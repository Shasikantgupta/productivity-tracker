"""
Employee Productivity Analytics - FastAPI Backend
Main Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
from loguru import logger
import sys

from app.config import settings
from app.database import engine, Base
from app.api.routes import auth, employees, tracking, screenshots, reports, admin, attendance
from app.websocket.manager import sio
from app.core.middleware import RateLimitMiddleware, RequestLoggingMiddleware


# ---- Configure Logging ----
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG" if settings.APP_DEBUG else "INFO",
)
logger.add(
    "logs/app_{time:YYYY-MM-DD}.log",
    rotation="00:00",
    retention="30 days",
    compression="gz",
    level="INFO",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    logger.info("🚀 Starting Productivity Analytics Backend...")
    logger.info(f"Environment: {settings.APP_ENV}")

    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables initialized")

    # Initialize Redis connection pool
    from app.core.redis_client import redis_manager
    await redis_manager.connect()
    logger.info("✅ Redis connected")

    yield

    # Cleanup
    await redis_manager.disconnect()
    await engine.dispose()
    logger.info("👋 Application shutdown complete")


# ---- Create FastAPI Application ----
app = FastAPI(
    title="Employee Productivity Analytics API",
    description="Enterprise-grade employee productivity monitoring and analytics platform",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.APP_DEBUG else None,
    redoc_url="/redoc" if settings.APP_DEBUG else None,
    lifespan=lifespan,
)

# ---- Middleware Stack ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

if settings.APP_ENV == "production":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.yourcompany.com"])

# ---- Mount Static Files ----
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---- Socket.IO Integration ----
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# ---- API Routes ----
API_V1 = "/api/v1"

app.include_router(auth.router, prefix=f"{API_V1}/auth", tags=["Authentication"])
app.include_router(employees.router, prefix=f"{API_V1}/employees", tags=["Employees"])
app.include_router(tracking.router, prefix=f"{API_V1}/tracking", tags=["Activity Tracking"])
app.include_router(screenshots.router, prefix=f"{API_V1}/screenshots", tags=["Screenshots"])
app.include_router(reports.router, prefix=f"{API_V1}/reports", tags=["Reports"])
app.include_router(attendance.router, prefix=f"{API_V1}/attendance", tags=["Attendance"])
app.include_router(admin.router, prefix=f"{API_V1}/admin", tags=["Administration"])


# ---- Health Check ----
@app.get("/health", tags=["Health"])
async def health_check():
    """Application health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Employee Productivity Analytics API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.APP_DEBUG else "Disabled in production",
        "health": "/health",
    }

"""
Activity Tracking Models
Active/idle tracking, app usage, and website visit logs
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float,
    ForeignKey, Text, Enum as SQLEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ActivityStatus(str, enum.Enum):
    ACTIVE = "active"
    IDLE = "idle"
    AWAY = "away"
    OFFLINE = "offline"


class ActivityLog(Base):
    """
    Core activity tracking - records active/idle periods.
    Partitioned by date for scalable querying.
    """
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("idx_activity_employee_date", "employee_id", "started_at"),
        Index("idx_activity_status", "status"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)

    status = Column(SQLEnum(ActivityStatus), nullable=False)
    started_at = Column(DateTime, nullable=False, index=True)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Input metrics
    keyboard_events = Column(Integer, default=0)
    mouse_events = Column(Integer, default=0)
    mouse_distance_px = Column(Float, default=0.0)

    # Context
    machine_name = Column(String(200), nullable=True)
    ip_address = Column(INET, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="activity_logs")


class AppCategory(str, enum.Enum):
    """Application category for productivity classification."""
    PRODUCTIVE = "productive"
    NEUTRAL = "neutral"
    UNPRODUCTIVE = "unproductive"
    COMMUNICATION = "communication"
    DEVELOPMENT = "development"
    DESIGN = "design"
    MEETING = "meeting"
    UNCATEGORIZED = "uncategorized"


class AppUsageLog(Base):
    """
    Application usage tracking.
    Records which apps employees use and for how long.
    """
    __tablename__ = "app_usage_logs"
    __table_args__ = (
        Index("idx_app_usage_employee_date", "employee_id", "started_at"),
        Index("idx_app_usage_name", "app_name"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)

    # App Info
    app_name = Column(String(300), nullable=False)
    app_executable = Column(String(500), nullable=True)
    window_title = Column(Text, nullable=True)
    app_category = Column(SQLEnum(AppCategory), default=AppCategory.UNCATEGORIZED)

    # Timing
    started_at = Column(DateTime, nullable=False, index=True)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    is_foreground = Column(Boolean, default=True)

    # Metadata
    app_metadata = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="app_usage_logs")


class WebsiteCategory(str, enum.Enum):
    PRODUCTIVE = "productive"
    NEUTRAL = "neutral"
    UNPRODUCTIVE = "unproductive"
    SOCIAL_MEDIA = "social_media"
    NEWS = "news"
    ENTERTAINMENT = "entertainment"
    EDUCATION = "education"
    DEVELOPMENT = "development"
    COMMUNICATION = "communication"
    UNCATEGORIZED = "uncategorized"


class WebsiteVisitLog(Base):
    """
    Website visit tracking from browser extension.
    Records domains, URLs, and time spent.
    """
    __tablename__ = "website_visit_logs"
    __table_args__ = (
        Index("idx_website_employee_date", "employee_id", "visited_at"),
        Index("idx_website_domain", "domain"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)

    # URL Info
    url = Column(Text, nullable=False)
    domain = Column(String(500), nullable=False)
    page_title = Column(Text, nullable=True)
    category = Column(SQLEnum(WebsiteCategory), default=WebsiteCategory.UNCATEGORIZED)

    # Timing
    visited_at = Column(DateTime, nullable=False, index=True)
    left_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    is_active_tab = Column(Boolean, default=True)

    # Browser Info
    browser_name = Column(String(50), nullable=True)
    tab_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="website_visit_logs")

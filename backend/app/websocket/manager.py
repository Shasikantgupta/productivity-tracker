"""
WebSocket Manager
Socket.IO server for real-time communication
"""
import socketio
from loguru import logger

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# Connected clients tracking
connected_clients: dict = {}  # sid -> {user_id, role, employee_id}


@sio.event
async def connect(sid, environ, auth):
    """Handle new WebSocket connection."""
    logger.info(f"WebSocket connected: {sid}")
    # Auth token should be in auth dict
    if auth and auth.get("token"):
        connected_clients[sid] = {"token": auth["token"]}
    await sio.emit("connected", {"sid": sid}, room=sid)


@sio.event
async def disconnect(sid):
    """Handle WebSocket disconnection."""
    if sid in connected_clients:
        del connected_clients[sid]
    logger.info(f"WebSocket disconnected: {sid}")


@sio.event
async def join_dashboard(sid, data):
    """Admin/Manager joins dashboard room for real-time updates."""
    await sio.enter_room(sid, "dashboard")
    logger.info(f"Client {sid} joined dashboard room")


@sio.event
async def subscribe_employee(sid, data):
    """Subscribe to a specific employee's real-time feed."""
    employee_id = data.get("employee_id")
    if employee_id:
        await sio.enter_room(sid, f"employee:{employee_id}")
        logger.info(f"Client {sid} subscribed to employee {employee_id}")


@sio.event
async def agent_activity(sid, data):
    """Receive real-time activity from desktop agent."""
    employee_id = data.get("employee_id")
    if employee_id:
        # Broadcast to dashboard viewers
        await sio.emit("activity_update", data, room="dashboard")
        # Broadcast to employee-specific subscribers
        await sio.emit("activity_update", data, room=f"employee:{employee_id}")


@sio.event
async def agent_status_change(sid, data):
    """Employee status changed (active/idle/away)."""
    await sio.emit("status_change", data, room="dashboard")


@sio.event
async def agent_alert(sid, data):
    """Security alert from agent."""
    await sio.emit("new_alert", data, room="dashboard")
    logger.warning(f"Security alert from agent: {data}")


# Helper function to emit from API routes
async def emit_to_dashboard(event: str, data: dict):
    """Emit event to all dashboard viewers."""
    await sio.emit(event, data, room="dashboard")


async def emit_to_employee_viewers(employee_id: str, event: str, data: dict):
    """Emit event to viewers watching a specific employee."""
    await sio.emit(event, data, room=f"employee:{employee_id}")

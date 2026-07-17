"""
Security Alert Model
Anomaly detection and security event tracking
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum
from app.database import Base


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(str, enum.Enum):
    UNUSUAL_HOURS = "unusual_hours"
    BLOCKED_APP = "blocked_app"
    BLOCKED_WEBSITE = "blocked_website"
    USB_DEVICE = "usb_device"
    SCREENSHOT_BLOCKED = "screenshot_blocked"
    DATA_EXFILTRATION = "data_exfiltration"
    IDLE_ANOMALY = "idle_anomaly"
    LOCATION_CHANGE = "location_change"
    CUSTOM = "custom"


class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    __table_args__ = (
        Index("idx_alert_employee_date", "employee_id", "triggered_at"),
        Index("idx_alert_severity", "severity"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    alert_type = Column(SQLEnum(AlertType), nullable=False)
    severity = Column(SQLEnum(AlertSeverity), default=AlertSeverity.LOW)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    details = Column(JSONB, nullable=True)
    triggered_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

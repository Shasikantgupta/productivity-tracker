"""
Attendance Model
Clock-in/out tracking and work session management
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, DateTime, Date, Integer, Float,
    ForeignKey, Text, Enum as SQLEnum, Boolean, Index
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base
from app.models.compat import GUID, IPAddress


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    HALF_DAY = "half_day"
    LATE = "late"
    ON_LEAVE = "on_leave"
    WORK_FROM_HOME = "work_from_home"
    HOLIDAY = "holiday"


class ClockType(str, enum.Enum):
    AUTOMATIC = "automatic"  # Agent-detected
    MANUAL = "manual"        # Self-reported
    ADMIN = "admin"          # Admin override


class AttendanceRecord(Base):
    """
    Daily attendance tracking.
    Supports automatic (agent-detected) and manual clock-in/out.
    """
    __tablename__ = "attendance_records"
    __table_args__ = (
        Index("idx_attendance_employee_date", "employee_id", "work_date", unique=True),
    )

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)
    work_date = Column(Date, nullable=False, index=True)

    # Clock times
    clock_in = Column(DateTime, nullable=True)
    clock_out = Column(DateTime, nullable=True)
    clock_type = Column(SQLEnum(ClockType), default=ClockType.AUTOMATIC)

    # Break tracking
    break_start = Column(DateTime, nullable=True)
    break_end = Column(DateTime, nullable=True)
    total_break_minutes = Column(Integer, default=0)

    # Computed fields
    status = Column(SQLEnum(AttendanceStatus), default=AttendanceStatus.PRESENT)
    total_hours = Column(Float, nullable=True)
    active_hours = Column(Float, nullable=True)
    idle_hours = Column(Float, nullable=True)
    overtime_hours = Column(Float, default=0.0)

    # Location
    clock_in_ip = Column(IPAddress(), nullable=True)
    clock_out_ip = Column(IPAddress(), nullable=True)
    is_remote = Column(Boolean, default=False)

    # Notes
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="attendance_records")

    def __repr__(self):
        return f"<Attendance {self.work_date}: {self.status.value}>"

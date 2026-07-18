"""
Employee Model
Employee profile, department, and team hierarchy
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Integer,
    ForeignKey, Text, Float, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base
from app.models.compat import GUID, JSONType


class EmploymentStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"


class Department(Base):
    """Department/Organization unit model."""
    __tablename__ = "departments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    head_id = Column(GUID(), ForeignKey("employees.id"), nullable=True)
    parent_id = Column(GUID(), ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employees = relationship("Employee", back_populates="department", foreign_keys="Employee.department_id")
    teams = relationship("Team", back_populates="department")
    parent = relationship("Department", remote_side=[id])


class Team(Base):
    """Team within a department."""
    __tablename__ = "teams"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    department_id = Column(GUID(), ForeignKey("departments.id"), nullable=False)
    lead_id = Column(GUID(), ForeignKey("employees.id"), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="teams")
    members = relationship("Employee", back_populates="team", foreign_keys="Employee.team_id")


class Employee(Base):
    """
    Employee profile model.
    Links to User for auth, contains work-related information.
    """
    __tablename__ = "employees"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True, nullable=False)
    employee_code = Column(String(50), unique=True, nullable=False, index=True)

    # Personal Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Work Info
    department_id = Column(GUID(), ForeignKey("departments.id"), nullable=True)
    team_id = Column(GUID(), ForeignKey("teams.id"), nullable=True)
    manager_id = Column(GUID(), ForeignKey("employees.id"), nullable=True)
    designation = Column(String(200), nullable=True)
    employment_status = Column(SQLEnum(EmploymentStatus), default=EmploymentStatus.ACTIVE)
    join_date = Column(Date, nullable=False, default=date.today)

    # Tracking Config
    tracking_enabled = Column(Boolean, default=True)
    screenshot_enabled = Column(Boolean, default=True)
    screenshot_interval = Column(Integer, default=300)  # seconds
    app_tracking_enabled = Column(Boolean, default=True)
    website_tracking_enabled = Column(Boolean, default=True)
    idle_timeout_seconds = Column(Integer, default=300)

    # Productivity Settings
    expected_hours_per_day = Column(Float, default=8.0)
    timezone = Column(String(50), default="UTC")
    work_schedule = Column(JSONType(), default=lambda: {
        "monday": {"start": "09:00", "end": "18:00"},
        "tuesday": {"start": "09:00", "end": "18:00"},
        "wednesday": {"start": "09:00", "end": "18:00"},
        "thursday": {"start": "09:00", "end": "18:00"},
        "friday": {"start": "09:00", "end": "18:00"},
        "saturday": None,
        "sunday": None,
    })

    # Agent Info
    agent_version = Column(String(20), nullable=True)
    agent_last_seen = Column(DateTime, nullable=True)
    agent_machine_name = Column(String(200), nullable=True)
    agent_os = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="employee")
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    team = relationship("Team", back_populates="members", foreign_keys=[team_id])
    manager = relationship("Employee", remote_side=[id])
    activity_logs = relationship("ActivityLog", back_populates="employee")
    app_usage_logs = relationship("AppUsageLog", back_populates="employee")
    website_visit_logs = relationship("WebsiteVisitLog", back_populates="employee")
    attendance_records = relationship("AttendanceRecord", back_populates="employee")
    screenshots = relationship("Screenshot", back_populates="employee")
    productivity_scores = relationship("ProductivityScore", back_populates="employee")
    consents = relationship("EmployeeConsent", back_populates="employee")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<Employee {self.employee_code}: {self.full_name}>"

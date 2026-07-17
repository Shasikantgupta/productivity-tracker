"""
Screenshot Model
Encrypted screenshot storage and metadata
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, Integer, Float,
    ForeignKey, Text, Boolean, Enum as SQLEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class ScreenshotType(str, enum.Enum):
    SCHEDULED = "scheduled"
    RANDOM = "random"
    MANUAL = "manual"
    ALERT = "alert"


class Screenshot(Base):
    __tablename__ = "screenshots"
    __table_args__ = (
        Index("idx_screenshot_employee_date", "employee_id", "captured_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(200), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    file_hash = Column(String(64), nullable=True)
    is_encrypted = Column(Boolean, default=True)
    encryption_iv = Column(String(64), nullable=True)
    captured_at = Column(DateTime, nullable=False, index=True)
    capture_type = Column(SQLEnum(ScreenshotType), default=ScreenshotType.SCHEDULED)
    screen_width = Column(Integer, nullable=True)
    screen_height = Column(Integer, nullable=True)
    active_app = Column(String(300), nullable=True)
    active_window_title = Column(Text, nullable=True)
    ai_productivity_score = Column(Float, nullable=True)
    ai_labels = Column(JSONB, nullable=True)
    is_blurred = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    access_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="screenshots")

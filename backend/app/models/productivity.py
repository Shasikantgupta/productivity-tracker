"""
Productivity Models
Scores, reports, and AI-generated insights
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, DateTime, Date, Integer, Float,
    ForeignKey, Text, Enum as SQLEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class ProductivityScore(Base):
    """Daily productivity score per employee."""
    __tablename__ = "productivity_scores"
    __table_args__ = (
        Index("idx_prod_score_employee_date", "employee_id", "score_date", unique=True),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    score_date = Column(Date, nullable=False, index=True)
    overall_score = Column(Float, nullable=False)  # 0-100
    active_time_score = Column(Float, nullable=True)
    app_usage_score = Column(Float, nullable=True)
    web_usage_score = Column(Float, nullable=True)
    attendance_score = Column(Float, nullable=True)
    total_active_minutes = Column(Integer, default=0)
    total_idle_minutes = Column(Integer, default=0)
    productive_app_minutes = Column(Integer, default=0)
    unproductive_app_minutes = Column(Integer, default=0)
    top_apps = Column(JSONB, nullable=True)
    top_websites = Column(JSONB, nullable=True)
    ai_insights = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="productivity_scores")


class ReportType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class ProductivityReport(Base):
    """Generated productivity reports for teams/departments."""
    __tablename__ = "productivity_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_type = Column(SQLEnum(ReportType), nullable=False)
    title = Column(String(300), nullable=False)
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)
    report_data = Column(JSONB, nullable=False)
    ai_summary = Column(Text, nullable=True)
    ai_recommendations = Column(JSONB, nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

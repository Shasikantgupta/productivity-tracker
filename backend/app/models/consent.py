"""
Privacy & Consent Models
Employee consent tracking and privacy policy management
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, Boolean, ForeignKey, Text, Integer, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class PrivacyPolicy(Base):
    """Privacy policy versions."""
    __tablename__ = "privacy_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version = Column(String(20), unique=True, nullable=False)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    data_collected = Column(JSONB, nullable=False)  # What data is collected
    data_retention_days = Column(Integer, default=365)
    is_active = Column(Boolean, default=False)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmployeeConsent(Base):
    """Tracks employee consent to monitoring policies."""
    __tablename__ = "employee_consents"
    __table_args__ = (
        Index("idx_consent_employee_policy", "employee_id", "policy_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("privacy_policies.id"), nullable=False)
    consented = Column(Boolean, nullable=False)
    consented_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    consent_method = Column(String(50), default="desktop_agent")  # desktop_agent, web, api
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="consents")
    policy = relationship("PrivacyPolicy")

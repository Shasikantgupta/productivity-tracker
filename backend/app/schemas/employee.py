"""
Employee Schemas
Request/response models for employee management
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID


class EmployeeCreate(BaseModel):
    user_id: UUID
    employee_code: str = Field(..., max_length=50)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    designation: Optional[str] = None
    join_date: date = Field(default_factory=date.today)
    expected_hours_per_day: float = 8.0
    timezone: str = "UTC"


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    designation: Optional[str] = None
    tracking_enabled: Optional[bool] = None
    screenshot_enabled: Optional[bool] = None
    screenshot_interval: Optional[int] = None
    app_tracking_enabled: Optional[bool] = None
    website_tracking_enabled: Optional[bool] = None
    idle_timeout_seconds: Optional[int] = None
    expected_hours_per_day: Optional[float] = None
    work_schedule: Optional[Dict[str, Any]] = None


class EmployeeResponse(BaseModel):
    id: UUID
    employee_code: str
    first_name: str
    last_name: str
    full_name: str
    designation: Optional[str] = None
    department_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    employment_status: str
    tracking_enabled: bool
    screenshot_enabled: bool
    agent_last_seen: Optional[datetime] = None
    agent_machine_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    employees: list[EmployeeResponse]
    total: int
    page: int
    page_size: int


class DepartmentCreate(BaseModel):
    name: str = Field(..., max_length=200)
    code: str = Field(..., max_length=20)
    description: Optional[str] = None
    parent_id: Optional[UUID] = None


class DepartmentResponse(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TeamCreate(BaseModel):
    name: str = Field(..., max_length=200)
    department_id: UUID
    lead_id: Optional[UUID] = None
    description: Optional[str] = None


class TeamResponse(BaseModel):
    id: UUID
    name: str
    department_id: UUID
    lead_id: Optional[UUID] = None
    is_active: bool

    class Config:
        from_attributes = True

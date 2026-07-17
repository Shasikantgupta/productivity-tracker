"""
Report Schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID


class ProductivityScoreResponse(BaseModel):
    id: UUID
    score_date: date
    overall_score: float
    active_time_score: Optional[float] = None
    app_usage_score: Optional[float] = None
    total_active_minutes: int
    total_idle_minutes: int
    productive_app_minutes: int
    unproductive_app_minutes: int
    top_apps: Optional[Dict[str, Any]] = None
    top_websites: Optional[Dict[str, Any]] = None
    ai_insights: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ReportRequest(BaseModel):
    report_type: str = "daily"
    date_from: date
    date_to: date
    department_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    employee_ids: Optional[List[UUID]] = None


class ReportResponse(BaseModel):
    id: UUID
    report_type: str
    title: str
    date_from: date
    date_to: date
    report_data: Dict[str, Any]
    ai_summary: Optional[str] = None
    ai_recommendations: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_employees: int
    online_now: int
    avg_productivity: float
    total_active_hours: float
    total_idle_hours: float
    attendance_rate: float
    alerts_count: int
    top_apps: List[Dict[str, Any]]
    top_websites: List[Dict[str, Any]]
    productivity_trend: List[Dict[str, Any]]

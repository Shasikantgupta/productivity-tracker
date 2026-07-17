"""
Tracking & Activity Schemas
Request/response models for activity data submission
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ActivitySubmit(BaseModel):
    """Submitted by desktop agent periodically."""
    status: str  # active, idle, away
    started_at: datetime
    ended_at: Optional[datetime] = None
    keyboard_events: int = 0
    mouse_events: int = 0
    mouse_distance_px: float = 0.0
    machine_name: Optional[str] = None


class AppUsageSubmit(BaseModel):
    """Submitted by desktop agent on app switch."""
    app_name: str
    app_executable: Optional[str] = None
    window_title: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    is_foreground: bool = True


class WebsiteVisitSubmit(BaseModel):
    """Submitted by browser extension."""
    url: str
    domain: str
    page_title: Optional[str] = None
    visited_at: datetime
    left_at: Optional[datetime] = None
    is_active_tab: bool = True
    browser_name: Optional[str] = None
    tab_id: Optional[int] = None


class BatchActivitySubmit(BaseModel):
    """Batch submission from agent."""
    employee_id: UUID
    activities: List[ActivitySubmit] = []
    app_usages: List[AppUsageSubmit] = []
    website_visits: List[WebsiteVisitSubmit] = []
    agent_version: Optional[str] = None
    machine_name: Optional[str] = None
    os_info: Optional[str] = None


class HeartbeatSubmit(BaseModel):
    """Agent heartbeat to maintain online status."""
    employee_id: UUID
    status: str = "active"
    current_app: Optional[str] = None
    current_window: Optional[str] = None
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None


class ActivityResponse(BaseModel):
    id: UUID
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    keyboard_events: int
    mouse_events: int

    class Config:
        from_attributes = True


class AppUsageResponse(BaseModel):
    id: UUID
    app_name: str
    window_title: Optional[str] = None
    app_category: str
    started_at: datetime
    duration_seconds: Optional[int] = None
    is_foreground: bool

    class Config:
        from_attributes = True

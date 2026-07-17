"""
Activity Tracking Routes
Receive activity data from desktop agent and browser extension
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.activity import ActivityLog, AppUsageLog, WebsiteVisitLog, ActivityStatus
from app.models.employee import Employee
from app.schemas.tracking import (
    BatchActivitySubmit, HeartbeatSubmit,
    ActivityResponse, AppUsageResponse,
)
from app.api.deps import get_current_user
from app.core.redis_client import redis_manager
from app.models.user import User

router = APIRouter()


@router.post("/batch", status_code=201)
async def submit_batch_activity(
    data: BatchActivitySubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Receive batch activity data from desktop agent."""
    # Verify employee exists
    result = await db.execute(select(Employee).where(Employee.id == data.employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Update agent info
    employee.agent_last_seen = datetime.utcnow()
    if data.agent_version:
        employee.agent_version = data.agent_version
    if data.machine_name:
        employee.agent_machine_name = data.machine_name
    if data.os_info:
        employee.agent_os = data.os_info

    # Process activity logs
    for activity in data.activities:
        duration = None
        if activity.ended_at and activity.started_at:
            duration = int((activity.ended_at - activity.started_at).total_seconds())

        log = ActivityLog(
            employee_id=data.employee_id,
            status=ActivityStatus(activity.status),
            started_at=activity.started_at,
            ended_at=activity.ended_at,
            duration_seconds=duration,
            keyboard_events=activity.keyboard_events,
            mouse_events=activity.mouse_events,
            mouse_distance_px=activity.mouse_distance_px,
            machine_name=activity.machine_name,
        )
        db.add(log)

    # Process app usage logs
    for app_usage in data.app_usages:
        duration = None
        if app_usage.ended_at and app_usage.started_at:
            duration = int((app_usage.ended_at - app_usage.started_at).total_seconds())

        log = AppUsageLog(
            employee_id=data.employee_id,
            app_name=app_usage.app_name,
            app_executable=app_usage.app_executable,
            window_title=app_usage.window_title,
            started_at=app_usage.started_at,
            ended_at=app_usage.ended_at,
            duration_seconds=duration,
            is_foreground=app_usage.is_foreground,
        )
        db.add(log)

    # Process website visits
    for visit in data.website_visits:
        duration = None
        if visit.left_at and visit.visited_at:
            duration = int((visit.left_at - visit.visited_at).total_seconds())

        log = WebsiteVisitLog(
            employee_id=data.employee_id,
            url=visit.url,
            domain=visit.domain,
            page_title=visit.page_title,
            visited_at=visit.visited_at,
            left_at=visit.left_at,
            duration_seconds=duration,
            is_active_tab=visit.is_active_tab,
            browser_name=visit.browser_name,
            tab_id=visit.tab_id,
        )
        db.add(log)

    await db.flush()

    # Update Redis real-time status
    await redis_manager.set_employee_online(str(data.employee_id), {
        "machine": data.machine_name,
        "os": data.os_info,
        "agent_version": data.agent_version,
    })

    return {
        "message": "Activity data received",
        "processed": {
            "activities": len(data.activities),
            "app_usages": len(data.app_usages),
            "website_visits": len(data.website_visits),
        },
    }


@router.post("/heartbeat")
async def submit_heartbeat(
    data: HeartbeatSubmit,
    user: User = Depends(get_current_user),
):
    """Agent heartbeat to maintain online status."""
    await redis_manager.heartbeat(str(data.employee_id))
    await redis_manager.push_activity(str(data.employee_id), {
        "type": "heartbeat",
        "status": data.status,
        "current_app": data.current_app,
        "current_window": data.current_window,
        "timestamp": datetime.utcnow().isoformat(),
    })
    return {"status": "ok"}


@router.get("/activities/{employee_id}", response_model=list[ActivityResponse])
async def get_activities(
    employee_id: UUID,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = Query(50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get activity logs for an employee."""
    query = select(ActivityLog).where(ActivityLog.employee_id == employee_id)

    if date_from:
        query = query.where(ActivityLog.started_at >= date_from)
    if date_to:
        query = query.where(ActivityLog.started_at <= date_to)

    query = query.order_by(ActivityLog.started_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/app-usage/{employee_id}", response_model=list[AppUsageResponse])
async def get_app_usage(
    employee_id: UUID,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = Query(50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get app usage logs for an employee."""
    query = select(AppUsageLog).where(AppUsageLog.employee_id == employee_id)

    if date_from:
        query = query.where(AppUsageLog.started_at >= date_from)
    if date_to:
        query = query.where(AppUsageLog.started_at <= date_to)

    query = query.order_by(AppUsageLog.started_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/online")
async def get_online_employees(user: User = Depends(get_current_user)):
    """Get list of currently online employees."""
    online_ids = await redis_manager.get_online_employees()
    return {"online_employees": list(online_ids), "count": len(online_ids)}

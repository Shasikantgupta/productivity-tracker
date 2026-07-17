"""
Reports Routes
Productivity reports and dashboard statistics
"""
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.productivity import ProductivityScore, ProductivityReport
from app.models.activity import ActivityLog, AppUsageLog, WebsiteVisitLog
from app.models.attendance import AttendanceRecord
from app.models.employee import Employee
from app.models.alert import SecurityAlert
from app.models.user import User
from app.schemas.report import (
    ProductivityScoreResponse, ReportRequest, ReportResponse, DashboardStats
)
from app.api.deps import get_current_user, get_manager_or_above
from app.core.redis_client import redis_manager

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    """Get real-time dashboard statistics."""
    today = date.today()

    # Total employees
    total_emp = (await db.execute(
        select(func.count(Employee.id))
    )).scalar() or 0

    # Online now
    online = await redis_manager.get_online_employees()

    # Today's productivity
    scores = await db.execute(
        select(func.avg(ProductivityScore.overall_score))
        .where(ProductivityScore.score_date == today)
    )
    avg_prod = round(scores.scalar() or 0, 1)

    # Today's active/idle hours
    active_result = await db.execute(
        select(func.sum(ActivityLog.duration_seconds))
        .where(
            ActivityLog.started_at >= datetime.combine(today, datetime.min.time()),
            ActivityLog.status == "active",
        )
    )
    active_seconds = active_result.scalar() or 0

    idle_result = await db.execute(
        select(func.sum(ActivityLog.duration_seconds))
        .where(
            ActivityLog.started_at >= datetime.combine(today, datetime.min.time()),
            ActivityLog.status == "idle",
        )
    )
    idle_seconds = idle_result.scalar() or 0

    # Attendance rate
    attendance = await db.execute(
        select(func.count(AttendanceRecord.id))
        .where(
            AttendanceRecord.work_date == today,
            AttendanceRecord.status.in_(["present", "work_from_home", "late"]),
        )
    )
    att_count = attendance.scalar() or 0
    att_rate = round((att_count / max(total_emp, 1)) * 100, 1)

    # Alerts count
    alerts = await db.execute(
        select(func.count(SecurityAlert.id))
        .where(SecurityAlert.acknowledged == False)
    )
    alerts_count = alerts.scalar() or 0

    # Top apps today
    top_apps_result = await db.execute(
        select(
            AppUsageLog.app_name,
            func.sum(AppUsageLog.duration_seconds).label("total_seconds"),
        )
        .where(AppUsageLog.started_at >= datetime.combine(today, datetime.min.time()))
        .group_by(AppUsageLog.app_name)
        .order_by(func.sum(AppUsageLog.duration_seconds).desc())
        .limit(10)
    )
    top_apps = [{"name": r[0], "seconds": r[1] or 0} for r in top_apps_result]

    # Top websites today
    top_web_result = await db.execute(
        select(
            WebsiteVisitLog.domain,
            func.sum(WebsiteVisitLog.duration_seconds).label("total_seconds"),
        )
        .where(WebsiteVisitLog.visited_at >= datetime.combine(today, datetime.min.time()))
        .group_by(WebsiteVisitLog.domain)
        .order_by(func.sum(WebsiteVisitLog.duration_seconds).desc())
        .limit(10)
    )
    top_websites = [{"domain": r[0], "seconds": r[1] or 0} for r in top_web_result]

    # 7-day productivity trend
    trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        score_result = await db.execute(
            select(func.avg(ProductivityScore.overall_score))
            .where(ProductivityScore.score_date == d)
        )
        trend.append({"date": d.isoformat(), "score": round(score_result.scalar() or 0, 1)})

    return DashboardStats(
        total_employees=total_emp,
        online_now=len(online),
        avg_productivity=avg_prod,
        total_active_hours=round(active_seconds / 3600, 1),
        total_idle_hours=round(idle_seconds / 3600, 1),
        attendance_rate=att_rate,
        alerts_count=alerts_count,
        top_apps=top_apps,
        top_websites=top_websites,
        productivity_trend=trend,
    )


@router.get("/my-dashboard", response_model=DashboardStats)
async def get_my_dashboard_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personal dashboard statistics for the logged-in employee."""
    today = date.today()

    # Get employee record
    emp_result = await db.execute(select(Employee).where(Employee.user_id == user.id))
    employee = emp_result.scalar_one_or_none()
    
    if not employee:
        # Fallback empty stats if user has no employee profile yet
        return DashboardStats(
            total_employees=1, online_now=1, avg_productivity=0,
            total_active_hours=0, total_idle_hours=0, attendance_rate=0,
            alerts_count=0, top_apps=[], top_websites=[], productivity_trend=[]
        )

    # Today's productivity
    scores = await db.execute(
        select(ProductivityScore.overall_score)
        .where(
            ProductivityScore.employee_id == employee.id,
            ProductivityScore.score_date == today
        )
    )
    avg_prod = round(scores.scalar() or 0, 1)

    # Today's active/idle hours
    active_result = await db.execute(
        select(func.sum(ActivityLog.duration_seconds))
        .where(
            ActivityLog.employee_id == employee.id,
            ActivityLog.started_at >= datetime.combine(today, datetime.min.time()),
            ActivityLog.status == "active",
        )
    )
    active_seconds = active_result.scalar() or 0

    idle_result = await db.execute(
        select(func.sum(ActivityLog.duration_seconds))
        .where(
            ActivityLog.employee_id == employee.id,
            ActivityLog.started_at >= datetime.combine(today, datetime.min.time()),
            ActivityLog.status == "idle",
        )
    )
    idle_seconds = idle_result.scalar() or 0

    # Attendance
    attendance = await db.execute(
        select(AttendanceRecord)
        .where(
            AttendanceRecord.employee_id == employee.id,
            AttendanceRecord.work_date == today
        )
    )
    att_record = attendance.scalar_one_or_none()
    att_rate = 100 if att_record and att_record.status in ["present", "work_from_home", "late"] else 0

    # 7-day productivity trend
    trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        score_result = await db.execute(
            select(ProductivityScore.overall_score)
            .where(
                ProductivityScore.employee_id == employee.id,
                ProductivityScore.score_date == d
            )
        )
        trend.append({"date": d.isoformat(), "score": round(score_result.scalar() or 0, 1)})

    return DashboardStats(
        total_employees=1,
        online_now=1,
        avg_productivity=avg_prod,
        total_active_hours=round(active_seconds / 3600, 1),
        total_idle_hours=round(idle_seconds / 3600, 1),
        attendance_rate=att_rate,
        alerts_count=0,
        top_apps=[],
        top_websites=[],
        productivity_trend=trend,
    )


@router.get("/productivity/{employee_id}", response_model=list[ProductivityScoreResponse])
async def get_productivity_scores(
    employee_id: UUID,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get productivity scores for an employee."""
    query = select(ProductivityScore).where(ProductivityScore.employee_id == employee_id)
    if date_from:
        query = query.where(ProductivityScore.score_date >= date_from)
    if date_to:
        query = query.where(ProductivityScore.score_date <= date_to)
    query = query.order_by(ProductivityScore.score_date.desc()).limit(90)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(
    data: ReportRequest,
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    """Generate a productivity report for a date range."""
    # Build report data
    query = select(ProductivityScore).where(
        ProductivityScore.score_date.between(data.date_from, data.date_to)
    )
    if data.employee_ids:
        query = query.where(ProductivityScore.employee_id.in_(data.employee_ids))

    result = await db.execute(query)
    scores = result.scalars().all()

    report_data = {
        "total_records": len(scores),
        "avg_score": round(sum(s.overall_score for s in scores) / max(len(scores), 1), 1),
        "date_range": f"{data.date_from} to {data.date_to}",
    }

    report = ProductivityReport(
        report_type=data.report_type,
        title=f"Productivity Report: {data.date_from} - {data.date_to}",
        generated_by=user.id,
        department_id=data.department_id,
        team_id=data.team_id,
        date_from=data.date_from,
        date_to=data.date_to,
        report_data=report_data,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report

"""
AI Productivity Analytics Engine
Scoring, pattern detection, and insight generation
"""
from datetime import date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import numpy as np
from loguru import logger

from app.models.activity import ActivityLog, AppUsageLog, WebsiteVisitLog, AppCategory
from app.models.productivity import ProductivityScore
from app.models.attendance import AttendanceRecord


class ProductivityAnalyzer:
    """AI-powered productivity analysis engine."""

    # App categories for scoring
    PRODUCTIVE_APPS = {
        "code", "visual studio", "vscode", "intellij", "pycharm", "sublime",
        "terminal", "cmd", "powershell", "excel", "word", "powerpoint",
        "figma", "sketch", "photoshop", "jira", "confluence", "notion",
        "slack", "teams", "zoom", "postman", "docker", "git",
    }

    UNPRODUCTIVE_APPS = {
        "netflix", "youtube", "spotify", "steam", "discord",
        "instagram", "tiktok", "facebook", "twitter",
    }

    PRODUCTIVE_DOMAINS = {
        "github.com", "gitlab.com", "stackoverflow.com", "docs.google.com",
        "notion.so", "figma.com", "jira.atlassian.com", "confluence.atlassian.com",
        "trello.com", "asana.com", "linear.app",
    }

    UNPRODUCTIVE_DOMAINS = {
        "youtube.com", "netflix.com", "reddit.com", "twitter.com",
        "facebook.com", "instagram.com", "tiktok.com",
    }

    async def calculate_daily_score(
        self, db: AsyncSession, employee_id: str, target_date: date
    ) -> Dict[str, Any]:
        """Calculate comprehensive productivity score for a day."""
        from datetime import datetime

        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = datetime.combine(target_date, datetime.max.time())

        # 1. Active/Idle time analysis (40% weight)
        active_time = await self._get_time_by_status(db, employee_id, "active", day_start, day_end)
        idle_time = await self._get_time_by_status(db, employee_id, "idle", day_start, day_end)
        total_time = active_time + idle_time
        active_ratio = active_time / max(total_time, 1)
        active_score = min(active_ratio * 125, 100)  # 80% active = 100 score

        # 2. App usage analysis (30% weight)
        app_stats = await self._analyze_app_usage(db, employee_id, day_start, day_end)
        app_score = app_stats["score"]

        # 3. Web usage analysis (20% weight)
        web_stats = await self._analyze_web_usage(db, employee_id, day_start, day_end)
        web_score = web_stats["score"]

        # 4. Attendance (10% weight)
        att_score = await self._attendance_score(db, employee_id, target_date)

        # Weighted overall score
        overall = (active_score * 0.4) + (app_score * 0.3) + (web_score * 0.2) + (att_score * 0.1)
        overall = round(min(max(overall, 0), 100), 1)

        # Generate insights
        insights = self._generate_insights(
            active_score, app_score, web_score, att_score,
            active_time, idle_time, app_stats, web_stats
        )

        return {
            "overall_score": overall,
            "active_time_score": round(active_score, 1),
            "app_usage_score": round(app_score, 1),
            "web_usage_score": round(web_score, 1),
            "attendance_score": round(att_score, 1),
            "total_active_minutes": int(active_time / 60),
            "total_idle_minutes": int(idle_time / 60),
            "productive_app_minutes": app_stats.get("productive_minutes", 0),
            "unproductive_app_minutes": app_stats.get("unproductive_minutes", 0),
            "top_apps": app_stats.get("top_apps", []),
            "top_websites": web_stats.get("top_sites", []),
            "ai_insights": insights,
        }

    async def _get_time_by_status(
        self, db: AsyncSession, employee_id: str,
        status: str, start: Any, end: Any
    ) -> float:
        result = await db.execute(
            select(func.coalesce(func.sum(ActivityLog.duration_seconds), 0))
            .where(
                ActivityLog.employee_id == employee_id,
                ActivityLog.started_at.between(start, end),
                ActivityLog.status == status,
            )
        )
        return float(result.scalar() or 0)

    async def _analyze_app_usage(
        self, db: AsyncSession, employee_id: str, start: Any, end: Any
    ) -> Dict:
        result = await db.execute(
            select(
                AppUsageLog.app_name,
                func.sum(AppUsageLog.duration_seconds).label("total")
            )
            .where(
                AppUsageLog.employee_id == employee_id,
                AppUsageLog.started_at.between(start, end),
            )
            .group_by(AppUsageLog.app_name)
            .order_by(func.sum(AppUsageLog.duration_seconds).desc())
        )
        apps = result.all()

        productive_sec = 0
        unproductive_sec = 0
        top_apps = []

        for app_name, total in apps[:10]:
            name_lower = app_name.lower()
            is_productive = any(p in name_lower for p in self.PRODUCTIVE_APPS)
            is_unproductive = any(u in name_lower for u in self.UNPRODUCTIVE_APPS)

            if is_productive:
                productive_sec += total or 0
            elif is_unproductive:
                unproductive_sec += total or 0

            top_apps.append({
                "name": app_name,
                "minutes": round((total or 0) / 60, 1),
                "category": "productive" if is_productive else ("unproductive" if is_unproductive else "neutral"),
            })

        total_sec = productive_sec + unproductive_sec
        score = (productive_sec / max(total_sec, 1)) * 100 if total_sec > 0 else 50

        return {
            "score": min(score, 100),
            "productive_minutes": int(productive_sec / 60),
            "unproductive_minutes": int(unproductive_sec / 60),
            "top_apps": top_apps,
        }

    async def _analyze_web_usage(
        self, db: AsyncSession, employee_id: str, start: Any, end: Any
    ) -> Dict:
        result = await db.execute(
            select(
                WebsiteVisitLog.domain,
                func.sum(WebsiteVisitLog.duration_seconds).label("total")
            )
            .where(
                WebsiteVisitLog.employee_id == employee_id,
                WebsiteVisitLog.visited_at.between(start, end),
            )
            .group_by(WebsiteVisitLog.domain)
            .order_by(func.sum(WebsiteVisitLog.duration_seconds).desc())
        )
        sites = result.all()

        productive_sec = 0
        unproductive_sec = 0
        top_sites = []

        for domain, total in sites[:10]:
            is_productive = domain in self.PRODUCTIVE_DOMAINS
            is_unproductive = domain in self.UNPRODUCTIVE_DOMAINS

            if is_productive:
                productive_sec += total or 0
            elif is_unproductive:
                unproductive_sec += total or 0

            top_sites.append({
                "domain": domain,
                "minutes": round((total or 0) / 60, 1),
                "category": "productive" if is_productive else ("unproductive" if is_unproductive else "neutral"),
            })

        total_sec = productive_sec + unproductive_sec
        score = (productive_sec / max(total_sec, 1)) * 100 if total_sec > 0 else 50

        return {"score": min(score, 100), "top_sites": top_sites}

    async def _attendance_score(
        self, db: AsyncSession, employee_id: str, target_date: date
    ) -> float:
        result = await db.execute(
            select(AttendanceRecord).where(
                AttendanceRecord.employee_id == employee_id,
                AttendanceRecord.work_date == target_date,
            )
        )
        record = result.scalar_one_or_none()
        if not record:
            return 0
        if record.status.value in ("present", "work_from_home"):
            return 100
        if record.status.value == "late":
            return 70
        if record.status.value == "half_day":
            return 50
        return 0

    def _generate_insights(
        self, active_score, app_score, web_score, att_score,
        active_time, idle_time, app_stats, web_stats
    ) -> Dict:
        insights = {"recommendations": [], "highlights": [], "concerns": []}

        if active_score >= 80:
            insights["highlights"].append("Excellent focus time maintained today")
        elif active_score < 50:
            insights["concerns"].append("High idle time detected - consider reviewing workload")
            insights["recommendations"].append("Try the Pomodoro technique for better focus")

        if app_score >= 80:
            insights["highlights"].append("Great use of productive tools")
        elif app_score < 40:
            insights["concerns"].append("Significant time spent on non-work applications")

        if idle_time > active_time:
            insights["recommendations"].append("Active time is below idle time. Check for blockers.")

        return insights


# Global analyzer instance
productivity_analyzer = ProductivityAnalyzer()

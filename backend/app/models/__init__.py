"""Models package init - Import all models for Alembic discovery."""
from app.models.compat import GUID, JSONType, IPAddress
from app.models.user import User
from app.models.employee import Employee, Department, Team
from app.models.activity import ActivityLog, AppUsageLog, WebsiteVisitLog
from app.models.attendance import AttendanceRecord
from app.models.screenshot import Screenshot
from app.models.productivity import ProductivityScore, ProductivityReport
from app.models.consent import EmployeeConsent, PrivacyPolicy
from app.models.alert import SecurityAlert

__all__ = [
    "GUID",
    "JSONType",
    "IPAddress",
    "User",
    "Employee",
    "Department",
    "Team",
    "ActivityLog",
    "AppUsageLog",
    "WebsiteVisitLog",
    "AttendanceRecord",
    "Screenshot",
    "ProductivityScore",
    "ProductivityReport",
    "EmployeeConsent",
    "PrivacyPolicy",
    "SecurityAlert",
]

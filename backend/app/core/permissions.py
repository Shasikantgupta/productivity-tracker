"""
Role-Based Access Control (RBAC)
Permission definitions and enforcement
"""
from enum import Enum
from typing import List, Set
from functools import wraps
from fastapi import HTTPException, status


class Permission(str, Enum):
    """Granular permission definitions."""
    # Employee management
    VIEW_EMPLOYEES = "view_employees"
    MANAGE_EMPLOYEES = "manage_employees"
    # Tracking data
    VIEW_OWN_DATA = "view_own_data"
    VIEW_TEAM_DATA = "view_team_data"
    VIEW_ALL_DATA = "view_all_data"
    # Screenshots
    VIEW_OWN_SCREENSHOTS = "view_own_screenshots"
    VIEW_TEAM_SCREENSHOTS = "view_team_screenshots"
    VIEW_ALL_SCREENSHOTS = "view_all_screenshots"
    DELETE_SCREENSHOTS = "delete_screenshots"
    # Reports
    VIEW_OWN_REPORTS = "view_own_reports"
    VIEW_TEAM_REPORTS = "view_team_reports"
    VIEW_ALL_REPORTS = "view_all_reports"
    GENERATE_REPORTS = "generate_reports"
    # Admin
    MANAGE_SETTINGS = "manage_settings"
    MANAGE_POLICIES = "manage_policies"
    MANAGE_ALERTS = "manage_alerts"
    VIEW_AUDIT_LOG = "view_audit_log"
    MANAGE_DEPARTMENTS = "manage_departments"
    # System
    SYSTEM_ADMIN = "system_admin"


# Role → Permission mapping
ROLE_PERMISSIONS: dict[str, Set[Permission]] = {
    "super_admin": set(Permission),  # All permissions
    "admin": {
        Permission.VIEW_EMPLOYEES, Permission.MANAGE_EMPLOYEES,
        Permission.VIEW_ALL_DATA, Permission.VIEW_ALL_SCREENSHOTS,
        Permission.DELETE_SCREENSHOTS, Permission.VIEW_ALL_REPORTS,
        Permission.GENERATE_REPORTS, Permission.MANAGE_SETTINGS,
        Permission.MANAGE_POLICIES, Permission.MANAGE_ALERTS,
        Permission.VIEW_AUDIT_LOG, Permission.MANAGE_DEPARTMENTS,
    },
    "manager": {
        Permission.VIEW_EMPLOYEES, Permission.VIEW_TEAM_DATA,
        Permission.VIEW_TEAM_SCREENSHOTS, Permission.VIEW_TEAM_REPORTS,
        Permission.GENERATE_REPORTS, Permission.VIEW_OWN_DATA,
        Permission.VIEW_OWN_SCREENSHOTS, Permission.VIEW_OWN_REPORTS,
    },
    "hr": {
        Permission.VIEW_EMPLOYEES, Permission.MANAGE_EMPLOYEES,
        Permission.VIEW_ALL_DATA, Permission.VIEW_ALL_REPORTS,
        Permission.GENERATE_REPORTS, Permission.MANAGE_POLICIES,
    },
    "employee": {
        Permission.VIEW_OWN_DATA, Permission.VIEW_OWN_SCREENSHOTS,
        Permission.VIEW_OWN_REPORTS,
    },
    "viewer": {
        Permission.VIEW_OWN_DATA, Permission.VIEW_OWN_REPORTS,
    },
}


def has_permission(role: str, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    role_perms = ROLE_PERMISSIONS.get(role, set())
    return permission in role_perms


def check_permissions(role: str, required: List[Permission]):
    """Raise 403 if role lacks any required permission."""
    for perm in required:
        if not has_permission(role, perm):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {perm.value}",
            )

"""
Admin Routes
System configuration, privacy policies, and security alerts
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database import get_db
from app.models.consent import PrivacyPolicy, EmployeeConsent
from app.models.alert import SecurityAlert
from app.models.user import User
from app.api.deps import get_admin_user, get_manager_or_above

router = APIRouter()


# ---- Privacy Policy Management ----

@router.post("/policies")
async def create_policy(
    version: str, title: str, content: str,
    data_collected: dict, retention_days: int = 365,
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    policy = PrivacyPolicy(
        version=version, title=title, content=content,
        data_collected=data_collected,
        data_retention_days=retention_days,
    )
    db.add(policy)
    await db.flush()
    return {"id": str(policy.id), "version": version}


@router.post("/policies/{policy_id}/activate")
async def activate_policy(
    policy_id: UUID,
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PrivacyPolicy).where(PrivacyPolicy.id == policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(404, "Policy not found")
    # Deactivate all others
    all_policies = await db.execute(select(PrivacyPolicy))
    for p in all_policies.scalars().all():
        p.is_active = False
    policy.is_active = True
    policy.published_at = datetime.utcnow()
    await db.flush()
    return {"message": f"Policy v{policy.version} activated"}


@router.get("/policies/active")
async def get_active_policy(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PrivacyPolicy).where(PrivacyPolicy.is_active == True)
    )
    policy = result.scalar_one_or_none()
    if not policy:
        return {"policy": None}
    return {
        "id": str(policy.id), "version": policy.version,
        "title": policy.title, "content": policy.content,
        "data_collected": policy.data_collected,
        "data_retention_days": policy.data_retention_days,
    }


# ---- Employee Consent ----

@router.post("/consent")
async def record_consent(
    employee_id: UUID, policy_id: UUID, consented: bool,
    ip_address: str = None, consent_method: str = "desktop_agent",
    db: AsyncSession = Depends(get_db),
):
    consent = EmployeeConsent(
        employee_id=employee_id, policy_id=policy_id,
        consented=consented,
        consented_at=datetime.utcnow() if consented else None,
        ip_address=ip_address, consent_method=consent_method,
    )
    db.add(consent)
    await db.flush()
    return {"message": "Consent recorded", "consented": consented}


# ---- Security Alerts ----

@router.get("/alerts")
async def list_alerts(
    acknowledged: bool = False,
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SecurityAlert)
        .where(SecurityAlert.acknowledged == acknowledged)
        .order_by(SecurityAlert.triggered_at.desc())
        .limit(50)
    )
    alerts = result.scalars().all()
    return {"alerts": [
        {"id": str(a.id), "type": a.alert_type.value,
         "severity": a.severity.value, "title": a.title,
         "description": a.description, "triggered_at": a.triggered_at.isoformat(),
         "acknowledged": a.acknowledged}
        for a in alerts
    ]}


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: UUID,
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SecurityAlert).where(SecurityAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.acknowledged = True
    alert.acknowledged_by = user.id
    alert.acknowledged_at = datetime.utcnow()
    await db.flush()
    return {"message": "Alert acknowledged"}


# ---- Transparency Controls ----

@router.get("/transparency/tracking-config")
async def get_tracking_config(user: User = Depends(get_admin_user)):
    """Return what data is being collected - for transparency."""
    return {
        "tracking_features": {
            "active_idle_tracking": True,
            "app_usage_monitoring": True,
            "website_tracking": True,
            "screenshot_capture": True,
            "keyboard_mouse_metrics": True,
            "attendance_tracking": True,
        },
        "data_retention": "365 days",
        "screenshot_interval": "5 minutes",
        "data_encryption": "AES-256",
        "employee_consent_required": True,
        "visible_indicator": True,
    }

"""
API Dependencies
Common dependencies for route handlers: auth, DB session, permissions
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.core.security import decode_token
from app.core.permissions import Permission, check_permissions
from app.models.user import User

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from JWT token."""
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    return user


def require_permissions(*permissions: Permission):
    """Dependency factory that checks required permissions."""
    async def _check(user: User = Depends(get_current_user)):
        check_permissions(user.role.value, list(permissions))
        return user
    return _check


async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    """Require admin or super_admin role."""
    if user.role.value not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def get_manager_or_above(user: User = Depends(get_current_user)) -> User:
    """Require manager, admin, or super_admin role."""
    if user.role.value not in ("manager", "admin", "super_admin", "hr"):
        raise HTTPException(status_code=403, detail="Manager access required")
    return user

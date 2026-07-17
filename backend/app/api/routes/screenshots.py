"""
Screenshot Routes
Encrypted upload, retrieval, and management
"""
import os
import hashlib
from datetime import datetime
from uuid import uuid4, UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from cryptography.fernet import Fernet
from typing import Optional

from app.database import get_db
from app.models.screenshot import Screenshot, ScreenshotType
from app.models.user import User
from app.api.deps import get_current_user, get_manager_or_above
from app.config import settings

router = APIRouter()

# Encryption setup
def get_fernet():
    key = settings.SCREENSHOT_ENCRYPTION_KEY.encode()
    # Pad or hash key to 32 bytes for Fernet
    key = hashlib.sha256(key).digest()
    import base64
    return Fernet(base64.urlsafe_b64encode(key))


@router.post("/upload", status_code=201)
async def upload_screenshot(
    file: UploadFile = File(...),
    employee_id: str = Form(...),
    active_app: Optional[str] = Form(None),
    active_window_title: Optional[str] = Form(None),
    capture_type: str = Form("scheduled"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload and encrypt a screenshot from the desktop agent."""
    # Validate file size
    content = await file.read()
    max_size = settings.SCREENSHOT_MAX_SIZE_MB * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(status_code=413, detail="Screenshot exceeds maximum size")

    # Encrypt the screenshot
    fernet = get_fernet()
    encrypted_content = fernet.encrypt(content)

    # Generate file path
    date_path = datetime.utcnow().strftime("%Y/%m/%d")
    file_name = f"{uuid4().hex}.enc"
    file_dir = os.path.join(settings.SCREENSHOT_PATH, employee_id, date_path)
    os.makedirs(file_dir, exist_ok=True)
    file_path = os.path.join(file_dir, file_name)

    # Write encrypted file
    with open(file_path, "wb") as f:
        f.write(encrypted_content)

    # Compute hash of original content
    file_hash = hashlib.sha256(content).hexdigest()

    # Save metadata to database
    screenshot = Screenshot(
        employee_id=employee_id,
        file_path=file_path,
        file_name=file_name,
        file_size_bytes=len(content),
        file_hash=file_hash,
        is_encrypted=True,
        captured_at=datetime.utcnow(),
        capture_type=ScreenshotType(capture_type),
        active_app=active_app,
        active_window_title=active_window_title,
    )
    db.add(screenshot)
    await db.flush()
    await db.refresh(screenshot)

    return {"id": str(screenshot.id), "message": "Screenshot uploaded and encrypted"}


@router.get("/{screenshot_id}")
async def get_screenshot(
    screenshot_id: UUID,
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve and decrypt a screenshot. Access is logged."""
    result = await db.execute(select(Screenshot).where(Screenshot.id == screenshot_id))
    screenshot = result.scalar_one_or_none()
    if not screenshot or screenshot.is_deleted:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    # Log access
    screenshot.access_count += 1
    await db.flush()

    # Decrypt
    if screenshot.is_encrypted and os.path.exists(screenshot.file_path):
        fernet = get_fernet()
        with open(screenshot.file_path, "rb") as f:
            encrypted = f.read()
        decrypted = fernet.decrypt(encrypted)

        from fastapi.responses import Response
        return Response(
            content=decrypted,
            media_type="image/png",
            headers={"X-Access-Count": str(screenshot.access_count)},
        )

    raise HTTPException(status_code=500, detail="Screenshot file not accessible")


@router.get("/employee/{employee_id}")
async def list_employee_screenshots(
    employee_id: UUID,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    """List screenshots for an employee with pagination."""
    query = select(Screenshot).where(
        Screenshot.employee_id == employee_id,
        Screenshot.is_deleted == False,
    )
    if date_from:
        query = query.where(Screenshot.captured_at >= date_from)
    if date_to:
        query = query.where(Screenshot.captured_at <= date_to)

    query = query.order_by(Screenshot.captured_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    screenshots = result.scalars().all()

    return {
        "screenshots": [
            {
                "id": str(s.id),
                "captured_at": s.captured_at.isoformat(),
                "active_app": s.active_app,
                "active_window_title": s.active_window_title,
                "ai_productivity_score": s.ai_productivity_score,
            }
            for s in screenshots
        ],
        "page": page,
        "page_size": page_size,
    }


@router.delete("/{screenshot_id}")
async def delete_screenshot(
    screenshot_id: UUID,
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a screenshot."""
    result = await db.execute(select(Screenshot).where(Screenshot.id == screenshot_id))
    screenshot = result.scalar_one_or_none()
    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    screenshot.is_deleted = True
    screenshot.deleted_at = datetime.utcnow()
    await db.flush()
    return {"message": "Screenshot deleted"}

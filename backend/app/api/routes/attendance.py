"""
Attendance Routes
Clock-in/out and attendance management
"""
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.attendance import AttendanceRecord, AttendanceStatus, ClockType
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/clock-in")
async def clock_in(
    employee_id: UUID, is_remote: bool = False,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    result = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.employee_id == employee_id,
            AttendanceRecord.work_date == today,
        )
    )
    record = result.scalar_one_or_none()
    if record and record.clock_in:
        raise HTTPException(400, "Already clocked in")
    if not record:
        record = AttendanceRecord(
            employee_id=employee_id, work_date=today,
            clock_in=datetime.utcnow(), status=AttendanceStatus.PRESENT,
            clock_type=ClockType.AUTOMATIC, is_remote=is_remote,
        )
        db.add(record)
    else:
        record.clock_in = datetime.utcnow()
    await db.flush()
    return {"message": "Clocked in", "time": record.clock_in.isoformat()}


@router.post("/clock-out")
async def clock_out(
    employee_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    result = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.employee_id == employee_id,
            AttendanceRecord.work_date == today,
        )
    )
    record = result.scalar_one_or_none()
    if not record or not record.clock_in:
        raise HTTPException(400, "Not clocked in")
    record.clock_out = datetime.utcnow()
    record.total_hours = round(
        (record.clock_out - record.clock_in).total_seconds() / 3600, 2
    )
    await db.flush()
    return {"message": "Clocked out", "total_hours": record.total_hours}


@router.get("/employee/{employee_id}")
async def get_attendance(
    employee_id: UUID, month: Optional[int] = None, year: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(AttendanceRecord).where(AttendanceRecord.employee_id == employee_id)
    if month and year:
        query = query.where(
            extract("month", AttendanceRecord.work_date) == month,
            extract("year", AttendanceRecord.work_date) == year,
        )
    query = query.order_by(AttendanceRecord.work_date.desc()).limit(31)
    result = await db.execute(query)
    records = result.scalars().all()
    return {"records": [
        {"id": str(r.id), "work_date": r.work_date.isoformat(),
         "clock_in": r.clock_in.isoformat() if r.clock_in else None,
         "clock_out": r.clock_out.isoformat() if r.clock_out else None,
         "status": r.status.value, "total_hours": r.total_hours,
         "is_remote": r.is_remote}
        for r in records
    ]}

"""
Employee Management Routes
CRUD operations for employee profiles
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.employee import Employee, Department, Team
from app.models.user import User
from app.schemas.employee import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    EmployeeListResponse, DepartmentCreate, DepartmentResponse,
    TeamCreate, TeamResponse,
)
from app.api.deps import get_current_user, get_manager_or_above, get_admin_user
from app.core.permissions import Permission

router = APIRouter()


@router.get("/", response_model=EmployeeListResponse)
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department_id: Optional[UUID] = None,
    team_id: Optional[UUID] = None,
    search: Optional[str] = None,
    user: User = Depends(get_manager_or_above),
    db: AsyncSession = Depends(get_db),
):
    """List employees with filtering and pagination."""
    query = select(Employee)

    if department_id:
        query = query.where(Employee.department_id == department_id)
    if team_id:
        query = query.where(Employee.team_id == team_id)
    if search:
        query = query.where(
            (Employee.first_name.ilike(f"%{search}%")) |
            (Employee.last_name.ilike(f"%{search}%")) |
            (Employee.employee_code.ilike(f"%{search}%"))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    employees = result.scalars().all()

    return EmployeeListResponse(
        employees=[EmployeeResponse.model_validate(e) for e in employees],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get employee details."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.post("/", response_model=EmployeeResponse, status_code=201)
async def create_employee(
    data: EmployeeCreate,
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new employee profile."""
    employee = Employee(**data.model_dump())
    db.add(employee)
    await db.flush()
    await db.refresh(employee)
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    data: EmployeeUpdate,
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update employee profile."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)

    await db.flush()
    await db.refresh(employee)
    return employee


# ---- Department Routes ----

@router.get("/departments/list", response_model=list[DepartmentResponse])
async def list_departments(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all departments."""
    result = await db.execute(select(Department).where(Department.is_active == True))
    return result.scalars().all()


@router.post("/departments", response_model=DepartmentResponse, status_code=201)
async def create_department(
    data: DepartmentCreate,
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new department."""
    dept = Department(**data.model_dump())
    db.add(dept)
    await db.flush()
    await db.refresh(dept)
    return dept


# ---- Team Routes ----

@router.get("/teams/list", response_model=list[TeamResponse])
async def list_teams(
    department_id: Optional[UUID] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List teams, optionally filtered by department."""
    query = select(Team).where(Team.is_active == True)
    if department_id:
        query = query.where(Team.department_id == department_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/teams", response_model=TeamResponse, status_code=201)
async def create_team(
    data: TeamCreate,
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new team."""
    team = Team(**data.model_dump())
    db.add(team)
    await db.flush()
    await db.refresh(team)
    return team

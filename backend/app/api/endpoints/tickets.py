"""
Ticket Management Endpoints
工单管理相关接口
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.ticket import Ticket, TicketStep
from app.schemas.ticket import (
    Ticket as TicketSchema,
    TicketCreate,
    TicketUpdate,
    TicketListResponse,
    TicketStepUpdate,
)

router = APIRouter()


def ticket_to_dict(ticket: Ticket) -> dict:
    """将Ticket模型转换为字典，处理前端需要的格式"""
    ticket_dict = {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "status": ticket.status.value,
        "priority": ticket.priority.value,
        "type": ticket.type.value,
        "requester": ticket.requester,
        "assignee": ticket.assignee_name,  # 前端需要assignee字段
        "location": ticket.location,
        "tags": ticket.tags or [],
        "createdAt": ticket.created_at.isoformat() if ticket.created_at else None,
        "updatedAt": ticket.updated_at.isoformat() if ticket.updated_at else None,
        "history": ticket.history,
        "steps": ticket.steps_data,  # 前端需要的步骤数据
        "rootCause": ticket.root_cause,
        "solution": ticket.solution,
        "beforePhotoUrls": ticket.before_photo_urls,
        "afterPhotoUrls": ticket.after_photo_urls,
        "feedback": ticket.feedback,
        "feedbackPhotoUrls": ticket.feedback_photo_urls,
        "problemPhotoUrls": ticket.problem_photo_urls,
        "relatedTicketId": ticket.related_ticket_id,
        "estimatedResolutionTime": ticket.estimated_resolution_time,
    }
    return ticket_dict


@router.get("", response_model=List[TicketSchema])
async def get_tickets(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取工单列表（支持分页和筛选）

    参数:
    - offset: 偏移量
    - limit: 每页数量
    - status: 状态筛选（可选）
    - priority: 优先级筛选（可选）

    返回:
    - 工单列表
    """
    query = db.query(Ticket)

    # 筛选条件
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)

    # 按创建时间倒序排序
    query = query.order_by(Ticket.created_at.desc())

    # 分页
    tickets = query.offset(offset).limit(limit).all()

    # 转换为字典格式
    tickets_data = [ticket_to_dict(ticket) for ticket in tickets]

    return tickets_data


@router.get("/{ticket_id}", response_model=TicketSchema)
async def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取工单详情

    参数:
    - ticket_id: 工单ID

    返回:
    - 工单详细信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    return ticket_to_dict(ticket)


@router.post("", response_model=TicketSchema)
async def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建新工单

    参数:
    - ticket_data: 工单数据

    返回:
    - 创建的工单信息
    """
    # 生成工单ID
    # 格式：WO-年份+流水号
    import time
    ticket_id = f"WO-{int(time.time() * 1000) % 100000}"

    # 创建工单
    new_ticket = Ticket(
        id=ticket_id,
        title=ticket_data.title,
        description=ticket_data.description,
        status=ticket_data.status,
        priority=ticket_data.priority,
        type=ticket_data.type,
        requester=ticket_data.requester,
        location=ticket_data.location,
        tags=ticket_data.tags,
        estimated_resolution_time=ticket_data.estimated_resolution_time,
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return ticket_to_dict(new_ticket)


@router.put("/{ticket_id}", response_model=TicketSchema)
async def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新工单

    参数:
    - ticket_id: 工单ID
    - ticket_data: 更新的数据

    返回:
    - 更新后的工单信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # 更新字段
    update_data = ticket_data.dict(exclude_unset=True, by_alias=False)

    for field, value in update_data.items():
        if hasattr(ticket, field):
            setattr(ticket, field, value)

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket_to_dict(ticket)


@router.post("/{ticket_id}/assign", response_model=TicketSchema)
async def assign_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    抢单/分配工单给当前用户

    参数:
    - ticket_id: 工单ID

    返回:
    - 更新后的工单信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # 检查工单状态
    if ticket.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket is not available for assignment"
        )

    # 分配给当前用户
    ticket.assignee_id = current_user.id
    ticket.assignee_name = current_user.name

    # 更新状态
    if ticket.type == "problem":
        ticket.status = "arrived"  # 问题管理类型直接进入arrived状态
        if not ticket.history:
            ticket.history = {}
        ticket.history["arrivedAt"] = datetime.utcnow().isoformat()
    else:
        ticket.status = "assigned"

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket_to_dict(ticket)


@router.post("/{ticket_id}/depart", response_model=TicketSchema)
async def depart_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    标记出发

    参数:
    - ticket_id: 工单ID

    返回:
    - 更新后的工单信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # 更新状态
    ticket.status = "departed"

    # 记录时间
    if not ticket.history:
        ticket.history = {}
    ticket.history["departedAt"] = datetime.utcnow().isoformat()

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket_to_dict(ticket)


@router.post("/{ticket_id}/arrive", response_model=TicketSchema)
async def arrive_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    标记到达

    参数:
    - ticket_id: 工单ID

    返回:
    - 更新后的工单信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # 更新状态
    ticket.status = "arrived"

    # 记录时间
    if not ticket.history:
        ticket.history = {}
    ticket.history["arrivedAt"] = datetime.utcnow().isoformat()

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket_to_dict(ticket)


@router.post("/{ticket_id}/complete", response_model=TicketSchema)
async def complete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    完成工单

    参数:
    - ticket_id: 工单ID

    返回:
    - 更新后的工单信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # 更新状态
    ticket.status = "completed"

    # 记录时间
    if not ticket.history:
        ticket.history = {}
    ticket.history["completedAt"] = datetime.utcnow().isoformat()

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket_to_dict(ticket)


@router.put("/{ticket_id}/steps/{step_id}", response_model=dict)
async def update_ticket_step(
    ticket_id: str,
    step_id: str,
    step_data: TicketStepUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新工单步骤

    参数:
    - ticket_id: 工单ID
    - step_id: 步骤ID
    - step_data: 步骤数据

    返回:
    - 更新后的步骤信息
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # 更新steps_data中的步骤
    if not ticket.steps_data:
        ticket.steps_data = []

    # 查找并更新步骤
    step_found = False
    for step in ticket.steps_data:
        if step.get("id") == step_id:
            # 更新步骤数据
            update_data = step_data.dict(exclude_unset=True)
            step.update(update_data)
            step_found = True
            break

    if not step_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Step not found"
        )

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return {"message": "Step updated successfully", "ticket": ticket_to_dict(ticket)}

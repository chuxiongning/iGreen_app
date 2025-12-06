"""
Ticket Schemas
工单相关的Pydantic模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# 枚举定义
class TicketStatus(str, Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    DEPARTED = "departed"
    ARRIVED = "arrived"
    REVIEW = "review"
    COMPLETED = "completed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketType(str, Enum):
    CORRECTIVE = "corrective"
    PLANNED = "planned"
    PREVENTIVE = "preventive"
    PROBLEM = "problem"


class StepStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    NA = "na"
    PENDING = "pending"


# TicketStep Schemas
class TicketStepBase(BaseModel):
    """工单步骤基础模型"""
    step_id: str
    label: str
    description: Optional[str] = None
    completed: bool = False
    status: Optional[StepStatus] = StepStatus.PENDING
    photo_urls: Optional[List[str]] = None
    before_photo_urls: Optional[List[str]] = None
    after_photo_urls: Optional[List[str]] = None
    cause: Optional[str] = None
    timestamp: Optional[datetime] = None
    location: Optional[str] = None


class TicketStepCreate(TicketStepBase):
    """创建工单步骤"""
    pass


class TicketStepUpdate(BaseModel):
    """更新工单步骤"""
    label: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    status: Optional[StepStatus] = None
    photo_urls: Optional[List[str]] = None
    before_photo_urls: Optional[List[str]] = None
    after_photo_urls: Optional[List[str]] = None
    cause: Optional[str] = None
    timestamp: Optional[datetime] = None
    location: Optional[str] = None


class TicketStep(TicketStepBase):
    """工单步骤（返回给前端）"""
    id: int
    ticket_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Ticket Schemas
class TicketHistory(BaseModel):
    """工单历史记录"""
    departed_at: Optional[str] = Field(None, alias="departedAt")
    arrived_at: Optional[str] = Field(None, alias="arrivedAt")
    completed_at: Optional[str] = Field(None, alias="completedAt")

    class Config:
        populate_by_name = True


class TicketBase(BaseModel):
    """工单基础模型"""
    title: str = Field(..., min_length=1, max_length=500)
    description: str
    status: TicketStatus = TicketStatus.OPEN
    priority: TicketPriority = TicketPriority.MEDIUM
    type: TicketType
    requester: str
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_resolution_time: Optional[str] = Field(None, alias="estimatedResolutionTime")

    class Config:
        populate_by_name = True


class TicketCreate(TicketBase):
    """创建工单"""
    pass


class TicketUpdate(BaseModel):
    """更新工单"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assignee_id: Optional[str] = Field(None, alias="assigneeId")
    assignee_name: Optional[str] = Field(None, alias="assigneeName")
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    history: Optional[Dict[str, Any]] = None
    steps_data: Optional[List[Dict[str, Any]]] = Field(None, alias="stepsData")
    root_cause: Optional[str] = Field(None, alias="rootCause")
    solution: Optional[str] = None
    before_photo_urls: Optional[List[str]] = Field(None, alias="beforePhotoUrls")
    after_photo_urls: Optional[List[str]] = Field(None, alias="afterPhotoUrls")
    feedback: Optional[str] = None
    feedback_photo_urls: Optional[List[str]] = Field(None, alias="feedbackPhotoUrls")
    problem_photo_urls: Optional[List[str]] = Field(None, alias="problemPhotoUrls")
    related_ticket_id: Optional[str] = Field(None, alias="relatedTicketId")
    estimated_resolution_time: Optional[str] = Field(None, alias="estimatedResolutionTime")

    class Config:
        populate_by_name = True


class Ticket(TicketBase):
    """工单（返回给前端）"""
    id: str
    assignee: Optional[str] = None  # 前端需要assignee字段
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    history: Optional[Dict[str, Any]] = None
    steps: Optional[List[Dict[str, Any]]] = None  # 前端需要的步骤数据
    root_cause: Optional[str] = Field(None, alias="rootCause")
    solution: Optional[str] = None
    before_photo_urls: Optional[List[str]] = Field(None, alias="beforePhotoUrls")
    after_photo_urls: Optional[List[str]] = Field(None, alias="afterPhotoUrls")
    feedback: Optional[str] = None
    feedback_photo_urls: Optional[List[str]] = Field(None, alias="feedbackPhotoUrls")
    problem_photo_urls: Optional[List[str]] = Field(None, alias="problemPhotoUrls")
    related_ticket_id: Optional[str] = Field(None, alias="relatedTicketId")

    class Config:
        from_attributes = True
        populate_by_name = True


class TicketListResponse(BaseModel):
    """工单列表响应"""
    tickets: List[Ticket]
    total: int
    has_more: bool = Field(..., alias="hasMore")

    class Config:
        populate_by_name = True

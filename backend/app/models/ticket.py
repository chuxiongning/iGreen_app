"""
Ticket and TicketStep Models
工单和工单步骤模型
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


# 枚举类型定义
class TicketStatus(str, enum.Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    DEPARTED = "departed"
    ARRIVED = "arrived"
    REVIEW = "review"
    COMPLETED = "completed"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketType(str, enum.Enum):
    CORRECTIVE = "corrective"  # 纠正性维护
    PLANNED = "planned"  # 计划性维护
    PREVENTIVE = "preventive"  # 预防性维护
    PROBLEM = "problem"  # 问题管理


class StepStatus(str, enum.Enum):
    PASS = "pass"
    FAIL = "fail"
    NA = "na"
    PENDING = "pending"


class Ticket(Base):
    __tablename__ = "tickets"

    # 主键
    id = Column(String(50), primary_key=True, index=True)

    # 基本信息
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.OPEN, nullable=False, index=True)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.MEDIUM, nullable=False, index=True)
    type = Column(SQLEnum(TicketType), nullable=False, index=True)

    # 关联信息
    requester = Column(String(255), nullable=False)  # 请求人
    assignee_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)  # 分配的技术员ID
    assignee_name = Column(String(100), nullable=True)  # 分配的技术员姓名（冗余字段，方便查询）

    # 位置信息
    location = Column(String(500), nullable=True)

    # 标签（存储为JSON数组）
    tags = Column(JSON, nullable=True)  # ["offline", "network", "urgent"]

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 历史记录（存储为JSON）
    history = Column(JSON, nullable=True)  # {"departedAt": "...", "arrivedAt": "...", "completedAt": "..."}

    # 预防性维护步骤（存储为JSON）
    # 这些步骤会动态创建，不单独建表
    steps_data = Column(JSON, nullable=True)  # 存储步骤数据

    # 纠正性维护字段
    root_cause = Column(Text, nullable=True)  # 根本原因
    solution = Column(Text, nullable=True)  # 解决方案
    before_photo_urls = Column(JSON, nullable=True)  # 维修前照片URLs
    after_photo_urls = Column(JSON, nullable=True)  # 维修后照片URLs

    # 计划性维护字段
    feedback = Column(Text, nullable=True)  # 反馈
    feedback_photo_urls = Column(JSON, nullable=True)  # 反馈照片URLs
    estimated_resolution_time = Column(String(100), nullable=True)  # 预计解决时间

    # 问题管理字段
    problem_photo_urls = Column(JSON, nullable=True)  # 问题照片URLs
    related_ticket_id = Column(String(50), nullable=True)  # 关联工单ID

    # 关系
    assigned_user = relationship("User", back_populates="tickets", foreign_keys=[assignee_id])
    steps = relationship("TicketStep", back_populates="ticket", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Ticket {self.id} - {self.title}>"


class TicketStep(Base):
    """
    工单步骤模型（主要用于预防性维护）
    """
    __tablename__ = "ticket_steps"

    # 主键
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # 外键
    ticket_id = Column(String(50), ForeignKey("tickets.id"), nullable=False, index=True)

    # 步骤信息
    step_id = Column(String(50), nullable=False)  # 步骤编号（如 "1", "2", "3"）
    label = Column(String(1000), nullable=False)  # 步骤标签/描述
    description = Column(Text, nullable=True)  # 额外描述
    completed = Column(Integer, default=0, nullable=False)  # 0=未完成, 1=完成

    # 状态
    status = Column(SQLEnum(StepStatus), default=StepStatus.PENDING, nullable=True)

    # 照片
    photo_urls = Column(JSON, nullable=True)  # 步骤照片URLs
    before_photo_urls = Column(JSON, nullable=True)  # 维修前照片URLs
    after_photo_urls = Column(JSON, nullable=True)  # 维修后照片URLs

    # 其他字段
    cause = Column(Text, nullable=True)  # 失败原因
    timestamp = Column(DateTime, nullable=True)  # 完成时间
    location = Column(String(500), nullable=True)  # 位置信息

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    ticket = relationship("Ticket", back_populates="steps")

    def __repr__(self):
        return f"<TicketStep {self.step_id} for Ticket {self.ticket_id}>"

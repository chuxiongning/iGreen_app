"""
User Model
用户模型
"""
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    # 主键
    id = Column(String(50), primary_key=True, index=True)

    # 认证信息
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)

    # 用户信息
    name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    group = Column(String(255), nullable=True)  # 用户所属组/部门

    # 偏好设置
    language = Column(String(10), default="en")  # 语言偏好: en, th

    # 状态
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    tickets = relationship("Ticket", back_populates="assigned_user", foreign_keys="Ticket.assignee_id")

    def __repr__(self):
        return f"<User {self.username}>"

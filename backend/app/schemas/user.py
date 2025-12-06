"""
User Schemas
用户相关的Pydantic模型
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    group: Optional[str] = None


class UserCreate(UserBase):
    """用户创建模型"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """用户更新模型"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class UserProfile(BaseModel):
    """用户资料模型（返回给前端）"""
    id: str
    username: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    group: Optional[str] = None
    language: str = "en"
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserPreferences(BaseModel):
    """用户偏好设置"""
    language: str = Field(..., pattern="^(en|th)$")


class Token(BaseModel):
    """认证令牌"""
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class TokenData(BaseModel):
    """令牌数据"""
    username: Optional[str] = None

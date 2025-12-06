"""
User Management Endpoints
用户管理相关接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.user import UserProfile, UserUpdate, UserPreferences

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    获取当前用户资料

    返回:
    - 用户资料信息
    """
    return UserProfile.from_orm(current_user)


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新用户资料

    参数:
    - user_data: 用户更新数据（name, phone等）

    返回:
    - 更新后的用户资料
    """
    # 更新字段
    update_data = user_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)

    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    return UserProfile.from_orm(current_user)


@router.put("/preferences", response_model=dict)
async def update_user_preferences(
    preferences: UserPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新用户偏好设置

    参数:
    - preferences: 偏好设置（语言等）

    返回:
    - 更新结果
    """
    # 更新语言偏好
    current_user.language = preferences.language
    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Preferences updated successfully",
        "language": current_user.language
    }

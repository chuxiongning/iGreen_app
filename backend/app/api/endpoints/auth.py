"""
Authentication Endpoints
用户认证相关接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_active_user,
)
from app.models.user import User
from app.schemas.user import Token, UserProfile

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    用户登录

    参数:
    - username: 用户名
    - password: 密码

    返回:
    - access_token: JWT访问令牌
    - token_type: 令牌类型
    - user: 用户信息
    """
    # 查找用户
    user = db.query(User).filter(User.username == form_data.username).first()

    # 验证用户和密码
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 检查用户是否激活
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    # 返回令牌和用户信息
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserProfile.from_orm(user)
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    用户登出

    注意：由于使用JWT，实际的登出逻辑应该在客户端删除token
    这个接口主要用于记录日志或执行清理操作
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserProfile)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    获取当前登录用户信息

    返回:
    - 当前用户的详细信息
    """
    return UserProfile.from_orm(current_user)

"""
File Upload Endpoints
文件上传相关接口
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
import os
import uuid
from pathlib import Path

from app.core.config import settings
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()

# 确保上传目录存在
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload_file(upload_file: UploadFile) -> str:
    """
    保存上传的文件

    参数:
    - upload_file: 上传的文件

    返回:
    - 文件URL
    """
    # 验证文件扩展名
    file_ext = Path(upload_file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_ext} not allowed. Allowed types: {settings.ALLOWED_IMAGE_EXTENSIONS}"
        )

    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # 保存文件
    try:
        with open(file_path, "wb") as f:
            content = upload_file.file.read()

            # 检查文件大小
            if len(content) > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes"
                )

            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    finally:
        upload_file.file.close()

    # 返回文件URL（相对路径）
    # 在实际部署中，这里应该返回完整的URL（如：https://your-domain.com/uploads/filename）
    file_url = f"/uploads/{unique_filename}"
    return file_url


@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    上传单张图片

    参数:
    - file: 图片文件

    返回:
    - url: 图片URL
    """
    file_url = save_upload_file(file)

    return {
        "url": file_url,
        "filename": file.filename
    }


@router.post("/images", response_model=dict)
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    批量上传图片

    参数:
    - files: 图片文件列表

    返回:
    - urls: 图片URL列表
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )

    file_urls = []
    for file in files:
        try:
            file_url = save_upload_file(file)
            file_urls.append(file_url)
        except HTTPException:
            # 如果某个文件失败，继续处理其他文件
            continue

    return {
        "urls": file_urls,
        "count": len(file_urls)
    }

"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "iGreen+ Backend API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database Configuration
    # 请根据实际情况修改以下数据库连接参数
    DB_HOST: str = "localhost"  # 数据库主机地址
    DB_PORT: int = 3306  # 数据库端口
    DB_USER: str = "igreen_user"  # 数据库用户名
    DB_PASSWORD: str = "your_password_here"  # 数据库密码
    DB_NAME: str = "igreen_db"  # 数据库名称

    @property
    def DATABASE_URL(self) -> str:
        """构建MySQL数据库连接URL"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-this-in-production-please-use-strong-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

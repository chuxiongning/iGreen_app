"""
Database Initialization Script
数据库初始化脚本

使用方法:
python scripts/init_db.py
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import Base, engine
from app.models import User, Ticket, TicketStep

def init_database():
    """初始化数据库表"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    print("\nTables created:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")

if __name__ == "__main__":
    try:
        init_database()
        print("\n✅ Database initialization completed!")
        print("\n📝 Next steps:")
        print("1. Start the server: python app/main.py")
        print("2. Initialize seed data: curl -X POST http://localhost:8000/api/seed")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

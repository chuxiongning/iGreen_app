# iGreen+ Backend API

这是iGreen+充电桩维护工单管理系统的后端API服务，基于FastAPI开发。

## 功能模块

### 1. 用户认证模块 (Authentication)
- **POST** `/api/auth/login` - 用户登录
- **POST** `/api/auth/logout` - 用户登出
- **GET** `/api/auth/me` - 获取当前用户信息

### 2. 工单管理模块 (Tickets)
- **GET** `/api/tickets` - 获取工单列表（支持分页和筛选）
- **GET** `/api/tickets/{id}` - 获取工单详情
- **POST** `/api/tickets` - 创建新工单
- **PUT** `/api/tickets/{id}` - 更新工单
- **POST** `/api/tickets/{id}/assign` - 抢单/分配工单
- **POST** `/api/tickets/{id}/depart` - 标记出发
- **POST** `/api/tickets/{id}/arrive` - 标记到达
- **POST** `/api/tickets/{id}/complete` - 完成工单
- **PUT** `/api/tickets/{ticket_id}/steps/{step_id}` - 更新工单步骤

### 3. 用户资料管理模块 (Users)
- **GET** `/api/users/profile` - 获取用户资料
- **PUT** `/api/users/profile` - 更新用户资料
- **PUT** `/api/users/preferences` - 更新用户偏好设置

### 4. 文件上传模块 (Upload)
- **POST** `/api/upload/image` - 上传单张图片
- **POST** `/api/upload/images` - 批量上传图片

### 5. 种子数据模块 (Seed)
- **POST** `/api/seed` - 初始化种子数据

## 技术栈

- **框架**: FastAPI 0.109.0
- **数据库**: MySQL (通过 SQLAlchemy ORM)
- **认证**: JWT (JSON Web Token)
- **数据验证**: Pydantic
- **密码加密**: Bcrypt
- **Web服务器**: Uvicorn

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI主应用
│   ├── api/
│   │   ├── __init__.py
│   │   └── endpoints/          # API端点
│   │       ├── auth.py         # 认证接口
│   │       ├── tickets.py      # 工单管理接口
│   │       ├── users.py        # 用户管理接口
│   │       ├── upload.py       # 文件上传接口
│   │       └── seed.py         # 种子数据接口
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # 配置文件
│   │   ├── database.py         # 数据库配置
│   │   └── security.py         # 安全工具（JWT、密码加密）
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py             # 用户模型
│   │   └── ticket.py           # 工单模型
│   └── schemas/
│       ├── __init__.py
│       ├── user.py             # 用户Pydantic模型
│       └── ticket.py           # 工单Pydantic模型
├── uploads/                    # 上传文件存储目录
├── requirements.txt            # 项目依赖
├── .env.example                # 环境变量示例
└── README.md                   # 项目文档
```

## 安装和部署

### 1. 环境要求

- Python 3.8+
- MySQL 5.7+ 或 8.0+

### 2. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置数据库

#### 3.1 创建MySQL数据库

```sql
CREATE DATABASE igreen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'igreen_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON igreen_db.* TO 'igreen_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3.2 配置环境变量

复制 `.env.example` 为 `.env` 并修改数据库连接参数：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost          # 数据库主机地址
DB_PORT=3306              # 数据库端口
DB_USER=igreen_user       # 数据库用户名
DB_PASSWORD=your_password # 数据库密码
DB_NAME=igreen_db         # 数据库名称

# JWT密钥（请修改为强密码）
SECRET_KEY=your-secret-key-change-this-in-production
```

### 4. 启动服务

```bash
# 开发模式（支持热重载）
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或者直接运行
python app/main.py
```

服务将在 `http://localhost:8000` 启动。

### 5. 初始化数据

首次启动后，访问以下接口初始化种子数据：

```bash
curl -X POST http://localhost:8000/api/seed
```

这将创建：
- 2个测试用户（mike.tech/password 和 admin/admin123）
- 6个示例工单

### 6. 访问API文档

启动服务后，可以访问：

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 数据库模型

### User（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String(50) | 用户ID（主键）|
| username | String(100) | 用户名（唯一）|
| email | String(255) | 邮箱（唯一）|
| hashed_password | String(255) | 密码哈希 |
| name | String(100) | 姓名 |
| phone | String(50) | 电话 |
| group | String(255) | 所属组/部门 |
| language | String(10) | 语言偏好 |
| is_active | Boolean | 是否激活 |
| is_admin | Boolean | 是否管理员 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### Ticket（工单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String(50) | 工单ID（主键）|
| title | String(500) | 标题 |
| description | Text | 描述 |
| status | Enum | 状态（open, assigned, departed, arrived, review, completed）|
| priority | Enum | 优先级（low, medium, high, critical）|
| type | Enum | 类型（corrective, planned, preventive, problem）|
| requester | String(255) | 请求人 |
| assignee_id | String(50) | 分配技术员ID |
| assignee_name | String(100) | 分配技术员姓名 |
| location | String(500) | 位置 |
| tags | JSON | 标签数组 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |
| history | JSON | 历史记录 |
| steps_data | JSON | 步骤数据 |
| root_cause | Text | 根本原因 |
| solution | Text | 解决方案 |
| before_photo_urls | JSON | 维修前照片 |
| after_photo_urls | JSON | 维修后照片 |
| feedback | Text | 反馈 |
| feedback_photo_urls | JSON | 反馈照片 |
| problem_photo_urls | JSON | 问题照片 |
| related_ticket_id | String(50) | 关联工单ID |
| estimated_resolution_time | String(100) | 预计解决时间 |

### TicketStep（工单步骤表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 自增ID（主键）|
| ticket_id | String(50) | 工单ID（外键）|
| step_id | String(50) | 步骤编号 |
| label | String(1000) | 步骤标签 |
| description | Text | 描述 |
| completed | Integer | 是否完成（0/1）|
| status | Enum | 状态（pass, fail, na, pending）|
| photo_urls | JSON | 照片URLs |
| before_photo_urls | JSON | 维修前照片URLs |
| after_photo_urls | JSON | 维修后照片URLs |
| cause | Text | 失败原因 |
| timestamp | DateTime | 完成时间 |
| location | String(500) | 位置 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

## 测试账号

初始化种子数据后，可以使用以下账号登录：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| mike.tech | password | 普通技术员 |
| admin | admin123 | 管理员 |

## API使用示例

### 1. 用户登录

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=mike.tech&password=password"
```

响应：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "TECH-8821",
    "username": "mike.tech",
    "name": "Mike Technician",
    "email": "mike@igreenplus.com",
    "phone": "+1 (555) 123-4567",
    "group": "Bangkok Operations (Zone A)",
    "language": "en",
    "is_active": true,
    "created_at": "2025-12-06T..."
  }
}
```

### 2. 获取工单列表

```bash
curl -X GET "http://localhost:8000/api/tickets?offset=0&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. 抢单

```bash
curl -X POST "http://localhost:8000/api/tickets/WO-2024/assign" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. 上传图片

```bash
curl -X POST "http://localhost:8000/api/upload/image" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

## 生产部署建议

### 1. 使用Gunicorn + Uvicorn Workers

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 2. 使用Nginx作为反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

### 3. 安全建议

- 修改 `SECRET_KEY` 为强随机密钥
- 修改数据库密码为强密码
- 启用HTTPS
- 配置防火墙规则
- 定期备份数据库
- 配置日志监控

## 常见问题

### Q: 数据库连接失败？
A: 请检查 `.env` 文件中的数据库配置是否正确，确保MySQL服务已启动。

### Q: JWT令牌验证失败？
A: 请确保在请求头中正确设置了 `Authorization: Bearer YOUR_TOKEN`。

### Q: 文件上传失败？
A: 请确保 `uploads` 目录存在且有写入权限。

## 许可证

此项目仅供学习和开发使用。

## 联系方式

如有问题，请联系开发团队。

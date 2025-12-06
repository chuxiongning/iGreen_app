# iGreen+ 前后端集成指南

本文档说明如何将iGreen+前端应用与FastAPI后端服务集成。

## 目录结构

```
iGreen_app/
├── backend/              # FastAPI后端服务
│   ├── app/
│   │   ├── api/         # API端点
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据库模型
│   │   └── schemas/     # Pydantic模型
│   ├── uploads/         # 文件上传目录
│   ├── requirements.txt
│   └── README.md
├── src/                 # React前端应用
│   ├── components/      # React组件
│   ├── lib/            # 工具库
│   │   ├── api.ts      # API客户端
│   │   ├── auth.ts     # 认证管理
│   │   └── data.ts     # 数据类型
│   └── ...
├── .env                # 环境变量配置
└── INTEGRATION.md      # 本文档
```

## 快速开始

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置数据库（参考backend/README.md）
# 编辑 .env 文件设置数据库连接

# 启动服务
./start.sh
# 或
python app/main.py
```

后端服务将在 `http://localhost:8000` 启动

### 2. 初始化数据库

```bash
# 访问种子数据接口初始化测试数据
curl -X POST http://localhost:8000/api/seed
```

这将创建：
- 2个测试用户
- 6个示例工单

### 3. 启动前端应用

```bash
# 在项目根目录
npm install  # 首次运行需要安装依赖
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

## 集成架构

### 认证流程

```
1. 用户登录
   ├─> 前端: Login.tsx
   ├─> API: POST /api/auth/login
   ├─> 后端验证用户名密码
   ├─> 返回JWT token + 用户信息
   └─> 前端保存token到localStorage

2. 后续请求
   ├─> 前端从localStorage获取token
   ├─> 添加 Authorization: Bearer <token> 到请求头
   ├─> 后端验证token
   └─> 返回数据

3. Token失效
   ├─> 后端返回401错误
   ├─> 前端清除本地token
   └─> 重定向到登录页面
```

### API调用示例

#### 登录
```typescript
import { api } from './lib/api';

const authData = await api.login('mike.tech', 'password');
// 返回: { access_token, token_type, user }
```

#### 获取工单列表
```typescript
const tickets = await api.getTickets(0, 20);
// 返回: Ticket[]
```

#### 更新工单
```typescript
const updatedTicket = await api.updateTicket('WO-2024', {
  status: 'completed',
  solution: 'Replaced network module'
});
```

#### 上传图片
```typescript
const result = await api.uploadImage(file);
// 返回: { url: '/uploads/xxx.jpg', filename: 'original.jpg' }
```

## 环境配置

### 前端环境变量 (.env)

```env
VITE_API_URL=http://localhost:8000
```

**生产环境**：修改为实际部署的后端地址
```env
VITE_API_URL=https://api.yourdomain.com
```

### 后端环境变量 (backend/.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=igreen_user
DB_PASSWORD=your_password
DB_NAME=igreen_db

# JWT配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# 文件上传
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
```

## API端点清单

### 认证 `/api/auth`
- `POST /login` - 用户登录
- `POST /logout` - 用户登出
- `GET /me` - 获取当前用户

### 工单 `/api/tickets`
- `GET /` - 获取工单列表
- `GET /{id}` - 获取工单详情
- `POST /` - 创建工单
- `PUT /{id}` - 更新工单
- `POST /{id}/assign` - 抢单
- `POST /{id}/depart` - 出发
- `POST /{id}/arrive` - 到达
- `POST /{id}/complete` - 完成
- `PUT /{id}/steps/{step_id}` - 更新步骤

### 用户 `/api/users`
- `GET /profile` - 获取用户资料
- `PUT /profile` - 更新用户资料
- `PUT /preferences` - 更新偏好设置

### 文件上传 `/api/upload`
- `POST /image` - 上传单张图片
- `POST /images` - 批量上传图片

### 种子数据 `/api/seed`
- `POST /` - 初始化测试数据

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| mike.tech | password | 技术员 |
| admin | admin123 | 管理员 |

## 数据模型映射

### Ticket (工单)

前端 TypeScript 接口与后端 Pydantic 模型完全对应：

```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'departed' | 'arrived' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'corrective' | 'planned' | 'preventive' | 'problem';
  requester: string;
  assignee?: string;
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  history?: {
    departedAt?: string;
    arrivedAt?: string;
    completedAt?: string;
  };
  steps?: TicketStep[];
  rootCause?: string;
  solution?: string;
  beforePhotoUrls?: string[];
  afterPhotoUrls?: string[];
  feedback?: string;
  feedbackPhotoUrls?: string[];
  problemPhotoUrls?: string[];
  relatedTicketId?: string;
  estimatedResolutionTime?: string;
}
```

## 错误处理

前端使用 `ApiError` 类统一处理API错误：

```typescript
try {
  await api.updateTicket(id, updates);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // 未授权，跳转登录
    } else if (error.status === 404) {
      // 资源不存在
    } else {
      toast.error(error.message);
    }
  } else {
    // 网络错误
    toast.error("Cannot connect to server");
  }
}
```

## 常见问题

### Q: 登录时提示"Cannot connect to server"？
**A**: 请确认后端服务已启动，并检查 `.env` 中的 `VITE_API_URL` 配置是否正确。

### Q: 上传图片失败？
**A**:
1. 检查后端 `uploads` 目录是否存在且有写权限
2. 检查文件大小是否超过限制（默认10MB）
3. 检查文件格式是否支持（.jpg, .jpeg, .png, .gif, .webp）

### Q: Token过期怎么办？
**A**: Token默认有效期7天。过期后会自动跳转登录页面，重新登录即可。

### Q: 如何切换到生产环境？
**A**:
1. 修改前端 `.env` 文件中的 `VITE_API_URL`
2. 重新构建前端：`npm run build`
3. 部署后端服务到生产服务器
4. 配置Nginx反向代理

## 部署建议

### 前端部署

```bash
# 构建生产版本
npm run build

# 部署dist目录到静态服务器（Nginx, Vercel, Netlify等）
```

### 后端部署

```bash
# 使用Gunicorn + Uvicorn Workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 或使用Docker（推荐）
docker build -t igreen-backend .
docker run -p 8000:8000 igreen-backend
```

### Nginx配置示例

```nginx
# 前端
server {
    listen 80;
    server_name app.yourdomain.com;
    root /var/www/igreen-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 后端
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

## 开发工作流

1. **后端开发**
   - 修改代码
   - 自动重载（--reload模式）
   - 测试API（Swagger UI: http://localhost:8000/api/docs）

2. **前端开发**
   - 修改组件
   - 热重载（HMR）
   - 调用后端API

3. **调试技巧**
   - 使用浏览器开发工具查看网络请求
   - 查看后端日志输出
   - 使用Swagger UI测试API

## 支持与帮助

- 前端文档：`README.md`
- 后端文档：`backend/README.md`
- API文档：http://localhost:8000/api/docs

## 更新日志

### v1.0.0 (2025-12-06)
- ✅ 完整的认证系统（JWT）
- ✅ 工单CRUD操作
- ✅ 文件上传功能
- ✅ 用户资料管理
- ✅ 语言偏好同步
- ✅ 错误处理和重试机制
- ✅ 乐观更新UI

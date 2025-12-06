/**
 * iGreen+ Backend API Client
 * 后端API客户端
 */
import { Ticket, TicketStep } from './data';
import { getAuthToken, clearAuth, AuthToken, UserData } from './auth';

// API配置
// 开发环境：使用本地后端
// 生产环境：修改为实际部署的后端地址
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API错误类
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 通用请求函数（带认证）
 */
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 如果有token，添加Authorization头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 处理401错误（未授权）
  if (response.status === 401) {
    clearAuth();
    window.location.reload(); // 重新加载页面回到登录界面
    throw new ApiError(401, 'Unauthorized - Please login again');
  }

  // 处理其他错误
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      throw new ApiError(response.status, errorMessage, errorData);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || errorMessage);
    }
  }

  // 处理204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * 不需要认证的请求（用于登录等）
 */
async function fetchWithoutAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      throw new ApiError(response.status, errorMessage, errorData);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || errorMessage);
    }
  }

  return response.json();
}

// ==================== 认证 API ====================

export const authApi = {
  /**
   * 用户登录
   */
  login: async (username: string, password: string): Promise<AuthToken> => {
    // FastAPI OAuth2PasswordRequestForm需要使用form-urlencoded格式
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || 'Login failed',
        errorData
      );
    }

    return response.json();
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    await fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    });
    clearAuth();
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<UserData> => {
    return fetchWithAuth('/api/auth/me');
  },
};

// ==================== 工单 API ====================

export const ticketApi = {
  /**
   * 获取工单列表
   */
  getTickets: async (
    offset = 0,
    limit = 50,
    status?: string,
    priority?: string
  ): Promise<Ticket[]> => {
    let url = `/api/tickets?offset=${offset}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;

    return fetchWithAuth(url);
  },

  /**
   * 获取工单详情
   */
  getTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}`);
  },

  /**
   * 创建工单
   */
  createTicket: async (ticketData: Partial<Ticket>): Promise<Ticket> => {
    return fetchWithAuth('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  /**
   * 更新工单
   */
  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * 抢单/分配工单
   */
  assignTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/assign`, {
      method: 'POST',
    });
  },

  /**
   * 标记出发
   */
  departTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/depart`, {
      method: 'POST',
    });
  },

  /**
   * 标记到达
   */
  arriveTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/arrive`, {
      method: 'POST',
    });
  },

  /**
   * 完成工单
   */
  completeTicket: async (id: string): Promise<Ticket> => {
    return fetchWithAuth(`/api/tickets/${id}/complete`, {
      method: 'POST',
    });
  },

  /**
   * 更新工单步骤
   */
  updateTicketStep: async (
    ticketId: string,
    stepId: string,
    updates: Partial<TicketStep>
  ): Promise<any> => {
    return fetchWithAuth(`/api/tickets/${ticketId}/steps/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ==================== 用户 API ====================

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  email?: string;
}

export interface UserPreferences {
  language: 'en' | 'th';
}

export const userApi = {
  /**
   * 获取用户资料
   */
  getProfile: async (): Promise<UserData> => {
    return fetchWithAuth('/api/users/profile');
  },

  /**
   * 更新用户资料
   */
  updateProfile: async (updates: UserProfileUpdate): Promise<UserData> => {
    return fetchWithAuth('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * 更新用户偏好
   */
  updatePreferences: async (preferences: UserPreferences): Promise<any> => {
    return fetchWithAuth('/api/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

// ==================== 文件上传 API ====================

export const uploadApi = {
  /**
   * 上传单张图片
   */
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || 'Upload failed',
        errorData
      );
    }

    return response.json();
  },

  /**
   * 批量上传图片
   */
  uploadImages: async (files: File[]): Promise<{ urls: string[]; count: number }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || 'Upload failed',
        errorData
      );
    }

    return response.json();
  },
};

// ==================== 种子数据 API ====================

export const seedApi = {
  /**
   * 初始化种子数据
   */
  seedData: async (): Promise<any> => {
    return fetchWithAuth('/api/seed', {
      method: 'POST',
    });
  },
};

// ==================== 导出统一的 API 对象 ====================

export const api = {
  // 认证
  login: authApi.login,
  logout: authApi.logout,
  getCurrentUser: authApi.getCurrentUser,

  // 工单
  getTickets: ticketApi.getTickets,
  getTicket: ticketApi.getTicket,
  createTicket: ticketApi.createTicket,
  updateTicket: ticketApi.updateTicket,
  assignTicket: ticketApi.assignTicket,
  departTicket: ticketApi.departTicket,
  arriveTicket: ticketApi.arriveTicket,
  completeTicket: ticketApi.completeTicket,
  updateTicketStep: ticketApi.updateTicketStep,

  // 用户
  getProfile: userApi.getProfile,
  updateProfile: userApi.updateProfile,
  updatePreferences: userApi.updatePreferences,

  // 文件上传
  uploadImage: uploadApi.uploadImage,
  uploadImages: uploadApi.uploadImages,

  // 种子数据
  seedTickets: seedApi.seedData,
};

// 导出API模块
export { authApi, ticketApi, userApi, uploadApi, seedApi };

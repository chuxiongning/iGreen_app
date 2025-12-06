/**
 * Authentication & Token Management
 * 认证和令牌管理
 */

const TOKEN_KEY = 'igreen_auth_token';
const USER_KEY = 'igreen_user';

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: UserData;
}

export interface UserData {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  group?: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

/**
 * 保存认证令牌到本地存储
 */
export function saveAuthToken(authData: AuthToken): void {
  localStorage.setItem(TOKEN_KEY, authData.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
}

/**
 * 获取认证令牌
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): UserData | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 清除认证信息
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * 检查是否已认证
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * 更新本地存储的用户信息
 */
export function updateLocalUser(updates: Partial<UserData>): void {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }
}

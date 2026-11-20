import api, { setAccessToken } from './axios';
import { REFRESH_TOKEN_KEY } from '../lib/constants';

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER';
  status: 'ACTIVE' | 'INVITED';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  role?: 'ADMIN' | 'MANAGER' | 'DEVELOPER';
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    if (res.data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
    }
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    if (res.data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
    }
    return res.data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    if (res.data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore error on logout
    } finally {
      setAccessToken(null);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  async me(): Promise<UserDto> {
    const res = await api.get<UserDto>('/auth/me');
    return res.data;
  },
};

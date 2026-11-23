import api, { setAccessToken } from './axios';

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
    // Refresh token is stored in httpOnly cookie by the server — do not store in localStorage
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    // Refresh token is stored in httpOnly cookie by the server — do not store in localStorage
    return res.data;
  },

  async refresh(): Promise<AuthResponse> {
    // No body needed — refresh token is sent automatically via httpOnly cookie
    const res = await api.post<AuthResponse>('/auth/refresh');
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore error on logout
    } finally {
      setAccessToken(null);
    }
  },

  async me(): Promise<UserDto> {
    const res = await api.get<UserDto>('/auth/me');
    return res.data;
  },
};

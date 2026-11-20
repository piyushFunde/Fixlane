import api from './axios';
import { UserDto } from './auth';

export interface InviteUserRequest {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER';
}

export const usersApi = {
  async list(): Promise<UserDto[]> {
    const res = await api.get<UserDto[]>('/users');
    return res.data;
  },

  async updateRole(userId: string, role: 'ADMIN' | 'MANAGER' | 'DEVELOPER'): Promise<UserDto> {
    const res = await api.patch<UserDto>(`/users/${userId}/role`, { role });
    return res.data;
  },

  async invite(data: InviteUserRequest): Promise<UserDto> {
    const res = await api.post<UserDto>('/users/invite', data);
    return res.data;
  },
};

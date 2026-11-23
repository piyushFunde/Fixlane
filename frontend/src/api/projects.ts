import api from './axios';
import type { UserDto } from './auth';

export interface ProjectDto {
  id: string;
  name: string;
  key: string;
  description?: string;
  leadId?: string;
  leadName?: string;
  lead?: UserDto;
  totalIssues?: number;
  doneIssues?: number;
  members?: UserDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  key: string;
  description?: string;
  leadId?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  leadId?: string;
}

export const projectsApi = {
  async list(): Promise<ProjectDto[]> {
    const res = await api.get<ProjectDto[]>('/projects');
    return res.data;
  },

  async getById(id: string): Promise<ProjectDto> {
    const res = await api.get<ProjectDto>(`/projects/${id}`);
    return res.data;
  },

  async create(data: CreateProjectRequest): Promise<ProjectDto> {
    const res = await api.post<ProjectDto>('/projects', data);
    return res.data;
  },

  async update(id: string, data: UpdateProjectRequest): Promise<ProjectDto> {
    const res = await api.put<ProjectDto>(`/projects/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getMembers(id: string): Promise<UserDto[]> {
    const res = await api.get<UserDto[]>(`/projects/${id}/members`);
    return res.data;
  },

  async addMember(id: string, userId: string): Promise<void> {
    await api.post(`/projects/${id}/members`, { userId });
  },

  async removeMember(id: string, userId: string): Promise<void> {
    await api.delete(`/projects/${id}/members/${userId}`);
  },
};

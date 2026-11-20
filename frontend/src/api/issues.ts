import api from './axios';
import { UserDto } from './auth';

export type IssuePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface IssueDto {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  projectKey?: string;
  assigneeId?: string;
  assigneeName?: string;
  assignee?: UserDto;
  reporterId?: string;
  reporterName?: string;
  reporter?: UserDto;
  dueDate?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueRequest {
  projectId: string;
  title: string;
  description?: string;
  priority: IssuePriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface IssueFilterParams {
  q?: string;
  priority?: string;
  mine?: boolean | string;
  status?: string;
}

export const issuesApi = {
  async listByProject(projectId: string, params?: IssueFilterParams): Promise<IssueDto[]> {
    const res = await api.get<IssueDto[]>(`/projects/${projectId}/issues`, { params });
    return res.data;
  },

  async getByKey(key: string): Promise<IssueDto> {
    const res = await api.get<IssueDto>(`/issues/${key}`);
    return res.data;
  },

  async create(data: CreateIssueRequest): Promise<IssueDto> {
    const res = await api.post<IssueDto>('/issues', data);
    return res.data;
  },

  async update(key: string, data: UpdateIssueRequest): Promise<IssueDto> {
    const res = await api.put<IssueDto>(`/issues/${key}`, data);
    return res.data;
  },

  async delete(key: string): Promise<void> {
    await api.delete(`/issues/${key}`);
  },

  async updateStatus(key: string, status: IssueStatus, orderIndex?: number): Promise<IssueDto> {
    const res = await api.patch<IssueDto>(`/issues/${key}/status`, { status, orderIndex });
    return res.data;
  },

  async updateAssignee(key: string, assigneeId: string | null): Promise<IssueDto> {
    const res = await api.patch<IssueDto>(`/issues/${key}/assignee`, { assigneeId });
    return res.data;
  },

  async reorder(projectId: string, issueIds: string[]): Promise<void> {
    await api.post(`/projects/${projectId}/issues/reorder`, { issueIds });
  },
};

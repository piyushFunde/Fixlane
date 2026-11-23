import api from './axios';
import type { UserDto } from './auth';

export interface CommentDto {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  author?: UserDto;
  content: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export const commentsApi = {
  async list(issueKeyOrId: string): Promise<CommentDto[]> {
    const res = await api.get<CommentDto[]>(`/issues/${issueKeyOrId}/comments`);
    return res.data;
  },

  async create(issueKeyOrId: string, data: CreateCommentRequest): Promise<CommentDto> {
    const res = await api.post<CommentDto>(`/issues/${issueKeyOrId}/comments`, data);
    return res.data;
  },

  async delete(issueKeyOrId: string, commentId: string): Promise<void> {
    await api.delete(`/issues/${issueKeyOrId}/comments/${commentId}`);
  },
};

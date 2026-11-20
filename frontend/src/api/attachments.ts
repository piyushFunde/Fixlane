import api from './axios';

export interface AttachmentDto {
  id: string;
  issueId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export const attachmentsApi = {
  async list(issueKey: string): Promise<AttachmentDto[]> {
    const res = await api.get<AttachmentDto[]>(`/issues/${issueKey}/attachments`);
    return res.data;
  },

  async upload(issueKey: string, file: File): Promise<AttachmentDto> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<AttachmentDto>(`/issues/${issueKey}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getUrl(attachmentId: string): string {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/attachments/${attachmentId}`;
  },
};

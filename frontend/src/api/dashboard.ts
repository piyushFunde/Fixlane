import api from './axios';
import { IssueDto } from './issues';

export interface ActivityItem {
  id: string;
  user: {
    id: string;
    fullName: string;
  };
  action: string;
  issueKey: string;
  issueTitle: string;
  timestamp: string;
}

export interface DashboardSummaryDto {
  assignedCount: number;
  highPriorityAssignedCount: number;
  inProgressCount: number;
  projectCount: number;
  dueThisWeekCount: number;
  doneThisSprintCount: number;
  totalSprintPlanned: number;
  priorityCounts: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  sprintProgress: {
    sprintName: string;
    projectName: string;
    endDate: string;
    done: number;
    inProgress: number;
    todo: number;
    total: number;
  };
  assignedIssues: IssueDto[];
  recentActivities: ActivityItem[];
}

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummaryDto> {
    const res = await api.get<DashboardSummaryDto>('/dashboard/summary');
    return res.data;
  },
};

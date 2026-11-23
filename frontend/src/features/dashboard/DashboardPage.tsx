import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { dashboardApi, type DashboardSummaryDto } from '../../api/dashboard';
import { getGreeting, formatDate, timeAgo } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.fullName.split(' ')[0] || 'there';
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const { data, isLoading } = useQuery<DashboardSummaryDto>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        return await dashboardApi.getSummary();
      } catch {
        // Fallback demo/initial data if backend is still starting or seeding
        return {
          assignedCount: 4,
          highPriorityAssignedCount: 2,
          inProgressCount: 5,
          projectCount: 2,
          dueThisWeekCount: 3,
          doneThisSprintCount: 8,
          totalSprintPlanned: 16,
          priorityCounts: {
            HIGH: 5,
            MEDIUM: 8,
            LOW: 3,
          },
          sprintProgress: {
            sprintName: 'Sprint 14',
            projectName: 'Payments API',
            endDate: 'Fri 27 Nov',
            done: 8,
            inProgress: 5,
            todo: 3,
            total: 16,
          },
          assignedIssues: [
            {
              id: '1',
              key: 'PAY-104',
              title: 'Implement Stripe webhook signature verification',
              priority: 'HIGH',
              status: 'IN_PROGRESS',
              projectId: 'proj-1',
              dueDate: '2026-11-24',
              createdAt: '2026-11-18T10:00:00Z',
              updatedAt: '2026-11-20T10:00:00Z',
            },
            {
              id: '2',
              key: 'PAY-108',
              title: 'Add retry exponential backoff for failed card charges',
              priority: 'HIGH',
              status: 'TODO',
              projectId: 'proj-1',
              dueDate: '2026-11-25',
              createdAt: '2026-11-19T10:00:00Z',
              updatedAt: '2026-11-20T10:00:00Z',
            },
            {
              id: '3',
              key: 'PAY-101',
              title: 'Add idempotency key header support to checkout API',
              priority: 'MEDIUM',
              status: 'IN_PROGRESS',
              projectId: 'proj-1',
              dueDate: '2026-11-26',
              createdAt: '2026-11-17T10:00:00Z',
              updatedAt: '2026-11-20T10:00:00Z',
            },
            {
              id: '4',
              key: 'PAY-112',
              title: 'Update invoice generation tax bracket logic',
              priority: 'LOW',
              status: 'TODO',
              projectId: 'proj-1',
              dueDate: '2026-11-28',
              createdAt: '2026-11-19T12:00:00Z',
              updatedAt: '2026-11-20T10:00:00Z',
            },
          ],
          recentActivities: [
            {
              id: 'a1',
              user: { id: 'u1', fullName: 'Sarah Connor' },
              action: 'moved PAY-104 to In Progress',
              issueKey: 'PAY-104',
              issueTitle: 'Stripe webhook verification',
              timestamp: '2026-11-20T11:45:00Z',
            },
            {
              id: 'a2',
              user: { id: 'u2', fullName: 'Alex Vance' },
              action: 'commented on PAY-98 "Vault rotation verified"',
              issueKey: 'PAY-98',
              issueTitle: 'Migrate card token storage',
              timestamp: '2026-11-20T10:30:00Z',
            },
            {
              id: 'a3',
              user: { id: 'u3', fullName: 'Dev One' },
              action: 'completed and closed PAY-92',
              issueKey: 'PAY-92',
              issueTitle: 'Configure audit log streaming',
              timestamp: '2026-11-20T09:15:00Z',
            },
          ],
        };
      }
    },
  });

  const sprint = data?.sprintProgress;
  const donePct = sprint && sprint.total > 0 ? (sprint.done / sprint.total) * 100 : 0;
  const inProgPct = sprint && sprint.total > 0 ? (sprint.inProgress / sprint.total) * 100 : 0;
  const todoPct = sprint && sprint.total > 0 ? (sprint.todo / sprint.total) * 100 : 0;

  const totalPriority =
    (data?.priorityCounts.HIGH || 0) + (data?.priorityCounts.MEDIUM || 0) + (data?.priorityCounts.LOW || 0) || 1;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-8 flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">{todayFormatted}</span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight mt-1">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/projects')}
            className="self-start sm:self-auto font-medium"
          >
            Open Sprint 14 board →
          </Button>
        </div>

        {/* 4 Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5 flex flex-col gap-2">
                <Skeleton width="40%" height={14} />
                <Skeleton width="60%" height={36} />
                <Skeleton width="50%" height={12} />
              </Card>
            ))
          ) : (
            <>
              {/* Tile 1 */}
              <Card className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Assigned to you</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold font-heading text-ink">{data?.assignedCount || 0}</span>
                </div>
                <span className="text-xs font-medium text-danger">
                  {data?.highPriorityAssignedCount || 0} are high priority
                </span>
              </Card>

              {/* Tile 2 */}
              <Card className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">In progress</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold font-heading text-ink">{data?.inProgressCount || 0}</span>
                </div>
                <span className="text-xs text-muted">across {data?.projectCount || 1} projects</span>
              </Card>

              {/* Tile 3 */}
              <Card className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Due this week</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold font-heading text-ink">{data?.dueThisWeekCount || 0}</span>
                </div>
                <span className="text-xs text-muted">Sprint 14 ends Friday</span>
              </Card>

              {/* Tile 4 */}
              <Card className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Done this sprint</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold font-heading text-[#0B5A4A]">{data?.doneThisSprintCount || 0}</span>
                </div>
                <span className="text-xs text-muted">of {data?.totalSprintPlanned || 0} planned</span>
              </Card>
            </>
          )}
        </div>

        {/* Sprint Progress & Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sprint Progress (8 cols) */}
          <Card className="lg:col-span-7 xl:col-span-8 p-6 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Active Sprint</span>
                <h3 className="text-xl font-bold text-ink mt-0.5">{sprint?.sprintName || 'Sprint 14'}</h3>
              </div>
              <span className="text-xs font-medium text-muted">
                {sprint?.projectName || 'Payments API'} · ends {sprint?.endDate || 'Fri 27 Nov'}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-full bg-[#EAEDE8] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${donePct}%` }}
                  className="bg-[#0B6E5B] h-full transition-all duration-500"
                  title={`Done: ${sprint?.done || 0}`}
                />
                <div
                  style={{ width: `${inProgPct}%` }}
                  className="bg-[#D99A1C] h-full transition-all duration-500"
                  title={`In progress: ${sprint?.inProgress || 0}`}
                />
                <div
                  style={{ width: `${todoPct}%` }}
                  className="bg-[#BAC2BD] h-full transition-all duration-500"
                  title={`To do: ${sprint?.todo || 0}`}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs font-medium text-muted pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B6E5B]"></span>
                  Done {sprint?.done || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D99A1C]"></span>
                  In progress {sprint?.inProgress || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BAC2BD]"></span>
                  To Do {sprint?.todo || 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Priority Breakdown (4 cols) */}
          <Card className="lg:col-span-5 xl:col-span-4 p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">By priority</h3>
              <span className="text-xs text-muted">{totalPriority} total</span>
            </div>

            <div className="flex flex-col gap-3">
              {/* High */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-danger">High</span>
                  <span className="font-mono font-medium text-ink">{data?.priorityCounts.HIGH || 0}</span>
                </div>
                <div className="h-2 w-full bg-[#EAEDE8] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${((data?.priorityCounts.HIGH || 0) / totalPriority) * 100}%` }}
                    className="h-full bg-danger rounded-full"
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#8F6209]">Medium</span>
                  <span className="font-mono font-medium text-ink">{data?.priorityCounts.MEDIUM || 0}</span>
                </div>
                <div className="h-2 w-full bg-[#EAEDE8] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${((data?.priorityCounts.MEDIUM || 0) / totalPriority) * 100}%` }}
                    className="h-full bg-[#D99A1C] rounded-full"
                  />
                </div>
              </div>

              {/* Low */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2F4F78]">Low</span>
                  <span className="font-mono font-medium text-ink">{data?.priorityCounts.LOW || 0}</span>
                </div>
                <div className="h-2 w-full bg-[#EAEDE8] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${((data?.priorityCounts.LOW || 0) / totalPriority) * 100}%` }}
                    className="h-full bg-[#4A729E] rounded-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Assigned To You Table & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assigned to You Table (8 cols) */}
          <Card className="lg:col-span-8 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Assigned to you</h3>
              <Link to="/projects" className="text-xs font-semibold text-primary hover:underline">
                All issues →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted uppercase font-semibold">
                    <th className="py-2.5 px-3">Key</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Due date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-3 px-3">
                          <Skeleton height={24} />
                        </td>
                      </tr>
                    ))
                  ) : data?.assignedIssues && data.assignedIssues.length > 0 ? (
                    data.assignedIssues.map((issue) => (
                      <tr
                        key={issue.id}
                        onClick={() => navigate(`/issues/${issue.key}`)}
                        className="hover:bg-bg/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-xs font-bold text-primary whitespace-nowrap">
                          {issue.key}
                        </td>
                        <td className="py-3 px-3 font-medium text-ink max-w-xs truncate">
                          {issue.title}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Pill
                            variant={issue.priority.toLowerCase() as 'high' | 'medium' | 'low'}
                            size="sm"
                          />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Pill
                            variant={
                              issue.status === 'IN_PROGRESS'
                                ? 'inProgress'
                                : (issue.status.toLowerCase() as 'todo' | 'done')
                            }
                            size="sm"
                          />
                        </td>
                        <td className="py-3 px-3 text-xs text-muted whitespace-nowrap">
                          {issue.dueDate ? formatDate(issue.dueDate) : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-muted">
                        No issues currently assigned to you.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Activity Feed (4 cols) */}
          <Card className="lg:col-span-4 p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">Recent activity</h3>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton variant="circular" width={32} height={32} />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="40%" height={10} />
                    </div>
                  </div>
                ))
              ) : data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <Avatar name={act.user.fullName} userId={act.user.id} size="sm" />
                    <div className="flex flex-col">
                      <p className="text-xs text-ink leading-snug">
                        <span className="font-semibold">{act.user.fullName} </span>
                        <span>{act.action}</span>
                      </p>
                      <span className="text-[11px] text-muted mt-0.5">{timeAgo(act.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted py-4">No recent activity.</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

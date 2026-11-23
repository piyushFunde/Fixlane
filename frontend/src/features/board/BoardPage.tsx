import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader';
import { BoardColumn } from './BoardColumn';
import { BoardCard } from './BoardCard';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { issuesApi, type IssueDto, type IssueStatus } from '../../api/issues';
import { projectsApi, type ProjectDto } from '../../api/projects';

export const BoardPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Read URL filter params
  const initialQ = searchParams.get('q') || '';
  const initialPriority = searchParams.get('priority') || 'ALL';
  const initialMine = searchParams.get('mine') === '1';

  const [searchInputValue, setSearchInputValue] = useState(initialQ);
  const [activeIssue, setActiveIssue] = useState<IssueDto | null>(null);

  // Debounce search input to URL param (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          if (searchInputValue.trim()) {
            prev.set('q', searchInputValue.trim());
          } else {
            prev.delete('q');
          }
          return prev;
        },
        { replace: true }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInputValue, setSearchParams]);

  const currentQ = searchParams.get('q') || '';
  const currentPriority = searchParams.get('priority') || 'ALL';
  const currentMine = searchParams.get('mine') === '1';

  const handlePriorityFilter = (priority: string) => {
    setSearchParams(
      (prev) => {
        if (priority === 'ALL') {
          prev.delete('priority');
        } else {
          prev.set('priority', priority);
        }
        return prev;
      },
      { replace: true }
    );
  };

  const handleMineToggle = () => {
    setSearchParams(
      (prev) => {
        if (currentMine) {
          prev.delete('mine');
        } else {
          prev.set('mine', '1');
        }
        return prev;
      },
      { replace: true }
    );
  };

  // Fetch project details
  const { data: project } = useQuery<ProjectDto>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        return await projectsApi.getById(projectId!);
      } catch {
        return {
          id: projectId || 'proj-1',
          name: 'Payments API',
          key: 'PAY',
          members: [
            { id: 'u1', fullName: 'Sarah Connor', email: 'sarah@fixlane.dev', role: 'ADMIN', status: 'ACTIVE' },
            { id: 'u2', fullName: 'Dev One', email: 'dev1@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
            { id: 'u3', fullName: 'Alex Vance', email: 'alex@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
          ],
        };
      }
    },
    enabled: !!projectId,
  });

  // Fetch issues for this project with filters
  const { data: rawIssues = [], isLoading } = useQuery<IssueDto[]>({
    queryKey: ['issues', projectId, { q: currentQ, priority: currentPriority, mine: currentMine }],
    queryFn: async () => {
      try {
        return await issuesApi.listByProject(projectId!, {
          q: currentQ || undefined,
          priority: currentPriority !== 'ALL' ? currentPriority : undefined,
          mine: currentMine ? true : undefined,
        });
      } catch {
        // Fallback demo issues
        const mock: IssueDto[] = [
          {
            id: '1',
            key: 'PAY-104',
            title: 'Implement Stripe webhook signature verification',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            projectId: projectId || 'proj-1',
            assigneeId: user?.id || 'u2',
            assigneeName: user?.fullName || 'Dev One',
            reporterId: 'u1',
            reporterName: 'Sarah Connor',
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
            projectId: projectId || 'proj-1',
            assigneeId: 'u3',
            assigneeName: 'Alex Vance',
            reporterId: 'u1',
            reporterName: 'Sarah Connor',
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
            projectId: projectId || 'proj-1',
            assigneeId: user?.id || 'u2',
            assigneeName: user?.fullName || 'Dev One',
            reporterId: 'u1',
            reporterName: 'Sarah Connor',
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
            projectId: projectId || 'proj-1',
            assigneeId: 'u1',
            assigneeName: 'Sarah Connor',
            reporterId: 'u2',
            reporterName: 'Dev One',
            dueDate: '2026-11-28',
            createdAt: '2026-11-19T12:00:00Z',
            updatedAt: '2026-11-20T10:00:00Z',
          },
          {
            id: '5',
            key: 'PAY-98',
            title: 'Migrate card token storage to encrypted KMS vault',
            priority: 'HIGH',
            status: 'DONE',
            projectId: projectId || 'proj-1',
            assigneeId: 'u1',
            assigneeName: 'Sarah Connor',
            reporterId: 'u2',
            reporterName: 'Dev One',
            createdAt: '2026-11-15T10:00:00Z',
            updatedAt: '2026-11-20T08:00:00Z',
          },
          {
            id: '6',
            key: 'PAY-92',
            title: 'Configure audit log streaming to CloudWatch',
            priority: 'MEDIUM',
            status: 'DONE',
            projectId: projectId || 'proj-1',
            assigneeId: 'u3',
            assigneeName: 'Alex Vance',
            reporterId: 'u1',
            reporterName: 'Sarah Connor',
            createdAt: '2026-11-14T10:00:00Z',
            updatedAt: '2026-11-19T16:00:00Z',
          },
        ];

        return mock.filter((item) => {
          if (currentQ && !item.title.toLowerCase().includes(currentQ.toLowerCase()) && !item.key.toLowerCase().includes(currentQ.toLowerCase())) {
            return false;
          }
          if (currentPriority !== 'ALL' && item.priority !== currentPriority) {
            return false;
          }
          if (currentMine && item.assigneeId !== user?.id) {
            return false;
          }
          return true;
        });
      }
    },
    enabled: !!projectId,
  });

  // Client-side local state for optimistic dragging
  const [issuesState, setIssuesState] = useState<IssueDto[]>([]);

  useEffect(() => {
    setIssuesState(rawIssues);
  }, [rawIssues]);

  // Group issues by status
  const columns = useMemo(() => {
    const todo = issuesState.filter((i) => i.status === 'TODO');
    const inProgress = issuesState.filter((i) => i.status === 'IN_PROGRESS');
    const done = issuesState.filter((i) => i.status === 'DONE');
    return { TODO: todo, IN_PROGRESS: inProgress, DONE: done };
  }, [issuesState]);

  // Status mutation with optimistic updates
  const statusMutation = useMutation({
    mutationFn: ({ key, status }: { key: string; status: IssueStatus }) =>
      issuesApi.updateStatus(key, status),
    onMutate: async ({ key, status }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['issues', projectId] });
      const previousIssues = issuesState;

      // Optimistic update local state
      setIssuesState((prev) =>
        prev.map((item) => (item.key === key ? { ...item, status } : item))
      );

      return { previousIssues };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssues) {
        setIssuesState(context.previousIssues);
      }
      toast.error('Failed to move issue. Rolling back.');
    },
    onSuccess: (data) => {
      toast.success(`${data.key} moved to ${data.status.replace('_', ' ')}`);
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  const handleMoveStatus = useCallback(
    (key: string, newStatus: IssueStatus) => {
      statusMutation.mutate({ key, status: newStatus });
    },
    [statusMutation]
  );

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issuesState.find((i) => i.id === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = issuesState.find((i) => i.id === activeId);
    if (!activeItem) return;

    // Check if dragging over a column container
    if (overId === 'TODO' || overId === 'IN_PROGRESS' || overId === 'DONE') {
      const newStatus = overId as IssueStatus;
      if (activeItem.status !== newStatus) {
        setIssuesState((prev) =>
          prev.map((i) => (i.id === activeId ? { ...i, status: newStatus } : i))
        );
      }
      return;
    }

    // Dragging over another card
    const overItem = issuesState.find((i) => i.id === overId);
    if (overItem && activeItem.status !== overItem.status) {
      setIssuesState((prev) =>
        prev.map((i) => (i.id === activeId ? { ...i, status: overItem.status } : i))
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeItem = issuesState.find((i) => i.id === active.id);
    if (!activeItem) return;

    let targetStatus = activeItem.status;
    if (over.id === 'TODO' || over.id === 'IN_PROGRESS' || over.id === 'DONE') {
      targetStatus = over.id as IssueStatus;
    } else {
      const overItem = issuesState.find((i) => i.id === over.id);
      if (overItem) targetStatus = overItem.status;
    }

    // Call mutation to persist in backend
    statusMutation.mutate({ key: activeItem.key, status: targetStatus });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-6 flex flex-col gap-6">
        {/* Breadcrumb + Sprint info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <Link to="/projects" className="hover:text-ink transition-colors">
                Projects
              </Link>
              <span>/</span>
              <span className="text-ink">{project?.name || 'Project'}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
                Sprint 14 Board
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-tint text-primary-ink">
                {issuesState.length} tickets
              </span>
            </div>
          </div>

          {/* Project members */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1.5">
              {(project?.members || []).slice(0, 4).map((m) => (
                <Avatar key={m.id} name={m.fullName} userId={m.id} size="sm" />
              ))}
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => (window.location.href = `/issues/new?projectId=${projectId}`)}
              className="text-xs font-semibold py-1.5"
            >
              + Create issue
            </Button>
          </div>
        </div>

        {/* Toolbar: Search + Priority Chips + Only Mine Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-3.5 rounded-card border border-border shadow-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg
              className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search issues (key or title)..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-bg border border-input-border rounded-input text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter Chips */}
            <div className="flex items-center gap-1.5 bg-bg p-1 rounded-input border border-border">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
                const isSelected = currentPriority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handlePriorityFilter(p)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-input transition-all ${
                      isSelected
                        ? 'bg-surface text-ink shadow-xs font-bold'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {p === 'ALL' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>

            {/* "Only mine" Toggle */}
            <button
              type="button"
              aria-pressed={currentMine}
              onClick={handleMineToggle}
              className={`px-3 py-1.5 text-xs font-semibold rounded-input border transition-all flex items-center gap-1.5 ${
                currentMine
                  ? 'bg-primary-tint border-primary text-primary-ink font-bold'
                  : 'bg-surface border-border text-muted hover:text-ink hover:border-input-border'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentMine ? 'bg-primary' : 'bg-muted/40'}`}></span>
              Only mine
            </button>
          </div>
        </div>

        {/* Kanban Columns (stacks vertically on <900px) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['To Do', 'In Progress', 'Done'].map((col) => (
              <div key={col} className="bg-column-bg rounded-[14px] p-3 flex flex-col gap-3 min-h-[400px]">
                <div className="flex justify-between items-center px-1">
                  <Skeleton width={80} height={18} />
                  <Skeleton width={24} height={18} />
                </div>
                <Skeleton height={90} className="rounded-card" />
                <Skeleton height={90} className="rounded-card" />
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-4 flex-1 items-start">
              <BoardColumn
                id="TODO"
                title="To Do"
                issues={columns.TODO}
                onMoveStatus={handleMoveStatus}
              />
              <BoardColumn
                id="IN_PROGRESS"
                title="In Progress"
                issues={columns.IN_PROGRESS}
                onMoveStatus={handleMoveStatus}
              />
              <BoardColumn
                id="DONE"
                title="Done"
                issues={columns.DONE}
                onMoveStatus={handleMoveStatus}
              />
            </div>

            <DragOverlay>
              {activeIssue ? <BoardCard issue={activeIssue} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
};

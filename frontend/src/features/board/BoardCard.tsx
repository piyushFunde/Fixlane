import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { IssueDto, IssueStatus } from '../../api/issues';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../lib/utils';

export interface BoardCardProps {
  issue: IssueDto;
  onMoveStatus?: (key: string, newStatus: IssueStatus) => void;
  isOverlay?: boolean;
}

export const BoardCard: React.FC<BoardCardProps> = ({ issue, onMoveStatus, isOverlay = false }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { issue },
    disabled: isOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getPrevStatus = (current: IssueStatus): IssueStatus | null => {
    if (current === 'DONE') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'TODO';
    return null;
  };

  const getNextStatus = (current: IssueStatus): IssueStatus | null => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'DONE';
    return null;
  };

  const prevStatus = getPrevStatus(issue.status);
  const nextStatus = getNextStatus(issue.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="listitem"
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent navigation if user dragged or clicked status move buttons
        if ((e.target as HTMLElement).closest('button')) return;
        navigate(`/issues/${issue.key}`);
      }}
      className={cn(
        'bg-surface border border-border rounded-[12px] p-3.5 shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing flex flex-col gap-2.5 select-none animate-pop-in group',
        isOverlay && 'shadow-xl rotate-1 scale-105 border-primary/50 cursor-grabbing opacity-95',
        isDragging && 'border-dashed border-primary/40'
      )}
    >
      {/* Top row: key + priority pill */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-muted tracking-tight">
          {issue.key}
        </span>
        <Pill variant={issue.priority.toLowerCase() as 'high' | 'medium' | 'low'} size="sm" />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-ink line-clamp-2 leading-snug group-hover:text-primary transition-colors">
        {issue.title}
      </p>

      {/* Bottom row: Assignee avatar + name, and prev/next status arrows */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Avatar
            name={issue.assignee?.fullName || issue.assigneeName || 'Unassigned'}
            userId={issue.assigneeId || '0'}
            size="sm"
          />
          <span className="text-xs text-muted truncate max-w-[100px]">
            {issue.assignee?.fullName || issue.assigneeName || 'Unassigned'}
          </span>
        </div>

        {/* Prev / Next status arrows */}
        {onMoveStatus && (
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {prevStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(issue.key, prevStatus);
                }}
                aria-label={`Move to ${prevStatus === 'TODO' ? 'To Do' : 'In Progress'}`}
                title={`Move to ${prevStatus === 'TODO' ? 'To Do' : 'In Progress'}`}
                className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-ink hover:bg-bg transition-colors focus:outline-none"
              >
                ←
              </button>
            )}
            {nextStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(issue.key, nextStatus);
                }}
                aria-label={`Move to ${nextStatus === 'DONE' ? 'Done' : 'In Progress'}`}
                title={`Move to ${nextStatus === 'DONE' ? 'Done' : 'In Progress'}`}
                className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-ink hover:bg-bg transition-colors focus:outline-none"
              >
                →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

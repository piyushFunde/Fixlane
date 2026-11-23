import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { IssueDto, IssueStatus } from '../../api/issues';
import { BoardCard } from './BoardCard';
import { cn } from '../../lib/utils';

export interface BoardColumnProps {
  id: IssueStatus;
  title: string;
  issues: IssueDto[];
  onMoveStatus: (key: string, newStatus: IssueStatus) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ id, title, issues, onMoveStatus }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { columnId: id },
  });

  const issueIds = issues.map((i) => i.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-column-bg rounded-[14px] p-3 flex flex-col gap-3 min-h-[500px] border transition-colors flex-1',
        isOver ? 'border-primary/50 bg-[#E2E8E0]' : 'border-border/60'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 py-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-sans">
          {title}
        </h3>
        <span className="text-xs font-mono font-bold text-muted bg-surface px-2 py-0.5 rounded-full shadow-xs border border-border/40">
          {issues.length}
        </span>
      </div>

      {/* Cards List */}
      <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
        <div role="list" className="flex flex-col gap-2.5 flex-1">
          {issues.map((issue) => (
            <BoardCard key={issue.id} issue={issue} onMoveStatus={onMoveStatus} />
          ))}

          {issues.length === 0 && (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-border/70 rounded-card p-4 text-center">
              <span className="text-xs text-muted font-medium">{title} is clear</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

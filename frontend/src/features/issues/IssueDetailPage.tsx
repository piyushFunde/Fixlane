import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Pill } from '../../components/ui/Pill';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmBanner } from '../../components/ui/ConfirmBanner';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { issuesApi, IssueDto, IssuePriority, IssueStatus } from '../../api/issues';
import { commentsApi, CommentDto } from '../../api/comments';
import { attachmentsApi, AttachmentDto } from '../../api/attachments';
import { projectsApi } from '../../api/projects';
import { formatDate, timeAgo } from '../../lib/utils';

export const IssueDetailPage: React.FC = () => {
  const { key: issueKey } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});

  // Fetch Issue
  const { data: issue, isLoading: issueLoading } = useQuery<IssueDto>({
    queryKey: ['issue', issueKey],
    queryFn: async () => {
      try {
        return await issuesApi.getByKey(issueKey!);
      } catch {
        return {
          id: '1',
          key: issueKey || 'PAY-104',
          title: 'Implement Stripe webhook signature verification',
          description:
            'We must verify all incoming Stripe webhook events using the endpoint secret header before processing charges.\n\nAcceptance Criteria:\n- [x] Extract Stripe-Signature header\n- [ ] Verify signature using SDK webhook constructEvent\n- [ ] Reject unverified requests with 400 Bad Request\n- [ ] Add unit test with mocked invalid timestamp',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          projectId: 'proj-1',
          projectKey: 'PAY',
          assigneeId: user?.id || 'u2',
          assigneeName: user?.fullName || 'Dev One',
          reporterId: 'u1',
          reporterName: 'Sarah Connor',
          dueDate: '2026-11-24',
          createdAt: '2026-11-18T10:00:00Z',
          updatedAt: '2026-11-20T10:00:00Z',
        };
      }
    },
    enabled: !!issueKey,
  });

  // Fetch Comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<CommentDto[]>({
    queryKey: ['comments', issueKey],
    queryFn: async () => {
      try {
        return await commentsApi.list(issueKey!);
      } catch {
        return [
          {
            id: 'c1',
            issueId: issue?.id || '1',
            authorId: 'u1',
            authorName: 'Sarah Connor',
            content: 'Please make sure we support both test and live signing keys from application.yml config.',
            createdAt: '2026-11-19T09:30:00Z',
          },
          {
            id: 'c2',
            issueId: issue?.id || '1',
            authorId: user?.id || 'u2',
            authorName: user?.fullName || 'Dev One',
            content: 'Will do! Adding test cases using wiremock right now.',
            createdAt: '2026-11-19T14:15:00Z',
          },
        ];
      }
    },
    enabled: !!issueKey,
  });

  // Fetch Attachments
  const { data: attachments = [] } = useQuery<AttachmentDto[]>({
    queryKey: ['attachments', issueKey],
    queryFn: async () => {
      try {
        return await attachmentsApi.list(issueKey!);
      } catch {
        return [
          {
            id: 'att-1',
            issueId: issue?.id || '1',
            filename: 'stripe-dashboard-webhook-error.png',
            fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60',
            fileSize: 104857,
            contentType: 'image/png',
            createdAt: '2026-11-18T11:00:00Z',
          },
        ];
      }
    },
    enabled: !!issueKey,
  });

  // Fetch Project members for assignee dropdown
  const { data: projectMembers = [] } = useQuery({
    queryKey: ['project-members', issue?.projectId],
    queryFn: async () => {
      if (!issue?.projectId) return [];
      try {
        return await projectsApi.getMembers(issue.projectId);
      } catch {
        return [
          { id: 'u1', fullName: 'Sarah Connor', email: 'sarah@fixlane.dev', role: 'ADMIN', status: 'ACTIVE' },
          { id: 'u2', fullName: 'Dev One', email: 'dev1@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
          { id: 'u3', fullName: 'Alex Vance', email: 'alex@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
        ];
      }
    },
    enabled: !!issue?.projectId,
  });

  // Permissions check: Admin, Manager, or Reporter
  const canEditOrDelete =
    user?.role === 'ADMIN' || user?.role === 'MANAGER' || (user?.id && issue?.reporterId === user.id);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; status?: IssueStatus; priority?: IssuePriority; assigneeId?: string; dueDate?: string }) =>
      issuesApi.update(issueKey!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['issue', issueKey], updated);
      toast.success('Issue updated');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update issue');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => issuesApi.delete(issueKey!),
    onSuccess: () => {
      toast.success(`Issue ${issueKey} deleted`);
      navigate(`/projects/${issue?.projectId || ''}/board`);
    },
    onError: () => {
      toast.error('Failed to delete issue');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(issueKey!, { content }),
    onSuccess: (newComment) => {
      queryClient.setQueryData<CommentDto[]>(['comments', issueKey], (old = []) => [...old, newComment]);
      setCommentText('');
      toast.success('Comment posted');
    },
    onError: () => {
      toast.error('Failed to post comment');
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => attachmentsApi.upload(issueKey!, file),
    onSuccess: (att) => {
      queryClient.setQueryData<AttachmentDto[]>(['attachments', issueKey], (old = []) => [...old, att]);
      toast.success('File uploaded');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });

  const handleStartEdit = () => {
    if (issue) {
      setEditTitle(issue.title);
      setEditDescription(issue.description || '');
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    updateMutation.mutate({
      title: editTitle.trim(),
      description: editDescription,
    });
  };

  // Parse markdown acceptance checkboxes: - [ ] or - [x]
  const parseChecklist = (text?: string) => {
    if (!text) return [];
    const lines = text.split('\n');
    const items: Array<{ index: number; label: string; checked: boolean }> = [];
    lines.forEach((line, index) => {
      const match = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (match) {
        items.push({
          index,
          checked: checklistState[index] !== undefined ? checklistState[index] : match[1].toLowerCase() === 'x',
          label: match[2],
        });
      }
    });
    return items;
  };

  const checklistItems = parseChecklist(issue?.description);

  const toggleChecklist = (index: number, currentChecked: boolean) => {
    setChecklistState((prev) => ({ ...prev, [index]: !currentChecked }));
    toast.success('Checklist item updated');
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadAttachmentMutation.mutate(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAttachmentMutation.mutate(e.target.files[0]);
    }
  };

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <AppHeader />
        <div className="max-w-[1280px] w-full mx-auto px-8 py-8 flex flex-col gap-6">
          <Skeleton width={120} height={20} />
          <Skeleton width="60%" height={36} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <Skeleton height={150} />
              <Skeleton height={200} />
            </div>
            <div className="lg:col-span-4">
              <Skeleton height={300} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <AppHeader />
        <div className="max-w-[1280px] w-full mx-auto px-8 py-16 text-center">
          <h2 className="text-2xl font-bold">Issue not found</h2>
          <Link to="/projects" className="text-primary hover:underline mt-2 inline-block">
            ← Return to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-6 flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link
            to={`/projects/${issue.projectId}/board`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            ← Back to board
          </Link>
        </div>

        {/* Delete Confirmation Banner (red warning strip, not dialog) */}
        {showDeleteConfirm && (
          <ConfirmBanner
            message={`Delete issue ${issue.key}? This action cannot be undone.`}
            confirmLabel="Delete permanently"
            onConfirm={() => deleteMutation.mutate()}
            onCancel={() => setShowDeleteConfirm(false)}
            isLoading={deleteMutation.isPending}
          />
        )}

        {/* Two-Column Detail Layout: Left 2/3 Main, Right 1/3 Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Header: Key + Title + Action buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-muted bg-surface px-2.5 py-1 rounded-card border border-border">
                  {issue.key}
                </span>

                {canEditOrDelete && !isEditing && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger-tint"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-2xl font-bold font-heading px-3 py-2 bg-surface border border-input-border rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Description</label>
                    <textarea
                      rows={6}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-sm font-sans p-3 bg-surface border border-input-border rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEdit}
                      isLoading={updateMutation.isPending}
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-heading">
                  {issue.title}
                </h1>
              )}
            </div>

            {/* Description & Rich content */}
            {!isEditing && (
              <Card className="p-6 flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Description</h2>
                <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                  {issue.description || <span className="italic text-muted">No description provided.</span>}
                </div>
              </Card>
            )}

            {/* Acceptance Checklist */}
            {checklistItems.length > 0 && (
              <Card className="p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Acceptance Checklist</h2>
                  <span className="text-xs text-muted font-medium">
                    {checklistItems.filter((i) => i.checked).length}/{checklistItems.length} completed
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  {checklistItems.map((item) => (
                    <label
                      key={item.index}
                      className="flex items-center gap-3 p-2 rounded-input hover:bg-bg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklist(item.index, item.checked)}
                        className="w-4 h-4 rounded text-primary border-input-border accent-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${item.checked ? 'line-through text-muted' : 'text-ink font-medium'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {/* Attachments Section */}
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Attachments</h2>

              {/* Drag-to-upload dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-border rounded-card p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-bg/40 text-center cursor-pointer relative"
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload attachment"
                />
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-ink">
                  Drop images here or <span className="text-primary hover:underline">browse</span>
                </p>
                <span className="text-xs text-muted">PNG, JPG, PDF up to 10MB</span>
              </div>

              {/* List of uploaded attachments */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border border-border rounded-input p-2 flex flex-col gap-2 bg-bg/60 group"
                    >
                      <img
                        src={att.fileUrl}
                        alt={att.filename}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs font-medium text-ink truncate" title={att.filename}>
                        {att.filename}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Comments Thread */}
            <Card className="p-6 flex flex-col gap-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                Activity & Comments ({comments.length})
              </h2>

              {/* Thread */}
              <div className="flex flex-col gap-4">
                {commentsLoading ? (
                  <Skeleton height={80} />
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 p-3 rounded-card bg-bg/50">
                      <Avatar name={comment.authorName} userId={comment.authorId} size="sm" />
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-ink">{comment.authorName}</span>
                          <span className="text-[11px] text-muted">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink mt-1 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted py-2 italic">No comments yet. Start the conversation!</p>
                )}
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (commentText.trim()) {
                    addCommentMutation.mutate(commentText.trim());
                  }
                }}
                className="flex flex-col gap-2 pt-2 border-t border-border"
              >
                <textarea
                  rows={3}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full text-sm p-3 bg-surface border border-input-border rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted/60"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={!commentText.trim()}
                    isLoading={addCommentMutation.isPending}
                  >
                    Post comment
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-card p-6 flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted border-b border-border pb-2">
              Issue Properties
            </h3>

            {/* Status Switcher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Status</label>
              <div className="grid grid-cols-3 gap-1 bg-bg p-1 rounded-input border border-border">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as IssueStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateMutation.mutate({ status: st })}
                    className={`py-1.5 px-2 text-xs font-semibold rounded transition-colors text-center ${
                      issue.status === st
                        ? 'bg-surface text-ink font-bold shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {st === 'TODO' ? 'To Do' : st === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Priority</label>
              <div className="flex items-center gap-2">
                {(['HIGH', 'MEDIUM', 'LOW'] as IssuePriority[]).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => updateMutation.mutate({ priority: pr })}
                    className="focus:outline-none transition-transform hover:scale-105"
                  >
                    <Pill
                      variant={pr.toLowerCase() as 'high' | 'medium' | 'low'}
                      className={issue.priority === pr ? 'ring-2 ring-primary ring-offset-1 font-bold' : 'opacity-70'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Assignee</label>
              <div className="flex items-center justify-between p-2 rounded-input border border-border bg-bg/40">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={issue.assignee?.fullName || issue.assigneeName || 'Unassigned'}
                    userId={issue.assigneeId || '0'}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-ink">
                    {issue.assignee?.fullName || issue.assigneeName || 'Unassigned'}
                  </span>
                </div>
                <select
                  value={issue.assigneeId || ''}
                  onChange={(e) => updateMutation.mutate({ assigneeId: e.target.value || undefined })}
                  className="text-xs bg-transparent text-primary font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reporter (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Reporter</label>
              <div className="flex items-center gap-2 p-2 rounded-input border border-border/50 bg-bg/20">
                <Avatar
                  name={issue.reporter?.fullName || issue.reporterName || 'Admin'}
                  userId={issue.reporterId || '0'}
                  size="sm"
                />
                <span className="text-sm text-ink">{issue.reporter?.fullName || issue.reporterName || 'Admin'}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Due Date</label>
              <input
                type="date"
                value={issue.dueDate ? issue.dueDate.split('T')[0] : ''}
                onChange={(e) => updateMutation.mutate({ dueDate: e.target.value || undefined })}
                className="w-full text-xs p-2 bg-bg border border-input-border rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Labels (Placeholder tags) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-xs bg-bg border border-border text-muted">backend</span>
                <span className="px-2 py-0.5 rounded text-xs bg-bg border border-border text-muted">payments</span>
                <span className="px-2 py-0.5 rounded text-xs bg-bg border border-border text-muted">stripe</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex flex-col gap-1 pt-3 border-t border-border/60 text-[11px] text-muted">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{formatDate(issue.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span>{formatDate(issue.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

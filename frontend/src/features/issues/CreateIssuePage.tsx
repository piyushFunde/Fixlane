import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../hooks/useToast';
import { projectsApi, type ProjectDto } from '../../api/projects';
import { issuesApi } from '../../api/issues';
import { usersApi, type UserDto } from '../../api/users';

const schema = z.object({
  projectId: z.string().min(1, 'Select a project'),
  assigneeId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(500, 'Max 500 characters'),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const CreateIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: searchParams.get('projectId') || '',
      priority: 'MEDIUM',
    },
  });

  const watchedValues = watch();

  const { data: projects = [] } = useQuery<ProjectDto[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        return await projectsApi.list();
      } catch {
        return [
          { id: 'proj-1', name: 'Payments API', key: 'PAY', members: [] },
          { id: 'proj-2', name: 'Web Frontend', key: 'WEB', members: [] },
        ] as ProjectDto[];
      }
    },
  });

  const { data: projectMembers = [] } = useQuery<UserDto[]>({
    queryKey: ['project-members', watchedValues.projectId],
    queryFn: async () => {
      try {
        return await usersApi.list();
      } catch {
        return [];
      }
    },
    enabled: !!watchedValues.projectId,
  });

  const selectedProject = projects.find((p) => p.id === watchedValues.projectId);
  const charCount = watchedValues.title?.length || 0;

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      issuesApi.create({
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
      }),
    onSuccess: (issue) => {
      toast.success(`Issue ${issue.key} created`);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      navigate(`/issues/${issue.key}`);
    },
    onError: () => {
      toast.error('Failed to create issue');
    },
  });

  const priorities = ['HIGH', 'MEDIUM', 'LOW'] as const;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-ink font-heading tracking-tight">
            Create Issue
          </h1>
          <p className="text-muted text-sm mt-1">
            New issues are added to the selected project's backlog.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit((data) => createMutation.mutate(data))}
            className="lg:col-span-3 flex flex-col gap-5 bg-surface border border-border rounded-card p-6 shadow-xs"
          >
            {/* Project */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectId" className="text-sm font-semibold text-ink">
                Project <span className="text-danger">*</span>
              </label>
              <select
                id="projectId"
                {...register('projectId')}
                className="h-12 px-3 border border-input-border rounded-input text-sm text-ink bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.key}] {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-xs text-danger">{errors.projectId.message}</p>
              )}
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assigneeId" className="text-sm font-semibold text-ink">
                Assignee
              </label>
              <select
                id="assigneeId"
                {...register('assigneeId')}
                className="h-12 px-3 border border-input-border rounded-input text-sm text-ink bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="title" className="text-sm font-semibold text-ink">
                  Title <span className="text-danger">*</span>
                </label>
                <span className={`text-xs ${charCount > 480 ? 'text-danger' : 'text-muted'}`}>
                  {charCount}/500
                </span>
              </div>
              <Input
                id="title"
                placeholder="Short, descriptive issue title"
                error={errors.title?.message}
                {...register('title')}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-semibold text-ink">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Describe the issue, reproduction steps, or acceptance criteria…"
                rows={5}
                className="px-3 py-2.5 border border-input-border rounded-input text-sm text-ink bg-bg placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-ink">Priority</span>
              <div className="flex items-center gap-2">
                {priorities.map((p) => {
                  const isSelected = watchedValues.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setValue('priority', p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-input border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        isSelected
                          ? 'border-primary bg-primary-tint text-primary-ink shadow-xs'
                          : 'border-border bg-surface text-muted hover:border-input-border hover:text-ink'
                      }`}
                    >
                      <Pill variant={p.toLowerCase() as 'high' | 'medium' | 'low'} size="sm" />
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <Input
              id="dueDate"
              label="Due date"
              type="date"
              {...register('dueDate')}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
                Create issue
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="lg:col-span-2 sticky top-24">
            <p className="text-xs uppercase font-bold tracking-widest text-muted mb-3">
              Preview
            </p>
            <div className="bg-surface border border-border rounded-card p-4 shadow-sm flex flex-col gap-3 animate-pop-in">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-muted">
                  {selectedProject ? `${selectedProject.key}-?` : 'KEY-?'}
                </span>
                <Pill
                  variant={(watchedValues.priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low'}
                  size="sm"
                />
              </div>
              <p className="text-sm font-semibold text-ink leading-snug min-h-[2rem]">
                {watchedValues.title || (
                  <span className="text-muted italic">Issue title will appear here…</span>
                )}
              </p>
              {watchedValues.description && (
                <p className="text-xs text-muted line-clamp-3">{watchedValues.description}</p>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div className="flex items-center gap-2">
                  {watchedValues.assigneeId ? (
                    <Avatar
                      name={
                        projectMembers.find((u) => u.id === watchedValues.assigneeId)?.fullName || '?'
                      }
                      userId={watchedValues.assigneeId}
                      size="sm"
                    />
                  ) : (
                    <span className="text-xs text-muted">Unassigned</span>
                  )}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9ECE8] text-[#3D4A44] font-medium">
                  To Do
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


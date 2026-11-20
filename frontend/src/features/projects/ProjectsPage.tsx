import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { projectsApi, ProjectDto } from '../../api/projects';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const { data: projects = [], isLoading } = useQuery<ProjectDto[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        return await projectsApi.list();
      } catch {
        // Fallback initial demo data
        return [
          {
            id: 'proj-1',
            key: 'PAY',
            name: 'Payments API',
            description: 'Core billing, Stripe integration, payment methods and ledger transaction audit trails.',
            leadId: 'u1',
            leadName: 'Sarah Connor',
            totalIssues: 16,
            doneIssues: 8,
            members: [
              { id: 'u1', fullName: 'Sarah Connor', email: 'sarah@fixlane.dev', role: 'ADMIN', status: 'ACTIVE' },
              { id: 'u2', fullName: 'Dev One', email: 'dev1@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
              { id: 'u3', fullName: 'Alex Vance', email: 'alex@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
            ],
          },
          {
            id: 'proj-2',
            key: 'AUTH',
            name: 'Identity & Access',
            description: 'OAuth2 SSO providers, JWT refresh token rotation, and RBAC permission evaluations.',
            leadId: 'u2',
            leadName: 'Dev One',
            totalIssues: 10,
            doneIssues: 6,
            members: [
              { id: 'u2', fullName: 'Dev One', email: 'dev1@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE' },
              { id: 'u1', fullName: 'Sarah Connor', email: 'sarah@fixlane.dev', role: 'ADMIN', status: 'ACTIVE' },
            ],
          },
        ];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (newProj: { name: string; key: string; description?: string }) =>
      projectsApi.create(newProj),
    onSuccess: (created) => {
      queryClient.setQueryData<ProjectDto[]>(['projects'], (old = []) => [...old, created]);
      toast.success(`Project ${created.name} (${created.key}) created`);
      setShowNewProjectForm(false);
      setName('');
      setKey('');
      setDescription('');
      setFormError(null);
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setFormError(axiosError?.response?.data?.message || 'Failed to create project');
    },
  });

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 2-4 uppercase alphanumeric auto-formatted
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setKey(val);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (!key && e.target.value.length >= 2) {
      // Auto suggest key from name
      const suggested = e.target.value
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (suggested.length >= 2) {
        setKey(suggested);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }
    if (key.length < 2 || key.length > 4) {
      setFormError('Key must be between 2 and 4 uppercase characters');
      return;
    }

    // Client-side key uniqueness check
    if (projects.some((p) => p.key.toUpperCase() === key.toUpperCase())) {
      setFormError(`Project key "${key}" already exists. Please choose a unique key.`);
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      key: key.toUpperCase(),
      description: description.trim() || undefined,
    });
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-8 flex flex-col gap-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">Projects</h1>
            <p className="text-sm text-muted mt-0.5">Manage workspaces, issue keys, and member permissions</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 text-sm bg-surface rounded-input border border-input-border text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                className="font-medium shrink-0"
              >
                {showNewProjectForm ? 'Cancel' : '+ New project'}
              </Button>
            )}
          </div>
        </div>

        {/* Inline New Project Form */}
        {showNewProjectForm && (
          <Card className="border-primary/40 bg-surface/90 shadow-sm p-6 animate-fade-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">Create new project</h2>
              <span className="text-xs text-muted">Tickets will be prefixed with this key</span>
            </div>

            {formError && (
              <div role="alert" className="p-3 mb-4 rounded-input bg-danger-tint border border-danger/30 text-danger text-sm font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Project name"
                    placeholder="e.g. Analytics Engine"
                    value={name}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Project key (2-4 uppercase)"
                    placeholder="e.g. ANLY"
                    value={key}
                    onChange={handleKeyChange}
                    maxLength={4}
                    required
                    className="font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-ink block mb-1.5">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="What is this project focused on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface text-ink text-sm rounded-input border border-input-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowNewProjectForm(false);
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending}
                >
                  Create project
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Card Grid (3 cols → 2 → 1) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <Skeleton width={50} height={24} />
                  <Skeleton width={120} height={24} />
                </div>
                <Skeleton width="90%" height={40} />
                <Skeleton width="100%" height={8} />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton variant="circular" width={28} height={28} />
                  <Skeleton width={80} height={32} />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const total = project.totalIssues || 0;
              const done = project.doneIssues || 0;
              const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
              const members = project.members || [];
              const visibleMembers = members.slice(0, 4);
              const overflowCount = members.length - visibleMembers.length;

              return (
                <Card
                  key={project.id}
                  hoverable
                  onClick={() => navigate(`/projects/${project.id}/board`)}
                  className="p-6 flex flex-col justify-between gap-5 group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-primary-tint text-primary-ink">
                        {project.key}
                      </span>
                      <span className="text-xs text-muted">
                        {done}/{total} done
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-ink group-hover:text-primary transition-colors">
                      {project.name}
                    </h2>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed min-h-[32px]">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 pt-2 border-t border-border/60">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] text-muted">
                        <span>Sprint progress</span>
                        <span className="font-semibold">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#EAEDE8] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progressPct}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>

                    {/* Bottom: Team Members & Open Board Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center -space-x-1.5">
                        {visibleMembers.map((m) => (
                          <Avatar key={m.id} name={m.fullName} userId={m.id} size="sm" />
                        ))}
                        {overflowCount > 0 && (
                          <div className="w-7 h-7 rounded-full bg-bg border border-border flex items-center justify-center text-[10px] font-bold text-muted">
                            +{overflowCount}
                          </div>
                        )}
                        {members.length === 0 && (
                          <span className="text-xs text-muted">1 lead</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}/board`);
                        }}
                        className="text-xs font-semibold py-1 px-3"
                      >
                        Open board →
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface rounded-card border border-border p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-muted font-mono font-bold text-lg">
              F|
            </div>
            <h3 className="text-lg font-bold text-ink">No projects found</h3>
            <p className="text-sm text-muted max-w-sm">
              {searchQuery ? 'Try clearing your search query.' : 'Create your first project to start tracking tickets.'}
            </p>
            {canCreate && !searchQuery && (
              <Button
                variant="primary"
                onClick={() => setShowNewProjectForm(true)}
                className="mt-2"
              >
                Create your first project
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

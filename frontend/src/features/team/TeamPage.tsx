import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { usersApi, UserDto } from '../../api/users';

export const TeamPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<'DEVELOPER' | 'MANAGER' | 'ADMIN'>('DEVELOPER');

  const isAdminOrManager =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: members = [], isLoading } = useQuery<UserDto[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await usersApi.list();
      } catch {
        return [
          { id: 'u1', fullName: 'Diya Kapoor', email: 'admin@fixlane.dev', role: 'ADMIN', status: 'ACTIVE', createdAt: '' },
          { id: 'u2', fullName: 'Kabir Nair', email: 'manager@fixlane.dev', role: 'MANAGER', status: 'ACTIVE', createdAt: '' },
          { id: 'u3', fullName: 'Rohan Iyer', email: 'dev1@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE', createdAt: '' },
          { id: 'u4', fullName: 'Sana Qureshi', email: 'dev2@fixlane.dev', role: 'DEVELOPER', status: 'ACTIVE', createdAt: '' },
          { id: 'u5', fullName: 'Aarav Mehta', email: 'dev3@fixlane.dev', role: 'DEVELOPER', status: 'INVITED', createdAt: '' },
        ] as UserDto[];
      }
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      usersApi.updateRole(userId, role),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to update role'),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      usersApi.invite({ email: inviteEmail, fullName: inviteFullName, role: inviteRole }),
    onSuccess: () => {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteFullName('');
      setInviteRole('DEVELOPER');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to send invitation'),
  });

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-[#E8E4F4] text-[#453A78]',
    MANAGER: 'bg-[#FBEFCF] text-[#7A5000]',
    DEVELOPER: 'bg-primary-tint text-primary-ink',
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-8 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-ink font-heading tracking-tight">Team</h1>
            <p className="text-muted text-sm mt-1">
              {members.length} member{members.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          {isAdminOrManager && (
            <Button
              variant="primary"
              onClick={() => setShowInviteForm((v) => !v)}
            >
              {showInviteForm ? 'Cancel invite' : 'Invite member'}
            </Button>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-xs">
            <h2 className="text-base font-bold text-ink">Invite a team member</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Full name"
                id="inv-name"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                placeholder="Jane Smith"
              />
              <Input
                label="Work email"
                id="inv-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="jane@company.com"
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-role" className="text-sm font-semibold text-ink">Role</label>
                <select
                  id="inv-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'DEVELOPER' | 'MANAGER' | 'ADMIN')}
                  className="h-12 px-3 border border-input-border rounded-input text-sm text-ink bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="MANAGER">Manager</option>
                  {isAdmin && <option value="ADMIN">Admin</option>}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                onClick={() => inviteMutation.mutate()}
                loading={inviteMutation.isPending}
                disabled={!inviteEmail || !inviteFullName}
              >
                Send invitation
              </Button>
              <Button variant="ghost" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-surface border border-border rounded-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="py-3.5 px-5 text-left font-semibold text-ink text-xs uppercase tracking-wider">
                    Member
                  </th>
                  <th className="py-3.5 px-5 text-left font-semibold text-ink text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3.5 px-5 text-left font-semibold text-ink text-xs uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3.5 px-5 text-left font-semibold text-ink text-xs uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <Skeleton width={36} height={36} className="rounded-full" />
                            <Skeleton width={120} height={16} />
                          </div>
                        </td>
                        <td className="py-4 px-5"><Skeleton width={160} height={14} /></td>
                        <td className="py-4 px-5"><Skeleton width={80} height={22} /></td>
                        <td className="py-4 px-5"><Skeleton width={60} height={22} /></td>
                      </tr>
                    ))
                  : members.map((member) => (
                      <tr key={member.id} className="hover:bg-bg/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.fullName} userId={member.id} size="md" />
                            <div>
                              <p className="font-semibold text-ink text-sm">{member.fullName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-muted text-sm">{member.email}</td>
                        <td className="py-4 px-5">
                          {isAdmin && member.id !== currentUser?.id ? (
                            <select
                              value={member.role}
                              onChange={(e) =>
                                roleMutation.mutate({ userId: member.id, role: e.target.value })
                              }
                              className="text-xs font-semibold px-2 py-1 rounded-input border border-input-border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                              aria-label={`Change role for ${member.fullName}`}
                            >
                              <option value="DEVELOPER">Developer</option>
                              <option value="MANAGER">Manager</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[member.role] || ''}`}
                            >
                              {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              member.status === 'ACTIVE'
                                ? 'bg-primary-tint text-primary-ink'
                                : 'bg-[#FBEFCF] text-[#7A5000]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                member.status === 'ACTIVE' ? 'bg-primary' : 'bg-[#7A5000]'
                              }`}
                            />
                            {member.status === 'ACTIVE' ? 'Active' : 'Invited'}
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && members.length === 0 && (
              <div className="text-center py-16 text-muted">
                <p className="font-medium">No team members yet</p>
                <p className="text-sm mt-1">Invite your first team member to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};


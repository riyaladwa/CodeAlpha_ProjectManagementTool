import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  Copy,
  Clock,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getAvatarColor, getInitials, formatDate } from '../utils/helpers';

export const TeamPage = () => {
  const { currentWorkspace, user, refreshUserData } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');

  // Remove Member Confirm
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const fetchTeamData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [wsRes, analyticsRes] = await Promise.all([
        api.get(`/workspaces/${currentWorkspace._id}`),
        api.get('/analytics/overview'),
      ]);

      if (wsRes.data.success) {
        setMembers(wsRes.data.workspace.members || []);
      }
      if (analyticsRes.data.success) {
        setWorkloads(analyticsRes.data.data.teamWorkload || []);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [currentWorkspace]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      const { data } = await api.post(`/workspaces/${currentWorkspace._id}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (data.success) {
        toast.success(data.message || 'Invitation created!');
        if (data.inviteLink) {
          setGeneratedInviteLink(`${window.location.origin}${data.inviteLink}`);
        } else {
          setInviteEmail('');
          setInviteModalOpen(false);
          await fetchTeamData();
          await refreshUserData();
        }
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to invite member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      const { data } = await api.patch(`/workspaces/${currentWorkspace._id}/members/role`, {
        targetUserId,
        role: newRole,
      });
      if (data.success) {
        toast.success('Member role updated.');
        await fetchTeamData();
        await refreshUserData();
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update role.');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      const { data } = await api.delete(
        `/workspaces/${currentWorkspace._id}/members/${memberToRemove.user?._id || memberToRemove.user}`
      );
      if (data.success) {
        toast.success('Member removed from workspace.');
        setRemoveConfirmOpen(false);
        setMemberToRemove(null);
        await fetchTeamData();
        await refreshUserData();
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to remove member.');
    }
  };

  const isOwner = currentWorkspace?.ownerId?._id === user?._id || currentWorkspace?.ownerId === user?._id;
  const currentMemberRole = currentWorkspace?.members?.find((m) => (m.user?._id || m.user) === user?._id)?.role || (isOwner ? 'owner' : 'member');
  const canManage = isOwner || currentMemberRole === 'admin';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Team Members</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage workspace collaborators, roles, and task workload in {currentWorkspace?.name}.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setInviteEmail('');
              setGeneratedInviteLink('');
              setInviteModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-98 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Invite Teammate
          </button>
        )}
      </div>

      {/* Members Grid / List */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#18181B]" /> Active Members ({members.length})
          </h3>
          <span className="text-xs text-zinc-400">Role-Based Access Control (RBAC)</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {members.map((m) => {
            const memberUser = m.user || {};
            const workload = workloads.find((w) => w.userId === memberUser._id) || {
              total: 0,
              completed: 0,
              pending: 0,
              overdue: 0,
            };
            const isTargetOwner = memberUser._id === currentWorkspace?.ownerId?._id || memberUser._id === currentWorkspace?.ownerId;

            return (
              <div
                key={memberUser._id || m.joinedAt}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
                      memberUser.name
                    )}`}
                  >
                    {getInitials(memberUser.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">
                        {memberUser.name || 'Member'}
                      </h4>
                      {isTargetOwner && (
                        <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{memberUser.email}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {memberUser.title || 'Product Engineer'} • Joined {formatDate(m.joinedAt)}
                    </p>
                  </div>
                </div>

                {/* Workload stats */}
                <div className="flex items-center gap-6 text-xs text-zinc-600">
                  <div className="text-center">
                    <span className="font-bold text-zinc-900 block">{workload.total}</span>
                    <span className="text-[10px] text-zinc-400">Assigned</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-zinc-900 block">{workload.completed}</span>
                    <span className="text-[10px] text-zinc-400">Completed</span>
                  </div>
                  {workload.overdue > 0 && (
                    <div className="text-center">
                      <span className="font-bold text-rose-600 block">{workload.overdue}</span>
                      <span className="text-[10px] text-rose-400">Overdue</span>
                    </div>
                  )}
                </div>

                {/* Role and Actions */}
                <div className="flex items-center gap-3">
                  {canManage && !isTargetOwner && memberUser._id !== user?._id ? (
                    <>
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(memberUser._id, e.target.value)}
                        className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-800 focus:bg-white focus:outline-hidden"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>

                      <button
                        onClick={() => {
                          setMemberToRemove(m);
                          setRemoveConfirmOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-700 capitalize bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                      {isTargetOwner ? 'Owner' : m.role}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900">Invite Teammate</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedInviteLink ? (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                    Teammate Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="teammate@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                    Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="member">Member (Can create & manage assigned tasks)</option>
                    <option value="admin">Admin (Can manage tasks & invite members)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-zinc-800 rounded-xl shadow-sm disabled:opacity-50"
                  >
                    {inviteLoading ? 'Inviting...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 space-y-1">
                  <p className="font-bold">✓ Invitation Link Generated</p>
                  <p className="text-[11px] text-zinc-600">
                    Share this registration link directly with your teammate to join your workspace:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteLink);
                      toast.success('Invite link copied to clipboard!');
                    }}
                    className="p-2 bg-[#18181B] text-white rounded-xl hover:bg-zinc-800 transition-colors"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setInviteModalOpen(false);
                    setGeneratedInviteLink('');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      <ConfirmationModal
        isOpen={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.user?.name || 'this member'} from the workspace?`}
        confirmLabel="Remove Member"
      />
    </div>
  );
};

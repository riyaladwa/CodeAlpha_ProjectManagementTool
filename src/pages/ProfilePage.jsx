import React, { useState } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Lock,
  Bell,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getAvatarColor, getInitials } from '../utils/helpers';
import api from '../services/api';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword, updatePreferences } = useAuth();
  const toast = useToast();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // Preferences
  const [taskAssignedNotify, setTaskAssignedNotify] = useState(
    user?.preferences?.taskAssignedNotify ?? true
  );
  const [deadlineAlerts, setDeadlineAlerts] = useState(
    user?.preferences?.deadlineAlerts ?? true
  );

  // Delete Account
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingProfile(true);
    await updateProfile({ name: name.trim(), title: title.trim() });
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setChangingPwd(true);
    const res = await changePassword(currentPassword, newPassword);
    setChangingPwd(false);

    if (res?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleTogglePreference = async (key, val) => {
    if (key === 'taskAssignedNotify') setTaskAssignedNotify(val);
    if (key === 'deadlineAlerts') setDeadlineAlerts(val);

    await updatePreferences({ [key]: val });
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await api.delete('/auth/account');
      toast.success('Account deleted.');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Account & Profile Settings</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your personal credentials, workspace preferences, and security settings.
        </p>
      </div>

      {/* Section 1: User Profile Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-subtle space-y-6">
        <div className="flex items-center gap-4 border-b border-zinc-100 pb-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-sm ${getAvatarColor(
              user?.name
            )}`}
          >
            {getInitials(user?.name)}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">{user?.name}</h3>
            <p className="text-xs text-zinc-500">{user?.email}</p>
            <span className="inline-block text-[10px] font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded mt-1">
              Verified User
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Job Title / Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs bg-zinc-100/80 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Change Password */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-subtle space-y-6">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#18181B]" /> Security & Password
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                New Password (min 6 chars) *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPwd}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {changingPwd ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Notification Preferences */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-subtle space-y-5">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#18181B]" /> In-App Notification Alerts
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Control which event triggers generate in-app alerts.</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-zinc-900">Task Assignment Alerts</p>
              <p className="text-[11px] text-zinc-500">Receive notifications when teammates assign you to a task.</p>
            </div>
            <input
              type="checkbox"
              checked={taskAssignedNotify}
              onChange={(e) => handleTogglePreference('taskAssignedNotify', e.target.checked)}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-500 border-zinc-300 accent-[#18181B]"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-zinc-900">Deadline Warning Alerts</p>
              <p className="text-[11px] text-zinc-500">Receive notifications when task due dates are approaching.</p>
            </div>
            <input
              type="checkbox"
              checked={deadlineAlerts}
              onChange={(e) => handleTogglePreference('deadlineAlerts', e.target.checked)}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-500 border-zinc-300 accent-[#18181B]"
            />
          </label>
        </div>
      </div>

      {/* Section 4: Danger Zone */}
      <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 space-y-4">
        <div>
          <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" /> Danger Zone
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Permanently delete your account and all private workspaces. This action cannot be undone.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account"
        message="Are you sure you want to delete your account? All workspaces owned by you and associated private data will be permanently wiped."
        confirmLabel={deleting ? 'Deleting...' : 'Delete Everything'}
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
};

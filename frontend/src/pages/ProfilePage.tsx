import { useState, FormEvent } from 'react';
import { useMutation } from 'react-query';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import { getErrorMessage } from '@services/api';
import LoadingSpinner from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { UserCircleIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { UserRole } from '@/types/index';

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  tech_lead: 'bg-blue-100 text-blue-700',
  developer: 'bg-green-100 text-green-700',
  tester: 'bg-yellow-100 text-yellow-700',
  devops: 'bg-orange-100 text-orange-700',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access — manage users, create appraisals, view all data.',
  manager: 'Review and finalize appraisals for your team members.',
  tech_lead: 'Review appraisals for your technical team members.',
  developer: 'Submit and track your own performance appraisals.',
  tester: 'Submit and track your own performance appraisals.',
  devops: 'Submit and track your own performance appraisals.',
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');

  const changePasswordMutation = useMutation(
    () => authService.changePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwError('');
        refreshUser();
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, 'Failed to change password'));
      },
    }
  );

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }

    changePasswordMutation.mutate();
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account information and security</p>
      </div>

      {/* Profile info card */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Account Information</h2>
        </div>
        <div className="card-body space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold flex items-center justify-center flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Role</p>
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  ROLE_COLORS[user.role]
                )}
              >
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">User ID</p>
              <p className="text-xs font-mono text-slate-500 truncate">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role permissions card */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Role & Permissions</h2>
        </div>
        <div className="card-body">
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                ROLE_COLORS[user.role]
              )}
            >
              {user.role.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 capitalize">
                {user.role.replace('_', ' ')}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{ROLE_DESCRIPTIONS[user.role]}</p>
            </div>
          </div>

          {(user.techLead || user.manager) && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.techLead && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tech Lead</p>
                  <p className="text-sm font-medium text-slate-900">{user.techLead.name}</p>
                  <p className="text-xs text-slate-500">{user.techLead.email}</p>
                </div>
              )}
              {user.manager && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Manager</p>
                  <p className="text-sm font-medium text-slate-900">{user.manager.name}</p>
                  <p className="text-xs text-slate-500">{user.manager.email}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="card-body space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="input"
            />
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="input"
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="input"
            />
          </div>

          {pwError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>
          )}

          <button
            type="submit"
            disabled={changePasswordMutation.isLoading}
            className="btn-primary"
          >
            {changePasswordMutation.isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

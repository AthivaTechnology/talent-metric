import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { appraisalService } from '@services/appraisalService';
import { userService } from '@services/userService';
import { useAuth } from '@context/AuthContext';
import StatusBadge from '@components/common/StatusBadge';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { AppraisalStatus, UserRole } from '@/types/index';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'tech_lead_review', label: 'Tech Lead Review' },
  { value: 'manager_review', label: 'Manager Review' },
  { value: 'completed', label: 'Completed' },
];

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const ROLES_THAT_CAN_CREATE: UserRole[] = ['admin'];

const APPRAISABLE_ROLES: { value: string; label: string }[] = [
  { value: 'developer', label: 'Developer / Tester' },
  { value: 'tech_lead', label: 'Tech Lead' },
  { value: 'manager', label: 'Manager' },
];

export default function AppraisalsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const limit = 10;

  const { data, isLoading } = useQuery(
    ['appraisals', { status: statusFilter, year: yearFilter, page, limit }],
    () =>
      appraisalService.getAppraisals({
        status: statusFilter || undefined,
        year: yearFilter || undefined,
        page,
        limit,
      }),
    { keepPreviousData: true }
  );

  const canCreate = user && ROLES_THAT_CAN_CREATE.includes(user.role);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appraisals</h1>
          <p className="text-slate-500 mt-1">
            {data ? `${data.total} total appraisals` : 'Loading...'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-4 h-4" />
            New Appraisal
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FunnelIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input w-auto"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
            className="input w-auto"
          >
            <option value="">All Years</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {(statusFilter || yearFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setYearFilter(''); setPage(1); }}
              className="btn-ghost btn-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : data?.appraisals.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardDocumentListEmpty />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {user?.role !== 'developer' && user?.role !== 'tester' && <th>Employee</th>}
                  <th>Year</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.appraisals.map((a) => (
                  <tr key={a.id}>
                    {user?.role !== 'developer' && user?.role !== 'tester' && (
                      <td>
                        <div>
                          <p className="font-medium text-slate-900">{a.user?.name ?? '—'}</p>
                          <p className="text-xs text-slate-500">{a.user?.email}</p>
                          <p className="text-xs text-slate-400 capitalize">{a.user?.role?.replace('_', ' ')}</p>
                        </div>
                      </td>
                    )}
                    <td className="font-medium">{a.year}</td>
                    <td>
                      <StatusBadge status={a.status as AppraisalStatus} />
                    </td>
                    <td className="text-slate-500">
                      {a.deadline ? format(new Date(a.deadline), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="text-slate-500">
                      {format(new Date(a.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <Link
                        to={`/appraisals/${a.id}`}
                        className="btn-secondary btn-sm"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Page {data.page} of {data.totalPages} ({data.total} results)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create appraisal modal */}
      {showCreateModal && (
        <CreateAppraisalModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries(['appraisals']);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function ClipboardDocumentListEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600">No appraisals found</p>
      <p className="text-xs">Adjust the filters or create a new appraisal.</p>
    </div>
  );
}

// Create appraisal modal (admin only)
interface CreateAppraisalModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateAppraisalModal({ onClose, onCreated }: CreateAppraisalModalProps) {
  const [selectedRole, setSelectedRole] = useState('developer');
  const [userId, setUserId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [deadline, setDeadline] = useState('');

  const { data: userData, isLoading: loadingUsers } = useQuery(
    ['users', { role: selectedRole }],
    () => userService.getUsers({ role: selectedRole, limit: 100 })
  );

  const { data: testerData } = useQuery(
    ['users', { role: 'tester' }],
    () => userService.getUsers({ role: 'tester', limit: 100 }),
    { enabled: selectedRole === 'developer' }
  );

  const employeeOptions = selectedRole === 'developer'
    ? [...(userData?.users ?? []), ...(testerData?.users ?? [])]
    : (userData?.users ?? []);

  const mutation = useMutation(
    () => appraisalService.createAppraisal({ userId, year, deadline: deadline || undefined }),
    {
      onSuccess: () => {
        toast.success('Appraisal created successfully');
        onCreated();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to create appraisal';
        toast.error(msg);
      },
    }
  );

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setUserId('');
  };

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              Create Appraisal
            </Dialog.Title>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="label">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="input"
              >
                {APPRAISABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Employee</label>
              {loadingUsers ? (
                <LoadingSpinner size="sm" />
              ) : (
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select employee...</option>
                  {employeeOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="label">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Deadline (optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!userId || mutation.isLoading}
              className="btn-primary flex-1"
            >
              {mutation.isLoading ? <LoadingSpinner size="sm" /> : 'Create'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

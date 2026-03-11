import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { userService } from '@services/userService';
import { getErrorMessage } from '@services/api';
import LoadingSpinner from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import type { User, UserRole, CreateUserPayload, UpdateUserPayload } from '@/types/index';
import { format } from 'date-fns';
import clsx from 'clsx';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'tester', label: 'Tester' },
  { value: 'tech_lead', label: 'Tech Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  tech_lead: 'bg-blue-100 text-blue-700',
  developer: 'bg-green-100 text-green-700',
  tester: 'bg-amber-100 text-amber-700',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const limit = 10;

  const { data, isLoading } = useQuery(
    ['users', { search, role: roleFilter, page, limit }],
    () =>
      userService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        page,
        limit,
      }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation((id: number | string) => userService.deleteUser(id), {
    onSuccess: () => {
      toast.success('User deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to delete user')); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">
            {data ? `${data.total} users` : 'Manage team members'}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search & filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="input pl-9"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input w-auto"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : data?.users.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Reports To</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{u.email}</td>
                    <td>
                      <span
                        className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          ROLE_COLORS[u.role]
                        )}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-slate-500">
                      {u.manager?.name ?? u.techLead?.name ?? '—'}
                    </td>
                    <td className="text-slate-500">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
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
              Page {data.page} of {data.totalPages}
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

      {/* Create modal */}
      {showCreateModal && (
        <UserModal
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            queryClient.invalidateQueries(['users']);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit modal */}
      {modalUser && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onSaved={() => {
            queryClient.invalidateQueries(['users']);
            setModalUser(null);
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Dialog open onClose={() => setDeleteTarget(null)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
              <Dialog.Title className="text-lg font-semibold text-slate-900 mb-2">
                Delete User
              </Dialog.Title>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete{' '}
                <strong className="text-slate-900">{deleteTarget.name}</strong>? This cannot
                be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isLoading}
                  className="btn-danger flex-1"
                >
                  {deleteMutation.isLoading ? <LoadingSpinner size="sm" /> : 'Delete'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}

interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ user, onClose, onSaved }: UserModalProps) {
  const isEditing = !!user;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'developer');
  const [techLeadId, setTechLeadId] = useState(user?.techLeadId ? String(user.techLeadId) : '');
  const [managerId, setManagerId] = useState(user?.managerId ? String(user.managerId) : '');

  const techLeadsQuery = useQuery(['tech-leads'], userService.getTechLeads, { staleTime: 60_000 });
  const managersQuery = useQuery(['managers'], userService.getManagers, { staleTime: 60_000 });

  const mutation = useMutation(
    () => {
      if (isEditing) {
        const payload: UpdateUserPayload = {
          name,
          email,
          role,
          techLeadId: techLeadId || undefined,
          managerId: managerId || undefined,
        };
        return userService.updateUser(user.id, payload);
      } else {
        const payload: CreateUserPayload = {
          name,
          email,
          password,
          role,
          techLeadId: techLeadId || undefined,
          managerId: managerId || undefined,
        };
        return userService.createUser(payload);
      }
    },
    {
      onSuccess: () => {
        toast.success(isEditing ? 'User updated' : 'User created');
        onSaved();
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, 'Failed to save user'));
      },
    }
  );

  const showTechLead = role === 'developer' || role === 'tester';
  const showManager = role === 'developer' || role === 'tester' || role === 'tech_lead';

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-xl my-8">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit User' : 'Add User'}
            </Dialog.Title>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Jane Smith"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="jane@company.com"
                required
              />
            </div>

            {!isEditing && (
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {showTechLead && (
              <div>
                <label className="label">Tech Lead (optional)</label>
                <select
                  value={techLeadId}
                  onChange={(e) => setTechLeadId(e.target.value)}
                  className="input"
                >
                  <option value="">None</option>
                  {techLeadsQuery.data?.map((tl) => (
                    <option key={tl.id} value={tl.id}>
                      {tl.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showManager && (
              <div>
                <label className="label">Manager (optional)</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="input"
                >
                  <option value="">None</option>
                  {managersQuery.data?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!name || !email || (!isEditing && !password) || mutation.isLoading}
              className="btn-primary flex-1"
            >
              {mutation.isLoading ? <LoadingSpinner size="sm" /> : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

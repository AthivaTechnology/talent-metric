import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MagnifyingGlassIcon, UserGroupIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { appraisalService } from '@services/appraisalService';
import { getErrorMessage } from '@services/api';
import LoadingSpinner from '@components/common/LoadingSpinner';
import StatusBadge from '@components/common/StatusBadge';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type PeerEntry = Awaited<ReturnType<typeof appraisalService.getPeerOverview>>[number];

const ROLE_LABELS: Record<string, string> = {
  developer: 'Developer',
  tester: 'Tester',
  tech_lead: 'Tech Lead',
  manager: 'Manager',
  devops: 'DevOps',
};

const ROLE_COLORS: Record<string, string> = {
  developer: 'bg-indigo-100 text-indigo-700',
  tester: 'bg-cyan-100 text-cyan-700',
  tech_lead: 'bg-violet-100 text-violet-700',
  manager: 'bg-emerald-100 text-emerald-700',
  devops: 'bg-amber-100 text-amber-700',
};

interface FeedbackModalProps {
  peer: PeerEntry;
  onClose: () => void;
  onSubmitted: () => void;
}

function FeedbackModal({ peer, onClose, onSubmitted }: FeedbackModalProps) {
  const isEditing = !!peer.myFeedback;
  const [didWell, setDidWell] = useState(peer.myFeedback?.didWell ?? '');
  const [canImprove, setCanImprove] = useState(peer.myFeedback?.canImprove ?? '');

  const addMutation = useMutation(
    () => appraisalService.addPeerFeedback(peer.appraisal!.id, didWell, canImprove),
    {
      onSuccess: () => { toast.success('Feedback submitted!'); onSubmitted(); },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to submit')); },
    }
  );

  const updateMutation = useMutation(
    () => appraisalService.updatePeerFeedback(peer.appraisal!.id, peer.myFeedback!.id, didWell, canImprove),
    {
      onSuccess: () => { toast.success('Feedback updated!'); onSubmitted(); },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to update')); },
    }
  );

  const isLoading = addMutation.isLoading || updateMutation.isLoading;
  const isValid = didWell.trim().length >= 5 && canImprove.trim().length >= 5;

  const handleSubmit = () => {
    if (isEditing) updateMutation.mutate();
    else addMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
            {peer.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{peer.user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{ROLE_LABELS[peer.user.role] ?? peer.user.role}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-1.5">
              What did they do well?
            </label>
            <textarea
              value={didWell}
              onChange={(e) => setDidWell(e.target.value)}
              placeholder="Share something they excelled at this period..."
              rows={3}
              className="input resize-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">{didWell.trim().length}/5 min</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1.5">
              What can they improve?
            </label>
            <textarea
              value={canImprove}
              onChange={(e) => setCanImprove(e.target.value)}
              placeholder="Suggest one area for growth..."
              rows={3}
              className="input resize-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">{canImprove.trim().length}/5 min</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : isEditing ? 'Update Feedback' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PeerFeedbackPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedPeer, setSelectedPeer] = useState<PeerEntry | null>(null);

  const overviewQuery = useQuery('peer-overview', () => appraisalService.getPeerOverview());

  const deleteMutation = useMutation(
    ({ appraisalId, feedbackId }: { appraisalId: string; feedbackId: string }) =>
      appraisalService.deletePeerFeedback(appraisalId, feedbackId),
    {
      onSuccess: () => {
        toast.success('Feedback removed');
        queryClient.invalidateQueries('peer-overview');
      },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to remove feedback')); },
    }
  );

  const peers = overviewQuery.data ?? [];

  const filtered = peers.filter((p) => {
    const matchesSearch = p.user.name.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || p.user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = [...new Set(peers.map((p) => p.user.role))].sort();

  const given = peers.filter((p) => p.myFeedback).length;
  const withAppraisal = peers.filter((p) => p.appraisal).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Peer Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">
          Give anonymous feedback to your colleagues for their {new Date().getFullYear()} appraisal.
        </p>
      </div>

      {/* Stats */}
      {!overviewQuery.isLoading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card card-body text-center py-4">
            <p className="text-2xl font-bold text-slate-900">{peers.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Colleagues</p>
          </div>
          <div className="card card-body text-center py-4">
            <p className="text-2xl font-bold text-indigo-600">{given}</p>
            <p className="text-xs text-slate-500 mt-0.5">Feedback Given</p>
          </div>
          <div className="card card-body text-center py-4">
            <p className="text-2xl font-bold text-slate-400">{withAppraisal - given}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input text-sm w-40"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {overviewQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Loading colleagues..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card card-body text-center py-16 text-slate-400">
          <UserGroupIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No colleagues found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => {
            const { user, appraisal, myFeedback } = entry;
            const hasAppraisal = !!appraisal;
            const hasFeedback = !!myFeedback;

            return (
              <div
                key={user.id}
                className={clsx(
                  'card card-body flex flex-col gap-3',
                  !hasAppraisal && 'opacity-60'
                )}
              >
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0', ROLE_COLORS[user.role] ?? 'bg-slate-100 text-slate-600')}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </div>

                {/* Appraisal status */}
                <div className="flex items-center justify-between text-xs">
                  {hasAppraisal ? (
                    <>
                      <span className="text-slate-500">{appraisal.year} appraisal</span>
                      <StatusBadge status={appraisal.status as any} />
                    </>
                  ) : (
                    <span className="text-slate-400 italic">No active appraisal this year</span>
                  )}
                </div>

                {/* Feedback preview */}
                {hasFeedback && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-2">
                    <div>
                      <p className="text-xs font-medium text-emerald-700 mb-0.5">Did well</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{myFeedback.didWell}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-0.5">Can improve</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{myFeedback.canImprove}</p>
                    </div>
                  </div>
                )}

                {/* Action */}
                {hasAppraisal && (
                  <div className="flex gap-2 mt-auto pt-1">
                    {hasFeedback ? (
                      <>
                        <button
                          onClick={() => setSelectedPeer(entry)}
                          className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate({ appraisalId: appraisal.id, feedbackId: myFeedback.id })}
                          disabled={deleteMutation.isLoading}
                          className="btn-sm px-3 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedPeer(entry)}
                        className="btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
                      >
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Give Feedback
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedPeer && (
        <FeedbackModal
          peer={selectedPeer}
          onClose={() => setSelectedPeer(null)}
          onSubmitted={() => {
            setSelectedPeer(null);
            queryClient.invalidateQueries('peer-overview');
          }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '@services/dashboardService';
import StatusBadge from '@components/common/StatusBadge';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { format } from 'date-fns';
import type { AppraisalStatus, RatingCategory, TeamAppraisal } from '@/types/index';
import { TableCellsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

function formatCategory(cat: string): string {
  return cat.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function CalibrationTable({ appraisals }: { appraisals: TeamAppraisal[] }) {
  const allCategories = [
    ...new Set(appraisals.flatMap((a) => a.ratings.map((r) => r.category as RatingCategory))),
  ];

  return (
    <div className="card overflow-x-auto">
      <div className="p-4 border-b border-slate-200 flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Ratings Calibration</h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Self
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            Tech Lead
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Manager
          </span>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Member</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Status</th>
            {allCategories.map((cat) => (
              <th
                key={cat}
                className="text-center px-3 py-3 font-medium text-slate-600 whitespace-nowrap text-xs"
              >
                {formatCategory(cat)}
              </th>
            ))}
            <th className="text-right px-4 py-3 font-medium text-slate-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appraisals.map((appraisal) => {
            const ratingsByCategory: Record<
              string,
              { self?: number; tech_lead?: number; manager?: number }
            > = {};
            appraisal.ratings.forEach((r) => {
              if (!ratingsByCategory[r.category]) ratingsByCategory[r.category] = {};
              const role = r.raterRole ?? 'self';
              (ratingsByCategory[r.category] as Record<string, number>)[role] = r.rating;
            });

            return (
              <tr key={appraisal.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {appraisal.user?.name.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 whitespace-nowrap">
                        {appraisal.user?.name ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {appraisal.user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={appraisal.status as AppraisalStatus} />
                </td>
                {allCategories.map((cat) => {
                  const c = ratingsByCategory[cat] ?? {};
                  const hasAny = c.self !== undefined || c.tech_lead !== undefined || c.manager !== undefined;
                  return (
                    <td key={cat} className="px-3 py-3 text-center">
                      {hasAny ? (
                        <div className="flex flex-col items-center gap-0.5">
                          {c.self !== undefined && (
                            <span className="text-xs font-semibold text-amber-600">{c.self}</span>
                          )}
                          {c.tech_lead !== undefined && (
                            <span className="text-xs font-semibold text-sky-600">{c.tech_lead}</span>
                          )}
                          {c.manager !== undefined && (
                            <span className="text-xs font-semibold text-indigo-600">{c.manager}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <Link to={`/appraisals/${appraisal.id}`} className="btn-secondary btn-sm">
                    Review
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TeamPage() {
  const [view, setView] = useState<'cards' | 'calibration'>('cards');

  const { data, isLoading, isError } = useQuery(
    ['team-appraisals'],
    dashboardService.getTeamAppraisals,
    { staleTime: 30_000 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Appraisals</h1>
          <p className="text-slate-500 mt-1">Review and manage your team's performance appraisals</p>
        </div>
        {data && data.length > 0 && (
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setView('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === 'cards'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setView('calibration')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === 'calibration'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableCellsIcon className="w-4 h-4" />
              Calibration
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Loading team appraisals..." />
        </div>
      ) : isError ? (
        <div className="card p-8 text-center text-slate-500 text-sm">
          Failed to load team appraisals.
        </div>
      ) : !data || data.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          No team appraisals found.
        </div>
      ) : view === 'calibration' ? (
        <CalibrationTable appraisals={data} />
      ) : (
        <div className="grid gap-4">
          {data.map((appraisal) => {
            const developer = appraisal.user;
            const selfRatings = appraisal.ratings.filter(
              (r) => !r.raterRole || r.raterRole === 'self'
            );
            const avgRating =
              selfRatings.length > 0
                ? selfRatings.reduce((sum, r) => sum + r.rating, 0) / selfRatings.length
                : null;

            return (
              <div key={appraisal.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 text-lg font-bold flex items-center justify-center flex-shrink-0">
                      {developer?.name.charAt(0).toUpperCase() ?? '?'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-slate-900">
                          {developer?.name ?? '—'}
                        </h3>
                        <StatusBadge status={appraisal.status as AppraisalStatus} />
                      </div>
                      <p className="text-sm text-slate-500">{developer?.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {appraisal.year} appraisal
                        {appraisal.deadline
                          ? ` · Due ${format(new Date(appraisal.deadline), 'MMM d, yyyy')}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {avgRating !== null && (
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              className={`w-4 h-4 ${
                                s <= Math.round(avgRating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 fill-slate-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {avgRating.toFixed(1)} avg (self)
                        </p>
                      </div>
                    )}

                    <Link to={`/appraisals/${appraisal.id}`} className="btn-primary btn-sm">
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

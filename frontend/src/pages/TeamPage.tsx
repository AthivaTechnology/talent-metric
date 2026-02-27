import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '@services/dashboardService';
import StatusBadge from '@components/common/StatusBadge';
import LoadingSpinner from '@components/common/LoadingSpinner';
import StarRating from '@components/common/StarRating';
import { format } from 'date-fns';
import type { AppraisalStatus } from '@/types/index';

export default function TeamPage() {
  const { data, isLoading, isError } = useQuery(
    ['team-appraisals'],
    dashboardService.getTeamAppraisals,
    { staleTime: 30_000 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team Appraisals</h1>
        <p className="text-slate-500 mt-1">Review and manage your team's performance appraisals</p>
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
      ) : (
        <div className="grid gap-4">
          {data.map((appraisal) => {
            const developer = appraisal.user;
            const avgRating =
              appraisal.ratings.length > 0
                ? appraisal.ratings.reduce((sum, r) => sum + r.rating, 0) /
                  appraisal.ratings.length
                : null;

            return (
              <div key={appraisal.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
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
                        <StarRating value={Math.round(avgRating)} readonly size="sm" />
                        <p className="text-xs text-slate-400 mt-1">
                          {avgRating.toFixed(1)} avg rating
                        </p>
                      </div>
                    )}

                    <Link
                      to={`/appraisals/${appraisal.id}`}
                      className="btn-primary btn-sm"
                    >
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

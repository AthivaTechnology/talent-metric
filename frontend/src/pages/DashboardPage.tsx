import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { dashboardService } from '@services/dashboardService';
import { appraisalService } from '@services/appraisalService';
import { useAuth } from '@context/AuthContext';
import StatusBadge from '@components/common/StatusBadge';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { format } from 'date-fns';
import type { DashboardStats } from '@/types/index';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function buildStatCards(stats: DashboardStats, role: string) {
  const cards: StatCardProps[] = [];

  if (role === 'admin') {
    const pending = (stats.draftAppraisals ?? 0) + (stats.submittedAppraisals ?? 0)
      + (stats.techLeadReviewAppraisals ?? 0) + (stats.managerReviewAppraisals ?? 0);
    const totalICs = (stats.totalDevelopers ?? 0) + (stats.totalTesters ?? 0) + (stats.totalDevOps ?? 0);
    cards.push(
      {
        label: 'Total Appraisals',
        value: stats.totalAppraisals ?? 0,
        icon: ClipboardDocumentListIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      },
      {
        label: 'Devs / Testers / DevOps',
        value: totalICs,
        icon: UserGroupIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        label: 'Completed',
        value: stats.completedAppraisals ?? 0,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        label: 'In Progress',
        value: pending,
        icon: ClockIcon,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      }
    );
  } else if (role === 'developer' || role === 'tester' || role === 'devops') {
    cards.push(
      {
        label: 'My Appraisals',
        value: stats.totalAppraisals ?? 0,
        icon: ClipboardDocumentListIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      },
      {
        label: 'Completed',
        value: stats.completedAppraisals ?? 0,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        label: 'In Review',
        value: (stats.techLeadReviewAppraisals ?? 0) + (stats.managerReviewAppraisals ?? 0),
        icon: ArrowTrendingUpIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        label: 'Draft',
        value: stats.draftAppraisals ?? 0,
        icon: ClockIcon,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      }
    );
  } else {
    const teamSize = role === 'manager'
      ? (stats.totalReportees ?? 0)
      : (stats.totalTeamMembers ?? 0);
    cards.push(
      {
        label: role === 'manager' ? 'Reportees' : 'Team Members',
        value: teamSize,
        icon: UserGroupIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        label: 'Total Appraisals',
        value: stats.totalAppraisals ?? 0,
        icon: ClipboardDocumentListIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      },
      {
        label: 'Pending Reviews',
        value: stats.pendingReviews ?? 0,
        icon: ClockIcon,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      },
      {
        label: 'Completed',
        value: stats.completedAppraisals ?? 0,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    );
  }
  return cards;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const statsQuery = useQuery(['dashboard-stats'], dashboardService.getDashboardStats, {
    staleTime: 30_000,
  });

  const appraisalsQuery = useQuery(
    ['appraisals', { page: 1, limit: 5 }],
    () => appraisalService.getAppraisals({ page: 1, limit: 5 }),
    { staleTime: 30_000 }
  );

  const analyticsQuery = useQuery(
    ['dashboard-analytics'],
    dashboardService.getTeamAnalytics,
    {
      enabled: user?.role !== 'developer' && user?.role !== 'tester' && user?.role !== 'devops',
      staleTime: 60_000,
    }
  );

  const stats = statsQuery.data;
  const statCards = stats && user ? buildStatCards(stats, user.role) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with appraisals.
        </p>
      </div>

      {/* Stat cards */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent appraisals */}
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Appraisals</h2>
            <Link
              to="/appraisals"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            {appraisalsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : appraisalsQuery.data?.appraisals.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No appraisals found.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    {user?.role !== 'developer' && user?.role !== 'tester' && user?.role !== 'devops' && <th>Employee</th>}
                    <th>Year</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appraisalsQuery.data?.appraisals.map((a) => (
                    <tr key={a.id}>
                      {user?.role !== 'developer' && user?.role !== 'tester' && user?.role !== 'devops' && (
                        <td className="font-medium">{a.user?.name ?? '—'}</td>
                      )}
                      <td>{a.year}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="text-slate-500">
                        {a.deadline
                          ? format(new Date(a.deadline), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td>
                        <Link
                          to={`/appraisals/${a.id}`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Analytics chart */}
        {user?.role !== 'developer' && user?.role !== 'tester' && user?.role !== 'devops' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-base font-semibold text-slate-900">Avg Ratings by Category</h2>
            </div>
            <div className="p-4">
              {analyticsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : analyticsQuery.data?.averageRatings?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analyticsQuery.data.averageRatings.map((r) => ({
                      name: r.category
                        .split('_')
                        .map((w) => w[0].toUpperCase() + w.slice(1))
                        .join(' '),
                      avg: Number(r.average.toFixed(1)),
                    }))}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No analytics data yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

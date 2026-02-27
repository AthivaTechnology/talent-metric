import { useQuery } from 'react-query';
import { dashboardService } from '@services/dashboardService';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e'];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  tech_lead_review: 'TL Review',
  manager_review: 'Mgr Review',
  completed: 'Completed',
};

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery(
    ['team-analytics'],
    dashboardService.getTeamAnalytics,
    { staleTime: 60_000 }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading analytics..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card p-8 text-center text-slate-500 text-sm">
        Failed to load analytics data.
      </div>
    );
  }

  const avgRatingData = (data.averageRatings ?? []).map((r) => ({
    name: r.category
      .split('_')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    value: Number(r.average.toFixed(2)),
  }));

  const statusData = (data.statusDistribution ?? []).map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
  }));

  const ratingDistData = (data.ratingDistribution ?? []).map((d) => ({
    name: `${d.rating} star${d.rating !== 1 ? 's' : ''}`,
    count: d.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Performance insights across your team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average ratings by category */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">
              Average Ratings by Category
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Scale: 1–5</p>
          </div>
          <div className="p-4">
            {avgRatingData.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No rating data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={avgRatingData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                    formatter={(v: number) => [v, 'Avg Rating']}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Appraisal Status Distribution</h2>
          </div>
          <div className="p-4">
            {statusData.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Rating distribution */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Rating Distribution</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              How ratings are spread across 1–5 stars
            </p>
          </div>
          <div className="p-4">
            {ratingDistData.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No distribution data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={ratingDistData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                    formatter={(v: number) => [v, 'Count']}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

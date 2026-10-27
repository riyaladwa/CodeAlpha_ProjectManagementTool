import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { getAvatarColor, getInitials } from '../utils/helpers';

export const AnalyticsPage = () => {
  const { currentWorkspace } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get('/analytics/overview');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentWorkspace]);

  if (loading || !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-64 bg-white rounded-2xl animate-pulse border border-zinc-200" />
      </div>
    );
  }

  const { summary, statusDistribution, priorityDistribution, completionTrend, teamWorkload } =
    data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Analytics & Sprint Velocity</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Real-time metrics, workload distribution, and deliverable trends in {currentWorkspace?.name}.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-[#18181B]" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary.totalTasks}</p>
          <p className="text-[11px] text-zinc-600 font-medium">{summary.completedTasks} completed in workspace</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-[#18181B]" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary.completionRate}%</p>
          <p className="text-[11px] text-zinc-500">{summary.completedTasks} of {summary.totalTasks} total tasks finished</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Active In-Flight</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary.inProgressTasks + summary.inReviewTasks}</p>
          <p className="text-[11px] text-zinc-500">{summary.inProgressTasks} In Progress • {summary.inReviewTasks} In Review</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Overdue Deadlines</span>
            <AlertCircle className={`w-4 h-4 ${summary.overdueTasks > 0 ? 'text-rose-600' : 'text-zinc-400'}`} />
          </div>
          <p className={`text-2xl font-bold ${summary.overdueTasks > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
            {summary.overdueTasks}
          </p>
          <p className={`text-[11px] font-medium ${summary.overdueTasks > 0 ? 'text-rose-700' : 'text-zinc-600'}`}>
            {summary.overdueTasks > 0 ? 'Action required by assignees' : 'Zero overdue blockers'}
          </p>
        </div>
      </div>

      {/* Row 1 Charts: Status Pie & Priority Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#18181B]" /> Task Status Breakdown
            </h3>
            <span className="text-xs text-zinc-400">{summary.totalTasks} total tasks</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#18181B]" /> Task Priority Distribution
            </h3>
            <span className="text-xs text-zinc-400">By urgency level</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDistribution} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#18181B" radius={[8, 8, 0, 0]}>
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: 14-Day Completion Trend Area Chart */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#18181B]" /> 14-Day Velocity & Completed Tasks Trend
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Daily task completion volume over past two weeks</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181B',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#18181B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCompleted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Workflow Status Breakdown & Team Workload Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Status Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Workflow Status Distribution
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {statusDistribution.map((s) => {
              const pct = summary.totalTasks > 0 ? Math.round((s.value / summary.totalTasks) * 100) : 0;
              return (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span>{s.name}</span>
                    </div>
                    <span className="font-bold text-zinc-900">{pct}% ({s.value} tasks)</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: s.color || '#18181B' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#18181B]" /> Team Workload Allocation
          </h3>

          <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
            {teamWorkload.map((m) => (
              <div key={m.userId} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarColor(
                      m.name
                    )}`}
                  >
                    {getInitials(m.name)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-zinc-900 truncate">{m.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{m.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="font-bold text-zinc-800">{m.total}</span>
                    <span className="text-[10px] text-zinc-400 block">Assigned</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900">{m.completed}</span>
                    <span className="text-[10px] text-zinc-400 block">Done</span>
                  </div>
                  {m.overdue > 0 && (
                    <div>
                      <span className="font-bold text-rose-600">{m.overdue}</span>
                      <span className="text-[10px] text-rose-400 block">Overdue</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

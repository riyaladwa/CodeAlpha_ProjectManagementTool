import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Users,
  Activity,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { formatDate, isOverdue, triggerConfetti, getAvatarColor, getInitials } from '../utils/helpers';

export const DashboardPage = () => {
  const { user, currentWorkspace } = useAuth();
  const { openNewTaskModal } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });
  const [activeTasks, setActiveTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchDashboardData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [analyticsRes, tasksRes, todayRes, actRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/tasks?limit=6'),
        api.get('/tasks?dueDateFilter=today'),
        api.get('/activity?limit=6'),
      ]);

      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.data.summary);
      }
      if (tasksRes.data.success) {
        setActiveTasks(tasksRes.data.tasks || []);
      }
      if (todayRes.data.success) {
        setTodayTasks(todayRes.data.tasks || []);
      }
      if (actRes.data.success) {
        setActivities(actRes.data.activities || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('taskflow-data-refresh', handleRefresh);
    return () => window.removeEventListener('taskflow-data-refresh', handleRefresh);
  }, [currentWorkspace]);

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: nextStatus });
      setTodayTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
      );
      setActiveTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
      );
      if (nextStatus === 'completed') {
        triggerConfetti();
        toast.success(`Task "${task.title}" completed!`);
      }
      // Refresh stats
      const { data } = await api.get('/analytics/overview');
      if (data.success) setStats(data.data.summary);
    } catch (err) {
      toast.error('Failed to update task status.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Greeting & Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.name?.split(' ')[0] || 'Engineer'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Here is the current state of workspace <span className="font-semibold text-slate-700">{currentWorkspace?.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ai-assistant')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/70 text-zinc-900 border border-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-zinc-700" />
            AI Sprint Planner
          </button>
          <button
            onClick={openNewTaskModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? '-' : stats.inProgressTasks}
            </span>
            <span className="text-xs font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md">
              Active Sprints
            </span>
          </div>
        </div>

        {/* Metric 2: Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? '-' : stats.totalTasks}
            </span>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {stats.completedTasks} Done
            </span>
          </div>
        </div>

        {/* Metric 3: Completion Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? '-' : `${stats.completionRate}%`}
            </span>
            <span className="text-xs font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md">
              {stats.completedTasks} Completed
            </span>
          </div>
        </div>

        {/* Metric 4: Overdue Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue Tasks
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stats.overdueTasks > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {loading ? '-' : stats.overdueTasks}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${stats.overdueTasks > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
              {stats.overdueTasks > 0 ? 'Needs Attention' : 'All on Track'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Tasks & Today's Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Workspace Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-zinc-900" /> Active Workspace Tasks ({activeTasks.length})
            </h3>
            <button
              onClick={() => navigate('/kanban')}
              className="text-xs font-semibold text-zinc-900 hover:text-black flex items-center gap-1 transition-colors"
            >
              Open Kanban <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : activeTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks in this workspace yet"
              description="Start organizing your deliverables by creating your first task."
              actionLabel="Create Task"
              onAction={openNewTaskModal}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeTasks.slice(0, 4).map((t) => {
                const subCount = t.subtasks?.length || 0;
                const completedSubs = t.subtasks?.filter((s) => s.completed)?.length || 0;
                const progress = subCount > 0 ? Math.round((completedSubs / subCount) * 100) : t.status === 'completed' ? 100 : 0;
                return (
                  <div
                    key={t._id}
                    onClick={() => navigate('/kanban')}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-zinc-400 transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-black transition-colors truncate">
                            {t.title}
                          </h4>
                        </div>
                        <StatusBadge status={t.status} size="xs" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Checklist ({completedSubs}/{subCount})</span>
                        <PriorityBadge priority={t.priority} size="xs" showIcon={false} />
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#18181B] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Activity Feed Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Recent Workspace Activity
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {activities.map((act) => (
                  <div key={act._id} className="py-3 flex items-start gap-3 text-xs">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarColor(
                        act.userId?.name
                      )}`}
                    >
                      {getInitials(act.userId?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800">
                        <span className="font-semibold">{act.userId?.name || 'Teammate'}</span>{' '}
                        {act.action === 'created_task' && 'created task '}
                        {act.action === 'completed_task' && 'completed task '}
                        {act.action === 'added_comment' && 'commented on task '}
                        {act.action === 'imported_ai_plan' && 'imported an AI sprint plan to '}
                        <span className="font-medium text-slate-900">
                          {act.details?.taskTitle || act.details?.projectName || 'an item'}
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Tasks & Fast AI Planner */}
        <div className="space-y-6">
          {/* Today's Tasks Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-900" /> Due Today ({todayTasks.length})
              </h3>
              <button
                onClick={() => navigate('/my-tasks')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                All Tasks
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                No deadlines due today. Great pacing!
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={() => handleToggleTaskStatus(t)}
                        className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-800 border-slate-300 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium truncate ${
                          t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                    <PriorityBadge priority={t.priority} size="xs" showIcon={false} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Signature Feature Box */}
          <div className="bg-[#18181B] rounded-2xl p-6 text-white space-y-4 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center border border-zinc-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold tracking-tight text-white">AI Sprint Assistant</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Break down large initiatives into actionable milestone tasks with Google Gemini AI.
              </p>
            </div>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all active:scale-98 shadow-sm"
            >
              Launch AI Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

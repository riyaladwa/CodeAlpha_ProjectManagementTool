import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { TaskModal } from '../components/TaskModal';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { formatDate, isOverdue, isDueToday, triggerConfetti } from '../utils/helpers';

export const MyTasksPage = () => {
  const { currentWorkspace, user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const fetchMyTasks = async () => {
    if (!currentWorkspace || !user) return;
    try {
      setLoading(true);
      const { data } = await api.get('/tasks?assigneeId=me');
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();

    const handleRefresh = () => fetchMyTasks();
    window.addEventListener('taskflow-data-refresh', handleRefresh);
    return () => window.removeEventListener('taskflow-data-refresh', handleRefresh);
  }, [currentWorkspace, user]);

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
      );
      if (nextStatus === 'completed') {
        triggerConfetti();
        toast.success(`Task "${task.title}" completed!`);
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status === 'completed'));
  const todayTasks = tasks.filter((t) => t.status !== 'completed' && isDueToday(t.dueDate));
  const upcomingTasks = tasks.filter(
    (t) => t.status !== 'completed' && !isOverdue(t.dueDate) && !isDueToday(t.dueDate)
  );
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const renderTaskRow = (t) => (
    <div
      key={t._id}
      onClick={() => {
        setSelectedTaskId(t._id);
        setTaskModalOpen(true);
      }}
      className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-subtle transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={t.status === 'completed'}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleTaskStatus(t);
          }}
          className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-800 border-slate-300 cursor-pointer"
        />
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold truncate ${
              t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-black'
            }`}
          >
            {t.title}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-600">
              {t.tags && t.tags.length > 0 ? `#${t.tags[0]}` : 'Workspace Task'}
            </span>
            {t.subtasks?.length > 0 && (
              <span>• {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <PriorityBadge priority={t.priority} size="xs" showIcon={false} />
        {t.dueDate && (
          <span
            className={`text-[11px] font-medium flex items-center gap-1 ${
              isOverdue(t.dueDate, t.status === 'completed') ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {formatDate(t.dueDate)}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalized agenda and assigned deliverables in {currentWorkspace?.name}.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTaskId(null);
            setTaskModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks assigned to you"
          description="You currently have no tasks assigned in this workspace. Create or assign tasks to get started."
          actionLabel="Create Task"
          onAction={() => {
            setSelectedTaskId(null);
            setTaskModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Overdue Tasks ({overdueTasks.length})
              </h3>
              <div className="space-y-2">{overdueTasks.map(renderTaskRow)}</div>
            </div>
          )}

          {/* Today Section */}
          {todayTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-700" /> Due Today ({todayTasks.length})
              </h3>
              <div className="space-y-2">{todayTasks.map(renderTaskRow)}</div>
            </div>
          )}

          {/* Upcoming Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" /> Upcoming Tasks ({upcomingTasks.length})
            </h3>
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No upcoming tasks scheduled.</p>
            ) : (
              <div className="space-y-2">{upcomingTasks.map(renderTaskRow)}</div>
            )}
          </div>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#18181B]" /> Completed Tasks ({completedTasks.length})
              </h3>
              <div className="space-y-2 opacity-75">{completedTasks.map(renderTaskRow)}</div>
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskId={selectedTaskId}
        onTaskSaved={fetchMyTasks}
        onTaskDeleted={fetchMyTasks}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/Badge';
import { TaskModal } from '../components/TaskModal';
import { isOverdue, formatDate } from '../utils/helpers';

export const CalendarPage = () => {
  const { currentWorkspace } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [defaultDueDate, setDefaultDueDate] = useState('');

  const fetchCalendarTasks = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const { data } = await api.get(`/calendar/tasks?month=${month}&year=${year}`);
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load calendar tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarTasks();

    const handleRefresh = () => fetchCalendarTasks();
    window.addEventListener('taskflow-data-refresh', handleRefresh);
    return () => window.removeEventListener('taskflow-data-refresh', handleRefresh);
  }, [currentWorkspace, currentDate]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      const dStr = new Date(t.dueDate).toISOString().split('T')[0];
      if (!tasksByDate[dStr]) tasksByDate[dStr] = [];
      tasksByDate[dStr].push(t);
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Generate 42 calendar grid cells
  const calendarCells = [];
  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: '',
    });
  }
  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthFormatted = String(month + 1).padStart(2, '0');
    const dayFormatted = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
      isToday: dateStr === todayStr,
      tasks: tasksByDate[dateStr] || [],
    });
  }
  // 3. Next month leading days to fill 35 or 42 grid cells
  const remaining = 35 - calendarCells.length >= 0 ? 35 - calendarCells.length : 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: '',
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar & Deadlines</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual month schedule of task deliverables in {currentWorkspace?.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Navigation */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goToday}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* 7-column Calendar Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (cell.isCurrentMonth && cell.dateStr) {
                  setDefaultDueDate(cell.dateStr);
                  setSelectedTaskId(null);
                  setTaskModalOpen(true);
                }
              }}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                !cell.isCurrentMonth
                  ? 'bg-zinc-50/40 text-zinc-300'
                  : 'bg-white hover:bg-zinc-50/70 cursor-pointer'
              } ${cell.isToday ? 'bg-zinc-50 ring-1 ring-inset ring-zinc-400/40' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    cell.isToday
                      ? 'bg-[#18181B] text-white shadow-2xs'
                      : cell.isCurrentMonth
                      ? 'text-zinc-800'
                      : 'text-zinc-300'
                  }`}
                >
                  {cell.day}
                </span>

                {cell.isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultDueDate(cell.dateStr);
                      setSelectedTaskId(null);
                      setTaskModalOpen(true);
                    }}
                    className="opacity-0 hover:opacity-100 text-zinc-400 hover:text-zinc-900 p-0.5 rounded"
                    title="Add task on this date"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Task Badges in Cell */}
              <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                {cell.tasks?.slice(0, 3).map((t) => (
                  <div
                    key={t._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTaskId(t._id);
                      setTaskModalOpen(true);
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold truncate border transition-all ${
                      t.status === 'completed'
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-300 line-through opacity-70'
                        : isOverdue(t.dueDate)
                        ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-zinc-400'
                    }`}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
                {cell.tasks?.length > 3 && (
                  <span className="text-[9px] font-bold text-zinc-400 block text-right">
                    +{cell.tasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskId={selectedTaskId}
        defaultStatus="todo"
        onTaskSaved={fetchCalendarTasks}
        onTaskDeleted={fetchCalendarTasks}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PriorityBadge } from '../components/Badge';
import { TaskModal } from '../components/TaskModal';
import { KanbanColumnSkeleton } from '../components/LoadingSkeleton';
import { formatDate, getAvatarColor, getInitials, triggerConfetti } from '../utils/helpers';

const COLUMNS = [
  { id: 'todo', title: 'To Do', border: 'border-slate-300' },
  { id: 'in_progress', title: 'In Progress', border: 'border-amber-400' },
  { id: 'in_review', title: 'In Review', border: 'border-purple-400' },
  { id: 'completed', title: 'Completed', border: 'border-zinc-800' },
];

export const KanbanPage = () => {
  const { currentWorkspace, user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState('todo');

  const fetchKanbanData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedAssignee) params.append('assigneeId', selectedAssignee);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (search) params.append('search', search);

      const tasksRes = await api.get(`/tasks?${params.toString()}`);

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load Kanban data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanData();

    const handleRefresh = () => fetchKanbanData();
    window.addEventListener('taskflow-data-refresh', handleRefresh);
    return () => window.removeEventListener('taskflow-data-refresh', handleRefresh);
  }, [currentWorkspace, selectedAssignee, selectedPriority]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKanbanData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Drag and Drop Handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    const nextStatus = destination.droppableId;
    const prevStatus = movedTask.status;

    // Optimistic UI Update
    const updatedTasks = tasks.map((t) =>
      t._id === draggableId ? { ...t, status: nextStatus, order: destination.index } : t
    );
    setTasks(updatedTasks);

    if (nextStatus === 'completed' && prevStatus !== 'completed') {
      triggerConfetti();
      toast.success(`Task "${movedTask.title}" completed! 🎉`);
    }

    try {
      await api.patch(`/tasks/${draggableId}/status`, {
        status: nextStatus,
        order: destination.index,
      });
    } catch (err) {
      toast.error('Failed to persist status change. Rolling back.');
      setTasks(tasks);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kanban Board</h2>
          <p className="text-xs text-slate-500 mt-1">
            Drag cards between columns to update sprint progression in real-time.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTaskId(null);
            setDefaultColumnStatus('todo');
            setTaskModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter tasks by keyword or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/70 space-y-3 min-h-[500px] flex flex-col shadow-2xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {col.title}
                      </span>
                      <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTaskId(null);
                        setDefaultColumnStatus(col.id);
                        setTaskModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                      title={`Add task to ${col.title}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Droppable Task Container */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 min-h-[300px] rounded-xl transition-colors ${
                          snapshot.isDraggingOver ? 'bg-zinc-200/50' : ''
                        }`}
                      >
                        {colTasks.map((t, index) => (
                          <Draggable key={t._id} draggableId={t._id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => {
                                  setSelectedTaskId(t._id);
                                  setTaskModalOpen(true);
                                }}
                                className={`bg-white rounded-xl p-4 border shadow-subtle hover:shadow-card transition-all cursor-grab active:cursor-grabbing space-y-3 group select-none ${
                                  dragSnapshot.isDragging
                                    ? 'shadow-2xl ring-2 ring-zinc-800 rotate-1 border-zinc-800'
                                    : 'border-slate-200/80 hover:border-zinc-400'
                                }`}
                              >
                                {/* Top Meta */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {t.tags && t.tags.length > 0 ? (
                                      <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                        #{t.tags[0]}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-semibold text-slate-400 truncate">
                                        Task
                                      </span>
                                    )}
                                  </div>
                                  <PriorityBadge priority={t.priority} size="xs" showIcon={false} />
                                </div>

                                {/* Task Title */}
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-black transition-colors leading-snug">
                                  {t.title}
                                </h4>

                                {/* Subtasks progress */}
                                {t.subtasks && t.subtasks.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                    <CheckSquare className="w-3 h-3 text-slate-400" />
                                    <span>
                                      {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                                    </span>
                                  </div>
                                )}

                                {/* Card Footer: Tags, Deadline, Assignee */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  {t.dueDate ? (
                                    <span
                                      className={`text-[10px] font-medium flex items-center gap-1 ${
                                        new Date(t.dueDate) < new Date() && t.status !== 'completed'
                                          ? 'text-rose-600 font-bold'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(t.dueDate)}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-300">No due date</span>
                                  )}

                                  {/* Assignee Avatar */}
                                  {t.assigneeId ? (
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(
                                        t.assigneeId.name
                                      )}`}
                                      title={`Assigned to ${t.assigneeId.name}`}
                                    >
                                      {getInitials(t.assigneeId.name)}
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                                      ?
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Column Add Card Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTaskId(null);
                            setDefaultColumnStatus(col.id);
                            setTaskModalOpen(true);
                          }}
                          className="w-full py-2 border border-dashed border-slate-300 hover:border-zinc-800 hover:bg-white rounded-xl text-xs font-semibold text-slate-500 hover:text-black transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add card
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskId={selectedTaskId}
        defaultStatus={defaultColumnStatus}
        onTaskSaved={fetchKanbanData}
        onTaskDeleted={fetchKanbanData}
      />
    </div>
  );
};

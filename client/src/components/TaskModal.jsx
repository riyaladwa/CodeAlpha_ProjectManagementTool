import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Tag,
  CheckSquare,
  Sparkles,
  MessageSquare,
  Trash2,
  Send,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from './ConfirmationModal';
import { getInitials, getAvatarColor, formatDate, isOverdue } from '../utils/helpers';

export const TaskModal = ({
  isOpen,
  onClose,
  taskId = null, // if null, create mode; if string, edit/view mode
  defaultProjectId = '',
  defaultStatus = 'todo',
  onTaskSaved,
  onTaskDeleted,
}) => {
  const { currentWorkspace, user } = useAuth();
  const toast = useToast();

  // Form State
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Subtasks & Comments
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  // Projects & Members lists
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load Projects and Task Details
  useEffect(() => {
    if (!isOpen) return;

    if (taskId) {
      fetchTaskDetails(taskId);
    } else {
      // Reset form for create mode
      setProjectId(defaultProjectId || '');
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssigneeId('');
      setStartDate('');
      setDueDate('');
      setEstimatedHours('');
      setTags([]);
      setSubtasks([]);
      setComments([]);
    }
  }, [isOpen, taskId, defaultProjectId, defaultStatus]);

  const fetchTaskDetails = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tasks/${id}`);
      if (data.success && data.task) {
        const t = data.task;
        setProjectId(t.projectId?._id || t.projectId || '');
        setTitle(t.title);
        setDescription(t.description || '');
        setStatus(t.status);
        setPriority(t.priority);
        setAssigneeId(t.assigneeId?._id || t.assigneeId || '');
        setStartDate(t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '');
        setDueDate(t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '');
        setEstimatedHours(t.estimatedHours || '');
        setTags(t.tags || []);
        setSubtasks(t.subtasks || []);
        setComments(t.comments || []);
      }
    } catch (err) {
      toast.error('Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Tag Handlers
  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Subtask Handlers
  const handleAddSubtask = async (e) => {
    e?.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    if (taskId) {
      try {
        const { data } = await api.post(`/tasks/${taskId}/subtasks`, {
          title: newSubtaskTitle.trim(),
        });
        if (data.success) {
          setSubtasks(data.subtasks);
          setNewSubtaskTitle('');
          toast.success('Subtask added.');
        }
      } catch (err) {
        toast.error('Failed to add subtask.');
      }
    } else {
      setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = async (subtaskId, index) => {
    if (taskId && subtaskId) {
      try {
        const { data } = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
        if (data.success) {
          setSubtasks(data.subtasks);
        }
      } catch (err) {
        toast.error('Failed to update subtask.');
      }
    } else {
      const updated = [...subtasks];
      updated[index].completed = !updated[index].completed;
      setSubtasks(updated);
    }
  };

  const handleDeleteSubtask = async (subtaskId, index) => {
    if (taskId && subtaskId) {
      try {
        const { data } = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
        if (data.success) {
          setSubtasks(data.subtasks);
        }
      } catch (err) {
        toast.error('Failed to delete subtask.');
      }
    } else {
      setSubtasks(subtasks.filter((_, idx) => idx !== index));
    }
  };

  // Comment Handlers
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !taskId) return;

    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, {
        content: commentInput.trim(),
      });
      if (data.success) {
        setComments([...comments, data.comment]);
        setCommentInput('');
        toast.success('Comment posted.');
      }
    } catch (err) {
      toast.error('Failed to post comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      if (data.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        toast.info('Comment removed.');
      }
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  // AI Helpers
  const handleAIBreakDown = async () => {
    if (!title.trim()) {
      toast.warning('Please enter a task title before breaking it down with AI.');
      return;
    }

    try {
      setAiLoading(true);
      const { data } = await api.post('/ai/break-down-task', {
        title: title.trim(),
        description: description.trim(),
      });

      if (data.success && data.breakdown) {
        const newItems = data.breakdown.subtasks || [];
        setSubtasks((prev) => [...prev, ...newItems]);
        if (data.breakdown.suggestedPriority) {
          setPriority(data.breakdown.suggestedPriority);
        }
        toast.success(`AI suggested ${newItems.length} subtasks!`);
      }
    } catch (err) {
      toast.error('AI breakdown service unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIImprove = async () => {
    if (!title.trim()) {
      toast.warning('Please enter a task title.');
      return;
    }

    try {
      setAiLoading(true);
      const { data } = await api.post('/ai/improve-task', {
        title: title.trim(),
        description: description.trim(),
      });

      if (data.success && data.improved) {
        setTitle(data.improved.improvedTitle || title);
        setDescription(data.improved.improvedDescription || description);
        if (data.improved.suggestedTags?.length) {
          const merged = Array.from(new Set([...tags, ...data.improved.suggestedTags]));
          setTags(merged);
        }
        toast.success('Task enhanced with acceptance checklist!');
      }
    } catch (err) {
      toast.error('AI improve service unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save Task (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        projectId: projectId || null,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        tags,
        subtasks,
      };

      let result;
      if (taskId) {
        const { data } = await api.patch(`/tasks/${taskId}`, payload);
        result = data.task;
        toast.success('Task updated successfully.');
      } else {
        const { data } = await api.post('/tasks', payload);
        result = data.task;
        toast.success('Task created successfully.');
      }

      if (onTaskSaved) onTaskSaved(result);
      onClose();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Task
  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted.');
      if (onTaskDeleted) onTaskDeleted(taskId);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete task.');
    }
  };

  const membersList = currentWorkspace?.members || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md">
                {taskId ? 'Task Details' : 'Create Task'}
              </span>
              {taskId && isOverdue(dueDate, status === 'completed') && (
                <span className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {taskId && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & AI Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Task Title *
                </label>
                <button
                  type="button"
                  onClick={handleAIImprove}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-900 hover:text-black bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                  {aiLoading ? 'Enhancing...' : 'AI Enhance & Acceptance'}
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Implement secure token refresh rotation"
                className="w-full text-base font-semibold text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-zinc-800 focus:ring-2 focus:ring-zinc-800/10 focus:outline-hidden transition-all placeholder:text-slate-400 placeholder:font-normal"
                required
              />
            </div>

            {/* Grid for Attributes: Assignee, Status, Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
              {/* Assignee */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                >
                  <option value="">Unassigned</option>
                  {membersList.map((m) => (
                    <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                      {m.user?.name || 'Member'} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Date Range & Estimated Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Est. Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 8"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Description & Acceptance Criteria
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed background, context, technical notes, or Markdown checklists..."
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl p-3 focus:border-zinc-800 focus:ring-2 focus:ring-zinc-800/10 focus:outline-hidden transition-all font-mono placeholder:font-sans placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-slate-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter (e.g. Backend, Security, UI)..."
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
              />
            </div>

            {/* Subtasks / Checklist */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" /> Checklist & Subtasks ({completedSubtasksCount}/{subtasks.length})
                  </label>
                  {subtasks.length > 0 && (
                    <span className="text-[11px] font-medium text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                      {subtaskProgress}%
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAIBreakDown}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 text-xs text-zinc-900 hover:text-black bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                  {aiLoading ? 'Breaking down...' : 'AI Subtask Breakdown'}
                </button>
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className="bg-[#18181B] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              )}

              {/* Subtask list */}
              <div className="space-y-1.5 mb-3">
                {subtasks.map((st, idx) => (
                  <div
                    key={st._id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st._id, idx)}
                        className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-800 border-slate-300"
                      />
                      <span
                        className={`text-xs font-medium truncate ${
                          st.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st._id, idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(e)}
                  placeholder="Add a checklist item..."
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>

            {/* Comments (only in view/edit mode) */}
            {taskId && (
              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Team Comments ({comments.length})
                </label>

                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments yet. Start a discussion.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 group">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(
                            c.userId?.name
                          )}`}
                        >
                          {getInitials(c.userId?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-900">
                              {c.userId?.name || 'Teammate'}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {c.content}
                          </p>
                        </div>
                        {(c.userId?._id === user?._id || user?.role === 'owner') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(e)}
                    placeholder="Write a comment..."
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-zinc-800 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={!commentInput.trim()}
                    className="px-3 py-2 text-xs font-medium bg-[#18181B] text-white hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Send
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-medium text-white bg-[#18181B] hover:bg-zinc-800 shadow-sm rounded-xl transition-all hover:shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : taskId ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? All subtasks and comments will be permanently removed."
        confirmLabel="Delete Task"
      />
    </>
  );
};

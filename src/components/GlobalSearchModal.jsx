import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckSquare, Sparkles, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from './Badge';

export const GlobalSearchModal = ({ isOpen, onClose, onOpenNewTask }) => {
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setTasks([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setTasks([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const taskRes = await api.get(`/tasks?search=${encodeURIComponent(query.trim())}`);
        setTasks(taskRes.data?.tasks || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const quickActions = [
    {
      title: 'AI Task Assistant & Sprint Planner',
      icon: Sparkles,
      iconColor: 'text-zinc-900 bg-zinc-100 border border-zinc-200',
      action: () => {
        navigate('/ai-assistant');
        onClose();
      },
    },
    {
      title: 'Open Kanban Board',
      icon: CheckSquare,
      iconColor: 'text-zinc-800 bg-zinc-100 border border-zinc-200',
      action: () => {
        navigate('/kanban');
        onClose();
      },
    },
    {
      title: 'Create New Task',
      icon: CheckSquare,
      iconColor: 'text-zinc-900 bg-zinc-200 border border-zinc-300',
      action: () => {
        onClose();
        if (onOpenNewTask) onOpenNewTask();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 modal-overlay animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks or type a command... (Press ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
            ESC
          </span>
        </div>

        {/* Search Results / Quick Actions */}
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">Searching workspace...</div>
          )}

          {!loading && !query.trim() && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Quick Actions
              </p>
              <div className="space-y-1">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={qa.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${qa.iconColor}`}>
                        <qa.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {qa.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim() && (
            <>
              {/* Tasks */}
              {tasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Tasks ({tasks.length})
                  </p>
                  <div className="space-y-1">
                    {tasks.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => {
                          navigate('/kanban');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CheckSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                            <span className="text-xs text-slate-400 capitalize">
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <PriorityBadge priority={t.priority} size="xs" showIcon={false} />
                          <StatusBadge status={t.status} size="xs" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">No tasks found for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or create a new task.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';
import { EmptyState } from '../components/EmptyState';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (link) navigate(link);
    } catch (err) {
      toast.error('Failed to mark notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.info('Notification dismissed.');
    } catch (err) {
      toast.error('Failed to dismiss notification.');
    }
  };

  const displayed = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Notifications Center</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Stay on top of task assignments, deadline approaching warnings, and team comments.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-200 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#18181B]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            !filterUnread
              ? 'bg-[#18181B] text-white'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filterUnread
              ? 'bg-[#18181B] text-white'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">Loading notifications...</div>
        ) : displayed.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-zinc-300 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-800">No notifications found</h4>
            <p className="text-xs text-zinc-400">You are all caught up on all activity!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {displayed.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id, n.link)}
                className={`p-4 flex items-start gap-3.5 hover:bg-zinc-50 transition-colors cursor-pointer group ${
                  !n.isRead ? 'bg-zinc-50/70' : ''
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                    !n.isRead ? 'bg-[#18181B] ring-4 ring-zinc-200' : 'bg-transparent'
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-xs font-bold ${!n.isRead ? 'text-zinc-900' : 'text-zinc-700'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{n.message}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {n.link && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n._id, n.link);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Dismiss"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

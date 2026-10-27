import React from 'react';
import { STATUS_META, PRIORITY_META } from '../utils/helpers';
import { AlertCircle, ArrowDown, ArrowUp, AlertTriangle, CheckCircle2, Clock, Eye } from 'lucide-react';

export const StatusBadge = ({ status = 'todo', size = 'sm' }) => {
  const meta = STATUS_META[status] || STATUS_META.todo;

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const getIcon = () => {
    switch (status) {
      case 'todo':
        return <Clock className="w-3 h-3 text-slate-500 mr-1" />;
      case 'in_progress':
        return <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1.5" />;
      case 'in_review':
        return <Eye className="w-3 h-3 text-purple-500 mr-1" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-[#18181B] mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-colors ${meta.color} ${sizeClasses}`}
    >
      {getIcon()}
      {meta.label}
    </span>
  );
};

export const PriorityBadge = ({ priority = 'medium', showIcon = true, size = 'sm' }) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;

  const getIcon = () => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-rose-600 mr-1" />;
      case 'high':
        return <ArrowUp className="w-3 h-3 text-amber-600 mr-1" />;
      case 'medium':
        return <ArrowUp className="w-3 h-3 text-sky-600 mr-1 opacity-75" />;
      case 'low':
        return <ArrowDown className="w-3 h-3 text-slate-400 mr-1" />;
      default:
        return null;
    }
  };

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${meta.color} ${sizeClasses}`}
    >
      {showIcon && getIcon()}
      {meta.label}
    </span>
  );
};

export const TagBadge = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">
      #{label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-400 hover:text-slate-600 ml-0.5 focus:outline-hidden"
        >
          ×
        </button>
      )}
    </span>
  );
};

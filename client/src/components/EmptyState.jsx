import React from 'react';
import { FolderPlus, Plus, Sparkles } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderPlus,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 my-4">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mb-4 shadow-subtle ring-8 ring-zinc-100/50">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] text-white text-sm font-medium hover:bg-zinc-800 shadow-sm transition-all duration-150 hover:shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 border border-slate-200 transition-all duration-150"
          >
            <Sparkles className="w-4 h-4 text-zinc-700" />
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

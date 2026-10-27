import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="w-16 h-6 rounded-full bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-slate-200 rounded-md w-3/4" />
        <div className="h-4 bg-slate-100 rounded-md w-full" />
        <div className="h-4 bg-slate-100 rounded-md w-2/3" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-20 h-4 bg-slate-200 rounded-md" />
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </div>
    </div>
  );
};

export const KanbanColumnSkeleton = () => {
  return (
    <div className="w-80 shrink-0 bg-slate-100/70 rounded-2xl p-4 space-y-3 border border-slate-200/60 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-slate-300 rounded-md w-24" />
        <div className="w-6 h-6 rounded-full bg-slate-300" />
      </div>
      <div className="h-28 bg-white rounded-xl shadow-2xs border border-slate-200/60 p-3 space-y-2" />
      <div className="h-32 bg-white rounded-xl shadow-2xs border border-slate-200/60 p-3 space-y-2" />
      <div className="h-24 bg-white rounded-xl shadow-2xs border border-slate-200/60 p-3 space-y-2" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-5 h-5 rounded bg-slate-200" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-20 ml-auto" />
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="w-8 h-8 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
};

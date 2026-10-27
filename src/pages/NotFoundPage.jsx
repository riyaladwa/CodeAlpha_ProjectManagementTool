import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-zinc-200/80 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-[#18181B] flex items-center justify-center mx-auto shadow-subtle ring-8 ring-zinc-100/50">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">404</h2>
          <h3 className="text-base font-bold text-zinc-800">Page Not Found</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The page you are looking for might have been moved, archived, or does not exist.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

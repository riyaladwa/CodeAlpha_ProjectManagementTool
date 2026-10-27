import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#18181B] flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M7 12L10.5 15.5L17 8.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="17.5" cy="6.5" r="2" fill="#71717A" />
            </svg>
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">TaskFlow AI</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <Outlet />
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        TaskFlow AI — Smart Project Management & Team Collaboration &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicLayout = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-zinc-200 selection:text-zinc-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-slate-200/80 px-6 lg:px-12 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#18181B] flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M7 12L10.5 15.5L17 8.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="17.5" cy="6.5" r="2" fill="#71717A" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-900 tracking-tight">TaskFlow</span>
            <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
              AI
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-black transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-black transition-colors">
            How It Works
          </a>
          <a href="#ai-capabilities" className="hover:text-black transition-colors">
            AI Assistant
          </a>
          <a href="#analytics" className="hover:text-black transition-colors">
            Analytics
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-zinc-800 shadow-sm transition-all hover:shadow-md"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-zinc-800 shadow-sm transition-all hover:shadow-md active:scale-98"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 lg:px-12 text-slate-600">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#18181B] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M7 12L10.5 15.5L17 8.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="17.5" cy="6.5" r="2" fill="#71717A" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">TaskFlow AI</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Plan smarter. Collaborate better. Deliver on time. An intelligent full-stack project management platform built for modern product engineering and agile sprints.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#features" className="hover:text-slate-900">Kanban Board</a></li>
              <li><a href="#ai-capabilities" className="hover:text-slate-900">AI Task Assistant</a></li>
              <li><a href="#analytics" className="hover:text-slate-900">Burnup Analytics</a></li>
              <li><a href="#features" className="hover:text-slate-900">PDF Report Exporter</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/login" className="hover:text-slate-900">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-slate-900">Create Account</Link></li>
              <li><Link to="/login?demo=true" className="hover:text-slate-900">Explore Demo Mode</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>&copy; {new Date().getFullYear()} TaskFlow AI. CodeAlpha Full-Stack Engineering Portfolio.</p>
          <p>Built with React, Express, MongoDB Atlas & Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};

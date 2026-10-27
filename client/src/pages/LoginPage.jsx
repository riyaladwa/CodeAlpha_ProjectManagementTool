import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, exploreDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    const res = await exploreDemo();
    setDemoLoading(false);

    if (res?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-xs text-slate-500">Sign in to your TaskFlow AI workspace</p>
      </div>

      {/* 1-Click Demo Mode Button */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={demoLoading || loading}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200/70 text-zinc-900 border border-zinc-200 text-xs font-semibold shadow-2xs transition-all duration-150 active:scale-98"
      >
        <Sparkles className="w-4 h-4 text-zinc-700" />
        {demoLoading ? 'Initializing Demo Workspace...' : '1-Click Explore Demo Mode'}
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider relative">
          or sign in with credentials
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:ring-2 focus:ring-zinc-800/10 focus:outline-hidden transition-all"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:ring-2 focus:ring-zinc-800/10 focus:outline-hidden transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all duration-150 active:scale-98 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-2">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-zinc-900 hover:text-black">
          Create account
        </Link>
      </p>
    </div>
  );
};

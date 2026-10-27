import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckSquare,
  BarChart3,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Clock,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { exploreDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    const res = await exploreDemo();
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI Sprint & Task Planning',
      description:
        'Transform high-level goals into structured milestones, actionable task cards, and acceptance checklists in seconds with Google Gemini.',
      accent: 'text-zinc-900 bg-zinc-100 border-zinc-200',
    },
    {
      icon: CheckSquare,
      title: 'Fluid Interactive Kanban Board',
      description:
        'Manage sprints seamlessly with intuitive drag-and-drop column transitions, optimistic state updates, subtask checklists, and tags.',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: BarChart3,
      title: 'Executive Analytics & Burnup',
      description:
        'Visualize task distribution, completion trends over time, project velocity comparison, and team workload balance with live Recharts.',
      accent: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      icon: Users,
      title: 'Team Collaboration & RBAC',
      description:
        'Organize multi-tenant workspaces with role-based access control (Owner, Admin, Member), task assignment notifications, and comment feeds.',
      accent: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      icon: Calendar,
      title: 'Interactive Calendar & Deadlines',
      description:
        'Track deliverables across monthly and weekly schedules with automated overdue alerts and instant click-to-create date pins.',
      accent: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      icon: FileText,
      title: 'Executive PDF Reports',
      description:
        'Generate high-resolution printable PDF project summaries complete with milestone metrics, workload distributions, and task audits.',
      accent: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Top Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-4 h-4 text-zinc-700" />
          <span>Next-Generation AI Project Management</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Your deliverables, <br />
          <span className="text-[#18181B]">
            finally in flow.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Plan projects faster with AI assistance, execute with fluid Kanban boards, balance team workloads, and hit every deadline with confidence.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-semibold text-sm shadow-sm transition-all active:scale-98"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDemoClick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm transition-all hover:border-slate-300"
          >
            <Sparkles className="w-4 h-4 text-zinc-700" /> Explore Live Demo
          </button>
        </div>

        {/* Interactive App Preview Mockup */}
        <div className="pt-8">
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-2xl shadow-slate-300/40">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-zinc-400" />
                <span className="text-xs font-mono text-slate-400 ml-2">TaskFlow AI — Workspace Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#18181B]" /> Live Real-time Board
              </div>
            </div>

            {/* Mockup Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              {/* Column 1: Todo */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1 border-b border-slate-200">
                  <span>To Do</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">2</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-2xs border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">High</span>
                    <span className="text-[10px] text-slate-400">Due Oct 15</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Token Refresh & RBAC Boundary Tests</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="text-zinc-800 font-medium">✓ 2/2 Subtasks</span>
                  </div>
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1 border-b border-slate-200">
                  <span>In Progress</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">1</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-2xs border border-zinc-300 ring-2 ring-zinc-800/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Urgent</span>
                    <span className="text-[10px] text-zinc-800 font-medium">In Sprint</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Kanban Board Drag & Drop Physics</p>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#18181B] h-1 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Column 3: In Review */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1 border-b border-slate-200">
                  <span>In Review</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">1</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-2xs border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">Medium</span>
                  <p className="text-xs font-semibold text-slate-800">Executive Burnup Chart Widgets</p>
                  <p className="text-[10px] text-slate-400">Assigned to Sarah Chen</p>
                </div>
              </div>

              {/* Column 4: Completed */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1 border-b border-slate-200">
                  <span>Completed</span>
                  <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">3</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-2xs border border-slate-200/80 opacity-80 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">✓ Done</span>
                  <p className="text-xs font-semibold text-slate-800 line-through text-slate-500">Google Gemini Plan Pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Built for Modern Product Teams
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to deliver high-impact software.
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminate project chaos with a unified workspace built for speed, transparency, and AI-driven precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 space-y-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-2xs ${f.accent}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">{f.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-white space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Simple 3-Step Workflow
            </span>
            <h3 className="text-3xl font-bold tracking-tight">
              From high-level idea to shipped feature in record time.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="inline-block text-2xl font-black text-zinc-300">01</span>
              <h4 className="text-base font-bold text-white">Create Workspace & Set Goals</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Initialize multi-tenant team workspaces, invite engineering peers, and define sprint target deadlines.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="inline-block text-2xl font-black text-zinc-300">02</span>
              <h4 className="text-base font-bold text-white">Let AI Generate Milestones</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your project scope and let Gemini create structured tasks, acceptance criteria, and duration estimates.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="inline-block text-2xl font-black text-zinc-300">03</span>
              <h4 className="text-base font-bold text-white">Execute with Real-time Flow</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Move tasks across drag-and-drop Kanban columns, audit team workload, and export executive PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ready to experience frictionless project delivery?
        </h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Join modern engineering teams organizing their sprints with TaskFlow AI. Free forever for individual portfolios and agile teams.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-semibold text-sm shadow-sm transition-all"
          >
            Create Your Account
          </Link>
          <button
            onClick={handleDemoClick}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 transition-all"
          >
            Launch Instant Demo
          </button>
        </div>
      </section>
    </div>
  );
};

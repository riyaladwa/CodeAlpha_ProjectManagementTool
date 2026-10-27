import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  CheckSquare,
  TrendingUp,
  FileCode,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PriorityBadge } from '../components/Badge';
import { triggerConfetti } from '../utils/helpers';

export const AIAssistantPage = () => {
  const { currentWorkspace, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTool, setActiveTool] = useState('plan_generator'); // 'plan_generator' | 'task_breakdown' | 'prioritizer' | 'enhancer'

  // Tool 1: Project Plan Generator
  const [planProjectName, setPlanProjectName] = useState('');
  const [planGoal, setPlanGoal] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDeadline, setPlanDeadline] = useState('Within 4 weeks');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [importingPlan, setImportingPlan] = useState(false);

  // Tool 2: Task Breakdown
  const [breakdownTitle, setBreakdownTitle] = useState('');
  const [breakdownDescription, setBreakdownDescription] = useState('');
  const [breakdownResult, setBreakdownResult] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  // Tool 3: Smart Prioritizer
  const [prioResult, setPrioResult] = useState(null);
  const [prioLoading, setPrioLoading] = useState(false);

  // Tool 4: Description Enhancer
  const [enhanceTitle, setEnhanceTitle] = useState('');
  const [enhanceDesc, setEnhanceDesc] = useState('');
  const [enhanceResult, setEnhanceResult] = useState(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  // Tool 1 Handler: Generate Plan
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!planProjectName.trim()) {
      toast.warning('Please enter an initiative name.');
      return;
    }

    try {
      setPlanLoading(true);
      const { data } = await api.post('/ai/generate-project-plan', {
        projectName: planProjectName.trim(),
        goal: planGoal.trim(),
        description: planDescription.trim(),
        targetDeadline: planDeadline,
      });

      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
        toast.success('AI Sprint Plan generated! Review tasks below before saving.');
      }
    } catch (err) {
      toast.error('AI plan generation error.');
    } finally {
      setPlanLoading(false);
    }
  };

  // Tool 1 Handler: Batch Import Plan into Current Workspace
  const handleImportPlan = async () => {
    if (!generatedPlan || !generatedPlan.milestones) return;

    // Flatten tasks from all milestones
    const allTasks = [];
    generatedPlan.milestones.forEach((m) => {
      (m.tasks || []).forEach((t) => {
        allTasks.push({
          title: t.title,
          description: `${t.description || ''}\n\n**Milestone Phase**: ${m.name}`,
          priority: t.priority || 'medium',
          estimatedHours: t.estimatedHours,
          suggestedDueDayOffset: t.suggestedDueDayOffset,
          tags: t.tags || ['AI Plan'],
        });
      });
    });

    if (allTasks.length === 0) {
      toast.warning('No tasks found in generated plan.');
      return;
    }

    try {
      setImportingPlan(true);
      const { data } = await api.post('/ai/batch-create-plan', {
        tasks: allTasks,
      });

      if (data.success) {
        triggerConfetti();
        toast.success(`Created ${allTasks.length} tasks in workspace! Redirecting to Kanban...`);
        setTimeout(() => {
          navigate('/kanban');
        }, 1200);
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to import plan tasks.');
    } finally {
      setImportingPlan(false);
    }
  };

  // Tool 2 Handler: Breakdown Task
  const handleBreakdownTask = async (e) => {
    e.preventDefault();
    if (!breakdownTitle.trim()) return;

    try {
      setBreakdownLoading(true);
      const { data } = await api.post('/ai/break-down-task', {
        title: breakdownTitle.trim(),
        description: breakdownDescription.trim(),
      });
      if (data.success) {
        setBreakdownResult(data.breakdown);
        toast.success('Task breakdown generated!');
      }
    } catch (err) {
      toast.error('AI Breakdown failed.');
    } finally {
      setBreakdownLoading(false);
    }
  };

  // Tool 3 Handler: Prioritize Workspace Tasks
  const handlePrioritizeTasks = async () => {
    try {
      setPrioLoading(true);
      const { data } = await api.post('/ai/prioritize-tasks', {});
      if (data.success) {
        setPrioResult(data.prioritization);
        toast.success('Smart priority recommendation generated!');
      }
    } catch (err) {
      toast.error('AI Prioritization failed.');
    } finally {
      setPrioLoading(false);
    }
  };

  // Tool 4 Handler: Enhance Description
  const handleEnhanceTask = async (e) => {
    e.preventDefault();
    if (!enhanceTitle.trim()) return;

    try {
      setEnhanceLoading(true);
      const { data } = await api.post('/ai/improve-task', {
        title: enhanceTitle.trim(),
        description: enhanceDesc.trim(),
      });
      if (data.success) {
        setEnhanceResult(data.improved);
        toast.success('Task description enhanced with Definition of Done!');
      }
    } catch (err) {
      toast.error('AI enhancement failed.');
    } finally {
      setEnhanceLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#18181B] rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-zinc-300" /> Signature AI Feature
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          AI Task Assistant & Intelligent Sprint Copilot
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Powered by Google Gemini. Transform abstract product concepts into structured milestone breakdowns, generate actionable acceptance criteria, and prioritize workspace backlogs.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTool('plan_generator')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTool === 'plan_generator'
              ? 'bg-[#18181B] text-white border-[#18181B] shadow-md ring-2 ring-zinc-800/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-5 h-5" />
          <div>
            <h3 className="text-xs font-bold">1. Sprint Plan Generator</h3>
            <p className={`text-[10px] mt-0.5 ${activeTool === 'plan_generator' ? 'text-zinc-300' : 'text-slate-400'}`}>
              Full milestone & task schema
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('task_breakdown')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTool === 'task_breakdown'
              ? 'bg-[#18181B] text-white border-[#18181B] shadow-md ring-2 ring-zinc-800/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <div>
            <h3 className="text-xs font-bold">2. Task Breakdown</h3>
            <p className={`text-[10px] mt-0.5 ${activeTool === 'task_breakdown' ? 'text-zinc-300' : 'text-slate-400'}`}>
              Convert big tasks into subtasks
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('prioritizer')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTool === 'prioritizer'
              ? 'bg-[#18181B] text-white border-[#18181B] shadow-md ring-2 ring-zinc-800/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <div>
            <h3 className="text-xs font-bold">3. Smart Prioritizer</h3>
            <p className={`text-[10px] mt-0.5 ${activeTool === 'prioritizer' ? 'text-zinc-300' : 'text-slate-400'}`}>
              Recommend focus sequence
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('enhancer')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTool === 'enhancer'
              ? 'bg-[#18181B] text-white border-[#18181B] shadow-md ring-2 ring-zinc-800/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <FileCode className="w-5 h-5" />
          <div>
            <h3 className="text-xs font-bold">4. Acceptance Enhancer</h3>
            <p className={`text-[10px] mt-0.5 ${activeTool === 'enhancer' ? 'text-zinc-300' : 'text-slate-400'}`}>
              Generate Definition of Done
            </p>
          </div>
        </button>
      </div>

      {/* Tool 1: Full Project Sprint Plan Generator */}
      {activeTool === 'plan_generator' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Generate Complete Project Execution Plan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your initiative details and let Gemini outline structured phases, estimated hours, and task cards.
              </p>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Initiative Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI-Powered Customer Support Portal"
                    value={planProjectName}
                    onChange={(e) => setPlanProjectName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Target Timeline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 weeks (or specify target date)"
                    value={planDeadline}
                    onChange={(e) => setPlanDeadline(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Strategic Objective / Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reduce response latency by 60% with automated ticket deflection."
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Detailed Scope & Tech Stack Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Include architectural requirements, preferred integrations, API contracts, target user personas..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={planLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-md transition-all active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {planLoading ? 'Generating Structured Plan...' : 'Generate Sprint Plan with Gemini'}
              </button>
            </form>
          </div>

          {/* Generated Plan Review Container */}
          {generatedPlan && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
                      Plan Generated ({generatedPlan.estimatedDurationDays || 30} Days)
                    </span>
                    {generatedPlan.isSimulated && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Smart Heuristic Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                    {generatedPlan.summary}
                  </p>
                </div>

                {/* Import Action */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleImportPlan}
                    disabled={importingPlan}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {importingPlan ? 'Importing Tasks...' : 'Approve & Import Tasks'}
                  </button>
                </div>
              </div>

              {/* Milestones Breakdown List */}
              <div className="space-y-6">
                {generatedPlan.milestones?.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </div>

                    <div className="space-y-2">
                      {m.tasks?.map((t, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <PriorityBadge priority={t.priority || 'medium'} size="xs" showIcon={false} />
                              <span className="font-bold text-slate-900">{t.title}</span>
                              {t.estimatedHours && (
                                <span className="text-[10px] text-slate-400">~{t.estimatedHours}h</span>
                              )}
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11px]">{t.description}</p>
                            <div className="flex items-center gap-1 pt-1">
                              {(t.tags || []).map((tag, tagI) => (
                                <span key={tagI} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              // Remove task from plan
                              const updatedMilestones = [...generatedPlan.milestones];
                              updatedMilestones[mIdx].tasks = updatedMilestones[mIdx].tasks.filter(
                                (_, idx) => idx !== tIdx
                              );
                              setGeneratedPlan({ ...generatedPlan, milestones: updatedMilestones });
                              toast.info('Task removed from plan.');
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded self-end sm:self-center"
                            title="Remove from plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 2: Task Breakdown */}
      {activeTool === 'task_breakdown' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Task Breakdown Tool</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Split a large, complex, or ambiguous feature into 4-6 specific actionable checklist items.
            </p>
          </div>

          <form onSubmit={handleBreakdownTask} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Implement OAuth2 Google Login with Session Refresh"
                value={breakdownTitle}
                onChange={(e) => setBreakdownTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Technical context or constraints..."
                value={breakdownDescription}
                onChange={(e) => setBreakdownDescription(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={breakdownLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {breakdownLoading ? 'Analyzing Subtasks...' : 'Break Down Task'}
            </button>
          </form>

          {breakdownResult && (
            <div className="border-t border-slate-100 pt-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Suggested Actionable Subtasks ({breakdownResult.subtasks?.length || 0})
                </h4>
                {breakdownResult.suggestedPriority && (
                  <PriorityBadge priority={breakdownResult.suggestedPriority} size="xs" />
                )}
              </div>

              <div className="space-y-2">
                {breakdownResult.subtasks?.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-800"
                  >
                    <CheckSquare className="w-4 h-4 text-zinc-900 shrink-0" />
                    <span>{st.title}</span>
                  </div>
                ))}
              </div>

              {breakdownResult.recommendations && (
                <p className="text-xs text-slate-600 italic bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  💡 <strong>Lead Note:</strong> {breakdownResult.recommendations}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tool 3: Smart Prioritization */}
      {activeTool === 'prioritizer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Smart Workspace Task Prioritizer</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyze pending tasks in your workspace and calculate which items the team should execute first today based on urgency and dependencies.
            </p>
          </div>

          <div>
            <button
              onClick={handlePrioritizeTasks}
              disabled={prioLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {prioLoading ? 'Calculating Priorities...' : 'Run Prioritization Analysis'}
            </button>
          </div>

          {prioResult && (
            <div className="border-t border-slate-100 pt-6 space-y-4 animate-fadeIn">
              <p className="text-xs text-zinc-900 font-semibold bg-zinc-100 p-3 rounded-xl border border-zinc-200">
                ✨ {prioResult.insight}
              </p>

              <div className="space-y-3">
                {prioResult.priorityList?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3.5 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#18181B] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      #{item.suggestedRank || idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 4: Description & Acceptance Enhancer */}
      {activeTool === 'enhancer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Task Description & Acceptance Checklist Enhancer</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn quick task titles into comprehensive technical descriptions with clear Acceptance Criteria & Definition of Done.
            </p>
          </div>

          <form onSubmit={handleEnhanceTask} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Add PDF export to reports page"
                value={enhanceTitle}
                onChange={(e) => setEnhanceTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Rough Notes / Bullet Points
              </label>
              <textarea
                rows={2}
                placeholder="Needs to include deliverable counts and download as clean document..."
                value={enhanceDesc}
                onChange={(e) => setEnhanceDesc(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-zinc-800 focus:outline-hidden leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={enhanceLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {enhanceLoading ? 'Polishing Specifications...' : 'Enhance Task Specs'}
            </button>
          </form>

          {enhanceResult && (
            <div className="border-t border-slate-100 pt-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">{enhanceResult.improvedTitle}</h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(enhanceResult.improvedDescription);
                    toast.success('Enhanced description copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Markdown
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {enhanceResult.improvedDescription}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

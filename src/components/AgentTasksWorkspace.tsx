import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { TaskPlan, TaskStep } from '../types';
import {
  CheckSquare,
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Layers
} from 'lucide-react';

export const AgentTasksWorkspace: React.FC = () => {
  const [objective, setObjective] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executingStepId, setExecutingStepId] = useState<string | null>(null);
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleObjectives = [
    'Create a portfolio website, write the executive bio content, synthesize brand identity logo, and prepare Vercel deployment spec.',
    'Research top 5 competitors in autonomous AI assistants, analyze pricing models, and draft our product strategy memo.',
    'Build a full-stack restaurant reservation system with table capacity logic and PostgreSQL schema.',
  ];

  const handleCreatePlan = async (customObjective?: string) => {
    const finalObj = customObjective || objective;
    if (!finalObj.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.planTasks(finalObj.trim());
      setPlan(data.plan);
    } catch (err: any) {
      setError(err.message || 'Failed to decompose task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveStep = (stepId: string) => {
    if (!plan) return;
    setPlan({
      ...plan,
      steps: plan.steps.map((s) => (s.id === stepId ? { ...s, requiresApproval: false } : s)),
    });
  };

  const handleExecuteStep = async (step: TaskStep) => {
    if (!plan || executingStepId) return;

    // Set status to in_progress
    setExecutingStepId(step.id);
    setPlan({
      ...plan,
      steps: plan.steps.map((s) => (s.id === step.id ? { ...s, status: 'in_progress' } : s)),
    });

    try {
      const previousOutputs = plan.steps
        .filter((s) => s.status === 'completed' && s.output)
        .map((s) => ({ title: s.title, output: s.output }));

      const data = await StarApi.executeTaskStep(plan.objective, step, previousOutputs);

      setPlan({
        ...plan,
        steps: plan.steps.map((s) =>
          s.id === step.id ? { ...s, status: 'completed', output: data.output } : s
        ),
      });
    } catch (err: any) {
      setPlan({
        ...plan,
        steps: plan.steps.map((s) => (s.id === step.id ? { ...s, status: 'failed' } : s)),
      });
    } finally {
      setExecutingStepId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF]">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>STAR AUTONOMOUS TASK AGENT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Multi-Step Planning & Human-in-the-Loop Execution
          </h2>
          <p className="text-xs text-[#98A3B8] max-w-xl mx-auto">
            Break down complex projects into sequential tool executions, safety validations, and human approval gates.
          </p>
        </div>

        {/* Input Formulation */}
        <div className="p-5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-4 shadow-xl">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Target Objective:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Create a portfolio website, write the content, generate a logo, test pages, and prepare deployment instructions..."
              className="flex-1 bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-3 text-sm text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
            />
            <button
              onClick={() => handleCreatePlan()}
              disabled={!objective.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presets */}
        {!plan && !isLoading && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#98A3B8] uppercase tracking-wider">
              Example Complex Missions:
            </span>
            <div className="space-y-2">
              {sampleObjectives.map((obj, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setObjective(obj);
                    handleCreatePlan(obj);
                  }}
                  className="p-3.5 rounded-xl bg-[#111B35]/60 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] cursor-pointer text-xs text-[#98A3B8] hover:text-[#35D7FF] transition-all flex items-center justify-between group"
                >
                  <span className="leading-relaxed">{obj}</span>
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 shrink-0 ml-3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Output Dashboard */}
        {plan && !isLoading && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/25 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.planName}</h3>
                  <div className="text-xs text-[#35D7FF] flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated Execution Time: {plan.estimatedTime}</span>
                  </div>
                </div>
                <div className="text-xs text-[#98A3B8]">
                  {plan.steps.filter((s) => s.status === 'completed').length} / {plan.steps.length} steps completed
                </div>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-4">
              {plan.steps.map((step, idx) => {
                const isExecuting = executingStepId === step.id;
                const isCompleted = step.status === 'completed';

                return (
                  <div
                    key={step.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isCompleted
                        ? 'bg-[#111B35]/70 border-emerald-500/30'
                        : isExecuting
                        ? 'bg-[#111B35] border-[#35D7FF] shadow-lg shadow-[#35D7FF]/20'
                        : 'bg-[#111B35]/80 border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? 'bg-emerald-400 text-[#080D1B]'
                              : isExecuting
                              ? 'bg-[#35D7FF] text-[#080D1B] animate-pulse'
                              : 'bg-[#080D1B] text-[#98A3B8] border border-white/10'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{step.title}</h4>
                          <span className="text-[11px] text-[#35D7FF] font-mono">
                            Tool: {step.tool}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {step.requiresApproval ? (
                          <button
                            onClick={() => handleApproveStep(step.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Approve Action</span>
                          </button>
                        ) : !isCompleted ? (
                          <button
                            onClick={() => handleExecuteStep(step)}
                            disabled={Boolean(executingStepId)}
                            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#35D7FF] text-[#080D1B] text-xs font-bold hover:brightness-110 disabled:opacity-40"
                          >
                            {isExecuting ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Executing...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Execute Step</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Complete</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#98A3B8] leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step Output if delivered */}
                    {step.output && (
                      <div className="p-3.5 rounded-xl bg-[#080D1B] border border-white/5 text-xs text-[#F5F7FF] whitespace-pre-wrap">
                        <span className="font-bold text-emerald-400 block mb-1">Deliverable:</span>
                        {step.output}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

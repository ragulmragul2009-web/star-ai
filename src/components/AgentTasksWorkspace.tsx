import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { TaskPlan, TaskStep } from '../types';
import {
  CheckSquare,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight
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
    } catch {
      setPlan({
        ...plan,
        steps: plan.steps.map((s) => (s.id === step.id ? { ...s, status: 'failed' } : s)),
      });
    } finally {
      setExecutingStepId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>STAR AUTONOMOUS TASK AGENT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Multi-Step Planning & Human-in-the-Loop Execution
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Break down complex projects into sequential tool executions, safety validations, and human approval gates.
          </p>
        </div>

        {/* Input Formulation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Target Objective:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Create a portfolio website, write the content, generate a logo, test pages, and prepare deployment instructions..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleCreatePlan()}
              disabled={!objective.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
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

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Presets */}
        {!plan && !isLoading && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs cursor-pointer text-xs text-slate-600 hover:text-blue-600 transition-all flex items-center justify-between group shadow-xs"
                >
                  <span className="leading-relaxed">{obj}</span>
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 shrink-0 ml-3 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Output Dashboard */}
        {plan && !isLoading && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.planName}</h3>
                  <div className="text-xs text-blue-600 flex items-center gap-1.5 mt-0.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated Execution Time: {plan.estimatedTime}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-medium">
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
                    className={`p-5 rounded-2xl border transition-all space-y-3 shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isExecuting
                        ? 'bg-blue-50/30 border-blue-400 ring-2 ring-blue-300/40'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isExecuting
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                          <span className="text-[11px] text-blue-600 font-mono font-medium">
                            Tool: {step.tool}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {step.requiresApproval ? (
                          <button
                            onClick={() => handleApproveStep(step.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 text-xs font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Approve Action</span>
                          </button>
                        ) : !isCompleted ? (
                          <button
                            onClick={() => handleExecuteStep(step)}
                            disabled={Boolean(executingStepId)}
                            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 shadow-xs cursor-pointer"
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
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified Complete</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step Output if delivered */}
                    {step.output && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap">
                        <span className="font-bold text-emerald-700 block mb-1">Deliverable:</span>
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

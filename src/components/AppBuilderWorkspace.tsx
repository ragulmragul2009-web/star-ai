import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { AppBuilderResult } from '../types';
import {
  Layers,
  Sparkles,
  Database,
  Eye,
  FileCode,
  Copy,
  Check,
  RotateCw,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Calendar
} from 'lucide-react';

export const AppBuilderWorkspace: React.FC = () => {
  const [appIdea, setAppIdea] = useState('');
  const [template, setTemplate] = useState('custom');
  const [targetPlatform, setTargetPlatform] = useState('Web & Mobile PWA');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AppBuilderResult | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'spec'>('preview');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateOptions = [
    {
      id: 'store',
      title: 'E-Commerce & Juice Bar Delivery',
      icon: ShoppingBag,
      prompt: 'A fruit juice shop website with customer ordering, cold-pressed menu, shopping cart, contact form, and administrator dashboard.',
    },
    {
      id: 'edu',
      title: 'Education & Learning Hub',
      icon: GraduationCap,
      prompt: 'An interactive online learning academy with video courses, quiz checkpoints, student progress streaks, and certificate downloads.',
    },
    {
      id: 'booking',
      title: 'Booking & Clinic Scheduling',
      icon: Calendar,
      prompt: 'A medical clinic scheduling application with doctor calendar, patient registration, email notifications, and instant appointment booking.',
    },
    {
      id: 'saas',
      title: 'Business SaaS Portal',
      icon: Briefcase,
      prompt: 'A team CRM and sales pipeline dashboard with leads Kanban board, client notes, deal revenue forecasting, and exportable CSV reports.',
    },
  ];

  const handleBuild = async (customPrompt?: string, customTemplate?: string) => {
    const finalIdea = customPrompt || appIdea;
    const finalTemplate = customTemplate || template;

    if (!finalIdea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.buildApp(finalIdea.trim(), finalTemplate, targetPlatform);
      setResult(data.app);
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate app blueprint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Creation Bar */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-600">
              <Layers className="w-3.5 h-3.5" />
              <span>STAR APP CREATOR</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
              Natural Language to Full-Stack Web Application
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Target Platform:</span>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="Web & Mobile PWA">Web & Mobile PWA</option>
              <option value="Desktop App (Electron)">Desktop (Electron)</option>
              <option value="Responsive SaaS">Responsive SaaS</option>
            </select>
          </div>
        </div>

        {/* Input Formulation */}
        <div className="flex gap-2">
          <input
            type="text"
            value={appIdea}
            onChange={(e) => setAppIdea(e.target.value)}
            placeholder="e.g. Create a fruit juice shop website with a home page, menu, contact form, and administrator dashboard..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleBuild()}
            disabled={!appIdea.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Architecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Build App</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Templates when empty */}
        {!result && !isLoading && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-4xl mx-auto text-center space-y-6">
            <Layers className="w-12 h-12 text-blue-600 animate-pulse" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">Describe any application in plain English</h3>
              <p className="text-xs text-slate-500 max-w-lg mt-1 mx-auto">
                STAR AI analyzes requirements, writes PostgreSQL database schemas, builds the UI component hierarchy, and runs an interactive live prototype immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              {templateOptions.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setAppIdea(t.prompt);
                      setTemplate(t.id);
                      handleBuild(t.prompt, t.id);
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                      <Icon className="w-4 h-4" />
                      <span>{t.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-3">
                      {t.prompt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900">STAR App Creator is generating full application...</div>
              <div className="text-xs text-slate-500 mt-1">Generating specifications, relational tables, and live working mockup</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 m-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Generated App Result */}
        {result && !isLoading && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Subtabs Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">{result.appName}</span>
                  <span className="text-[11px] text-blue-600 ml-2 hidden sm:inline font-medium">
                    {result.tagline}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Interactive Prototype</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('schema')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeTab === 'schema'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Database Schema (Postgres)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('spec')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeTab === 'spec'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Specifications</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TAB: Live Interactive Prototype Sandbox */}
            {activeTab === 'preview' && (
              <div className="flex-1 bg-white relative">
                <iframe
                  title="STAR App Interactive Prototype"
                  srcDoc={result.sandboxedPreview}
                  sandbox="allow-scripts allow-modals allow-forms"
                  className="w-full h-full border-none"
                />
              </div>
            )}

            {/* TAB: Database Schema */}
            {activeTab === 'schema' && (
              <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs text-slate-300">
                  <span className="font-mono text-white">schema.sql (PostgreSQL DDL)</span>
                  <button
                    onClick={() => handleCopy(result.databaseSchema)}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-cyan-300 leading-relaxed">
                  <code>{result.databaseSchema}</code>
                </pre>
              </div>
            )}

            {/* TAB: Specifications */}
            {activeTab === 'spec' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Technical Specifications & User Stories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.specifications.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1"
                    >
                      <div className="text-xs font-bold text-blue-600">{s.category}</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{s.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { AppBuilderResult } from '../types';
import {
  Layers,
  Sparkles,
  Database,
  Eye,
  FileCode,
  Download,
  Copy,
  Check,
  RotateCw,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const AppBuilderWorkspace: React.FC = () => {
  const [appIdea, setAppIdea] = useState('');
  const [template, setTemplate] = useState('custom');
  const [targetPlatform, setTargetPlatform] = useState('Web & Mobile PWA');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AppBuilderResult | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'spec' | 'export'>('preview');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateOptions = [
    {
      id: 'store',
      title: 'E-Commerce & Ordering',
      icon: ShoppingBag,
      prompt: 'A fruit juice ordering app with customer login, product categories, shopping cart, online payment, order history, and an admin dashboard.',
    },
    {
      id: 'edu',
      title: 'Education & Learning Hub',
      icon: GraduationCap,
      prompt: 'An interactive online course platform with video lessons, quiz checkpoints, student progress streaks, and certificate downloads.',
    },
    {
      id: 'booking',
      title: 'Booking & Appointment App',
      icon: Calendar,
      prompt: 'A medical clinic scheduling application with doctor availability calendar, patient registration, email notifications, and instant appointment booking.',
    },
    {
      id: 'saas',
      title: 'Business SaaS Portal',
      icon: Briefcase,
      prompt: 'A team CRM and pipeline dashboard with leads Kanban board, client notes, deal revenue forecasting, and exportable CSV reports.',
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
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-hidden">
      {/* Top Creation Bar */}
      <div className="p-4 border-b border-[#35D7FF]/10 bg-[#080D1B]/95 space-y-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-[11px] font-bold text-[#35D7FF]">
              <Layers className="w-3.5 h-3.5" />
              <span>STAR APP CREATOR</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white">
              Natural Language to Full-Stack Web Application
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#98A3B8]">Target:</span>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="bg-[#111B35] border border-[#35D7FF]/20 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
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
            placeholder="e.g. Create a fruit juice ordering app with login, cart, payments, order history, and admin dashboard..."
            className="flex-1 bg-[#111B35]/80 border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs md:text-sm text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
          />
          <button
            onClick={() => handleBuild()}
            disabled={!appIdea.trim() || isLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
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
            <Layers className="w-12 h-12 text-[#35D7FF] animate-bounce" />
            <div>
              <h3 className="text-xl font-bold text-white">Describe any application in plain English</h3>
              <p className="text-xs text-[#98A3B8] max-w-lg mt-1 mx-auto">
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
                    className="p-4 rounded-2xl bg-[#111B35]/70 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] cursor-pointer transition-all group shadow-md"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#35D7FF] mb-1">
                      <Icon className="w-4 h-4" />
                      <span>{t.title}</span>
                    </div>
                    <p className="text-xs text-[#98A3B8] group-hover:text-white transition-colors line-clamp-3">
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
            <div className="w-12 h-12 rounded-full border-4 border-[#35D7FF]/20 border-t-[#35D7FF] animate-spin" />
            <div className="text-center">
              <div className="text-sm font-bold text-white">STAR App Creator is generating full application...</div>
              <div className="text-xs text-[#98A3B8] mt-1">Generating specifications, relational tables, and live working mockup</div>
            </div>
          </div>
        )}

        {/* Generated App Result */}
        {result && !isLoading && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Subtabs Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#111B35]/70">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-xs font-extrabold text-white">{result.appName}</span>
                  <span className="text-[11px] text-[#35D7FF] ml-2 hidden sm:inline">
                    {result.tagline}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#080D1B] p-1 rounded-lg border border-white/5 text-xs">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Interactive Prototype</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('schema')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeTab === 'schema'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Database Schema (Postgres)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('spec')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeTab === 'spec'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
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
              <div className="flex-1 flex flex-col bg-[#0B1124] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#111B35]/60 border-b border-white/5 text-xs text-[#98A3B8]">
                  <span className="font-mono text-white">schema.sql (PostgreSQL DDL)</span>
                  <button
                    onClick={() => handleCopy(result.databaseSchema)}
                    className="flex items-center gap-1 hover:text-white"
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Technical Specifications & User Stories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.specifications.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#111B35] border border-[#35D7FF]/15 space-y-1"
                    >
                      <div className="text-xs font-bold text-[#35D7FF]">{s.category}</div>
                      <p className="text-xs text-[#98A3B8] leading-relaxed">{s.details}</p>
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

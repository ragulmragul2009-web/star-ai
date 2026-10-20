import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { DeveloperProject } from '../types';
import {
  Code2,
  Play,
  FileCode,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Rocket,
  RotateCw,
  Eye
} from 'lucide-react';

export const DeveloperWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [technology, setTechnology] = useState('React & Tailwind');
  const [action, setAction] = useState<'create' | 'debug' | 'refactor' | 'review'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<DeveloperProject | null>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [activeView, setActiveView] = useState<'preview' | 'code' | 'architecture' | 'deployment'>('preview');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      title: 'Crypto & Stock Portfolio Tracker',
      prompt: 'Build a financial portfolio dashboard with real-time price charts, asset allocation bar, and buy/sell modal in React',
      tech: 'React & Tailwind',
    },
    {
      title: 'Kanban Task Board with Drag & Drop',
      prompt: 'Build an interactive modern Kanban board with columns (To Do, In Progress, Done), add task dialog, and category tags',
      tech: 'HTML/JS & Tailwind',
    },
    {
      title: 'AI Audio Waveform Visualizer App',
      prompt: 'Build an audio frequency synthesizer with animated canvas audio waves, play/pause controls, and preset sound generators',
      tech: 'Canvas JS & CSS',
    },
  ];

  const handleGenerate = async (presetPrompt?: string, presetTech?: string) => {
    const finalPrompt = presetPrompt || prompt;
    const finalTech = presetTech || technology;

    if (!finalPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.generateCode(finalPrompt.trim(), finalTech, action);
      setProject(data.project);
      setSelectedFileIdx(0);
      setActiveView('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate developer code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    if (!project) return;
    const currentFile = project.files[selectedFileIdx] || { name: 'index.html', content: project.sandboxedHtml };
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-600">
              <Code2 className="w-3.5 h-3.5" />
              <span>STAR DEVELOPER & SANDBOX</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
              Sandboxed Full-Stack Code Studio
            </h2>
          </div>

          {/* Action & Tech selectors */}
          <div className="flex items-center gap-2">
            <select
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="React & Tailwind">React & Tailwind</option>
              <option value="HTML5, CSS & Vanilla JS">HTML5 & JS</option>
              <option value="Next.js Full-Stack">Next.js</option>
              <option value="Node.js & Express">Node & Express</option>
              <option value="PostgreSQL & SQL DDL">PostgreSQL DDL</option>
            </select>

            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="create">Generate New App</option>
              <option value="debug">Debug & Fix Code</option>
              <option value="refactor">Refactor & Optimize</option>
              <option value="review">Security Review</option>
            </select>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build or paste code to debug / refactor..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={!prompt.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Building...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Studio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* If no project generated yet, show presets */}
        {!project && !isLoading && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-3xl mx-auto text-center">
            <Code2 className="w-12 h-12 text-blue-600 mb-3 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-900">Full-Stack Code Engine & Live Preview</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
              Generate fully functional web applications, complete multi-file structures, and test them immediately inside an isolated sandbox iframe.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full text-left">
              {presets.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPrompt(p.prompt);
                    setTechnology(p.tech);
                    handleGenerate(p.prompt, p.tech);
                  }}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group shadow-xs"
                >
                  <div className="text-xs font-bold text-blue-600 mb-1">{p.title}</div>
                  <p className="text-[11px] text-slate-600 group-hover:text-slate-900 line-clamp-3">
                    {p.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900">STAR AI Architect is compiling code...</div>
              <div className="text-xs text-slate-500 mt-1">Generating components, styles, logic & isolated sandbox</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 m-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Active Project View */}
        {project && !isLoading && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* View Subtabs Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                  {project.projectTitle}
                </span>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setActiveView('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeView === 'preview'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveView('code')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeView === 'code'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Code Files ({project.files.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveView('architecture')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeView === 'architecture'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Architecture & Security</span>
                  </button>
                  <button
                    onClick={() => setActiveView('deployment')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeView === 'deployment'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Deploy</span>
                  </button>
                </div>
              </div>

              {/* Download / Export */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-blue-700 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* TAB: Live Sandbox Preview */}
            {activeView === 'preview' && (
              <div className="flex-1 bg-white relative">
                <iframe
                  title="STAR Code Sandbox Preview"
                  srcDoc={project.sandboxedHtml}
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-none"
                />
              </div>
            )}

            {/* TAB: Code Files Explorer */}
            {activeView === 'code' && (
              <div className="flex-1 flex overflow-hidden">
                {/* File list sidebar */}
                <div className="w-56 border-r border-slate-200 bg-white p-2 space-y-1 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project Tree
                  </div>
                  {project.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIdx(idx)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                        selectedFileIdx === idx
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>

                {/* File Code Editor View */}
                <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs text-slate-300">
                    <span className="font-mono text-white">
                      {project.files[selectedFileIdx]?.name}
                    </span>
                    <button
                      onClick={() => handleCopyCode(project.files[selectedFileIdx]?.content || '')}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-emerald-400 leading-relaxed">
                    <code>{project.files[selectedFileIdx]?.content}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB: Architecture & Security */}
            {activeView === 'architecture' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>Architecture Specification</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {project.architectureSummary}
                  </p>
                </div>

                {project.securityNotes && (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs space-y-3">
                    <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Security & Hardening Guidelines</span>
                    </h4>
                    <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {project.securityNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Deployment */}
            {activeView === 'deployment' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-indigo-600" />
                    <span>Deployment Instructions</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {project.deploymentGuide || 'Ready for deployment via Vercel, Netlify, or Docker container.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

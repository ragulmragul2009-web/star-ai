import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { DeveloperProject, ProjectFile } from '../types';
import {
  Code2,
  Play,
  FileCode,
  FolderOpen,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  Rocket,
  Sparkles,
  RotateCw,
  Eye,
  Maximize2
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
      prompt: 'Build a dark-mode financial portfolio dashboard with real-time mock price charts, asset allocation bar, and buy/sell modal in React',
      tech: 'React & Tailwind',
    },
    {
      title: 'Kanban Task Board with Drag & Drop',
      prompt: 'Build an interactive modern Kanban board with columns (To Do, In Progress, Done), add task dialog, and category tags',
      tech: 'HTML/JS & Tailwind',
    },
    {
      title: 'AI Audio Waveform Visualizer App',
      prompt: 'Build a high-tech audio frequency synthesizer with animated canvas audio waves, play/pause controls, and preset sound generators',
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
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-[#35D7FF]/10 bg-[#080D1B]/90 space-y-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-[11px] font-bold text-[#35D7FF]">
              <Code2 className="w-3.5 h-3.5" />
              <span>STAR DEVELOPER & SANDBOX</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white">
              Sandboxed Full-Stack Code Studio
            </h2>
          </div>

          {/* Action & Tech selectors */}
          <div className="flex items-center gap-2">
            <select
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              className="bg-[#111B35] border border-[#35D7FF]/20 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
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
              className="bg-[#111B35] border border-[#35D7FF]/20 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
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
            className="flex-1 bg-[#111B35]/80 border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs md:text-sm text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={!prompt.trim() || isLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
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
            <Code2 className="w-12 h-12 text-[#35D7FF] mb-3 animate-pulse" />
            <h3 className="text-xl font-bold text-white">Full-Stack Code Engine & Live Preview</h3>
            <p className="text-xs text-[#98A3B8] max-w-md mt-1 mb-6">
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
                  className="p-4 rounded-xl bg-[#111B35]/70 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold text-[#35D7FF] mb-1">{p.title}</div>
                  <p className="text-[11px] text-[#98A3B8] group-hover:text-white line-clamp-3">
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
            <div className="w-12 h-12 rounded-full border-4 border-[#35D7FF]/20 border-t-[#35D7FF] animate-spin" />
            <div className="text-center">
              <div className="text-sm font-bold text-white">STAR AI Architect is compiling code...</div>
              <div className="text-xs text-[#98A3B8] mt-1">Generating components, styles, logic & isolated sandbox</div>
            </div>
          </div>
        )}

        {/* Active Project View */}
        {project && !isLoading && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* View Subtabs Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#111B35]/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                  {project.projectTitle}
                </span>

                <div className="flex items-center gap-1 bg-[#080D1B] p-1 rounded-lg border border-white/5 text-xs">
                  <button
                    onClick={() => setActiveView('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeView === 'preview'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveView('code')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeView === 'code'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Code Files ({project.files.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveView('architecture')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeView === 'architecture'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Architecture & Security</span>
                  </button>
                  <button
                    onClick={() => setActiveView('deployment')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeView === 'deployment'
                        ? 'bg-[#35D7FF] text-[#080D1B]'
                        : 'text-[#98A3B8] hover:text-white'
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
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#080D1B] border border-[#35D7FF]/20 text-xs text-[#35D7FF] hover:bg-[#35D7FF]/10"
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
                <div className="w-56 border-r border-white/5 bg-[#080D1B] p-2 space-y-1 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#98A3B8]/60">
                    Project Tree
                  </div>
                  {project.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIdx(idx)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        selectedFileIdx === idx
                          ? 'bg-[#111B35] text-[#35D7FF] font-semibold border border-[#35D7FF]/30'
                          : 'text-[#98A3B8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-[#35D7FF]" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>

                {/* File Code Editor View */}
                <div className="flex-1 flex flex-col bg-[#0B1124] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111B35]/50 border-b border-white/5 text-xs text-[#98A3B8]">
                    <span className="font-mono text-white">
                      {project.files[selectedFileIdx]?.name}
                    </span>
                    <button
                      onClick={() => handleCopyCode(project.files[selectedFileIdx]?.content || '')}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-emerald-300 leading-relaxed">
                    <code>{project.files[selectedFileIdx]?.content}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB: Architecture & Security */}
            {activeView === 'architecture' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
                <div className="p-5 rounded-2xl bg-[#111B35] border border-[#35D7FF]/20 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#35D7FF]" />
                    <span>Architecture Specification</span>
                  </h4>
                  <p className="text-xs text-[#F5F7FF] leading-relaxed whitespace-pre-wrap">
                    {project.architectureSummary}
                  </p>
                </div>

                {project.securityNotes && (
                  <div className="p-5 rounded-2xl bg-[#111B35] border border-amber-500/20 space-y-3">
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security & Hardening Guidelines</span>
                    </h4>
                    <p className="text-xs text-[#98A3B8] leading-relaxed whitespace-pre-wrap">
                      {project.securityNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Deployment */}
            {activeView === 'deployment' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
                <div className="p-5 rounded-2xl bg-[#111B35] border border-[#35D7FF]/20 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Deployment Instructions</span>
                  </h4>
                  <p className="text-xs text-[#F5F7FF] leading-relaxed whitespace-pre-wrap">
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

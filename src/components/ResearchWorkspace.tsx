import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { WebSource } from '../types';
import {
  Globe,
  Search,
  ExternalLink,
  BookOpen,
  Newspaper,
  Code,
  FileText,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

export const ResearchWorkspace: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'news' | 'technical' | 'educational'>('all');
  const [depth, setDepth] = useState<'quick' | 'detailed' | 'academic'>('detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<{
    text: string;
    sources: WebSource[];
    queries: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.performResearch(query.trim(), category, depth);
      setResearchResult({
        text: data.text || 'No research data returned.',
        sources: data.sources || [],
        queries: data.queries || [query.trim()],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to complete web research.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!researchResult) return;
    navigator.clipboard.writeText(researchResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trendingTopics = [
    'Next generation quantum computing algorithms in 2026',
    'Solid-state battery EV commercialization timeline',
    'James Webb Space Telescope recent exoplanet discoveries',
    'PostgreSQL 18 latest performance optimizations',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Research Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF]">
            <Globe className="w-3.5 h-3.5" />
            <span>GROUNDED WEB RESEARCH STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Live Web Intelligence & Verified Citations
          </h2>
          <p className="text-xs md:text-sm text-[#98A3B8] max-w-xl mx-auto">
            Grounded directly with Google Search index. Extracts verified facts, dates, academic synthesis, and clickable primary citations.
          </p>
        </div>

        {/* Search Formulation Box */}
        <form
          onSubmit={handleSearch}
          className="p-4 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 shadow-xl space-y-4"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#35D7FF]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter any research topic, breaking news, or technical documentation question..."
              className="w-full bg-[#080D1B]/80 border border-[#35D7FF]/20 rounded-xl pl-12 pr-28 py-3.5 text-sm md:text-base text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Research</span>
                </>
              )}
            </button>
          </div>

          {/* Filters & Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
            {/* Category Segmented Filters */}
            <div className="flex items-center gap-1 p-1 bg-[#080D1B]/80 rounded-xl border border-white/5">
              {[
                { id: 'all' as const, label: 'All Sources', icon: Globe },
                { id: 'news' as const, label: 'News', icon: Newspaper },
                { id: 'technical' as const, label: 'Technical Docs', icon: Code },
                { id: 'educational' as const, label: 'Academic & Edu', icon: BookOpen },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#35D7FF]/20 text-[#35D7FF] border border-[#35D7FF]/30'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Depth Level */}
            <div className="flex items-center gap-2 text-[#98A3B8]">
              <span>Depth:</span>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="bg-[#080D1B] border border-[#35D7FF]/20 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="quick">Quick Overview</option>
                <option value="detailed">In-Depth Synthesis</option>
                <option value="academic">Academic Fact-Check</option>
              </select>
            </div>
          </div>
        </form>

        {/* Trending Suggestions */}
        {!researchResult && !isLoading && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#98A3B8] uppercase tracking-wider">
              Trending Inquiries:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trendingTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(topic);
                  }}
                  className="p-3 rounded-xl bg-[#111B35]/40 border border-white/5 hover:border-[#35D7FF]/30 hover:bg-[#111B35] text-left text-xs text-[#98A3B8] hover:text-[#35D7FF] transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{topic}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-[#111B35]/70 border border-[#35D7FF]/20 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#35D7FF]/20" />
              <div className="h-4 bg-[#35D7FF]/20 rounded w-1/3" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-5/6" />
              <div className="h-3 bg-white/10 rounded w-4/6" />
            </div>
            <div className="h-20 bg-white/5 rounded-xl" />
          </div>
        )}

        {/* Research Synthesis Output */}
        {researchResult && !isLoading && (
          <div className="space-y-6">
            {/* Primary Report Card */}
            <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/25 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    STAR Verified Research Report
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#080D1B] border border-white/10 text-xs text-[#98A3B8] hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Report'}</span>
                  </button>
                </div>
              </div>

              {/* Research Queries Used */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#98A3B8]">
                <span className="font-semibold text-white">Google Queries:</span>
                {researchResult.queries.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#080D1B] text-[#35D7FF] font-mono text-[11px]"
                  >
                    &ldquo;{q}&rdquo;
                  </span>
                ))}
              </div>

              {/* Report Body */}
              <div className="text-sm md:text-base leading-relaxed text-[#F5F7FF] whitespace-pre-wrap font-sans">
                {researchResult.text}
              </div>
            </div>

            {/* Clickable Citations & Primary Sources Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#98A3B8] flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#35D7FF]" />
                <span>Verified Primary Web Citations ({researchResult.sources.length})</span>
              </h3>

              {researchResult.sources.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#111B35]/40 border border-white/5 text-xs text-[#98A3B8]">
                  Direct citations integrated within text report.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {researchResult.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#35D7FF] mb-1">
                          <span className="truncate max-w-[85%] group-hover:underline">
                            {src.title || 'Web Citation'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                        </div>
                        {src.snippet && (
                          <p className="text-xs text-[#98A3B8] line-clamp-2 mt-1">
                            {src.snippet}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 text-[10px] text-[#98A3B8]/60 truncate font-mono">
                        {src.url}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

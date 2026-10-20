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
  Copy,
  Check,
  RotateCw
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

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.performResearch(finalQuery.trim(), category, depth);
      setResearchResult({
        text: data.text || 'No research data returned.',
        sources: data.sources || [],
        queries: data.queries || [finalQuery.trim()],
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
    'Next generation nuclear fusion energy breakthroughs in 2026',
    'Solid-state battery EV commercialization timeline',
    'James Webb Space Telescope recent exoplanet discoveries',
    'PostgreSQL latest performance and query planner optimizations',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Research Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
            <Globe className="w-3.5 h-3.5" />
            <span>GROUNDED WEB RESEARCH STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Live Web Intelligence & Verified Citations
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
            Grounded directly with Google Search index. Extracts verified facts, dates, academic synthesis, and clickable primary citations.
          </p>
        </div>

        {/* Search Formulation Box */}
        <form
          onSubmit={(e) => handleSearch(e)}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-blue-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter any research topic, breaking news, or technical documentation question..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-28 py-3.5 text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-40 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Research</span>
                </div>
              )}
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Category:</span>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'All Sources', icon: Globe },
                  { id: 'news', label: 'News & Events', icon: Newspaper },
                  { id: 'technical', label: 'Technical Docs', icon: Code },
                  { id: 'educational', label: 'Academic / Papers', icon: BookOpen },
                ].map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Depth:</span>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="quick">Quick Summary</option>
                <option value="detailed">Comprehensive Analysis</option>
                <option value="academic">Academic Rigor & Peer Citations</option>
              </select>
            </div>
          </div>
        </form>

        {/* Trending Suggestions */}
        {!researchResult && !isLoading && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trending Inquiries Grounded with Search:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {trendingTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(topic);
                    handleSearch(undefined, topic);
                  }}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm text-left transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <span className="text-xs text-slate-700 group-hover:text-blue-600 font-medium">
                    {topic}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-pulse">
            <div className="h-5 bg-blue-100 rounded-md w-1/3" />
            <div className="h-4 bg-slate-100 rounded-md w-full" />
            <div className="h-4 bg-slate-100 rounded-md w-5/6" />
            <div className="h-4 bg-slate-100 rounded-md w-4/6" />
            <div className="pt-4 flex gap-3">
              <div className="h-16 bg-slate-100 rounded-xl w-1/2" />
              <div className="h-16 bg-slate-100 rounded-xl w-1/2" />
            </div>
          </div>
        )}

        {/* Research Dossier Output */}
        {researchResult && !isLoading && (
          <div className="space-y-6">
            {/* Header info card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Grounded Research Briefing</span>
                </div>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Dossier'}</span>
                </button>
              </div>

              {/* Research Text */}
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap prose-star">
                {researchResult.text}
              </div>
            </div>

            {/* Primary Source Cards */}
            {researchResult.sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified Web Citations & Sources ({researchResult.sources.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {researchResult.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {src.title || src.url}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                        </div>
                        {src.snippet && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {src.snippet}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 text-[10px] text-blue-600 font-mono truncate">
                        {src.url}
                      </div>
                    </a>
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

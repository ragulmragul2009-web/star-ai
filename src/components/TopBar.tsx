import React from 'react';
import { WorkspaceId } from '../types';
import {
  Globe,
  Flame,
  Volume2,
  VolumeX,
  User,
  SlidersHorizontal,
  Bot,
  Zap,
  Menu,
  BookOpen,
  Languages
} from 'lucide-react';

interface TopBarProps {
  currentWorkspace: WorkspaceId;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  explanationLevel?: 'basic' | 'normal' | 'advanced';
  onSelectExplanationLevel?: (lvl: 'basic' | 'normal' | 'advanced') => void;
  preferredLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  showAvatarInChat: boolean;
  onToggleAvatarInChat: () => void;
  streakDays: number;
  learningPoints: number;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onToggleMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentWorkspace,
  selectedModel,
  onSelectModel,
  explanationLevel = 'normal',
  onSelectExplanationLevel,
  preferredLanguage = 'en',
  onSelectLanguage,
  enableSearch,
  onToggleSearch,
  voiceEnabled,
  onToggleVoice,
  showAvatarInChat,
  onToggleAvatarInChat,
  streakDays,
  learningPoints,
  onOpenSettings,
  onOpenAuth,
  onToggleMobileSidebar,
}) => {
  const workspaceMeta: Record<WorkspaceId, { title: string; subtitle: string }> = {
    chat: { title: 'STAR AI Assistant', subtitle: 'Multimodal AI with Real-Time Grounding' },
    'avatar-live': { title: 'STAR Live Room', subtitle: 'Interactive 3D Visual Human Avatar' },
    research: { title: 'STAR Research Studio', subtitle: 'Google Search Deep Synthesis & Fact Citations' },
    teacher: { title: 'STAR Teacher & Tutor', subtitle: 'Adaptive Learning, Quizzes & Bilingual Practice' },
    developer: { title: 'STAR Developer Sandbox', subtitle: 'Full-Stack Code Generation & Live Sandbox' },
    'app-builder': { title: 'STAR App Creator', subtitle: 'Natural Language to Working Full-Stack Apps' },
    'image-studio': { title: 'STAR Image Studio', subtitle: 'Next-Gen AI Image Generation & Art' },
    'video-studio': { title: 'STAR Video Studio', subtitle: 'Cinematic Storyboarding, Scripting & Direction' },
    notes: { title: 'STAR Notes & Docs', subtitle: 'Smart Workspace with AI Expansion & Auto-Save' },
    tasks: { title: 'Autonomous Task Agent', subtitle: 'Multi-Step Execution & Verified Approvals' },
    support: { title: 'STAR Customer Care', subtitle: 'Intelligent Support, FAQs & Ticket Center' },
    admin: { title: 'STAR Admin Console', subtitle: 'Telemetry, Role Controls & API Operations' },
    settings: { title: 'Settings & Preferences', subtitle: 'Personalization & System Tuning' },
  };

  const currentMeta = workspaceMeta[currentWorkspace] || workspaceMeta.chat;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10 shadow-xs">
      {/* Left: Mobile hamburger & Workspace title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{currentMeta.title}</span>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-[11px] text-slate-500 hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Explanation Level Selector */}
        {onSelectExplanationLevel && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 ml-1.5" />
            <select
              value={explanationLevel}
              onChange={(e) => onSelectExplanationLevel(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1 py-0.5"
              title="Explanation Level"
            >
              <option value="basic">Basic English</option>
              <option value="normal">Normal English</option>
              <option value="advanced">Advanced English</option>
            </select>
          </div>
        )}

        {/* Preferred Language Selector */}
        {onSelectLanguage && (
          <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs">
            <Languages className="w-3.5 h-3.5 text-violet-600 ml-1.5" />
            <select
              value={preferredLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1 py-0.5"
              title="Preferred Language"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        )}

        {/* Model Switcher */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
          >
            <option value="gemini-3.1-flash-lite">STAR Lite 3.1 (Default)</option>
            <option value="gemini-3.8-flash">STAR Flash 3.8</option>
            <option value="gemini-4-argon">STAR Quantum Pro</option>
          </select>
        </div>

        {/* Google Search Grounding Toggle */}
        <button
          onClick={onToggleSearch}
          title={enableSearch ? 'Web Search Grounding Active' : 'Enable Web Search Grounding'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            enableSearch
              ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          <Globe className={`w-3.5 h-3.5 ${enableSearch ? 'text-blue-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">Web Grounding</span>
        </button>

        {/* Avatar Visibility Toggle (in chat workspace) */}
        {currentWorkspace === 'chat' && (
          <button
            onClick={onToggleAvatarInChat}
            title={showAvatarInChat ? 'Hide 3D Avatar' : 'Show 3D Avatar'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showAvatarInChat
                ? 'bg-violet-50 text-violet-700 border border-violet-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-violet-600" />
            <span className="hidden sm:inline">Avatar</span>
          </button>
        )}

        {/* Voice Playback Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
          className={`p-2 rounded-xl text-xs transition-colors ${
            voiceEnabled
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-slate-100 text-slate-400 border border-slate-200 hover:text-slate-700'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Streak & Learning Points Display */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <div className="flex items-center gap-1 text-amber-600 font-bold" title="Daily Streak">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streakDays}d</span>
          </div>
          <span className="text-slate-300">·</span>
          <span className="text-blue-600 font-semibold" title="Learning Points">
            {learningPoints} pts
          </span>
        </div>

        {/* Quick Settings */}
        <button
          onClick={onOpenSettings}
          title="Open Settings"
          className="p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenAuth}
          title="Account & Authentication"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] hover:scale-105 transition-transform shadow-xs"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
};

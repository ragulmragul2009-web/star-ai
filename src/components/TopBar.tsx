import React from 'react';
import { WorkspaceId, AvatarState } from '../types';
import {
  Globe,
  Flame,
  Volume2,
  VolumeX,
  User,
  SlidersHorizontal,
  Bot,
  Zap,
  Activity,
  Menu
} from 'lucide-react';

interface TopBarProps {
  currentWorkspace: WorkspaceId;
  selectedModel: string;
  onSelectModel: (model: string) => void;
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
    <header className="h-16 border-b border-[#35D7FF]/10 bg-[#080D1B]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
      {/* Left: Mobile hamburger & Workspace title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#98A3B8] hover:text-white hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>{currentMeta.title}</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </h1>
          <p className="text-[11px] text-[#98A3B8] hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#111B35] border border-[#35D7FF]/15 text-xs text-[#F5F7FF]">
          <Zap className="w-3.5 h-3.5 text-[#35D7FF]" />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#F5F7FF] outline-none cursor-pointer pr-1"
          >
            <option value="gemini-3.1-flash-lite" className="bg-[#111B35]">STAR Lite 3.1 (Default)</option>
            <option value="gemini-3.8-flash" className="bg-[#111B35]">STAR Flash 3.8</option>
            <option value="gemini-4-argon" className="bg-[#111B35]">STAR Quantum Pro</option>
          </select>
        </div>

        {/* Google Search Grounding Toggle */}
        <button
          onClick={onToggleSearch}
          title={enableSearch ? 'Web Search Grounding Active' : 'Enable Web Search Grounding'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
            enableSearch
              ? 'bg-[#35D7FF]/15 text-[#35D7FF] border border-[#35D7FF]/40 shadow-sm shadow-[#35D7FF]/20'
              : 'bg-[#111B35] text-[#98A3B8] border border-white/5 hover:text-white'
          }`}
        >
          <Globe className={`w-3.5 h-3.5 ${enableSearch ? 'text-[#35D7FF]' : 'text-[#98A3B8]'}`} />
          <span className="hidden sm:inline">Web Grounding</span>
        </button>

        {/* Avatar Visibility Toggle (in chat workspace) */}
        {currentWorkspace === 'chat' && (
          <button
            onClick={onToggleAvatarInChat}
            title={showAvatarInChat ? 'Hide 3D Avatar' : 'Show 3D Avatar'}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showAvatarInChat
                ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40'
                : 'bg-[#111B35] text-[#98A3B8] border border-white/5 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Avatar</span>
          </button>
        )}

        {/* Voice Playback Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
          className={`p-2 rounded-xl text-xs transition-colors ${
            voiceEnabled
              ? 'bg-[#111B35] text-[#35D7FF] border border-[#35D7FF]/20'
              : 'bg-[#111B35] text-[#98A3B8]/60 border border-white/5 hover:text-white'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Streak & Learning Points Display */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#111B35]/70 border border-[#35D7FF]/10 text-xs text-[#F5F7FF]">
          <div className="flex items-center gap-1 text-amber-400 font-bold" title="Daily Streak">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{streakDays}d</span>
          </div>
          <span className="text-[#98A3B8]/40">·</span>
          <span className="text-[#35D7FF] font-semibold" title="Learning Points">
            {learningPoints} pts
          </span>
        </div>

        {/* Quick Settings */}
        <button
          onClick={onOpenSettings}
          title="Open Settings"
          className="p-2 rounded-xl bg-[#111B35] text-[#98A3B8] border border-white/5 hover:text-white hover:border-[#35D7FF]/30 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenAuth}
          title="Account & Authentication"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#35D7FF] to-[#8B5CF6] p-[1.5px] hover:scale-105 transition-transform"
        >
          <div className="w-full h-full rounded-full bg-[#080D1B] flex items-center justify-center text-[#35D7FF]">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
};

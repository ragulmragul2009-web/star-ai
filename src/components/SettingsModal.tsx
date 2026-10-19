import React, { useState } from 'react';
import { AvatarStyle } from '../types';
import {
  X,
  Sliders,
  Moon,
  Sun,
  Volume2,
  Cpu,
  Shield,
  Download,
  Trash2,
  Check,
  Globe
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (m: string) => void;
  avatarStyle: AvatarStyle;
  onChangeAvatarStyle: (s: AvatarStyle) => void;
  voiceSpeed: number;
  onChangeVoiceSpeed: (spd: number) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onClearAllHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  avatarStyle,
  onChangeAvatarStyle,
  voiceSpeed,
  onChangeVoiceSpeed,
  autoSpeak,
  onToggleAutoSpeak,
  onClearAllHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'voice' | 'privacy'>('general');
  const [exportNotice, setExportNotice] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'STAR AI Platform',
      version: '2.5.0',
      settings: { selectedModel, avatarStyle, voiceSpeed, autoSpeak },
      notes: localStorage.getItem('star_ai_notes'),
      conversations: localStorage.getItem('star_ai_conversations'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STAR_AI_Data_Export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#111B35] border border-[#35D7FF]/30 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#35D7FF]/15 flex items-center justify-between bg-[#080D1B]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#35D7FF]" />
            <h3 className="text-base font-extrabold text-white">Settings & Personalization</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#98A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-2 bg-[#080D1B]/60 border-b border-white/5 text-xs">
          {[
            { id: 'general', label: 'General & Model' },
            { id: 'appearance', label: 'Appearance & Avatar' },
            { id: 'voice', label: 'Voice & Speech' },
            { id: 'privacy', label: 'Data & Privacy' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-[#35D7FF] text-[#080D1B]'
                  : 'text-[#98A3B8] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#F5F7FF]">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-white block">Default AI Model Provider:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="gemini-3.1-flash-lite">STAR Lite (gemini-3.1-flash-lite) - Ultra Fast & Recommended</option>
                  <option value="gemini-3.8-flash">STAR Flash (gemini-3.8-flash) - Multimodal Reasoning</option>
                  <option value="gemini-4-argon">STAR Quantum Pro (gemini-4-argon) - Deep STEM Reasoning</option>
                </select>
                <p className="text-[11px] text-[#98A3B8]">
                  Powered by Google GenAI. All keys managed securely server-side.
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <label className="font-bold text-white block">Default Language & Regional Formatting:</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#35D7FF]" />
                  <span className="text-white font-medium">English (US) + Tamil Bilingual Tutor Support</span>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-white block">Visual Avatar Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '3d-human' as AvatarStyle, label: '3D Digital Human' },
                    { id: 'cyber-hologram' as AvatarStyle, label: 'Cyber Hologram' },
                    { id: 'stylized-anime' as AvatarStyle, label: 'Stylized Anime' },
                    { id: 'star-minimal' as AvatarStyle, label: 'Star Core Minimal' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onChangeAvatarStyle(s.id)}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        avatarStyle === s.id
                          ? 'bg-[#35D7FF]/20 border-[#35D7FF] text-white'
                          : 'bg-[#080D1B] border-white/5 text-[#98A3B8] hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <label className="font-bold text-white block">Theme Mode:</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-[#080D1B] border border-[#35D7FF] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#35D7FF]" />
                      <span>Midnight Star Navy (Optimized for OLED & focus)</span>
                    </div>
                    <Check className="w-4 h-4 text-[#35D7FF]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VOICE */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1B] border border-white/5">
                <div>
                  <div className="font-bold text-white">Auto-Speak Spoken Responses</div>
                  <div className="text-[11px] text-[#98A3B8]">Read aloud assistant answers automatically</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={onToggleAutoSpeak}
                  className="w-4 h-4 accent-[#35D7FF] cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Speech Rate:</span>
                  <span className="font-mono text-[#35D7FF]">{voiceSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => onChangeVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#35D7FF]"
                />
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#080D1B] border border-[#35D7FF]/20 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Your Data Belongs to You</span>
                </div>
                <p className="text-[11px] text-[#98A3B8]">
                  Export all your conversations, notes, generated projects, and preferences in standard JSON format at any time.
                </p>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#35D7FF] text-[#080D1B] font-bold hover:brightness-110 active:scale-95 transition-all text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportNotice ? 'Export Downloaded!' : 'Export All Local Data'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 space-y-2">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Conversation History</span>
                </div>
                <p className="text-[11px] text-[#98A3B8]">
                  Permanently wipe all recent chat sessions and active messages from this device.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all chat history?')) {
                      onClearAllHistory();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600/30 border border-red-500/50 text-red-200 font-bold hover:bg-red-600/50 text-xs"
                >
                  Wipe Chat History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#080D1B] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#35D7FF] text-[#080D1B] font-bold text-xs hover:brightness-110"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AvatarState, AvatarStyle } from '../types';
import { AvatarCanvas } from './AvatarCanvas';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Bot,
  Layers,
  Send
} from 'lucide-react';

interface AvatarLiveWorkspaceProps {
  avatarState: AvatarState;
  avatarStyle: AvatarStyle;
  onChangeAvatarStyle: (style: AvatarStyle) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onSendVoiceMessage: (text: string) => void;
  lastUserSpeech?: string;
  lastAiResponse?: string;
}

export const AvatarLiveWorkspace: React.FC<AvatarLiveWorkspaceProps> = ({
  avatarState,
  avatarStyle,
  onChangeAvatarStyle,
  isListening,
  onToggleListening,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
  voiceEnabled,
  onToggleVoice,
  onSendVoiceMessage,
  lastUserSpeech = '',
  lastAiResponse = '',
}) => {
  const [quickInput, setQuickInput] = useState('');

  const sampleVoicePrompts = [
    'Tell me an inspiring story about space exploration.',
    'How do black holes bend time and light?',
    'Teach me a warm Tamil greeting with its meaning.',
    'What are the 3 best habits for deep focus?',
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSendVoiceMessage(quickInput.trim());
    setQuickInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#080D1B] via-[#0D152D] to-[#080D1B] p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-between">
        {/* Header Title */}
        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>IMMERSIVE AI COMPANION</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Meet <span className="bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] bg-clip-text text-transparent">STAR</span>
          </h2>
          <p className="text-xs md:text-sm text-[#98A3B8]">
            Real-time conversational visual human assistant with procedural lip-sync and audio awareness.
          </p>
        </div>

        {/* Central Large Avatar Stage */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <AvatarCanvas
            state={avatarState}
            style={avatarStyle}
            size="hero"
            isSpeaking={isSpeaking}
            isListening={isListening}
            onToggleMic={onToggleListening}
            onToggleSpeech={() => {
              if (isSpeaking) onStopSpeaking();
            }}
            voiceEnabled={voiceEnabled}
            showControls={false}
            statusMessage={
              isListening
                ? 'Listening to your voice...'
                : isSpeaking
                ? 'Speaking response...'
                : avatarState === 'THINKING'
                ? 'Formulating response...'
                : 'STAR is listening. Tap the microphone or speak.'
            }
          />

          {/* Style Selector Pills */}
          <div className="flex items-center gap-2 mt-4 p-1.5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/15 backdrop-blur-md">
            {[
              { id: '3d-human' as AvatarStyle, label: '3D Human' },
              { id: 'cyber-hologram' as AvatarStyle, label: 'Hologram' },
              { id: 'stylized-anime' as AvatarStyle, label: 'Anime' },
              { id: 'star-minimal' as AvatarStyle, label: 'Star Core' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onChangeAvatarStyle(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  avatarStyle === st.id
                    ? 'bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] shadow-md shadow-[#35D7FF]/30'
                    : 'text-[#98A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spoken Dialogue Teleprompter */}
        <div className="w-full max-w-2xl space-y-3 mb-6">
          {lastUserSpeech && (
            <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-[#35D7FF]/15 text-xs text-white">
              <span className="font-bold text-[#35D7FF] mr-2">You:</span>
              <span>{lastUserSpeech}</span>
            </div>
          )}

          {lastAiResponse && (
            <div className="p-4 rounded-xl bg-[#111B35]/90 border border-[#8B5CF6]/30 text-xs md:text-sm text-[#F5F7FF] shadow-lg">
              <div className="flex items-center justify-between font-bold text-[#8B5CF6] mb-1">
                <span>STAR Assistant:</span>
                <button
                  onClick={() => {
                    if (isSpeaking) onStopSpeaking();
                    else onSpeakText(lastAiResponse);
                  }}
                  className="hover:text-white"
                  title="Repeat speech"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="leading-relaxed">{lastAiResponse}</p>
            </div>
          )}
        </div>

        {/* Main Microphone Button & Controls */}
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Audio Voice Output Toggle */}
            <button
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}
              className={`p-3 rounded-2xl border transition-all ${
                voiceEnabled
                  ? 'bg-[#111B35] text-[#35D7FF] border-[#35D7FF]/30'
                  : 'bg-[#111B35] text-[#98A3B8]/60 border-white/5'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Giant Center Mic Button */}
            <button
              onClick={onToggleListening}
              className={`relative p-5 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/50 scale-110 animate-pulse'
                  : 'bg-gradient-to-tr from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] shadow-xl shadow-[#35D7FF]/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isListening ? (
                <Mic className="w-7 h-7 stroke-[2.5]" />
              ) : (
                <MicOff className="w-7 h-7 stroke-[2.5]" />
              )}
            </button>

            {/* Stop Speaking button if active */}
            <button
              onClick={onStopSpeaking}
              disabled={!isSpeaking}
              title="Stop speaking"
              className={`p-3 rounded-2xl border transition-all ${
                isSpeaking
                  ? 'bg-[#111B35] text-amber-400 border-amber-400/40 hover:bg-amber-400/10'
                  : 'bg-[#111B35] text-[#98A3B8]/30 border-white/5 cursor-not-allowed'
              }`}
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#98A3B8]">
            {isListening
              ? '🎙️ Listening... speak clearly into your microphone'
              : 'Tap microphone to speak with STAR in real time'}
          </p>

          {/* Fallback Text Input for Silent Environments */}
          <form onSubmit={handleQuickSubmit} className="w-full flex items-center gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Or type a question to hear STAR speak..."
              className="flex-1 bg-[#111B35]/80 border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs md:text-sm text-white placeholder-[#98A3B8]/50 focus:outline-none focus:border-[#35D7FF]/60"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="p-2.5 rounded-xl bg-[#35D7FF] text-[#080D1B] font-bold disabled:opacity-40 hover:brightness-110 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Voice Topics */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-2">
            {sampleVoicePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => onSendVoiceMessage(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#111B35]/60 hover:bg-[#111B35] border border-white/5 hover:border-[#35D7FF]/30 text-[#98A3B8] hover:text-[#35D7FF] transition-all"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

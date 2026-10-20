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
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-between">
        {/* Header Title */}
        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>IMMERSIVE AI COMPANION</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Meet <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">STAR</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
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
          <div className="flex items-center gap-2 mt-4 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            {[
              { id: '3d-human' as AvatarStyle, label: '3D Human' },
              { id: 'cyber-hologram' as AvatarStyle, label: 'Hologram' },
              { id: 'stylized-anime' as AvatarStyle, label: 'Anime' },
              { id: 'star-minimal' as AvatarStyle, label: 'Star Core' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onChangeAvatarStyle(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  avatarStyle === st.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-xs">
              <span className="font-bold text-blue-600 mr-2">You:</span>
              <span>{lastUserSpeech}</span>
            </div>
          )}

          {lastAiResponse && (
            <div className="p-4 rounded-xl bg-white border border-blue-200 text-xs md:text-sm text-slate-800 shadow-sm">
              <div className="flex items-center justify-between font-bold text-blue-600 mb-1">
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
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Giant Center Mic Button */}
            <button
              onClick={onToggleListening}
              className={`relative p-5 rounded-full transition-all duration-300 cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110 animate-pulse'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95'
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
                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 cursor-pointer'
                  : 'bg-white text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
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
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-40 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
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
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-all shadow-xs cursor-pointer"
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

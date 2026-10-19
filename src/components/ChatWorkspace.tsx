import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Attachment, AvatarState, AvatarStyle } from '../types';
import { AvatarCanvas } from './AvatarCanvas';
import { StarLogo } from './StarLogo';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Camera,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  X,
  FileCode,
  FileText,
  FileAudio,
  Search,
  Zap,
  Globe,
  Square,
  Trash2
} from 'lucide-react';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  avatarState: AvatarState;
  avatarStyle: AvatarStyle;
  showAvatarInChat: boolean;
  onToggleAvatarInChat: () => void;
  voiceEnabled: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
  selectedModel: string;
  onStopGeneration?: () => void;
  onRegenerateResponse?: () => void;
  onClearConversation?: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  avatarState,
  avatarStyle,
  showAvatarInChat,
  onToggleAvatarInChat,
  voiceEnabled,
  onSpeakText,
  onStopSpeaking,
  isSpeaking,
  isListening,
  onToggleListening,
  enableSearch,
  onToggleSearch,
  selectedModel,
  onStopGeneration,
  onRegenerateResponse,
  onClearConversation,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        let type: Attachment['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.type.startsWith('video/')) type = 'video';

        const newAtt: Attachment = {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          data: base64,
          type,
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Screen share capture
  const handleCaptureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0);
      const base64 = canvas.toDataURL('image/png');
      track.stop();

      const newAtt: Attachment = {
        name: `Screen_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
        mimeType: 'image/png',
        size: Math.round(base64.length * 0.75),
        data: base64,
        type: 'image',
      };
      setAttachments((prev) => [...prev, newAtt]);
    } catch (err) {
      console.warn('Screen share cancelled or not supported:', err);
    }
  };

  // Live Camera snapshot modal
  const openCameraModal = async () => {
    try {
      setShowCameraModal(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Unable to access webcam. Please check browser permissions.');
      setShowCameraModal(false);
    }
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/png');

    closeCameraModal();

    const newAtt: Attachment = {
      name: `Snapshot_${Date.now()}.png`,
      mimeType: 'image/png',
      size: Math.round(base64.length * 0.75),
      data: base64,
      type: 'image',
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const starterPrompts = [
    {
      title: 'Analyze & Teach Code',
      desc: 'Explain how async/await works under the hood in JavaScript',
      prompt: 'Explain how asynchronous programming and the event loop work in JavaScript, with a clear step-by-step mental model and visual example.',
    },
    {
      title: 'Tamil to English Practice',
      desc: 'Learn common business conversation phrases with Tamil translations',
      prompt: 'Help me practice English for a job interview. Provide key professional phrases with their Tamil translations and pronunciation tips.',
    },
    {
      title: 'Web Research with Citations',
      desc: 'Search for the latest breakthrough in fusion energy in 2026',
      prompt: 'Search the web for the latest major breakthroughs and status of commercial nuclear fusion power in 2026. Provide verified facts and citations.',
    },
    {
      title: 'Design Full-Stack App',
      desc: 'Architect a fruit juice delivery system with PostgreSQL & React',
      prompt: 'Create the architecture specification, database schema, and interactive React UI for a high-end cold-pressed juice subscription service.',
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Central Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#080D1B] via-[#0A1024] to-[#080D1B]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center py-8">
              <StarLogo size="xl" showText={true} showTagline={true} animated={true} />

              <h2 className="mt-6 text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                How can <span className="bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] bg-clip-text text-transparent">STAR AI</span> empower you today?
              </h2>
              <p className="mt-2 text-sm text-[#98A3B8] max-w-xl">
                Experience multimodal intelligence with real-time web grounding, conversational 3D avatar, code sandbox, and multi-step autonomous workflows.
              </p>

              {/* Quick Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl text-left">
                {starterPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p.prompt, [])}
                    className="p-4 rounded-2xl bg-[#111B35]/70 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] transition-all group shadow-lg shadow-[#080D1B]/50"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#35D7FF]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{p.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#98A3B8] group-hover:text-[#F5F7FF] transition-colors line-clamp-2">
                      {p.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Feed */
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Assistant Avatar Badge */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#35D7FF] to-[#8B5CF6] p-[1.5px] shrink-0 mt-1">
                        <div className="w-full h-full rounded-full bg-[#080D1B] flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[#35D7FF]" />
                        </div>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 md:p-5 shadow-xl transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-[#1E293B] to-[#111B35] text-white border border-[#35D7FF]/20 rounded-tr-sm'
                          : 'bg-[#111B35]/85 text-[#F5F7FF] border border-[#35D7FF]/15 backdrop-blur-md rounded-tl-sm'
                      }`}
                    >
                      {/* Attached files preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="rounded-xl overflow-hidden border border-[#35D7FF]/20 bg-[#080D1B]/80 max-w-[200px]"
                            >
                              {att.type === 'image' ? (
                                <img
                                  src={att.data}
                                  alt={att.name}
                                  className="w-full max-h-36 object-cover"
                                />
                              ) : (
                                <div className="p-2 flex items-center gap-2 text-xs">
                                  {att.type === 'audio' ? (
                                    <FileAudio className="w-4 h-4 text-[#35D7FF]" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-[#8B5CF6]" />
                                  )}
                                  <span className="truncate max-w-[120px]">{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Web Search Queries (if Grounded) */}
                      {msg.webSearchQueries && msg.webSearchQueries.length > 0 && (
                        <div className="mb-3 p-2.5 rounded-xl bg-[#080D1B]/60 border border-[#35D7FF]/20 text-xs">
                          <div className="flex items-center gap-1.5 text-[#35D7FF] font-semibold mb-1">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Grounded with Google Search:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {msg.webSearchQueries.map((q, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-[#111B35] text-[#98A3B8]"
                              >
                                &ldquo;{q}&rdquo;
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Message Text (with rich formatting) */}
                      <div className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap break-words prose-star">
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* Source Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#35D7FF]/10">
                          <div className="text-xs font-bold text-[#98A3B8] mb-2 flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-[#35D7FF]" />
                            <span>Sources & Verified Citations:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-[#080D1B]/60 border border-white/5 hover:border-[#35D7FF]/30 text-xs text-[#35D7FF] group transition-all"
                              >
                                <span className="truncate max-w-[90%] font-medium group-hover:underline">
                                  {src.title || src.url}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Bar (Copy, Voice, Regenerate, Timestamp) */}
                      <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-[#98A3B8]/70 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy message"
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Voice Read Aloud Button */}
                          {!isUser && (
                            <button
                              onClick={() => {
                                if (isSpeaking) {
                                  onStopSpeaking();
                                } else {
                                  onSpeakText(msg.text);
                                }
                              }}
                              className="flex items-center gap-1 hover:text-[#35D7FF] transition-colors"
                              title="Listen to response"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{isSpeaking ? 'Stop voice' : 'Listen'}</span>
                            </button>
                          )}

                          {/* Regenerate Response Button */}
                          {!isUser && onRegenerateResponse && (
                            <button
                              onClick={onRegenerateResponse}
                              disabled={isLoading}
                              className="flex items-center gap-1 hover:text-[#8B5CF6] transition-colors disabled:opacity-40"
                              title="Regenerate this response"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>

                        {/* Model & Time */}
                        <div className="flex items-center gap-2">
                          {msg.modelUsed && <span>{msg.modelUsed}</span>}
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Profile Initial */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 mt-1">
                        U
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming / Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center text-xs text-[#35D7FF] animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#35D7FF] to-[#8B5CF6] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#080D1B]" />
                  </div>
                  <span>STAR AI is synthesizing response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer Input Area */}
        <div className="p-4 border-t border-[#35D7FF]/10 bg-[#080D1B]/95 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto">
            {/* Attachment Chips Bar */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/20">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#080D1B] text-xs text-white border border-[#35D7FF]/20"
                  >
                    <span className="truncate max-w-[140px]">{att.name}</span>
                    <button
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-[#98A3B8] hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="relative flex flex-col rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/20 focus-within:border-[#35D7FF]/60 shadow-xl shadow-[#080D1B] transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask STAR AI anything, code something, analyze documents, or speak..."
                rows={1}
                className="w-full bg-transparent px-4 py-3.5 text-sm md:text-base text-[#F5F7FF] placeholder-[#98A3B8]/60 focus:outline-none resize-none min-h-[52px] max-h-40"
              />

              {/* Bottom Tools Toolbar */}
              <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-white/5">
                {/* Multimodal Attachment Tools */}
                <div className="flex items-center gap-1">
                  {/* File Upload (Images, Docs, Audio) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,audio/*,.pdf,.txt,.docx,.js,.ts,.tsx,.json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach image, audio, or document"
                    className="p-2 rounded-lg text-[#98A3B8] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Camera Snapshot */}
                  <button
                    onClick={openCameraModal}
                    title="Take camera snapshot"
                    className="p-2 rounded-lg text-[#98A3B8] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Screen Share Capture */}
                  <button
                    onClick={handleCaptureScreen}
                    title="Capture screen for AI troubleshooting"
                    className="p-2 rounded-lg text-[#98A3B8] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>

                  {/* Web Grounding Quick Toggle */}
                  <button
                    onClick={onToggleSearch}
                    title={enableSearch ? 'Web search enabled' : 'Web search disabled'}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      enableSearch
                        ? 'text-[#35D7FF] bg-[#35D7FF]/15'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Web</span>
                  </button>
                </div>

                {/* Right controls: Mic & Send */}
                <div className="flex items-center gap-2">
                  {/* Microphone Voice Input */}
                  <button
                    onClick={onToggleListening}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                    className={`p-2 rounded-xl transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                        : 'text-[#98A3B8] hover:text-[#35D7FF] hover:bg-white/5'
                    }`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Send / Stop Generation Button */}
                  {isLoading ? (
                    <button
                      onClick={onStopGeneration}
                      title="Stop generating response"
                      className="flex items-center justify-center p-2 rounded-xl font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-all shadow-md shadow-rose-500/20 active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() && attachments.length === 0}
                      className={`flex items-center justify-center p-2 rounded-xl font-bold transition-all ${
                        !inputText.trim() && attachments.length === 0
                          ? 'bg-white/5 text-[#98A3B8]/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] shadow-md shadow-[#35D7FF]/30 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] text-[#98A3B8]/60">
              STAR AI utilizes grounded intelligence. Verify critical medical, financial, or legal decisions.
            </div>
          </div>
        </div>
      </div>

      {/* Optional Docked 3D Avatar Side Panel */}
      {showAvatarInChat && (
        <div className="hidden xl:flex flex-col w-80 border-l border-[#35D7FF]/10 bg-[#080D1B]/95 p-4 items-center justify-between shrink-0">
          <div className="w-full flex items-center justify-between pb-3 border-b border-[#35D7FF]/10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#35D7FF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STAR AVATAR LIVE</span>
            </div>
            <button
              onClick={onToggleAvatarInChat}
              className="text-[#98A3B8] hover:text-white p-1"
              title="Close Avatar Widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-auto flex flex-col items-center">
            <AvatarCanvas
              state={avatarState}
              style={avatarStyle}
              size="medium"
              isSpeaking={isSpeaking}
              isListening={isListening}
              onToggleMic={onToggleListening}
              onToggleSpeech={() => {
                if (isSpeaking) onStopSpeaking();
              }}
              voiceEnabled={voiceEnabled}
              statusMessage={
                isListening
                  ? 'Listening to your voice...'
                  : isSpeaking
                  ? 'Speaking response...'
                  : avatarState === 'THINKING'
                  ? 'Reasoning through answer...'
                  : 'Ready to assist'
              }
            />
          </div>

          <div className="w-full p-3 rounded-xl bg-[#111B35]/60 border border-[#35D7FF]/10 text-xs text-[#98A3B8] text-center">
            <p className="font-semibold text-white">Interactive Digital Human</p>
            <p className="text-[11px] mt-0.5">Procedural lip-sync & expression synthesis</p>
          </div>
        </div>
      )}

      {/* Live Camera Snapshot Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111B35] border border-[#35D7FF]/30 rounded-2xl p-4 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#35D7FF]" />
                <span>Capture Camera Snapshot</span>
              </h3>
              <button onClick={closeCameraModal} className="text-[#98A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={closeCameraModal}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#98A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={captureCameraSnapshot}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#35D7FF] text-[#080D1B] hover:brightness-110"
              >
                Capture Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for lightweight Markdown formatting (headings, code blocks, bold, lists)
function renderFormattedText(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineBreak = part.indexOf('\n');
      const lang = part.slice(3, firstLineBreak).trim() || 'code';
      const code = part.slice(firstLineBreak + 1, -3);

      return (
        <div key={index} className="my-3 rounded-xl overflow-hidden border border-[#35D7FF]/20 bg-[#0B1124]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#111B35]/70 border-b border-white/5 text-xs text-[#35D7FF] font-mono">
            <span>{lang}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="flex items-center gap-1 text-[#98A3B8] hover:text-white text-[11px]"
            >
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-xs font-mono text-emerald-300">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Basic inline code & styling
    return <span key={index}>{part}</span>;
  });
}

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
  ExternalLink,
  Sparkles,
  X,
  FileText,
  FileAudio,
  Globe,
  Square,
  BookOpen,
  Languages
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
  explanationLevel?: 'basic' | 'normal' | 'advanced';
  onSelectExplanationLevel?: (lvl: 'basic' | 'normal' | 'advanced') => void;
  preferredLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
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
  explanationLevel = 'normal',
  onSelectExplanationLevel,
  preferredLanguage = 'en',
  onSelectLanguage,
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
    } catch {
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
      desc: 'Explain how async/await works under the hood in JavaScript with clear examples',
      prompt: 'Explain how asynchronous programming and the event loop work in JavaScript, with a clear step-by-step mental model and visual example.',
    },
    {
      title: 'Tamil to English Practice',
      desc: 'Learn common business conversation phrases with Tamil translations',
      prompt: 'Help me practice English for a job interview. Provide key professional phrases with their Tamil translations and pronunciation tips.',
    },
    {
      title: 'What is HTML & CSS?',
      desc: 'Explain web development fundamentals in simple beginner-friendly English',
      prompt: 'What is HTML? Explain in simple English with a practical beginner-friendly example.',
    },
    {
      title: 'Web Research with Citations',
      desc: 'Search for the latest breakthrough in fusion energy with verified sources',
      prompt: 'Search the web for the latest major breakthroughs and status of commercial nuclear fusion power in 2026. Provide verified facts and citations.',
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden relative bg-slate-50">
      {/* Central Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center py-8">
              <StarLogo size="xl" showText={true} showTagline={true} animated={true} />

              <h2 className="mt-6 text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                How can <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">STAR AI</span> empower you today?
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Experience multimodal intelligence with real-time web grounding, conversational 3D avatar, code sandbox, and multi-step autonomous workflows.
              </p>

              {/* Quick Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl text-left">
                {starterPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p.prompt, [])}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{p.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-2">
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shrink-0 mt-1 shadow-xs">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 md:p-5 shadow-xs transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-sm'
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {/* Attached files preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-[200px]"
                            >
                              {att.type === 'image' ? (
                                <img
                                  src={att.data}
                                  alt={att.name}
                                  className="w-full max-h-36 object-cover"
                                />
                              ) : (
                                <div className="p-2 flex items-center gap-2 text-xs text-slate-700">
                                  {att.type === 'audio' ? (
                                    <FileAudio className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-violet-600" />
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
                        <div className="mb-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                          <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-1">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Grounded with Google Search:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {msg.webSearchQueries.map((q, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-blue-200 text-slate-700"
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
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-blue-600" />
                            <span>Sources & Verified Citations:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-400 text-xs text-blue-600 group transition-all"
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
                      <div className={`mt-3 pt-2 flex items-center justify-between text-[11px] border-t ${
                        isUser ? 'border-white/20 text-white/80' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-3">
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy message"
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
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
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
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
                              className="flex items-center gap-1 hover:text-violet-600 transition-colors disabled:opacity-40"
                              title="Regenerate this response"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>

                        {/* Model & Time */}
                        <div className="flex items-center gap-2">
                          {msg.modelUsed && <span className="font-mono text-[10px]">{msg.modelUsed}</span>}
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
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white shrink-0 mt-1 shadow-xs">
                        U
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming / Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center text-xs text-blue-600 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">STAR AI is synthesizing response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white/95 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto">
            {/* Quick Context Chips Bar: Level & Language Indicators */}
            <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                {onSelectExplanationLevel && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-blue-600" />
                    <span className="font-semibold text-slate-700">Level:</span>
                    <select
                      value={explanationLevel}
                      onChange={(e) => onSelectExplanationLevel(e.target.value as any)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[11px] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="basic">Basic English</option>
                      <option value="normal">Normal English</option>
                      <option value="advanced">Advanced English</option>
                    </select>
                  </div>
                )}

                {onSelectLanguage && (
                  <div className="flex items-center gap-1">
                    <Languages className="w-3 h-3 text-violet-600" />
                    <span className="font-semibold text-slate-700">Language:</span>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => onSelectLanguage(e.target.value)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[11px] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                )}
              </div>

              {onClearConversation && messages.length > 0 && (
                <button
                  onClick={onClearConversation}
                  className="text-slate-400 hover:text-red-500 text-[11px] transition-colors"
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Attachment Chips Bar */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white text-xs text-slate-800 border border-slate-200 shadow-xs"
                  >
                    <span className="truncate max-w-[140px]">{att.name}</span>
                    <button
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="relative flex flex-col rounded-2xl bg-white border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 shadow-sm transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask STAR AI anything, code something, analyze documents, or speak..."
                rows={1}
                className="w-full bg-transparent px-4 py-3.5 text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none min-h-[52px] max-h-40"
              />

              {/* Bottom Tools Toolbar */}
              <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-100">
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
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Camera Snapshot */}
                  <button
                    onClick={openCameraModal}
                    title="Take camera snapshot"
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Screen Share Capture */}
                  <button
                    onClick={handleCaptureScreen}
                    title="Capture screen for AI troubleshooting"
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>

                  {/* Web Grounding Quick Toggle */}
                  <button
                    onClick={onToggleSearch}
                    title={enableSearch ? 'Web search enabled' : 'Web search disabled'}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      enableSearch
                        ? 'text-blue-700 bg-blue-100'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                        : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                    }`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Send / Stop Generation Button */}
                  {isLoading ? (
                    <button
                      onClick={onStopGeneration}
                      title="Stop generating response"
                      className="flex items-center justify-center p-2 rounded-xl font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all shadow-xs active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() && attachments.length === 0}
                      className={`flex items-center justify-center p-2 rounded-xl font-bold transition-all ${
                        !inputText.trim() && attachments.length === 0
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 cursor-pointer'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2 text-center text-[11px] text-slate-400">
              STAR AI utilizes grounded intelligence. Verify critical medical, financial, or legal decisions.
            </div>
          </div>
        </div>
      </div>

      {/* Optional Docked 3D Avatar Side Panel */}
      {showAvatarInChat && (
        <div className="hidden xl:flex flex-col w-80 border-l border-slate-200 bg-white p-4 items-center justify-between shrink-0 shadow-xs">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STAR AVATAR LIVE</span>
            </div>
            <button
              onClick={onToggleAvatarInChat}
              className="text-slate-400 hover:text-slate-700 p-1"
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

          <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
            <p className="font-semibold text-slate-900">Interactive Digital Human</p>
            <p className="text-[11px] mt-0.5 text-slate-500">Procedural lip-sync & expression synthesis</p>
          </div>
        </div>
      )}

      {/* Live Camera Snapshot Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Capture Camera Snapshot</span>
              </h3>
              <button onClick={closeCameraModal} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={closeCameraModal}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={captureCameraSnapshot}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
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

// Helper for clean Markdown formatting (headings, code blocks, bold, lists)
function renderFormattedText(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineBreak = part.indexOf('\n');
      const lang = part.slice(3, firstLineBreak).trim() || 'code';
      const code = part.slice(firstLineBreak + 1, -3);

      return (
        <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-xs text-blue-400 font-mono">
            <span>{lang}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="flex items-center gap-1 text-slate-300 hover:text-white text-[11px]"
            >
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-xs font-mono text-emerald-400">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Basic inline formatting
    return <span key={index}>{part}</span>;
  });
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  WorkspaceId,
  ChatMessage,
  Conversation,
  AvatarState,
  AvatarStyle,
  UserProfile,
  Attachment
} from './types';
import { StarApi } from './services/api';

// Components
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { AvatarLiveWorkspace } from './components/AvatarLiveWorkspace';
import { ResearchWorkspace } from './components/ResearchWorkspace';
import { TeacherWorkspace } from './components/TeacherWorkspace';
import { DeveloperWorkspace } from './components/DeveloperWorkspace';
import { AppBuilderWorkspace } from './components/AppBuilderWorkspace';
import { ImageStudioWorkspace } from './components/ImageStudioWorkspace';
import { VideoStudioWorkspace } from './components/VideoStudioWorkspace';
import { NotesWorkspace } from './components/NotesWorkspace';
import { AgentTasksWorkspace } from './components/AgentTasksWorkspace';
import { SupportWorkspace } from './components/SupportWorkspace';
import { AdminWorkspace } from './components/AdminWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation & Workspace State
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceId>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Model & Search Grounding
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [enableSearch, setEnableSearch] = useState(false);
  const [explanationLevel, setExplanationLevel] = useState<'basic' | 'normal' | 'advanced'>('normal');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // Avatar Configuration & State
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('3d-human');
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [showAvatarInChat, setShowAvatarInChat] = useState(true);

  // Voice & Audio
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastUserSpeech, setLastUserSpeech] = useState('');
  const [lastAiResponse, setLastAiResponse] = useState('');

  // Gamification (Daily Streak & Mastery Points)
  const [streakDays, setStreakDays] = useState(7);
  const [learningPoints, setLearningPoints] = useState(380);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('star_ai_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'usr-default',
      name: 'Commander',
      email: 'commander@starai.dev',
      role: 'developer',
      avatarStyle: '3d-human',
      preferredVoice: 'default',
      speechSpeed: 1.0,
      autoSpeak: true,
      theme: 'dark',
      streakDays: 7,
      learningPoints: 380,
    };
  });

  // Conversations Storage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('star_ai_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'conv-1',
        title: 'STAR Multimodal Capabilities',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000,
        pinned: true,
        messages: [
          {
            id: 'm1',
            role: 'assistant',
            text: 'Greetings! I am STAR AI, your intelligent multimodal assistant. I am equipped with real-time web research, code generation in live sandboxes, personalized bilingual tutoring, visual image & video direction, and autonomous task workflows. How can I assist your discoveries today?',
            timestamp: Date.now() - 3600000,
            modelUsed: 'gemini-3.1-flash-lite',
          },
        ],
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0]?.id || 'conv-1'
  );
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Recognition and request abort refs
  const speechRecognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem('star_ai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Persist user
  useEffect(() => {
    localStorage.setItem('star_ai_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Voice Synthesis helper
  const handleSpeakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .slice(0, 500); // limit spoken snippet length for responsiveness

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setAvatarState('SPEAKING');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarState('IDLE');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setAvatarState('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAvatarState('IDLE');
  };

  // Web Speech Recognition setup
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      setAvatarState('IDLE');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setAvatarState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setLastUserSpeech(transcript);
        setIsListening(false);
        handleSendMessage(transcript, []);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAvatarState('IDLE');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (avatarState === 'LISTENING') setAvatarState('IDLE');
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsListening(false);
      setAvatarState('IDLE');
    }
  };

  // Stop active AI generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsChatLoading(false);
    setAvatarState('IDLE');
  };

  // Main Chat Send Handler
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (!text && attachments.length === 0) return;
    if (isChatLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text,
      timestamp: Date.now(),
      attachments,
    };

    // Append to current conversation
    const updatedMessages = [...(activeConversation?.messages || []), userMessage];
    const updatedTitle =
      activeConversation?.messages.length === 0
        ? text.slice(0, 36) + '...'
        : activeConversation?.title || 'Chat';

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, title: updatedTitle, messages: updatedMessages, updatedAt: Date.now() }
          : c
      )
    );

    setIsChatLoading(true);
    setAvatarState('THINKING');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await StarApi.sendChat({
        messages: updatedMessages.slice(-8), // Send last turns for multi-turn context
        prompt: text,
        model: selectedModel,
        enableSearch,
        attachments,
        explanationLevel,
        preferredLanguage,
        signal: controller.signal,
      });

      const assistantMessage: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        text: data.text || 'STAR AI has processed your request.',
        timestamp: Date.now(),
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        modelUsed: selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...updatedMessages, assistantMessage], updatedAt: Date.now() }
            : c
        )
      );

      setLastAiResponse(assistantMessage.text);
      setAvatarState('IDLE');

      // Auto read if enabled
      if (autoSpeak) {
        handleSpeakText(assistantMessage.text);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setAvatarState('IDLE');
        return;
      }
      console.error('Chat generation error:', err);
      setAvatarState('ERROR');
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        text: `⚠️ Notice: ${err.message || 'Unable to connect to STAR AI intelligence model.'}`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...updatedMessages, errorMessage], updatedAt: Date.now() }
            : c
        )
      );
      setTimeout(() => setAvatarState('IDLE'), 3000);
    } finally {
      setIsChatLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response or retry failed prompt
  const handleRegenerateResponse = async () => {
    if (isChatLoading) return;
    const currentMessages = activeConversation?.messages || [];
    if (currentMessages.length === 0) return;

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const lastUserMsg = currentMessages[lastUserIndex];
    // Keep messages up to the user message
    const prunedMessages = currentMessages.slice(0, lastUserIndex + 1);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: prunedMessages, updatedAt: Date.now() }
          : c
      )
    );

    setIsChatLoading(true);
    setAvatarState('THINKING');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await StarApi.sendChat({
        messages: prunedMessages.slice(-8),
        prompt: lastUserMsg.text,
        model: selectedModel,
        enableSearch,
        attachments: lastUserMsg.attachments || [],
        explanationLevel,
        preferredLanguage,
        signal: controller.signal,
      });

      const assistantMessage: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        text: data.text || 'STAR AI has processed your request.',
        timestamp: Date.now(),
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        modelUsed: selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...prunedMessages, assistantMessage], updatedAt: Date.now() }
            : c
        )
      );

      setLastAiResponse(assistantMessage.text);
      setAvatarState('IDLE');

      if (autoSpeak) {
        handleSpeakText(assistantMessage.text);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setAvatarState('IDLE');
        return;
      }
      setAvatarState('ERROR');
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        text: `⚠️ Notice: ${err.message || 'Unable to connect to STAR AI intelligence model.'}`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...prunedMessages, errorMessage], updatedAt: Date.now() }
            : c
        )
      );
      setTimeout(() => setAvatarState('IDLE'), 3000);
    } finally {
      setIsChatLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Clear messages inside the active conversation
  const handleClearConversation = () => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [], updatedAt: Date.now() }
          : c
      )
    );
  };

  // Conversation Management Handlers
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setCurrentWorkspace('chat');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) setActiveConversationId(remaining[0].id);
      else handleNewChat();
    }
  };

  const handleTogglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleClearAllHistory = () => {
    setConversations([]);
    handleNewChat();
  };

  const handleAddPoints = (pts: number) => {
    setLearningPoints((prev) => prev + pts);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Subtle Ambient Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      {/* Main Sidebar Navigation */}
      <div className="relative z-20 flex">
        <Sidebar
          currentWorkspace={currentWorkspace}
          onSelectWorkspace={(id) => {
            setCurrentWorkspace(id);
            setMobileSidebarOpen(false);
          }}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setMobileSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onTogglePinConversation={handleTogglePinConversation}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          userName={currentUser.name}
          userRole={currentUser.role}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main App Workspace Stage */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Universal TopBar */}
        <TopBar
          currentWorkspace={currentWorkspace}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          explanationLevel={explanationLevel}
          onSelectExplanationLevel={setExplanationLevel}
          preferredLanguage={preferredLanguage}
          onSelectLanguage={setPreferredLanguage}
          enableSearch={enableSearch}
          onToggleSearch={() => setEnableSearch(!enableSearch)}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => {
            if (voiceEnabled) handleStopSpeaking();
            setVoiceEnabled(!voiceEnabled);
          }}
          showAvatarInChat={showAvatarInChat}
          onToggleAvatarInChat={() => setShowAvatarInChat(!showAvatarInChat)}
          streakDays={streakDays}
          learningPoints={learningPoints}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Workspace Router */}
        <main className="flex-1 flex overflow-hidden">
          {currentWorkspace === 'chat' && (
            <ChatWorkspace
              messages={activeConversation?.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              avatarState={avatarState}
              avatarStyle={avatarStyle}
              showAvatarInChat={showAvatarInChat}
              onToggleAvatarInChat={() => setShowAvatarInChat(!showAvatarInChat)}
              voiceEnabled={voiceEnabled}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              isSpeaking={isSpeaking}
              isListening={isListening}
              onToggleListening={toggleListening}
              enableSearch={enableSearch}
              onToggleSearch={() => setEnableSearch(!enableSearch)}
              selectedModel={selectedModel}
              explanationLevel={explanationLevel}
              onSelectExplanationLevel={setExplanationLevel}
              preferredLanguage={preferredLanguage}
              onSelectLanguage={setPreferredLanguage}
              onStopGeneration={handleStopGeneration}
              onRegenerateResponse={handleRegenerateResponse}
              onClearConversation={handleClearConversation}
            />
          )}

          {currentWorkspace === 'avatar-live' && (
            <AvatarLiveWorkspace
              avatarState={avatarState}
              avatarStyle={avatarStyle}
              onChangeAvatarStyle={setAvatarStyle}
              isListening={isListening}
              onToggleListening={toggleListening}
              isSpeaking={isSpeaking}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => {
                if (voiceEnabled) handleStopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }}
              onSendVoiceMessage={(prompt) => handleSendMessage(prompt, [])}
              lastUserSpeech={lastUserSpeech}
              lastAiResponse={lastAiResponse}
            />
          )}

          {currentWorkspace === 'research' && <ResearchWorkspace />}

          {currentWorkspace === 'teacher' && (
            <TeacherWorkspace
              streakDays={streakDays}
              learningPoints={learningPoints}
              onAddPoints={handleAddPoints}
              onSpeakText={handleSpeakText}
            />
          )}

          {currentWorkspace === 'developer' && <DeveloperWorkspace />}

          {currentWorkspace === 'app-builder' && <AppBuilderWorkspace />}

          {currentWorkspace === 'image-studio' && <ImageStudioWorkspace />}

          {currentWorkspace === 'video-studio' && <VideoStudioWorkspace />}

          {currentWorkspace === 'notes' && <NotesWorkspace />}

          {currentWorkspace === 'tasks' && <AgentTasksWorkspace />}

          {currentWorkspace === 'support' && <SupportWorkspace />}

          {currentWorkspace === 'admin' && (
            <AdminWorkspace
              currentUserRole={currentUser.role}
              onOpenAuth={() => setAuthOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        avatarStyle={avatarStyle}
        onChangeAvatarStyle={setAvatarStyle}
        voiceSpeed={voiceSpeed}
        onChangeVoiceSpeed={setVoiceSpeed}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
      />
    </div>
  );
}

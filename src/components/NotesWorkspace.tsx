import React, { useState, useEffect } from 'react';
import { NoteItem } from '../types';
import { StarApi } from '../services/api';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  CheckCircle2,
  RotateCw
} from 'lucide-react';

export const NotesWorkspace: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('star_ai_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'note-1',
        title: 'STAR AI System Architecture',
        content: `# STAR AI Architecture Overview\n\nSTAR AI is a complete multimodal platform featuring:\n- **Visual Human Avatar**: Procedural 3D canvas with facial rigging and lip-synchronization.\n- **Google Search Grounding**: Real-time web fact checking and source citation extraction.\n- **STAR Teacher**: Bilingual tutoring with Tamil-to-English translation and adaptive quizzes.\n- **Developer Sandbox**: Isolated iframe preview with full-stack code generators.\n- **Autonomous Agent**: Multi-step decomposition with verified user approval gates.\n\n*Created on October 2026 for high-speed intelligence.*`,
        tags: ['architecture', 'star-ai', 'overview'],
        folder: 'System',
        pinned: true,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 3600000,
      },
      {
        id: 'note-2',
        title: 'Meeting Notes: Q4 Intelligent Agents',
        content: `### Executive Action Items:\n1. Complete benchmark testing for low-latency voice synthesis.\n2. Verify all external Google Search grounding citations.\n3. Integrate offline note caching for progressive web applications.\n4. Deliver autonomous multi-task planner with human-in-the-loop approvals.`,
        tags: ['meeting', 'action-items'],
        folder: 'Work',
        pinned: false,
        createdAt: Date.now() - 40000000,
        updatedAt: Date.now() - 40000000,
      },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [aiLoading, setAiLoading] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  useEffect(() => {
    localStorage.setItem('star_ai_notes', JSON.stringify(notes));
  }, [notes]);

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    setSaveStatus('saving');
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, [field]: value, updatedAt: Date.now() } : n))
    );
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      content: '',
      tags: ['general'],
      folder: 'General',
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      if (remaining.length > 0) setActiveNoteId(remaining[0].id);
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // AI Document Helpers
  const handleAiAction = async (action: 'summarize' | 'expand' | 'fix_grammar') => {
    if (!activeNote || !activeNote.content.trim() || aiLoading) return;
    setAiLoading(true);

    let prompt = '';
    if (action === 'summarize') prompt = `Summarize this document into 3 key takeaways and an executive briefing:\n\n${activeNote.content}`;
    else if (action === 'expand') prompt = `Expand this document with detailed explanations, practical examples, and clear section headings:\n\n${activeNote.content}`;
    else if (action === 'fix_grammar') prompt = `Proofread, enhance vocabulary, and polish the grammar of this document while maintaining tone:\n\n${activeNote.content}`;

    try {
      const data = await StarApi.sendChat({
        prompt,
        systemInstruction: 'You are STAR NOTES AI editor. Return clean, beautifully formatted markdown document content.'
      });
      if (data.text) {
        handleUpdateNote('content', activeNote.content + '\n\n---\n\n' + data.text);
      }
    } catch {
      alert('AI note action failed. Please check connection.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = (format: 'markdown' | 'txt') => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, '_')}.${format === 'markdown' ? 'md' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full bg-slate-50 overflow-hidden">
      {/* Left Notes List Sidebar */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0 shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>STAR Notes</span>
          </div>
          <button
            onClick={handleCreateNote}
            className="p-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
            title="New Note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Notes Scroll */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map((note) => {
            const isSelected = activeNote?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`group p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {note.pinned && <Pin className="w-3 h-3 text-blue-600 shrink-0" />}
                    <span className="truncate">{note.title || 'Untitled'}</span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note.id);
                      }}
                      className="p-0.5 hover:text-blue-600"
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-0.5 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {note.content ? note.content.replace(/#+/g, '').trim() : 'Empty note'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Note Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {/* Editor Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                placeholder="Note Title..."
                className="text-lg md:text-xl font-extrabold text-slate-900 bg-transparent outline-none w-full border-b border-transparent focus:border-blue-500"
              />
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved locally'}</span>
              </span>

              {/* AI Assistant Menu */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleAiAction('summarize')}
                  disabled={aiLoading}
                  className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  AI Summarize
                </button>
                <button
                  onClick={() => handleAiAction('expand')}
                  disabled={aiLoading}
                  className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-violet-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  AI Expand
                </button>
                <button
                  onClick={() => handleAiAction('fix_grammar')}
                  disabled={aiLoading}
                  className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Polish
                </button>
              </div>

              {/* Export */}
              <button
                onClick={() => handleExport('markdown')}
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Download as Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Editor Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <textarea
              value={activeNote.content}
              onChange={(e) => handleUpdateNote('content', e.target.value)}
              placeholder="Start drafting your document in Markdown..."
              className="w-full h-full bg-transparent text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-mono leading-relaxed"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          Select or create a note to begin.
        </div>
      )}
    </div>
  );
};

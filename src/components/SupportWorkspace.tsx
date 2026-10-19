import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { SupportTicket } from '../types';
import {
  HelpCircle,
  MessageSquare,
  Search,
  Ticket,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCw
} from 'lucide-react';

export const SupportWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'status'>('faq');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Ticket Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('normal');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  // Ticket history
  const [ticketHistory, setTicketHistory] = useState<SupportTicket[]>([
    {
      id: 'STAR-849201',
      subject: 'Google Search grounding latency query',
      category: 'Performance',
      priority: 'normal',
      status: 'Resolved by STAR AI Care',
      createdAt: '2026-10-18T14:20:00Z',
      userEmail: 'explorer@starai.dev',
      estimatedResolution: 'Completed',
    },
  ]);

  const faqs = [
    {
      q: 'How does STAR AI guarantee verified sources during Web Research?',
      a: 'STAR AI connects directly to Google Search Grounding through the official @google/genai SDK. Every research claim is verified against indexed web pages, with citations containing official source URLs, dates, and titles.',
    },
    {
      q: 'Can STAR Teacher explain concepts in Tamil as well as English?',
      a: 'Yes! STAR Teacher contains specialized bilingual modes that provide step-by-step explanations, technical terminology transliteration, and conversational English practice specifically tailored for Tamil speakers.',
    },
    {
      q: 'How does the 3D Digital Human Avatar work?',
      a: 'The STAR Avatar uses procedural canvas rigging with facial tracking, natural blinking, emotional expressions, and lip-sync flaps coordinated with Web Speech Synthesis audio.',
    },
    {
      q: 'Are my uploaded files, camera photos, and documents kept private?',
      a: 'Yes. Uploaded files and camera frames are processed directly through your private session and are never broadcast or shared publicly.',
    },
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const data = await StarApi.submitTicket({
        subject,
        category,
        priority,
        message,
        userEmail: userEmail || 'user@starai.dev',
      });
      setCreatedTicket(data.ticket);
      setTicketHistory((prev) => [data.ticket, ...prev]);
      setActiveTab('status');
      setSubject('');
      setMessage('');
    } catch (err) {
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>STAR CUSTOMER CARE & HELP CENTER</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            How can our support team assist you?
          </h2>
          <p className="text-xs text-[#98A3B8]">
            Search knowledge base, submit verified support tickets, or read troubleshooting guides.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-center gap-2 p-1 bg-[#111B35] rounded-xl max-w-md mx-auto border border-[#35D7FF]/20">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B]'
                : 'text-[#98A3B8] hover:text-white'
            }`}
          >
            FAQ & Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ticket'
                ? 'bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B]'
                : 'text-[#98A3B8] hover:text-white'
            }`}
          >
            Create Ticket
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'status'
                ? 'bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B]'
                : 'text-[#98A3B8] hover:text-white'
            }`}
          >
            Ticket History ({ticketHistory.length})
          </button>
        </div>

        {/* TAB 1: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#35D7FF]" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search common questions, tutorials, or troubleshooting..."
                className="w-full bg-[#111B35]/80 border border-[#35D7FF]/20 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
              />
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => {
                const isOpen = expandedFaq === i;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#111B35]/70 border border-[#35D7FF]/15 transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between text-left text-xs md:text-sm font-bold text-white hover:text-[#35D7FF] transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#35D7FF]" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs text-[#98A3B8] leading-relaxed border-t border-white/5 pt-2">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Create Ticket */}
        {activeTab === 'ticket' && (
          <form
            onSubmit={handleTicketSubmit}
            className="p-6 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-bold text-white">Open a Support Request</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#98A3B8]">Your Contact Email:</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs text-white placeholder-[#98A3B8]/50 focus:outline-none focus:border-[#35D7FF]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#98A3B8]">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="AI Integration & API">AI Integration & API</option>
                  <option value="Teacher / Education Feature">Teacher / Education Feature</option>
                  <option value="Billing & Subscription">Billing & Subscription</option>
                  <option value="Security & Privacy">Security & Privacy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#98A3B8]">Priority:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#98A3B8]">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question or issue..."
                className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs text-white placeholder-[#98A3B8]/50 focus:outline-none focus:border-[#35D7FF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#98A3B8]">Detailed Description:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Provide steps to reproduce or details regarding your inquiry..."
                className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#98A3B8]/50 focus:outline-none focus:border-[#35D7FF] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!subject.trim() || !message.trim() || isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket to Care Center</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Ticket Status */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Your Support Inquiries
            </h3>
            <div className="space-y-3">
              {ticketHistory.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/15 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#35D7FF]">{t.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{t.subject}</div>
                  <div className="flex items-center gap-3 text-[11px] text-[#98A3B8]">
                    <span>Category: {t.category}</span>
                    <span>·</span>
                    <span>Priority: {t.priority.toUpperCase()}</span>
                    <span>·</span>
                    <span>ETA: {t.estimatedResolution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

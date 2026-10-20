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
    } catch {
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>STAR AI CUSTOMER CARE & SUPPORT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Knowledge Base, FAQs & Concierge Care
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Find immediate answers to technical questions, report feedback, or open an official ticket with the STAR AI Engineering Team.
          </p>
        </div>

        {/* Subtabs Header */}
        <div className="flex items-center justify-center gap-1 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ticket'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Support Request</span>
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Tickets ({ticketHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: FAQ Search & Accordion */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search questions about avatar, search grounding, tutoring, or developer mode..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs md:text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Support Ticket Submission */}
        {activeTab === 'ticket' && (
          <form
            onSubmit={handleTicketSubmit}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Open a Support Request</h3>
            <p className="text-xs text-slate-500">
              Our engineering team responds to priority inquiries promptly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of request..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Your Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="AI Output Quality">AI Output Quality</option>
                  <option value="Billing & Quota">Billing & Quota</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none cursor-pointer"
                >
                  <option value="low">Low (General Feedback)</option>
                  <option value="normal">Normal (Standard)</option>
                  <option value="high">High (Urgent Disruption)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Detailed Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Ticket Status List */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {createdTicket && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ticket #{createdTicket.id} received. Our care team is reviewing it.</span>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active & Past Support Inquiries
              </h3>

              <div className="space-y-3">
                {ticketHistory.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{t.id}</span>
                        <span className="text-xs font-semibold text-slate-900">{t.subject}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Category: {t.category} · Priority: {t.priority} · {t.userEmail}
                      </div>
                    </div>
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

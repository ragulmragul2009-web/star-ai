import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { TeacherLesson, QuizQuestion, Flashcard } from '../types';
import {
  GraduationCap,
  BookOpen,
  Languages,
  Code,
  Calculator,
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Flame,
  Award,
  ChevronRight,
  ChevronLeft,
  Volume2
} from 'lucide-react';

interface TeacherWorkspaceProps {
  streakDays: number;
  learningPoints: number;
  onAddPoints: (pts: number) => void;
  onSpeakText: (text: string) => void;
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
  streakDays,
  learningPoints,
  onAddPoints,
  onSpeakText,
}) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [mode, setMode] = useState<string>('explain_step_by_step');
  const [languageSupport, setLanguageSupport] = useState<'none' | 'tamil_to_english'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<TeacherLesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active sub-tab in lesson view
  const [activeTab, setActiveTab] = useState<'explanation' | 'quiz' | 'flashcards' | 'practice'>('explanation');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcard index
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  const curriculumPresets = [
    {
      title: 'Tamil to English: Tech Interview',
      topic: 'How to introduce yourself and describe software projects in English for IT interviews',
      level: 'intermediate' as const,
      lang: 'tamil_to_english' as const,
    },
    {
      title: 'Python: Data Structures',
      topic: 'Lists, Dictionaries, and Sets in Python with real-world examples',
      level: 'beginner' as const,
      lang: 'none' as const,
    },
    {
      title: 'Math: Calculus Intuition',
      topic: 'Intuitive visual explanation of Derivatives and Rates of Change',
      level: 'intermediate' as const,
      lang: 'none' as const,
    },
    {
      title: 'Tamil to English: Daily Conversational Fluency',
      topic: 'Mastering everyday conversational English, greetings, and polite requests',
      level: 'beginner' as const,
      lang: 'tamil_to_english' as const,
    },
  ];

  const handleGenerateLesson = async (presetTopic?: string, presetLang?: 'none' | 'tamil_to_english', presetLevel?: any) => {
    const finalTopic = presetTopic || topic;
    const finalLang = presetLang || languageSupport;
    const finalLevel = presetLevel || level;

    if (!finalTopic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentCardIdx(0);
    setCardFlipped(false);
    setActiveTab('explanation');

    try {
      const data = await StarApi.generateLesson(finalTopic.trim(), finalLevel, mode, finalLang);
      setLesson(data.lesson);
      // Award bonus points for starting a new lesson
      onAddPoints(10);
    } catch (err: any) {
      setError(err.message || 'Failed to generate personalized lesson.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!lesson?.quiz) return;
    setQuizSubmitted(true);

    let correctCount = 0;
    lesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const earned = correctCount * 15;
    if (earned > 0) {
      onAddPoints(earned);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#35D7FF]/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF] mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>STAR PERSONAL AI TUTOR</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Adaptive Mastery & Bilingual Learning
            </h2>
            <p className="text-xs text-[#98A3B8]">
              Step-by-step guidance, English & Tamil-to-English fluency, interactive flashcards, and quizzes.
            </p>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111B35] border border-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
              <div>
                <div className="text-xs font-bold">{streakDays} Day Streak</div>
                <div className="text-[10px] text-[#98A3B8]">Daily habit</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111B35] border border-[#35D7FF]/20 text-[#35D7FF]">
              <Award className="w-5 h-5" />
              <div>
                <div className="text-xs font-bold">{learningPoints} XP</div>
                <div className="text-[10px] text-[#98A3B8]">Mastery points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="p-5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-4 shadow-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              What would you like to master today?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. React hooks & useEffect, or English job interview questions, or Linear Algebra..."
                className="flex-1 bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
              />
              <button
                onClick={() => handleGenerateLesson()}
                disabled={!topic.trim() || isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Teaching...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Create Lesson</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Configuration Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
            {/* Student Level */}
            <div className="flex items-center gap-2 text-[#98A3B8]">
              <span>Level:</span>
              <div className="flex bg-[#080D1B] p-0.5 rounded-lg border border-white/10">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`px-2.5 py-1 rounded capitalize font-medium ${
                      level === lvl ? 'bg-[#35D7FF] text-[#080D1B] font-bold' : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamil-to-English Support Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[#98A3B8]">Language Support:</span>
              <button
                type="button"
                onClick={() =>
                  setLanguageSupport(languageSupport === 'tamil_to_english' ? 'none' : 'tamil_to_english')
                }
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold transition-all ${
                  languageSupport === 'tamil_to_english'
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[#080D1B] border-white/10 text-[#98A3B8] hover:text-white'
                }`}
              >
                <Languages className="w-3.5 h-3.5 text-[#35D7FF]" />
                <span>Tamil ⇄ English Assistance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Curriculum Presets */}
        {!lesson && !isLoading && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#98A3B8] uppercase tracking-wider">
              Curated Learning Pathways:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {curriculumPresets.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setTopic(preset.topic);
                    setLanguageSupport(preset.lang);
                    setLevel(preset.level);
                    handleGenerateLesson(preset.topic, preset.lang, preset.level);
                  }}
                  className="p-4 rounded-xl bg-[#111B35]/60 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] cursor-pointer transition-all group shadow-md"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#35D7FF] mb-1">
                    <span>{preset.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#98A3B8] uppercase">
                      {preset.level}
                    </span>
                  </div>
                  <p className="text-xs text-[#98A3B8] group-hover:text-white transition-colors">
                    {preset.topic}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Lesson View */}
        {lesson && !isLoading && (
          <div className="space-y-6">
            {/* Tab navigation */}
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#111B35] border border-[#35D7FF]/20">
              <div className="flex items-center gap-1">
                {[
                  { id: 'explanation', label: '1. Lesson & Concepts' },
                  { id: 'flashcards', label: `2. Flashcards (${lesson.flashcards?.length || 0})` },
                  { id: 'quiz', label: `3. Practice Quiz (${lesson.quiz?.length || 0})` },
                  { id: 'practice', label: '4. Hands-on Challenge' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] shadow-md'
                        : 'text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onSpeakText(`${lesson.title}. ${lesson.summary}`)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#35D7FF] hover:bg-white/5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Read</span>
              </button>
            </div>

            {/* TAB 1: Explanation */}
            {activeTab === 'explanation' && (
              <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/20 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{lesson.title}</h3>
                  <p className="text-sm text-[#35D7FF] mt-1 font-medium">{lesson.summary}</p>
                </div>

                {/* Main Explanation Body */}
                <div className="text-sm md:text-base leading-relaxed text-[#F5F7FF] whitespace-pre-wrap font-sans border-t border-white/5 pt-4">
                  {lesson.explanation}
                </div>

                {/* Key Examples */}
                {lesson.examples && lesson.examples.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#35D7FF]">
                      Real-Life Examples & Context
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {lesson.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-[#080D1B]/80 border border-white/5 space-y-1"
                        >
                          <div className="text-xs font-bold text-white">{ex.title}</div>
                          <p className="text-xs text-[#98A3B8]">{ex.content}</p>
                          {ex.tamilNote && (
                            <div className="text-xs text-amber-300 font-medium bg-amber-500/10 p-2 rounded-lg mt-2">
                              💡 தமிழ் விளக்கம் (Tamil Note): {ex.tamilNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary & Pronunciation */}
                {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
                      Vocabulary & Pronunciation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lesson.vocabulary.map((v, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-[#080D1B]/70 border border-white/5"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#35D7FF]">
                            <span>{v.term}</span>
                            {v.pronunciation && (
                              <span className="font-mono text-[10px] text-[#98A3B8]">
                                [{v.pronunciation}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#98A3B8] mt-1">{v.definition}</p>
                          {v.tamilTranslation && (
                            <div className="text-xs text-emerald-400 mt-1 font-medium">
                              தமிழ்: {v.tamilTranslation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Flashcards */}
            {activeTab === 'flashcards' && lesson.flashcards && lesson.flashcards.length > 0 && (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/20 space-y-6">
                <div className="text-xs text-[#98A3B8] font-semibold">
                  Card {currentCardIdx + 1} of {lesson.flashcards.length} · Tap to flip
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="w-full max-w-md h-64 rounded-2xl p-6 bg-gradient-to-br from-[#1E293B] to-[#0A1024] border border-[#35D7FF]/40 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#35D7FF] transition-all select-none"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#35D7FF] mb-2">
                    {cardFlipped ? 'Answer' : 'Question / Concept'}
                  </div>
                  <div className="text-base md:text-lg font-semibold text-white">
                    {cardFlipped
                      ? lesson.flashcards[currentCardIdx].back
                      : lesson.flashcards[currentCardIdx].front}
                  </div>
                </div>

                {/* Flashcard Nav controls */}
                <div className="flex items-center gap-4">
                  <button
                    disabled={currentCardIdx === 0}
                    onClick={() => {
                      setCurrentCardIdx((prev) => Math.max(0, prev - 1));
                      setCardFlipped(false);
                    }}
                    className="p-2 rounded-xl bg-[#080D1B] border border-white/10 text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="px-4 py-2 rounded-xl bg-[#35D7FF] text-[#080D1B] font-bold text-xs"
                  >
                    Flip Card
                  </button>
                  <button
                    disabled={currentCardIdx === lesson.flashcards.length - 1}
                    onClick={() => {
                      setCurrentCardIdx((prev) => Math.min(lesson.flashcards.length - 1, prev + 1));
                      setCardFlipped(false);
                    }}
                    className="p-2 rounded-xl bg-[#080D1B] border border-white/10 text-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Quiz */}
            {activeTab === 'quiz' && lesson.quiz && (
              <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/20 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-base font-bold text-white">Knowledge Check Quiz</h3>
                  <span className="text-xs text-[#35D7FF] font-semibold">+15 XP per correct answer</span>
                </div>

                <div className="space-y-6">
                  {lesson.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 p-4 rounded-xl bg-[#080D1B]/60 border border-white/5">
                      <div className="text-sm font-semibold text-white">
                        {qIdx + 1}. {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let btnStyle = 'bg-[#111B35] text-[#98A3B8] border-white/5 hover:border-[#35D7FF]/30';
                          if (isSelected) {
                            btnStyle = 'bg-[#35D7FF]/20 text-[#35D7FF] border-[#35D7FF] font-semibold';
                          }
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500 line-through';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-[#111B35] text-xs text-[#98A3B8] border border-white/5 mt-2">
                          <span className="font-bold text-white">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-extrabold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Submit Quiz & Claim Points
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: Practice Exercise */}
            {activeTab === 'practice' && (
              <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/20 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#35D7FF]" />
                  <span>Hands-on Application Exercise</span>
                </h3>
                <p className="text-sm text-[#F5F7FF] leading-relaxed">
                  {lesson.practiceExercise}
                </p>
                <div className="p-4 rounded-xl bg-[#080D1B] border border-emerald-500/20 text-xs text-emerald-400">
                  Tip: Paste your attempt or code into STAR Chat to receive immediate interactive evaluation and feedback.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { TeacherLesson } from '../types';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Flame,
  Award,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Send,
  MessageSquare,
  Code,
  Check
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
  const [activeTab, setActiveTab] = useState<'explanation' | 'quiz' | 'flashcards' | 'practice' | 'followup'>('explanation');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcard state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Practice solution evaluation state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Follow-up question state
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [isAnsweringFollowup, setIsAnsweringFollowup] = useState(false);
  const [followupAnswers, setFollowupAnswers] = useState<{ q: string; a: string }[]>([]);

  const subjectPills = [
    { label: 'English Learning', topic: 'Conversational English and Business Vocabulary with Tamil Translation', lang: 'tamil_to_english' as const },
    { label: 'Mathematics', topic: 'Calculus: Derivatives, Integrals and Real-World Rate of Change', lang: 'none' as const },
    { label: 'Science', topic: 'Physics of Quantum Mechanics and Wave-Particle Duality', lang: 'none' as const },
    { label: 'Computer Science', topic: 'Algorithms: Big O Notation and Binary Search Trees', lang: 'none' as const },
    { label: 'HTML & CSS', topic: 'Semantic HTML5 and Modern CSS Flexbox & Grid with Code Examples', lang: 'none' as const },
    { label: 'JavaScript', topic: 'Asynchronous JavaScript: Promises, Async/Await and Event Loop', lang: 'none' as const },
    { label: 'Python', topic: 'Python Object-Oriented Programming and Practical Data Structures', lang: 'none' as const },
    { label: 'Web Development', topic: 'Full-Stack Web Architecture: REST APIs, Frontend State and PostgreSQL', lang: 'none' as const },
    { label: 'AI & Prompting', topic: 'Prompt Engineering Strategies for LLMs with Practical Examples', lang: 'none' as const },
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
    setEvaluationResult(null);
    setStudentAnswer('');
    setFollowupAnswers([]);
    setActiveTab('explanation');

    try {
      const data = await StarApi.generateLesson(finalTopic.trim(), finalLevel, mode, finalLang);
      setLesson(data.lesson);
      onAddPoints(15);
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

  // Evaluate practice solution
  const handleSubmitPracticeSolution = async () => {
    if (!studentAnswer.trim() || !lesson || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await StarApi.evaluateAnswer({
        lessonTopic: lesson.title,
        practiceExercise: lesson.practiceExercise,
        studentAnswer: studentAnswer.trim(),
        level,
      });
      setEvaluationResult(res.evaluation);
      if (res.evaluation.pointsAwarded) {
        onAddPoints(res.evaluation.pointsAwarded);
      }
    } catch (err: any) {
      alert(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Follow-up question submission
  const handleAskFollowup = async () => {
    if (!followupQuestion.trim() || !lesson || isAnsweringFollowup) return;
    const q = followupQuestion.trim();
    setIsAnsweringFollowup(true);
    try {
      const res = await StarApi.askTeacherFollowup({
        lessonTopic: lesson.title,
        lessonSummary: lesson.summary,
        question: q,
      });
      setFollowupAnswers((prev) => [...prev, { q, a: res.answer }]);
      setFollowupQuestion('');
    } catch (err: any) {
      alert(err.message || 'Failed to get answer. Please try again.');
    } finally {
      setIsAnsweringFollowup(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>STAR PERSONAL AI TUTOR</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Interactive Learning & Mastery Mode
            </h2>
            <p className="text-xs text-slate-500">
              Personalized lessons, step-by-step code analysis, bilingual Tamil & English practice, quizzes, and live solution evaluation.
            </p>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streakDays} Day Streak</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Award className="w-4 h-4 text-blue-600" />
              <span>{learningPoints} Mastery XP</span>
            </div>
          </div>
        </div>

        {/* Lesson Generator Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enter Lesson Topic or Select a Subject:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Asynchronous JavaScript, Tamil to English job interview practice, Python data structures..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <button
                onClick={() => handleGenerateLesson()}
                disabled={!topic.trim() || isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Lesson...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Start Lesson</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">Popular Subjects:</span>
            <div className="flex flex-wrap gap-1.5">
              {subjectPills.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(sub.topic);
                    setLanguageSupport(sub.lang);
                    handleGenerateLesson(sub.topic, sub.lang, level);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-xs text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls: Difficulty & Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold">Difficulty Level:</span>
              <div className="flex gap-1">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      level === lvl
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold">Language Support:</span>
              <select
                value={languageSupport}
                onChange={(e) => setLanguageSupport(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="none">Standard English</option>
                <option value="tamil_to_english">தமிழ் + English (Bilingual)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Lesson Viewer */}
        {lesson && !isLoading && (
          <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('explanation')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'explanation'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Concept & Examples</span>
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'practice'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Practice Evaluation</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'quiz'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quiz Checkpoint ({lesson.quiz?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'flashcards'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Flashcards ({lesson.flashcards?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('followup')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'followup'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Follow-up</span>
              </button>
            </div>

            {/* TAB 1: Explanation */}
            {activeTab === 'explanation' && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{lesson.title}</h3>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{lesson.summary}</p>
                  </div>
                  <button
                    onClick={() => onSpeakText(lesson.explanation.slice(0, 500))}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                    title="Read Lesson Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap prose-star">
                  {lesson.explanation}
                </div>

                {/* Practical Examples with Line-by-Line breakdown */}
                {lesson.examples && lesson.examples.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Step-by-Step Practical Examples
                    </h4>
                    <div className="space-y-3">
                      {lesson.examples.map((ex, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="text-xs font-bold text-slate-900">{ex.title}</div>
                          <div className="text-xs text-slate-700 whitespace-pre-wrap">{ex.content}</div>
                          {ex.tamilNote && (
                            <div className="text-xs text-emerald-700 mt-2 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                              தமிழ் குறிப்பு: {ex.tamilNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary & Pronunciation */}
                {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600">
                      Vocabulary, Pronunciation & Meanings
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lesson.vocabulary.map((v, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-600">
                            <span>{v.term}</span>
                            {v.pronunciation && (
                              <span className="font-mono text-[10px] text-slate-500">
                                [{v.pronunciation}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 mt-1">{v.definition}</p>
                          {v.tamilTranslation && (
                            <div className="text-xs text-emerald-700 mt-1 font-semibold">
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

            {/* TAB 2: AI Practice Evaluation */}
            {activeTab === 'practice' && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice Exercise Challenge</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Apply What You Learned
                  </h3>
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-sm text-slate-800 leading-relaxed">
                    {lesson.practiceExercise}
                  </div>
                </div>

                {/* Student Submission Form */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Solution (Code, Translation, or Answer):
                  </label>
                  <textarea
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Type or paste your solution here for thorough AI evaluation..."
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    onClick={handleSubmitPracticeSolution}
                    disabled={!studentAnswer.trim() || isEvaluating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating Your Work...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Submit for AI Evaluation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Evaluation Feedback Report */}
                {evaluationResult && (
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        {evaluationResult.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-amber-600" />
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {evaluationResult.evaluationTitle || 'Evaluation Report'}
                          </h4>
                          <span className="text-xs text-slate-500">
                            Score: {evaluationResult.score}/100 · +{evaluationResult.pointsAwarded || 20} XP Awarded
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Tutor Feedback & Analysis:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {evaluationResult.feedback}
                      </p>
                    </div>

                    {evaluationResult.correctedVersion && (
                      <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-800">
                          Recommended Solution:
                        </span>
                        <pre className="text-xs text-emerald-900 font-mono whitespace-pre-wrap mt-1">
                          {evaluationResult.correctedVersion}
                        </pre>
                      </div>
                    )}

                    {evaluationResult.nextStep && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                        <span className="font-bold">Next Mastery Step: </span>
                        {evaluationResult.nextStep}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Quiz */}
            {activeTab === 'quiz' && lesson.quiz && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Knowledge Checkpoint Quiz</h3>
                  <span className="text-xs text-blue-600 font-semibold">+15 XP per correct answer</span>
                </div>

                <div className="space-y-6">
                  {lesson.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-sm font-semibold text-slate-900">
                        {qIdx + 1}. {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let btnStyle = 'bg-white text-slate-700 border-slate-200 hover:border-blue-400';
                          if (isSelected) {
                            btnStyle = 'bg-blue-50 text-blue-700 border-blue-500 font-semibold';
                          }
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-50 text-rose-700 border-rose-400 line-through';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-blue-50 text-xs text-blue-900 border border-blue-200 mt-2">
                          <span className="font-bold">Explanation: </span>
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    Submit Quiz & Claim XP
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: Flashcards */}
            {activeTab === 'flashcards' && lesson.flashcards && lesson.flashcards.length > 0 && (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="text-xs text-slate-500 font-semibold">
                  Card {currentCardIdx + 1} of {lesson.flashcards.length} · Tap to flip
                </div>

                <div
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="w-full max-w-md h-64 rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200 shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-all select-none"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                    {cardFlipped ? 'Answer' : 'Question / Concept'}
                  </div>
                  <div className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
                    {cardFlipped
                      ? lesson.flashcards[currentCardIdx].back
                      : lesson.flashcards[currentCardIdx].front}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    disabled={currentCardIdx === 0}
                    onClick={() => {
                      setCurrentCardIdx((prev) => Math.max(0, prev - 1));
                      setCardFlipped(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
                  >
                    Flip Card
                  </button>
                  <button
                    disabled={currentCardIdx === lesson.flashcards.length - 1}
                    onClick={() => {
                      setCurrentCardIdx((prev) => Math.min(lesson.flashcards.length - 1, prev + 1));
                      setCardFlipped(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: Ask Follow-up Question in Lesson Context */}
            {activeTab === 'followup' && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Ask Your Tutor a Follow-up Question</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Maintains full context of &ldquo;{lesson.title}&rdquo; so you can ask for more details, alternative code, or simple analogies.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followupQuestion}
                    onChange={(e) => setFollowupQuestion(e.target.value)}
                    placeholder="e.g. Can you explain line 3 in more detail, or give an everyday analogy?"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    onClick={handleAskFollowup}
                    disabled={!followupQuestion.trim() || isAnsweringFollowup}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAnsweringFollowup ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Ask</span>
                  </button>
                </div>

                {/* Follow-up dialogue history */}
                {followupAnswers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {followupAnswers.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-blue-600">
                          Q: {item.q}
                        </div>
                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

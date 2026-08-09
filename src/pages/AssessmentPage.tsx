import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  assessmentService,
  type PublicAssessmentQuestion,
  type AssessmentAnswers,
  type AssessmentResult,
  type CefrBand,
} from '@/services/assessmentService';
import { useAuth } from '@/context/AuthContext';
import {
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart,
  LogOut,
  XCircle,
} from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();

  const isOnboarding = searchParams.get('onboarding') === '1';

  // State
  const [questions, setQuestions] = useState<PublicAssessmentQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [screen, setScreen] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await assessmentService.getQuestions();
        // Sort questions ascending by ID (A1 -> C2)
        const sorted = [...data.questions].sort((a, b) => a.id - b.id);
        setQuestions(sorted);
        setTotalQuestions(data.totalQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleStart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setScreen('test');
  };

  const handleSelectOption = (optionIdx: number) => {
    const currentQuestion = questions[currentIdx];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const data = await assessmentService.submit(answers);
      setResult(data.result);
      // Mark as officially completed for the Guard caching
      sessionStorage.setItem('eb_assessment_completed', 'true');
      setScreen('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = () => {
    navigate('/home');
  };

  const handleQuit = () => {
    if (isOnboarding) {
      logout();
      navigate('/login');
    } else {
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-100 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading your level finder...</h2>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isQuestionAnswered = selectedOption !== undefined;
  const isLastQuestion = currentIdx === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Level Descriptions
  const getLevelDescription = (band: CefrBand) => {
    switch (band) {
      case 'A1':
        return 'Absolute Beginner — you understand basic words, greetings, and simple sentence structures.';
      case 'A2':
        return 'Elementary — you can communicate in simple daily tasks and describe background details.';
      case 'B1':
        return 'Intermediate — you can understand clear standard input and describe experiences, dreams, and reasons.';
      case 'B2':
        return 'Upper-Intermediate — you speak fluently with native speakers and understand complex technical texts.';
      case 'C1':
        return 'Advanced — you use language flexibly for social, academic, and professional purposes with nuance.';
      case 'C2':
        return 'Proficient (Mastery) — you understand and express yourself with complete ease, grasping subtle shades of meaning.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header / Logo */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 dark:bg-primary-700 flex items-center justify-center shadow-md">
              <span className="font-extrabold text-white tracking-tighter text-lg">EB</span>
            </div>
            <span className="font-extrabold text-gray-900 dark:text-white text-xl tracking-tight">
              English<span className="text-primary-600 dark:text-primary-400">Bridge</span>
            </span>
          </div>

          <button
            onClick={handleQuit}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-1.5"
          >
            {isOnboarding ? (
              <>
                <LogOut className="w-3.5 h-3.5" /> Exit to Login
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" /> Leave Test
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* ── INTRO SCREEN ────────────────────────────────────────────────── */}
        {screen === 'intro' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
              English Level Finder
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8">
              Let's find the absolute best starting point for your English learning journey. This 24-question test spans basic to advanced concepts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-left mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 p-4 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">24 Questions</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Spanning CEFR levels A1 up to C2.</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 p-4 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Smart Placement</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Instantly unlocks the courses matching your level.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="group inline-flex items-center gap-2 bg-primary-600 dark:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-all active:scale-[0.98]"
            >
              Start Placement Test
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* ── TEST SCREEN ─────────────────────────────────────────────────── */}
        {screen === 'test' && currentQuestion && (
          <div className="space-y-6">
            {/* Top Stat Banner */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">Question {currentIdx + 1}</span>
                <span className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 rounded-full text-primary-600 dark:text-primary-300 font-semibold uppercase tracking-wide">
                  CEFR {currentQuestion.cefr}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-snug">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`w-full p-4 text-left rounded-xl border-2 text-sm md:text-base font-medium transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span>{option}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-primary-600 dark:border-primary-500 bg-primary-600 dark:bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600 bg-transparent group-hover:border-gray-400 dark:group-hover:border-gray-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav controls */}
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex-1 py-3.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-gray-700 dark:text-gray-300 font-semibold text-sm tracking-wide transition-all"
              >
                Back
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount < totalQuestions}
                  className="flex-1 py-3.5 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Grading Test...
                    </>
                  ) : (
                    <>
                      Submit Assessment <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isQuestionAnswered}
                  className="flex-1 py-3.5 bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm tracking-wide rounded-xl shadow-md transition-all"
                >
                  Next
                </button>
              )}
            </div>

            {/* Fast Nav Dots */}
            <div className="flex justify-center flex-wrap gap-1.5 pt-4">
              {questions.map((_, idx) => {
                const qid = questions[idx].id;
                const isAnswered = answers[qid] !== undefined;
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    aria-label={`Go to question ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-primary-600 dark:bg-primary-400 scale-125 ring-2 ring-primary-600/30 dark:ring-primary-400/30'
                        : isAnswered
                          ? 'bg-primary-400 dark:bg-primary-600'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULT SCREEN ───────────────────────────────────────────────── */}
        {screen === 'result' && result && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-10 shadow-sm text-center relative overflow-hidden">
            {/* Sparkle icons */}
            <Sparkles className="absolute top-6 left-6 w-6 h-6 text-primary-200 dark:text-primary-700 animate-pulse" />
            <Sparkles className="absolute bottom-6 right-6 w-6 h-6 text-amber-300 dark:text-amber-500/40 animate-pulse" />

            <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1.5">
              Placement Result
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Your English Level is:
            </h2>

            {/* Level Badge */}
            <div className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 dark:bg-primary-700 rounded-2xl text-4xl font-black text-white tracking-tight shadow-lg mb-6">
              {result.cefrLevel}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
              {getLevelDescription(result.cefrLevel)}
            </p>

            {/* Score breakdown bar chart */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 mb-8 max-w-md mx-auto text-left">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-primary-600 dark:text-primary-400" /> CEFR Breakdown
              </h4>

              <div className="space-y-3">
                {Object.entries(result.perBand).map(([band, score]) => {
                  const percent = score.total > 0 ? (score.correct / score.total) * 100 : 0;
                  const passed = percent >= 50;
                  return (
                    <div key={band} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 dark:text-white tracking-wide">{band} Difficulty</span>
                        <span className={passed ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                          {score.correct}/{score.total} correct
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            passed
                              ? 'bg-primary-600 dark:bg-primary-500'
                              : 'bg-gray-400 dark:bg-gray-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Starting message */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-8 max-w-md mx-auto flex items-center gap-3.5 text-left text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <div>
                We have unlocked <span className="font-semibold text-gray-900 dark:text-white">Level {result.mappedLevel}</span> of the curriculum for you. You can start directly there!
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full max-w-xs bg-primary-600 dark:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-all active:scale-[0.98]"
            >
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;

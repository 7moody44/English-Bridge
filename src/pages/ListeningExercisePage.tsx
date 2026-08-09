import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Volume2,
  Play,
  Pause,
  Zap,
  HelpCircle,
  FileText,
  X,
  BarChart3,
  Shapes,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Music,
  Star,
  Loader2,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import {
  listeningService,
  type ListeningExercise,
  type ListeningCompleteResponse,
  type ListeningHintType,
} from '@/services/listeningService';
import { getProgressStats } from '@/services/progressService';

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

/** A row in the completion metadata card (icon + label + right-aligned value). */
const MetadataRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
  </div>
);

/** Filled circular score badge for the results view. */
const ScoreCircle: React.FC<{ value: number; size?: 'lg' }> = ({ value }) => {
  const color = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className={`w-28 h-28 rounded-full ${color} flex flex-col items-center justify-center shadow-lg`}>
      <span className="text-3xl font-extrabold text-white">{value}%</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export const ListeningExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();

  // Exercise data
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [hintCost, setHintCost] = useState(0);
  const [transcriptCost, setTranscriptCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  // Questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  // XP / hints
  const [xpBalance, setXpBalance] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [transcriptRevealed, setTranscriptRevealed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<{ [key: number]: number[] }>({});
  const [hintModal, setHintModal] = useState<ListeningHintType | null>(null);
  const [hintProcessing, setHintProcessing] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Results
  const [view, setView] = useState<'exercise' | 'results'>('exercise');
  const [results, setResults] = useState<ListeningCompleteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // Load the exercise + the user's current XP balance.
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [exerciseRes, stats] = await Promise.all([
          listeningService.getExercise(exerciseId as string),
          getProgressStats().catch(() => null),
        ]);
        if (!mounted) return;
        setExercise(exerciseRes.exercise);
        setHintCost(exerciseRes.hintCost);
        setTranscriptCost(exerciseRes.transcriptCost);
        if (stats) setXpBalance(stats.xp);
      } catch (err) {
        console.error('Error loading listening exercise:', err);
        if (mounted) setLoadError('Failed to load this exercise. Please try again.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      window.speechSynthesis?.cancel();
    };
  }, [exerciseId]);

  // -------------------------------------------------------------------------
  // Audio playback (Web Speech API)
  // -------------------------------------------------------------------------
  const handlePlayAudio = useCallback(() => {
    if (!exercise) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setPlayCount((c) => c + 1);

    const utterance = new SpeechSynthesisUtterance(exercise.audioText);
    utterance.rate = exercise.speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en-'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [exercise]);

  // -------------------------------------------------------------------------
  // Hints (spend XP)
  // -------------------------------------------------------------------------
  const costFor = (type: ListeningHintType): number =>
    type === 'transcript' ? transcriptCost : hintCost;

  const hintAlreadyUsed = (type: ListeningHintType): boolean => {
    if (type === 'transcript') return transcriptRevealed;
    return Array.isArray(eliminatedOptions[currentQuestionIndex]);
  };

  const openHintModal = (type: ListeningHintType) => {
    setHintError(null);
    setHintModal(type);
  };

  const confirmHint = async () => {
    if (!exercise || !hintModal) return;
    const type = hintModal;
    setHintProcessing(true);
    setHintError(null);
    try {
      const res = await listeningService.useHint(exercise.id, type);
      setXpBalance(res.totalXP);
      setHintsUsed((h) => h + 1);

      if (type === 'transcript') {
        setTranscriptRevealed(true);
      } else {
        // Eliminate two incorrect options for the current question.
        const question = exercise.questions[currentQuestionIndex];
        if (question) {
          const incorrect = question.options
            .map((_, i) => i)
            .filter((i) => i !== question.correctAnswer);
          const shuffled = [...incorrect].sort(() => Math.random() - 0.5);
          setEliminatedOptions((prev) => ({
            ...prev,
            [currentQuestionIndex]: shuffled.slice(0, 2),
          }));
        }
      }
      setHintModal(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || 'Could not purchase this hint. Please try again.';
      setHintError(msg);
      // Refresh balance in case the server rejected for insufficient funds.
      if (err?.response?.data?.balance !== undefined) {
        setXpBalance(err.response.data.balance);
      }
    } finally {
      setHintProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // Answers & submission
  // -------------------------------------------------------------------------
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    // Ignore taps on eliminated options.
    if (eliminatedOptions[questionIndex]?.includes(optionIndex)) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const getOptionLabel = (index: number): string => String.fromCharCode(65 + index);

  const allAnswered = exercise
    ? exercise.questions.every((_, i) => selectedAnswers[i] !== undefined)
    : false;

  const handleSubmit = async () => {
    if (!exercise) return;
    setIsSubmitting(true);
    try {
      const answers = exercise.questions.map((_, i) => selectedAnswers[i] ?? -1);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await listeningService.completeExercise(exercise.id, answers, hintsUsed, timeSpent);
      setResults(res);
      if (res.totalXP !== undefined) setXpBalance(res.totalXP);
      setView('results');
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error('Error submitting listening exercise:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // "Listen Again" — reset for another attempt
  // -------------------------------------------------------------------------
  const handleListenAgain = () => {
    window.speechSynthesis?.cancel();
    setSelectedAnswers({});
    setEliminatedOptions({});
    setTranscriptRevealed(false);
    setHintsUsed(0);
    setCurrentQuestionIndex(0);
    setPlayCount(0);
    setResults(null);
    startTimeRef.current = Date.now();
    setView('exercise');
    window.scrollTo({ top: 0 });
  };

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading exercise..." />
      </div>
    );
  }

  if (loadError || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 dark:text-red-400 mb-4 text-center">
          {loadError || 'Exercise not found'}
        </p>
        <button
          onClick={() => navigate('/practice/listening')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Exercises
        </button>
      </div>
    );
  }

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const totalQuestions = exercise.questions.length;
  const eliminatedForCurrent = eliminatedOptions[currentQuestionIndex] ?? [];

  // =========================================================================
  // RESULTS VIEW
  // =========================================================================
  if (view === 'results' && results) {
    const { correctAnswers, totalQuestions: total, score, passed } = results.results;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
        {/* Header */}
        <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/practice/listening')}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">Exercise Complete</h1>
            </div>
            {xpBalance !== null && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 text-sm font-semibold">
                <Zap className="w-4 h-4 text-amber-300" />
                {xpBalance} XP
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Score banner */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
            <ScoreCircle value={score} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
              {passed ? 'Great listening!' : 'Keep practising!'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              You answered {correctAnswers} out of {total} questions correctly.
            </p>

            {results.xpEarned !== undefined && results.xpEarned > 0 && (
              <span className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-sm">
                <Star className="w-4 h-4 fill-current" />
                +{results.xpEarned} XP earned
              </span>
            )}
          </div>

          {/* Metadata card — mirrors the reference design */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <MetadataRow
              icon={<BarChart3 className="w-4 h-4" />}
              label="Level"
              value={`Level ${exercise.levelNumber} · ${exercise.level}`}
            />
            <MetadataRow icon={<Shapes className="w-4 h-4" />} label="Topic" value={exercise.category} />
            <MetadataRow
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Score"
              value={`${correctAnswers} correct out of ${total}`}
            />
          </div>

          {/* Per-question review */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Review your answers</h3>
            <div className="space-y-3">
              {exercise.questions.map((q, i) => {
                const userAns = selectedAnswers[i];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-3 ${
                      isCorrect
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{q.question}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Correct answer:{' '}
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            {q.options[q.correctAnswer]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Your answer:{' '}
                            <span className="font-semibold text-red-700 dark:text-red-400">
                              {typeof userAns === 'number' && q.options[userAns] ? q.options[userAns] : '—'}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic mt-1">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons — mirror the reference design */}
          <div className="space-y-3">
            <button
              onClick={handleListenAgain}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 dark:bg-primary-700 text-white rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Listen Again
            </button>
            <button
              onClick={() => navigate('/practice/listening')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-300 border-2 border-primary-600 dark:border-primary-500 rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Music className="w-5 h-5" />
              Try Another Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // EXERCISE VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/practice/listening')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold truncate">{exercise.title}</h1>
          </div>
          {xpBalance !== null && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 text-sm font-semibold flex-shrink-0">
              <Zap className="w-4 h-4 text-amber-300" />
              {xpBalance} XP
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 mt-3 text-sm">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/20">
            Level {exercise.levelNumber} · {exercise.level}
          </span>
          <span className="text-white/80">{exercise.category}</span>
          <span className="text-white/80">• {playCount} plays</span>
        </div>
      </div>

      {/* Audio Player Card */}
      <div className="px-4 mt-6 mb-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-6 h-6" />
              <span className="font-semibold">Listen to the audio</span>
            </div>
            <span className="text-sm opacity-90">{exercise.duration} min</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAudio}
              className="w-14 h-14 bg-white text-primary-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg flex-shrink-0"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>

            <div className="flex-1">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ width: isPlaying ? '100%' : '0%' }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-white/70 mt-3 text-center">
            You can play the audio as many times as you like
          </p>
        </div>
      </div>

      {/* Hint buttons */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openHintModal('fiftyFifty')}
            disabled={hintAlreadyUsed('fiftyFifty')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-colors
              ${
                hintAlreadyUsed('fiftyFifty')
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                  : 'border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
          >
            <HelpCircle className="w-4 h-4" />
            50/50 · {hintCost} XP
          </button>
          <button
            onClick={() => openHintModal('transcript')}
            disabled={hintAlreadyUsed('transcript')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-colors
              ${
                hintAlreadyUsed('transcript')
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                  : 'border-sky-400 dark:border-sky-500 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40'
              }`}
          >
            <FileText className="w-4 h-4" />
            Transcript · {transcriptCost} XP
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Hints cost XP — you have {xpBalance ?? '…'} XP
        </p>
      </div>

      {/* Revealed transcript */}
      {transcriptRevealed && (
        <div className="px-4 mb-6">
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-sky-700 dark:text-sky-300">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">Transcript</span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{exercise.audioText}</p>
          </div>
        </div>
      )}

      {/* Question Section */}
      <div className="px-4">
        {/* Question progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
            <div className="flex gap-1">
              {exercise.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 dark:bg-primary-500'
                      : selectedAnswers[index] !== undefined
                        ? 'bg-primary-400 dark:bg-primary-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question card */}
        {currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isEliminated = eliminatedForCurrent.includes(index);
                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                    disabled={isEliminated}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                      ${
                        isEliminated
                          ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 opacity-40 cursor-not-allowed'
                          : isSelected
                            ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold flex-shrink-0
                        ${
                          isSelected
                            ? 'bg-primary-600 dark:bg-primary-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {getOptionLabel(index)}
                    </div>
                    <span
                      className={`text-base text-gray-800 dark:text-gray-200 ${isEliminated ? 'line-through' : ''}`}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          )}
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors
                ${
                  selectedAnswers[currentQuestionIndex] !== undefined
                    ? 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors
                ${
                  allAnswered && !isSubmitting
                    ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>

        {!allAnswered && currentQuestionIndex === totalQuestions - 1 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Answer all questions to submit.
          </p>
        )}
      </div>

      {/* Hint confirmation modal */}
      {hintModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {hintModal === 'transcript' ? 'Show Transcript' : '50/50 Hint'}
              </h3>
              <button
                onClick={() => setHintModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {hintModal === 'transcript'
                ? 'Reveal the full written transcript of the audio.'
                : 'Remove two incorrect answers from the current question.'}
            </p>

            {/* Cost breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Hint cost</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  −{costFor(hintModal)} XP
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current balance</span>
                <span className="font-semibold text-gray-900 dark:text-white">{xpBalance ?? '…'} XP</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Balance after</span>
                <span
                  className={`font-bold ${
                    (xpBalance ?? 0) - costFor(hintModal) < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {xpBalance !== null ? Math.max(0, xpBalance - costFor(hintModal)) : '…'} XP
                </span>
              </div>
            </div>

            {hintError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {hintError}
              </div>
            )}

            {(xpBalance ?? 0) < costFor(hintModal) && !hintError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Not enough XP for this hint.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setHintModal(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmHint}
                disabled={hintProcessing || (xpBalance ?? 0) < costFor(hintModal)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors
                  ${
                    hintProcessing || (xpBalance ?? 0) < costFor(hintModal)
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
              >
                {hintProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {hintProcessing ? 'Applying…' : `Use ${costFor(hintModal)} XP`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeningExercisePage;

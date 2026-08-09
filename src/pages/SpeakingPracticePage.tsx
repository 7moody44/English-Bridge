import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Mic,
  Square,
  Volume2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Award,
  TrendingUp,
  Loader2,
  Play,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { speakingService, type SpeakingTopic, type SpeakingFeedback } from '@/services/speakingService';
import { getAudioService } from '@/services/AudioService';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const VOCAB_XP = 5; // XP chip value shown next to each target word (per the design)

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SpeakingPracticePage: React.FC = () => {
  const { topicId = '' } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<SpeakingTopic | null>(null);
  const [isLoadingTopic, setIsLoadingTopic] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    isSupported,
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    error: recorderError,
    start,
    stop,
    reset,
  } = useAudioRecorder();

  // Load the topic detail.
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingTopic(true);
        setLoadError(null);
        const res = await speakingService.getTopic(topicId);
        setTopic(res.topic);
      } catch (err) {
        console.error('Error fetching speaking topic:', err);
        setLoadError('Failed to load this topic.');
      } finally {
        setIsLoadingTopic(false);
      }
    };
    load();
  }, [topicId]);

  // When recording stops and we have an audioBlob, auto-transcribe.
  useEffect(() => {
    if (!audioBlob || isRecording) return;
    const transcribe = async () => {
      setIsTranscribing(true);
      try {
        const res = await speakingService.transcribe(audioBlob);
        setTranscript(res.transcription);
        setConfidence(res.confidence);
      } catch (err) {
        console.error('Transcription failed:', err);
        setSubmitError('Speech-to-text failed. Check your internet and try again.');
      } finally {
        setIsTranscribing(false);
      }
    };
    transcribe();
  }, [audioBlob, isRecording]);

  const handleMicToggle = async () => {
    if (isRecording) {
      await stop();
    } else {
      // Start a fresh attempt — clear any previous feedback/transcript.
      setFeedback(null);
      setXpEarned(null);
      setSubmitError(null);
      setTranscript('');
      setConfidence(undefined);
      reset();
      await start();
    }
  };

  const handleSubmit = async () => {
    if (!topic || !transcript.trim()) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const res = await speakingService.submitFeedback(topic.id, transcript.trim(), confidence, duration);
      setFeedback(res.feedback);
      setXpEarned(res.xpEarned ?? null);
    } catch (err) {
      console.error('Error submitting speaking attempt:', err);
      setSubmitError('Failed to get feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setFeedback(null);
    setXpEarned(null);
    setSubmitError(null);
    setTranscript('');
    setConfidence(undefined);
    reset();
  };

  const handleSpeakPrompt = () => {
    if (topic) getAudioService().speak(topic.prompt);
  };

  // ---------------- Loading / error gates ----------------
  if (isLoadingTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner message="Loading topic..." />
      </div>
    );
  }
  if (loadError || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 p-6">
        <p className="text-red-500 dark:text-red-400 text-center">{loadError || 'Topic not found.'}</p>
        <button
          onClick={() => navigate('/practice/speaking')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to topics
        </button>
      </div>
    );
  }

  // ---------------- Feedback Full-Page View ----------------
  if (feedback && topic) {
    return (
      <FeedbackResultView 
        feedback={feedback}
        xpEarned={xpEarned}
        transcript={transcript}
        duration={duration}
        topic={topic}
        onSpeakImproved={() => feedback.improvedVersion && getAudioService().speak(feedback.improvedVersion)}
        onTryAgain={handleTryAgain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice/speaking')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl" aria-hidden="true">{topic.icon}</span>
            <h1 className="text-lg font-bold truncate">{topic.title}</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Prompt card */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Your task</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{topic.prompt}</p>
            </div>
            <button
              onClick={handleSpeakPrompt}
              className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-lg text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="Listen to the prompt"
              title="Listen to the prompt"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Target vocabulary chips */}
        {topic.targetVocabulary.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Vocabulary to try
            </h3>
            <div className="flex flex-wrap gap-2">
              {topic.targetVocabulary.map((v) => {
                const used = feedback?.vocabularyUsed.includes(v.word);
                return (
                  <span
                    key={v.word}
                    title={v.meaning}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                      ${
                        used
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {used ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    <span>{v.word}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-semibold">
                      +{VOCAB_XP} XP
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        {topic.tips.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
              <Lightbulb className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Tips</h3>
            </div>
            <ul className="space-y-1.5">
              {topic.tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                  <span className="text-amber-500 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript display (appears after recording + transcription) */}
        {(isTranscribing || transcript) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">What you said</h3>
              {isTranscribing && (
                <span className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Transcribing…
                </span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 min-h-[3rem] leading-relaxed">
              {isTranscribing ? (
                <span className="text-gray-400 dark:text-gray-500 italic">Processing your speech…</span>
              ) : transcript ? (
                transcript
              ) : (
                <span className="text-gray-400 dark:text-gray-500 italic">No speech detected.</span>
              )}
            </p>
            {/* Playback button for recorded audio */}
            {audioUrl && !isRecording && (
              <button
                onClick={() => new Audio(audioUrl).play()}
                className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>Play recording</span>
              </button>
            )}
          </div>
        )}

        {/* Browser support warning */}
        {!isSupported && (
          <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-800 rounded-2xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your browser does not support audio recording. Please use Chrome, Edge, Firefox, or Safari.
            </p>
          </div>
        )}

        {/* Errors */}
        {(recorderError || submitError) && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{recorderError || submitError}</p>
          </div>
        )}

        {/* AI feedback (Removed from here, now a full page view above) */}
      </div>

      {/* Sticky recording controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 safe-area-bottom z-20">
        <div className="max-w-screen-sm mx-auto flex items-center justify-center gap-3">
          {!feedback && (
            <button
              onClick={handleMicToggle}
              disabled={!isSupported || isTranscribing}
              className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50
                ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-700'
                } text-white`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-7 h-7" />}
            </button>
          )}

          {/* Duration timer while recording */}
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{formatDuration(duration)}</span>
            </div>
          )}

          {!feedback && !isRecording && (
            <button
              onClick={handleSubmit}
              disabled={!transcript.trim() || isTranscribing || isSubmitting}
              className="flex-1 max-w-[220px] flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700
                disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Get feedback</span>
                </>
              )}
            </button>
          )}

        </div>
        {!isRecording && !isTranscribing && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Tap the microphone and answer the task out loud
          </p>
        )}
        {isRecording && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Tap stop when you finish speaking
          </p>
        )}
        {isTranscribing && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Transcribing your speech…
          </p>
        )}
      </div>
    </div>
  );
};

// ---------------- Feedback sub-component ----------------

const getScoreMessage = (score: number): string => {
  if (score >= 85) return 'Excellent speaking!';
  if (score >= 70) return 'Great job!';
  if (score >= 55) return 'Good effort!';
  if (score >= 40) return 'Keep practicing';
  return 'More practice needed';
};

/** Skill rows for the breakdown section — colours match the design spec. */
const SKILL_CONFIG: { key: keyof SpeakingFeedback; label: string; barClass: string; textClass: string }[] = [
  { key: 'pronunciationScore', label: 'Pronunciation', barClass: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400' },
  { key: 'fluencyScore', label: 'Fluency', barClass: 'bg-green-500', textClass: 'text-green-600 dark:text-green-400' },
  { key: 'grammarScore', label: 'Grammar', barClass: 'bg-orange-500', textClass: 'text-orange-600 dark:text-orange-400' },
  { key: 'vocabularyScore', label: 'Vocabulary', barClass: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400' },
  { key: 'confidenceScore', label: 'Confidence', barClass: 'bg-teal-500', textClass: 'text-teal-600 dark:text-teal-400' },
  { key: 'naturalnessScore', label: 'Naturalness', barClass: 'bg-red-500', textClass: 'text-red-600 dark:text-red-400' },
];

/** Small coloured metric badge (recorded time, words, wpm, CEFR, …). */
const MetricBadge: React.FC<{ emoji: string; text: string; colorClass: string }> = ({
  emoji,
  text,
  colorClass,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${colorClass}`}
  >
    <span aria-hidden="true">{emoji}</span>
    <span>{text}</span>
  </span>
);

const FeedbackResultView: React.FC<{
  feedback: SpeakingFeedback;
  xpEarned: number | null;
  transcript: string;
  duration: number;
  topic: SpeakingTopic;
  onSpeakImproved: () => void;
  onTryAgain: () => void;
}> = ({ feedback, xpEarned, transcript, duration, topic, onSpeakImproved, onTryAgain }) => {
  const m = feedback.metrics;
  const isGoodScore = feedback.score >= 60;
  const ringColor = isGoodScore ? 'stroke-green-500' : 'stroke-red-500';
  const numberColor = isGoodScore ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  const recordedLabel =
    m.durationSeconds > 0
      ? `${Math.floor(m.durationSeconds / 60)}:${String(m.durationSeconds % 60).padStart(2, '0')} recorded`
      : `${formatDuration(duration)} recorded`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onTryAgain}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Back to practice"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Mic className="w-5 h-5" />
            <h1 className="text-lg font-bold truncate">Speaking Practice</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-screen-md mx-auto animate-slide-up">
        {/* ---------------- Overall Score ---------------- */}
        <div className="flex flex-col items-center justify-center pt-6 pb-5 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          {/* Score circle */}
          <div className="relative" style={{ width: 190, height: 190 }}>
            <svg width={190} height={190} className="-rotate-90">
              <circle
                cx={95}
                cy={95}
                r={82}
                strokeWidth={14}
                className="stroke-gray-100 dark:stroke-gray-700 fill-none"
              />
              <circle
                cx={95}
                cy={95}
                r={82}
                strokeWidth={14}
                strokeLinecap="round"
                className={`${ringColor} fill-none transition-all duration-1000 ease-out`}
                style={{
                  strokeDasharray: 2 * Math.PI * 82,
                  strokeDashoffset: 2 * Math.PI * 82 - (feedback.score / 100) * (2 * Math.PI * 82),
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-extrabold tracking-tighter leading-none ${numberColor}`}>
                {feedback.score}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-sm font-semibold mt-1">/100</span>
            </div>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Overall Score</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{getScoreMessage(feedback.score)}</p>

          {xpEarned != null && xpEarned > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-sm font-bold shadow-sm">
              <Award className="w-4 h-4" />
              +{xpEarned} XP earned
            </div>
          )}
        </div>

        {/* ---------------- Metric badges ---------------- */}
        <div className="flex flex-wrap justify-center gap-2">
          <MetricBadge emoji="⏱️" text={recordedLabel} colorClass="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300" />
          <MetricBadge emoji="👤" text={`${m.wordCount} words`} colorClass="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" />
          <MetricBadge emoji="📊" text={`${m.wpm} wpm`} colorClass="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300" />
          <MetricBadge emoji="🎓" text={`CEFR: ${feedback.estimatedCEFR}`} colorClass="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300" />
          <MetricBadge emoji="✨" text={`${m.uniqueWords} unique words`} colorClass="bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300" />
          <MetricBadge emoji="🔗" text={`${m.connectiveCount} connectives`} colorClass="bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300" />
          <MetricBadge emoji="🎯" text={`${m.topicRelevanceScore}% on topic`} colorClass="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300" />
        </div>

        {/* ---------------- Skill Breakdown ---------------- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Skill Breakdown</h3>
          <div className="space-y-4">
            {SKILL_CONFIG.map((skill) => {
              const value = Number(feedback[skill.key] ?? 0);
              return (
                <div key={skill.key} className="flex items-center gap-3">
                  <span className="w-28 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {skill.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${skill.barClass} transition-all duration-1000 ease-out`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className={`w-10 text-right text-sm font-bold ${skill.textClass}`}>{value}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- What you said ---------------- */}
        {transcript && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What you said</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{transcript}"</p>
          </div>
        )}

        {/* ---------------- Grammar corrections ---------------- */}
        {feedback.grammarErrors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-orange-500" />
              Grammar Corrections ({feedback.grammarErrors.length})
            </h3>
            <div className="space-y-3">
              {feedback.grammarErrors.map((err, i) => (
                <div key={i} className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-xl p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <span className="text-sm text-red-600 dark:text-red-400 line-through decoration-red-400/60">
                      {err.original}
                    </span>
                    <span className="hidden sm:inline text-gray-400">→</span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      {err.correction}
                    </span>
                  </div>
                  {err.explanation && (
                    <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">{err.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- Strengths & Suggestions ---------------- */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50/60 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                  <span className="text-green-500 flex-shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2.5 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              How to Improve
            </h3>
            <ul className="space-y-2">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                  <span className="text-amber-500 flex-shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------------- Target vocabulary recap ---------------- */}
        {topic.targetVocabulary.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Target Vocabulary</h3>
            <div className="flex flex-wrap gap-2">
              {topic.targetVocabulary.map((v) => {
                const used = feedback.vocabularyUsed.some(
                  (u) => u.toLowerCase() === v.word.toLowerCase()
                );
                return (
                  <span
                    key={v.word}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                      ${
                        used
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {used ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{v.word}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- Model answer ---------------- */}
        <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Example of a 90+ Answer
          </h3>
          <p className="text-gray-800 dark:text-gray-200 italic mb-3">
            {feedback.improvedVersion || topic.prompt}
          </p>
          <button
            onClick={onSpeakImproved}
            className="flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Listen to example
          </button>
        </div>

        {/* ---------------- Next Steps ---------------- */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Next Steps</h3>
          <div className="space-y-3">
            <button
              onClick={onTryAgain}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Try this topic again</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Repeat practice improves your score</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

            <button
              onClick={() => window.location.href = '/practice/speaking'}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Try another topic</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Explore more speaking challenges</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingPracticePage;

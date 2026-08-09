import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronUp,
  PenLine,
  Pencil,
  Lightbulb,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Medal,
  Star,
  RefreshCw,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import {
  writingService,
  type WritingTopicListItem,
  type WritingTopic,
  type WritingFeedback,
  type WritingError,
} from '@/services/writingService';

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Compute the character ranges to highlight for the detected errors. */
const getHighlightRanges = (text: string, errors: WritingError[]): { start: number; end: number }[] => {
  const ranges: { start: number; end: number }[] = [];
  const uniqueOriginals = Array.from(new Set(errors.map((e) => e.original)));
  for (const orig of uniqueOriginals) {
    const isPronounI = orig === 'i';
    // Skip single-letter capitalisation errors (can't be word-matched reliably).
    if (!isPronounI && orig.length < 2) continue;
    const flags = isPronounI ? 'g' : 'gi';
    const re = new RegExp(`\\b${escapeRegex(orig)}\\b`, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
};

/** Render text with the error ranges highlighted. */
const HighlightedText: React.FC<{ text: string; errors: WritingError[] }> = ({ text, errors }) => {
  const ranges = useMemo(() => getHighlightRanges(text, errors), [text, errors]);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, r.start)}</span>);
    parts.push(
      <mark
        key={`h${i}`}
        className="bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 rounded px-0.5 font-semibold"
      >
        {text.slice(r.start, r.end)}
      </mark>
    );
    cursor = r.end;
  });
  if (cursor < text.length) parts.push(<span key="end">{text.slice(cursor)}</span>);
  return <>{parts}</>;
};

// ---------------------------------------------------------------------------
// Reusable presentational pieces
// ---------------------------------------------------------------------------

/** Filled circular score badge (number inside, label below). */
const ScoreCircle: React.FC<{ value: number; label: string; colorClass: string }> = ({
  value,
  label,
  colorClass,
}) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className={`w-20 h-20 rounded-full ${colorClass} flex items-center justify-center shadow-sm`}
    >
      <span className="text-2xl font-extrabold text-white">{value}</span>
    </div>
    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
  </div>
);

/** Small coloured stat pill (words, sentences, unique words, errors). */
const StatPill: React.FC<{ text: string; colorClass: string }> = ({ text, colorClass }) => (
  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${colorClass}`}>
    {text}
  </span>
);

/** Collapsible card with an icon, title, subtitle and chevron. */
const CollapsibleSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleClass: string;
  bgClass: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, titleClass, bgClass, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl ${bgClass} p-4 border border-gray-100 dark:border-gray-700`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0">{icon}</span>
          <div className="text-left min-w-0">
            <h3 className={`font-bold ${titleClass}`}>{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
          </div>
        </div>
        <ChevronUp
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
        />
      </button>
      {open && <div className="mt-3 animate-fade-in">{children}</div>}
    </div>
  );
};

/** Bullet list used inside the tip sections. */
const TipList: React.FC<{ items: string[]; bulletClass: string }> = ({ items, bulletClass }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
        <span className={`${bulletClass} flex-shrink-0`}>•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export const WritingPracticePage: React.FC = () => {
  const navigate = useNavigate();

  const [topics, setTopics] = useState<WritingTopicListItem[]>([]);
  const [topic, setTopic] = useState<WritingTopic | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);

  const [text, setText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [view, setView] = useState<'input' | 'results'>('input');

  // Load the topic list, then the first topic's detail.
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingTopics(true);
        const res = await writingService.getTopics();
        setTopics(res.topics);
        if (res.topics.length > 0) {
          const first = res.topics[0];
          if (first) await selectTopic(first.id);
        }
      } catch (err) {
        console.error('Error fetching writing topics:', err);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTopic = async (topicId: string) => {
    try {
      setIsLoadingTopic(true);
      const res = await writingService.getTopic(topicId);
      setTopic(res.topic);
      // Fresh start for the new topic.
      setText('');
      setShowHint(false);
      setFeedback(null);
      setXpEarned(null);
      setSubmitError(null);
      setView('input');
    } catch (err) {
      console.error('Error fetching writing topic:', err);
    } finally {
      setIsLoadingTopic(false);
    }
  };

  const wordCount = countWords(text);
  const minWords = topic?.minWords ?? 0;
  const remaining = Math.max(0, minWords - wordCount);
  const progress = minWords > 0 ? Math.min(100, (wordCount / minWords) * 100) : 0;
  const canSubmit = wordCount >= minWords && !isSubmitting;

  const handleCheck = async () => {
    if (!topic || !canSubmit) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const res = await writingService.checkWriting(topic.id, text.trim());
      setFeedback(res.feedback);
      setXpEarned(res.xpEarned ?? null);
      setView('results');
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error('Error checking writing:', err);
      setSubmitError('Failed to analyse your writing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setView('input');
    window.scrollTo({ top: 0 });
  };

  const handleWriteAgain = () => {
    setText('');
    setFeedback(null);
    setXpEarned(null);
    setSubmitError(null);
    setShowHint(false);
    setView('input');
    window.scrollTo({ top: 0 });
  };

  // ---------------- Loading gate ----------------
  if (isLoadingTopics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner message="Loading writing topics..." />
      </div>
    );
  }

  // ---------------- Results view ----------------
  if (view === 'results' && feedback && topic) {
    return (
      <WritingAnalysisView
        feedback={feedback}
        xpEarned={xpEarned}
        text={text}
        topic={topic}
        onEdit={handleEdit}
        onWriteAgain={handleWriteAgain}
        onBack={() => navigate('/practice')}
      />
    );
  }

  // ---------------- Input view ----------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <PenLine className="w-5 h-5" />
            <h1 className="text-lg font-bold truncate">Writing Practice</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-screen-md mx-auto">
        {/* Topic selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {topics.map((t) => {
            const active = t.id === topic?.id;
            return (
              <button
                key={t.id}
                onClick={() => selectTopic(t.id)}
                className={`flex-shrink-0 flex flex-col items-start gap-1.5 px-4 py-3 rounded-2xl border transition-all min-w-[150px]
                  ${
                    active
                      ? 'bg-primary-600 dark:bg-primary-700 border-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-primary-300'
                  }`}
              >
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap
                    ${active ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}
                >
                  Level {t.levelNumber} · {t.level}
                </span>
                <span className="font-bold text-sm leading-tight text-left">{t.title}</span>
              </button>
            );
          })}
        </div>

        {isLoadingTopic && (
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading task..." />
          </div>
        )}

        {!isLoadingTopic && topic && (
          <>
            {/* Prompt box */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <PenLine className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{topic.prompt}</p>
              </div>
            </div>

            {/* Vocabulary hint */}
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold text-sm hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Get a vocabulary hint (10 XP)</span>
              </button>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-300">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="text-sm font-semibold">Vocabulary hint</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{topic.hint}</p>
                <div className="flex flex-wrap gap-2">
                  {topic.targetVocabulary.map((v) => (
                    <span
                      key={v.word}
                      title={v.meaning}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900 text-gray-700 dark:text-gray-300"
                    >
                      <span>{v.word}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">({v.meaning})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Writing area */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start writing here... (aim for 2–3 paragraphs)"
                rows={10}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-y focus:outline-none focus:ring-2 focus:ring-primary-400 text-base leading-relaxed"
              />
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {wordCount} / {minWords} words
                </span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{topic.level} level</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${canSubmit ? 'bg-green-500' : 'bg-primary-400'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {remaining > 0
                  ? `Write at least ${minWords} words for a ${topic.level} task before checking (${remaining} to go).`
                  : 'Ready! Check your writing now.'}
              </p>
            </div>

            {/* Errors */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky submit control */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 z-20">
        <div className="max-w-screen-md mx-auto">
          <button
            onClick={handleCheck}
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold shadow-md transition-colors
              ${
                canSubmit
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analysing your writing…</span>
              </>
            ) : canSubmit ? (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Check my writing</span>
              </>
            ) : (
              <span>Keep writing...</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Results / analysis view
// ---------------------------------------------------------------------------

const WritingAnalysisView: React.FC<{
  feedback: WritingFeedback;
  xpEarned: number | null;
  text: string;
  topic: WritingTopic;
  onEdit: () => void;
  onWriteAgain: () => void;
  onBack: () => void;
}> = ({ feedback, xpEarned, text, topic, onEdit, onWriteAgain, onBack }) => {
  const m = feedback.metrics;
  const firstError = feedback.errors[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <PenLine className="w-5 h-5" />
              <h1 className="text-lg font-bold truncate">Writing Practice</h1>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-screen-md mx-auto animate-slide-up">
        {/* ---------------- Score circles ---------------- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <ScoreCircle value={feedback.score} label="Overall" colorClass="bg-green-500" />
            <ScoreCircle value={feedback.grammarScore} label="Grammar" colorClass="bg-blue-500" />
            <ScoreCircle value={feedback.vocabularyScore} label="Vocab" colorClass="bg-purple-500" />
            <ScoreCircle value={feedback.styleScore} label="Style" colorClass="bg-orange-500" />
          </div>

          {/* Pass / fail banner */}
          <div className="mt-6 flex flex-col items-center gap-3">
            {feedback.passed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Passed! Great writing!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-semibold text-sm">
                <RefreshCw className="w-5 h-5" />
                <span>Not passed yet — 60% needed</span>
              </div>
            )}

            {xpEarned != null && xpEarned > 0 && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-sm font-bold shadow-sm">
                <Star className="w-4 h-4 fill-current" />
                +{xpEarned} XP
              </div>
            )}
          </div>

          {/* Stat pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <StatPill text={`${m.wordCount} words`} colorClass="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" />
            <StatPill text={`${m.sentenceCount} sentences`} colorClass="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300" />
            <StatPill text={`${m.uniqueWords} unique words`} colorClass="bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300" />
            <StatPill text={`${m.errorCount} errors found`} colorClass="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300" />
          </div>
        </div>

        {/* ---------------- Mistakes found ---------------- */}
        {feedback.errors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Mistakes Found</h3>
            <div className="space-y-3">
              {feedback.errors.map((err, i) => (
                <div
                  key={i}
                  className="bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-3"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-red-600 dark:text-red-400 line-through decoration-red-400/60">
                        {err.original}
                      </span>
                      {err.correction && err.correction !== err.original && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {err.correction}
                          </span>
                        </>
                      )}
                    </div>
                    {err.explanation && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{err.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- Your text (errors highlighted) ---------------- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          {firstError && (
            <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">{firstError.explanation}</p>
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Your Text (errors highlighted)</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            <HighlightedText text={text} errors={feedback.errors} />
          </p>
        </div>

        {/* ---------------- Improved version (basic check) ---------------- */}
        <CollapsibleSection
          icon={<Pencil className="w-5 h-5 text-green-600 dark:text-green-400" />}
          title="Improved Version (basic check)"
          subtitle="Spelling and grammar only — word-choice mistakes may remain"
          titleClass="text-green-700 dark:text-green-400"
          bgClass="bg-green-50/60 dark:bg-green-950/20"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-100 dark:border-green-900/40">
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {feedback.improvedVersion || text}
            </p>
          </div>
          {feedback.writingTips.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-400">
                <Lightbulb className="w-4 h-4" />
                <h4 className="text-sm font-bold text-green-700 dark:text-green-400">Writing Tips</h4>
              </div>
              <TipList items={feedback.writingTips} bulletClass="text-green-500" />
            </div>
          )}
        </CollapsibleSection>

        {/* ---------------- Professional rewrite ---------------- */}
        <CollapsibleSection
          icon={<Medal className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          title="Professional Rewrite"
          subtitle="See your text in a more formal, professional tone + tips"
          titleClass="text-blue-700 dark:text-blue-400"
          bgClass="bg-blue-50/60 dark:bg-blue-950/20"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {feedback.professionalRewrite || feedback.improvedVersion || text}
            </p>
          </div>
          {feedback.professionalTips.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400">How to Sound More Professional</h4>
              </div>
              <TipList items={feedback.professionalTips} bulletClass="text-blue-500" />
            </div>
          )}
        </CollapsibleSection>

        {/* ---------------- Feedback (strengths / areas to improve) ---------------- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Feedback</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                    <span className="text-green-500 flex-shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Areas to Improve
              </h4>
              <ul className="space-y-1.5">
                {feedback.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------------- Target vocabulary recap ---------------- */}
        {topic.targetVocabulary.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Target Vocabulary</h3>
            <div className="flex flex-wrap gap-2">
              {topic.targetVocabulary.map((v) => {
                const used = feedback.vocabularyUsed.some((u) => u.toLowerCase() === v.word.toLowerCase());
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

        {/* ---------------- Next steps ---------------- */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onWriteAgain}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Write Again</span>
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Pencil className="w-5 h-5" />
            <span>Edit My Writing</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingPracticePage;

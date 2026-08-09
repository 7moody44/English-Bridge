import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mistakeService,
  type Mistake,
  type MistakeSource,
  type MistakeStats,
} from '@/services/mistakeService';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import {
  ArrowLeft,
  Target,
  ClipboardList,
  BookOpen,
  FileText,
  Gamepad2,
  Headphones,
  Brain,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Grouping helpers                                                    */
/* ------------------------------------------------------------------ */

const CEFR_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Normalise the many cefr spellings ("a1", "A1", "pre-a1", ...) to a canonical band. */
const normalizeCefr = (raw?: string): string | null => {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, '-');
  const map: Record<string, string> = {
    'pre-a1': 'Pre-A1',
    a1: 'A1',
    a2: 'A2',
    b1: 'B1',
    b2: 'B2',
    c1: 'C1',
    c2: 'C2',
  };
  return map[key] ?? null;
};

/** Colour-code level badges the same way the reference design does (A=green, B=orange, C=purple). */
const levelBadgeClass = (level: string): string => {
  if (['Pre-A1', 'A1', 'A2'].includes(level)) return 'bg-green-500';
  if (['B1', 'B2'].includes(level)) return 'bg-orange-500';
  return 'bg-purple-500';
};

const SOURCE_META: Record<Exclude<MistakeSource, 'assessment'>, { label: string; icon: LucideIcon }> = {
  lesson: { label: 'Lessons', icon: BookOpen },
  exam: { label: 'Exams', icon: FileText },
  practice: { label: 'Practice', icon: Headphones },
  game: { label: 'Games', icon: Gamepad2 },
};

interface MistakeTab {
  id: string;
  label: string;
  /** Short coloured badge (e.g. "A1") for level tabs. */
  badge?: string;
  badgeClass?: string;
  icon?: LucideIcon;
  mistakes: Mistake[];
}

/**
 * Organise mistakes into category tabs:
 *  1. Placement Assessment (source === 'assessment')
 *  2. One tab per CEFR level present (non-assessment mistakes)
 *  3. One tab per remaining source that has no CEFR tag (Lessons, Exams, ...)
 */
const buildTabs = (mistakes: Mistake[]): MistakeTab[] => {
  const tabs: MistakeTab[] = [];

  const assessment = mistakes.filter((m) => m.source === 'assessment');
  tabs.push({
    id: 'assessment',
    label: 'Placement Assessment',
    icon: ClipboardList,
    mistakes: assessment,
  });

  const byLevel = new Map<string, Mistake[]>();
  const noLevel: Mistake[] = [];
  for (const m of mistakes) {
    if (m.source === 'assessment') continue;
    const level = normalizeCefr(m.cefr);
    if (level) {
      byLevel.set(level, [...(byLevel.get(level) ?? []), m]);
    } else {
      noLevel.push(m);
    }
  }

  for (const level of CEFR_ORDER) {
    const items = byLevel.get(level);
    if (items && items.length > 0) {
      tabs.push({
        id: `level-${level}`,
        label: `Level ${level}`,
        badge: level,
        badgeClass: levelBadgeClass(level),
        mistakes: items,
      });
    }
  }

  const bySource = new Map<MistakeSource, Mistake[]>();
  for (const m of noLevel) {
    bySource.set(m.source, [...(bySource.get(m.source) ?? []), m]);
  }
  (Object.keys(SOURCE_META) as Array<Exclude<MistakeSource, 'assessment'>>).forEach((src) => {
    const items = bySource.get(src);
    if (items && items.length > 0) {
      const meta = SOURCE_META[src];
      tabs.push({ id: `source-${src}`, label: meta.label, icon: meta.icon, mistakes: items });
    }
  });

  // Drop the Placement Assessment tab only if it is empty AND there are other tabs.
  return tabs.filter((t) => t.mistakes.length > 0 || t.id === 'assessment');
};

/* ------------------------------------------------------------------ */
/* Mistake card — interactive "try again" review card                  */
/* ------------------------------------------------------------------ */

interface MistakeCardProps {
  mistake: Mistake;
  onResolved: (id: string) => void;
}

const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onResolved }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const isWrongAgain = !!selected && selected !== mistake.correctAnswer;
  const hasOptions = !!mistake.options && mistake.options.length > 0;

  const handleSelect = (option: string) => {
    setSelected(option);
    if (option === mistake.correctAnswer) {
      onResolved(mistake._id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
      {mistake.cefr && (
        <div className="absolute top-0 right-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-gray-200 dark:border-gray-600">
          {normalizeCefr(mistake.cefr) ?? mistake.cefr}
        </div>
      )}

      <div className="text-xs font-semibold text-primary-600 dark:text-primary-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 flex-wrap">
        <Brain className="w-3.5 h-3.5" />
        {mistake.sourceLabel || mistake.source}
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 leading-snug">
        {mistake.question}
      </h3>

      {/* Previous (wrong) answer */}
      <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium px-3 py-2 rounded-lg inline-flex items-center gap-2 border border-red-100 dark:border-red-800">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span>
          You answered: <span className="line-through opacity-80">{mistake.userAnswer}</span>
        </span>
      </div>

      {hasOptions ? (
        <div className="space-y-2 mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">
            Try again to mark as learned:
          </p>
          {mistake.options!.map((opt, i) => {
            const isIncorrectPick = selected === opt && opt !== mistake.correctAnswer;
            const btnClass = isIncorrectPick
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500';
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex justify-between items-center ${btnClass}`}
              >
                <span className="text-sm font-medium">{opt}</span>
                {isIncorrectPick && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-xl border border-green-100 dark:border-green-800 mb-4">
            <p className="text-xs uppercase font-bold text-green-600 dark:text-green-400 mb-1 tracking-wider">
              Correct Answer
            </p>
            <p className="font-semibold text-lg">{mistake.correctAnswer}</p>
          </div>
          <button
            onClick={() => onResolved(mistake._id)}
            className="w-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 font-bold py-3.5 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex items-center justify-center gap-2"
          >
            I understand now <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Explanation — revealed after another wrong pick, or always when there are no options */}
      {mistake.explanation && (!hasOptions || isWrongAgain) && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-sm flex items-start gap-3 border border-blue-100 dark:border-blue-800">
          <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>{mistake.explanation}</p>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Learned card — compact, de-emphasised resolved mistake              */
/* ------------------------------------------------------------------ */

interface LearnedCardProps {
  mistake: Mistake;
  /** True when it was just resolved in this session (green highlight). */
  justLearned?: boolean;
}

const LearnedCard: React.FC<LearnedCardProps> = ({ mistake, justLearned }) => (
  <div
    className={`rounded-2xl p-4 border shadow-sm transition-colors ${
      justLearned
        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <CheckCircle2
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            justLearned ? 'text-green-500' : 'text-green-500/70'
          }`}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
            {mistake.question}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Correct: <span className="font-medium text-green-600 dark:text-green-400">{mistake.correctAnswer}</span>
          </p>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${
          justLearned
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
      >
        {justLearned ? 'Learned!' : 'Learned'}
      </span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const MistakesPage: React.FC = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [stats, setStats] = useState<MistakeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('assessment');
  /** Mistakes resolved during this session (optimistic). */
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [all, statsRes] = await Promise.all([
        mistakeService.getAllMistakes(),
        mistakeService.stats(),
      ]);
      setMistakes(all);
      setStats(statsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mistakes');
    } finally {
      setLoading(false);
    }
  };

  const tabs = useMemo(() => buildTabs(mistakes), [mistakes]);

  // On first load, land on the first tab that still has work to do.
  const hasSetDefault = useRef(false);
  useEffect(() => {
    if (loading || tabs.length === 0 || hasSetDefault.current) return;
    hasSetDefault.current = true;
    const firstActive = tabs.find((t) =>
      t.mistakes.some((m) => !m.resolved && !resolvedIds.has(m._id))
    );
    setActiveTab(firstActive?.id ?? tabs[0].id);
  }, [loading, tabs, resolvedIds]);

  const activeTabData = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const unresolvedCount = (tab: MistakeTab) =>
    tab.mistakes.filter((m) => !m.resolved && !resolvedIds.has(m._id)).length;

  const handleResolved = async (id: string) => {
    setResolvedIds((prev) => new Set(prev).add(id));
    setStats((prev) =>
      prev
        ? { ...prev, unresolved: Math.max(0, prev.unresolved - 1), resolved: prev.resolved + 1 }
        : prev
    );
    try {
      await mistakeService.resolve(id);
    } catch (err) {
      console.error('Failed to resolve mistake:', err);
    }
  };

  const totalUnresolved = stats?.unresolved ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
        <LoadingSpinner message="Loading your mistakes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header + category tabs pinned together */}
      <div className="sticky top-0 z-20">
        {/* Header */}
        <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/home')}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <h1 className="text-xl font-bold">Review Mistakes</h1>
              </div>
            </div>
            <div className="bg-white/15 border border-white/25 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">{totalUnresolved} to review</span>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-1 ml-10">Turn your mistakes into mastery</p>
        </div>

        {/* Category tabs */}
        {mistakes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                const count = unresolvedCount(tab);
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.badge ? (
                      <span
                        className={`w-6 h-6 rounded-md ${tab.badgeClass} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}
                      >
                        {tab.badge}
                      </span>
                    ) : (
                      Icon && <Icon className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{tab.label}</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : count > 0
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 mt-5 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100 dark:border-red-800 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Overall empty state */}
        {!error && mistakes.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center mt-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Mistakes Yet!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[260px]">
              Keep practicing — any questions you miss will show up here so you can master them.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 bg-primary-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary-700 transition"
            >
              Start Practicing
            </button>
          </div>
        )}

        {/* Active tab content */}
        {!error && mistakes.length > 0 && activeTabData && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeTabData.mistakes.length} question
                {activeTabData.mistakes.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {unresolvedCount(activeTabData)} to review
                </span>
              </p>
            </div>

            {activeTabData.mistakes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">All caught up!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Nothing to review in this category.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTabData.mistakes.map((mistake) => {
                  const isResolved = mistake.resolved || resolvedIds.has(mistake._id);
                  const justLearned = resolvedIds.has(mistake._id);
                  return isResolved ? (
                    <LearnedCard key={mistake._id} mistake={mistake} justLearned={justLearned} />
                  ) : (
                    <MistakeCard key={mistake._id} mistake={mistake} onResolved={handleResolved} />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MistakesPage;

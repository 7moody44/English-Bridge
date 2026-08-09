import UserProgress, { IUserProgress } from '../models/UserProgress';
import { Types } from 'mongoose';

// CEFR Level Mapping based on course level
export const CEFR_LEVEL_MAP: Record<number, string> = {
  1: 'A1',
  2: 'A1',
  3: 'A2',
  4: 'A2',
  5: 'B1',
  6: 'B1',
  7: 'B2',
  8: 'B2',
  9: 'C1',
  10: 'C2',
};

export type ActivityType = 'lesson' | 'exam' | 'practice' | 'game';

/**
 * XP multipliers per activity type.
 * Exams are the hardest milestone → biggest reward. Games are light practice → smallest.
 * Base XP is derived from the 0-100 score, then multiplied.
 */
const XP_MULTIPLIERS: Record<ActivityType, number> = {
  exam: 1.5,
  lesson: 1.0,
  practice: 1.0,
  game: 0.5,
};

/** Max base XP a perfect (100%) score yields before the activity multiplier. */
const MAX_BASE_XP = 15;

/**
 * Calculate base XP from a score (0-100), ignoring activity type.
 * Returns a value in [0, MAX_BASE_XP].
 */
export const calculateXP = (score: number, activityType: ActivityType = 'lesson'): number => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const base = (normalizedScore / 100) * MAX_BASE_XP;
  const multiplier = XP_MULTIPLIERS[activityType] ?? 1;
  return Math.round(base * multiplier);
};

/**
 * Day-difference helper: how many calendar days separate two dates (ignoring time).
 * Returns 0 for same day, 1 for yesterday, etc. Always non-negative when a <= b.
 */
const dayDiff = (a: Date, b: Date): number => {
  const dayA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const dayB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.floor((dayB - dayA) / (1000 * 60 * 60 * 24));
};

/**
 * Update user streak in place on the given progress doc, using "today" as reference.
 * - Same day → no change.
 * - Yesterday (diff === 1) → increment currentStreak.
 * - 2+ days ago → reset currentStreak to 1.
 * Also keeps longestStreak up to date.
 *
 * Does NOT save the doc — caller saves once at the end.
 */
const applyStreakUpdate = (progress: IUserProgress, now: Date = new Date()): void => {
  if (!progress.streak) {
    progress.streak = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: now,
    } as any;
  }

  const lastActivity = new Date(progress.streak.lastActivityDate);
  const diff = dayDiff(lastActivity, now);

  if (diff <= 0) {
    // Same day (or clock skew) — keep streak, refresh timestamp.
    progress.streak.lastActivityDate = now;
    return;
  }

  if (diff === 1) {
    // Consecutive day — extend streak.
    progress.streak.currentStreak = (progress.streak.currentStreak || 0) + 1;
  } else {
    // Streak broken — start fresh from today.
    progress.streak.currentStreak = 1;
  }

  progress.streak.lastActivityDate = now;

  if (progress.streak.currentStreak > (progress.streak.longestStreak || 0)) {
    progress.streak.longestStreak = progress.streak.currentStreak;
  }
};

/**
 * Public helper: touch a user's streak (e.g. on login). Safe to call multiple
 * times per day — same-day calls are a no-op beyond refreshing the timestamp.
 */
export const touchStreak = async (userId: Types.ObjectId): Promise<void> => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) return;
  applyStreakUpdate(progress);
  await progress.save();
};

/**
 * Add XP to user and update streak.
 *
 * NOTE: This does NOT dedupe by itself — callers are responsible for deciding
 * whether a replay should earn XP (pass alreadyAwarded=true to skip XP but
 * still refresh the streak).
 */
export const addXP = async (
  userId: Types.ObjectId,
  score: number,
  activityType: ActivityType = 'lesson',
  alreadyAwarded = false
): Promise<{ progress: IUserProgress; xpEarned: number }> => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    throw new Error('User progress not found');
  }

  const xpEarned = alreadyAwarded ? 0 : calculateXP(score, activityType);

  if (xpEarned > 0) {
    progress.xp += xpEarned;
  }

  // Streak always refreshes, even if no XP was awarded (user still did something).
  applyStreakUpdate(progress);

  await progress.save();
  return { progress, xpEarned };
};

/**
 * Deduct XP from a user (e.g. when spending XP on hints / premium features).
 *
 * The balance is floored at 0 — a user can never go negative. Callers should
 * check the balance against the intended cost BEFORE calling this if they want
 * to reject insufficient-funds spends (see the listening hint endpoint).
 *
 * Returns the amount actually deducted (may be less than requested if the
 * balance was lower) along with the updated progress doc.
 */
export const deductXP = async (
  userId: Types.ObjectId,
  amount: number
): Promise<{ progress: IUserProgress; xpDeducted: number }> => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    throw new Error('User progress not found');
  }

  const safeAmount = Math.max(0, Math.floor(amount));
  const xpDeducted = Math.min(safeAmount, progress.xp);

  if (xpDeducted > 0) {
    progress.xp -= xpDeducted;
    await progress.save();
  }

  return { progress, xpDeducted };
};

/**
 * Spend XP to unlock a premium game. Idempotent — re-unlocking an already
 * owned game is a no-op that spends nothing. Rejects insufficient balances
 * without touching the doc.
 */
export const unlockGame = async (
  userId: Types.ObjectId,
  gameId: string,
  cost: number
): Promise<{ progress: IUserProgress; unlocked: boolean; xpSpent: number }> => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    throw new Error('User progress not found');
  }

  // Already owned — nothing to spend.
  if (progress.unlockedGames.includes(gameId)) {
    return { progress, unlocked: true, xpSpent: 0 };
  }

  const safeCost = Math.max(0, Math.floor(cost));
  if (progress.xp < safeCost) {
    return { progress, unlocked: false, xpSpent: 0 };
  }

  progress.xp -= safeCost;
  progress.unlockedGames.push(gameId);
  await progress.save();

  return { progress, unlocked: true, xpSpent: safeCost };
};

/**
 * Returns true if the given lesson has already been recorded as completed.
 * Used by callers to decide whether to award XP (avoid farming via replays).
 */
export const isLessonCompleted = (
  progress: IUserProgress,
  levelId: number,
  lessonId: number
): boolean => {
  return progress.completedLessons.some((l) => l.levelId === levelId && l.lessonId === lessonId);
};

/**
 * Returns true if an exam for the given level has already been recorded as passed.
 */
export const isExamPassed = (progress: IUserProgress, levelId: number): boolean => {
  return progress.completedExams.some((e) => e.levelId === levelId && e.passedThreshold);
};

/**
 * Award certificate when user completes a level.
 * BUG FIX: cefrLevel is set to the HIGHEST completed level's CEFR band,
 * never downgraded by passing a lower level later.
 */
export const awardCertificate = async (
  userId: Types.ObjectId,
  levelId: number
): Promise<IUserProgress> => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    throw new Error('User progress not found');
  }

  // Idempotent — don't duplicate the certificate.
  const existingCert = progress.certificates.find((cert) => cert.levelId === levelId);
  if (existingCert) {
    return progress;
  }

  const cefrLevel = CEFR_LEVEL_MAP[levelId] || 'A1';

  progress.certificates.push({
    levelId,
    cefrLevel,
    earnedAt: new Date(),
  });

  // Recompute CEFR from the highest completed level (never regress).
  const highestCompleted = Math.max(levelId, ...progress.completedLevels);
  progress.cefrLevel = CEFR_LEVEL_MAP[highestCompleted] || 'A1';

  await progress.save();
  return progress;
};

/**
 * Get user's current CEFR level based on completed levels.
 */
export const getCEFRLevel = (completedLevels: number[]): string => {
  if (completedLevels.length === 0) return 'A1';
  const highestLevel = Math.max(...completedLevels);
  return CEFR_LEVEL_MAP[highestLevel] || 'A1';
};

/**
 * Check if user can claim certificate for a level.
 */
export const canClaimCertificate = async (
  userId: Types.ObjectId,
  levelId: number
): Promise<boolean> => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    return false;
  }

  const hasCompletedLevel = progress.completedLevels.includes(levelId);
  const hasCertificate = progress.certificates.some((cert) => cert.levelId === levelId);

  return hasCompletedLevel && !hasCertificate;
};

/**
 * Backfill certificates for every level the user has already unlocked.
 *
 * A level counts as "earned" when it is strictly below the user's current
 * level (they progressed past it) or appears in completedLevels. This covers
 * users who were placed mid-course by the assessment and never re-took the
 * lower-level exams — they still own those certificates.
 *
 * Mutates the doc in place; returns true if anything was added (caller saves).
 */
const syncCertificates = (progress: IUserProgress): boolean => {
  let changed = false;

  for (let levelId = 1; levelId <= 10; levelId++) {
    const qualifies =
      levelId < progress.currentLevel || progress.completedLevels.includes(levelId);
    if (!qualifies) continue;

    const hasCert = progress.certificates.some((cert) => cert.levelId === levelId);
    if (hasCert) continue;

    progress.certificates.push({
      levelId,
      cefrLevel: CEFR_LEVEL_MAP[levelId] || 'A1',
      earnedAt: new Date(),
    });
    changed = true;
  }

  if (changed && progress.certificates.length > 0) {
    // Keep the headline CEFR band in sync with the highest certified level.
    const highest = Math.max(...progress.certificates.map((cert) => cert.levelId));
    progress.cefrLevel = CEFR_LEVEL_MAP[highest] || progress.cefrLevel;
  }

  return changed;
};

/**
 * Get all available certificates for user.
 *
 * Always returns the full 1..10 ladder so the UI can render earned vs. locked
 * rows, after first backfilling any certificates the user has already unlocked
 * (see syncCertificates).
 */
export const getAvailableCertificates = async (userId: Types.ObjectId) => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    return [];
  }

  // Backfill certs for already-unlocked levels, persisting only when new.
  if (syncCertificates(progress)) {
    await progress.save();
  }

  const certificates = [];
  for (let levelId = 1; levelId <= 10; levelId++) {
    const cert = progress.certificates.find((c) => c.levelId === levelId);
    certificates.push({
      levelId,
      cefrLevel: CEFR_LEVEL_MAP[levelId],
      earned: Boolean(cert),
      earnedAt: cert ? cert.earnedAt : null,
    });
  }

  return certificates;
};

/**
 * Get progress stats.
 */
export const getProgressStats = async (userId: Types.ObjectId) => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    return {
      xp: 0,
      streak: 0,
      cefrLevel: 'A1',
      certificates: 0,
      longestStreak: 0,
      hasCompletedAssessment: false,
      assessmentCefrLevel: null as string | null,
    };
  }

  return {
    xp: progress.xp,
    streak: progress.streak.currentStreak,
    longestStreak: progress.streak.longestStreak,
    cefrLevel: progress.cefrLevel,
    certificates: progress.certificates.length,
    completedLevels: progress.completedLevels.length,
    completedLessons: progress.completedLessons.length,
    hasCompletedAssessment: Boolean(progress.hasCompletedAssessment),
    assessmentCefrLevel: progress.assessmentCefrLevel ?? null,
  };
};

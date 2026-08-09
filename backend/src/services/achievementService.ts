import { Types } from 'mongoose';
import UserProgress from '../models/UserProgress.js';
import { getMistakeStats } from './mistakeService.js';

/**
 * Achievements are computed from a user's live progress snapshot and then
 * persisted (achievementId + earnedAt) so the "earned" state and its date
 * survive even if the underlying metric later regresses (e.g. spending XP).
 */

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AchievementWithStatus extends AchievementDef {
  earned: boolean;
  earnedAt: Date | null;
}

/** Snapshot of every metric an achievement predicate cares about. */
interface AchievementStats {
  completedLessons: number;
  currentLevel: number;
  examsPassed: number;
  perfectExams: number;
  certificatesCount: number;
  xp: number;
  longestStreak: number;
  hasCompletedAssessment: boolean;
  resolvedMistakes: number;
  unlockedGamesCount: number;
}

type CheckableAchievement = AchievementDef & { check: (s: AchievementStats) => boolean };

const ACHIEVEMENTS: CheckableAchievement[] = [
  // Lessons
  { id: 'first-steps', title: 'First Steps', description: 'Complete your first lesson', icon: '👣', check: (s) => s.completedLessons >= 1 },
  { id: 'lesson-10', title: 'Getting Serious', description: 'Complete 10 lessons', icon: '📚', check: (s) => s.completedLessons >= 10 },
  { id: 'lesson-25', title: 'Bookworm', description: 'Complete 25 lessons', icon: '📖', check: (s) => s.completedLessons >= 25 },
  { id: 'lesson-50', title: 'Scholar', description: 'Complete 50 lessons', icon: '🎓', check: (s) => s.completedLessons >= 50 },

  // Levels
  { id: 'level-2', title: 'Moving Up', description: 'Reach level 2', icon: '🪜', check: (s) => s.currentLevel >= 2 },
  { id: 'level-5', title: 'Halfway There', description: 'Reach level 5', icon: '⛰️', check: (s) => s.currentLevel >= 5 },
  { id: 'level-10', title: 'Summit', description: 'Reach level 10', icon: '🏔️', check: (s) => s.currentLevel >= 10 },

  // Exams
  { id: 'exam-pass', title: "Examiner's Approval", description: 'Pass your first final exam', icon: '✅', check: (s) => s.examsPassed >= 1 },
  { id: 'exam-ace', title: 'Perfectionist', description: 'Score 100% on a final exam', icon: '💯', check: (s) => s.perfectExams >= 1 },

  // Certificates
  { id: 'cert-1', title: 'Certified', description: 'Earn your first certificate', icon: '📜', check: (s) => s.certificatesCount >= 1 },
  { id: 'cert-5', title: 'Collector', description: 'Earn 5 certificates', icon: '🗂️', check: (s) => s.certificatesCount >= 5 },
  { id: 'cert-10', title: 'Wall of Fame', description: 'Earn all 10 certificates', icon: '🏛️', check: (s) => s.certificatesCount >= 10 },

  // XP
  { id: 'xp-100', title: 'Centurion', description: 'Hold 100 XP', icon: '⚡', check: (s) => s.xp >= 100 },
  { id: 'xp-500', title: 'XP Hunter', description: 'Hold 500 XP', icon: '🔥', check: (s) => s.xp >= 500 },
  { id: 'xp-1000', title: 'XP Legend', description: 'Hold 1,000 XP', icon: '🌟', check: (s) => s.xp >= 1000 },

  // Streaks
  { id: 'streak-3', title: 'On a Roll', description: 'Reach a 3-day streak', icon: '🗓️', check: (s) => s.longestStreak >= 3 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Reach a 7-day streak', icon: '📅', check: (s) => s.longestStreak >= 7 },
  { id: 'streak-30', title: 'Unstoppable', description: 'Reach a 30-day streak', icon: '🚀', check: (s) => s.longestStreak >= 30 },

  // Assessment
  { id: 'assessed', title: 'Know Thyself', description: 'Complete the placement assessment', icon: '🧭', check: (s) => s.hasCompletedAssessment },

  // Mistakes
  { id: 'mistake-fixer', title: 'Self-Corrector', description: 'Resolve 5 mistakes', icon: '🛠️', check: (s) => s.resolvedMistakes >= 5 },
  { id: 'mistake-master', title: 'Mistake Master', description: 'Resolve 20 mistakes', icon: '🧽', check: (s) => s.resolvedMistakes >= 20 },

  // Games
  { id: 'gamer', title: 'Arcade Fan', description: 'Unlock a premium game', icon: '🎮', check: (s) => s.unlockedGamesCount >= 1 },
];

/**
 * Compute the full achievement list for a user, persist any newly earned
 * entries, and return each achievement with its earned status + date.
 */
export const getAchievements = async (
  userId: Types.ObjectId | string
): Promise<AchievementWithStatus[]> => {
  const userObjId = new Types.ObjectId(String(userId));
  const progress = await UserProgress.findOne({ userId: userObjId });
  if (!progress) {
    return ACHIEVEMENTS.map((a) => ({ ...a, earned: false, earnedAt: null }));
  }

  const mistakeStats = await getMistakeStats(userObjId).catch(() => null);

  const stats: AchievementStats = {
    completedLessons: progress.completedLessons.length,
    currentLevel: progress.currentLevel,
    examsPassed: progress.completedExams.filter((e) => e.passedThreshold).length,
    perfectExams: progress.completedExams.filter((e) => e.score >= 100).length,
    certificatesCount: progress.certificates.length,
    xp: progress.xp,
    longestStreak: progress.streak?.longestStreak ?? 0,
    hasCompletedAssessment: Boolean(progress.hasCompletedAssessment),
    resolvedMistakes: mistakeStats?.resolved ?? 0,
    unlockedGamesCount: progress.unlockedGames.length,
  };

  let changed = false;
  const result: AchievementWithStatus[] = ACHIEVEMENTS.map((def) => {
    const existing = progress.achievements.find((a) => a.achievementId === def.id);
    const nowEarned = Boolean(existing) || def.check(stats);

    // Persist the moment of first earning so the date survives regressions.
    if (nowEarned && !existing) {
      progress.achievements.push({ achievementId: def.id, earnedAt: new Date() });
      changed = true;
    }

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      earned: nowEarned,
      earnedAt: existing ? existing.earnedAt : nowEarned ? new Date() : null,
    };
  });

  if (changed) {
    await progress.save();
  }

  return result;
};

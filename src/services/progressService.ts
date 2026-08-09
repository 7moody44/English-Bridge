import api from './api';

export interface ProgressStats {
  xp: number;
  streak: number;
  longestStreak: number;
  cefrLevel: string;
  certificates: number;
  completedLevels: number;
  completedLessons: number;
  hasCompletedAssessment: boolean;
  assessmentCefrLevel: string | null;
}

export interface Certificate {
  levelId: number;
  cefrLevel: string;
  earned: boolean;
  earnedAt: Date | null;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

export interface ProgressData {
  currentLevel: number;
  currentLesson: number;
  completedLessons: number;
  completedCourses: number;
  totalScore: number;
  xp: number;
  streak: Streak;
  cefrLevel: string;
  certificates: Certificate[];
  unlockedGames: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: Date | null;
}

/**
 * Get user progress
 */
export const getProgress = async (): Promise<ProgressData> => {
  try {
    const response = await api.get('/progress');
    return response.data.progress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

/**
 * Get progress stats
 */
export const getProgressStats = async (): Promise<ProgressStats> => {
  try {
    const response = await api.get('/progress/stats');
    return response.data.stats;
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    throw error;
  }
};

/**
 * Add XP after completing activity
 */
export const addXP = async (
  score: number,
  activityType: 'lesson' | 'exam' | 'practice' | 'game' = 'lesson'
): Promise<{
  xpEarned: number;
  totalXP: number;
  streak: Streak;
}> => {
  try {
    const response = await api.post('/progress/xp', { score, activityType });
    return {
      xpEarned: response.data.xpEarned,
      totalXP: response.data.totalXP,
      streak: response.data.streak,
    };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
};

/**
 * Get available certificates
 */
export const getCertificates = async (): Promise<Certificate[]> => {
  try {
    const response = await api.get('/progress/certificates');
    return response.data.certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

/**
 * Claim a certificate
 */
export const claimCertificate = async (levelId: number): Promise<Certificate[]> => {
  try {
    const response = await api.post(`/progress/certificates/${levelId}`);
    return response.data.certificates;
  } catch (error) {
    console.error('Error claiming certificate:', error);
    throw error;
  }
};

/**
 * Update current progress
 */
export const updateProgress = async (data: {
  currentLevel?: number;
  currentLesson?: number;
}): Promise<ProgressData> => {
  try {
    const response = await api.put('/progress', data);
    return response.data.progress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Spend XP to unlock a premium game. Returns the updated balance and the full
 * list of unlocked game ids.
 */
export const unlockGame = async (
  gameId: string,
  cost: number
): Promise<{ xp: number; xpSpent: number; unlockedGames: string[] }> => {
  try {
    const response = await api.post(`/progress/games/${gameId}/unlock`, { cost });
    return {
      xp: response.data.xp,
      xpSpent: response.data.xpSpent,
      unlockedGames: response.data.unlockedGames,
    };
  } catch (error) {
    console.error('Error unlocking game:', error);
    throw error;
  }
};

/**
 * Get all achievements with earned status (computed + persisted server-side).
 */
export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await api.get('/progress/achievements');
    return response.data.achievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

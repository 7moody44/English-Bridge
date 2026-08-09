import { Router, Response } from 'express';
import UserProgress from '../models/UserProgress.js';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import * as progressService from '../services/progressService.js';
import * as achievementService from '../services/achievementService.js';
import { Types } from 'mongoose';

const router = Router();

// Get user progress
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      res.status(404).json({ success: false, error: 'Progress not found' });
      return;
    }

    res.json({
      success: true,
      progress: {
        currentLevel: progress.currentLevel,
        currentLesson: progress.currentLesson,
        completedLessons: progress.completedLessons.length,
        completedCourses: progress.completedCourses.length,
        totalScore: progress.totalScore,
        xp: progress.xp,
        streak: progress.streak,
        cefrLevel: progress.cefrLevel,
        certificates: progress.certificates,
        unlockedGames: progress.unlockedGames,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get progress stats
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const stats = await progressService.getProgressStats(userObjectId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update progress
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { currentLevel, currentLesson } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(currentLevel && { currentLevel }),
          ...(currentLesson && { currentLesson }),
        },
      },
      { new: true }
    );

    if (!progress) {
      res.status(404).json({ success: false, error: 'Progress not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Progress updated',
      progress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Add XP (called after completing lesson, game, practice)
router.post('/xp', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { score, activityType } = req.body;

    if (typeof score !== 'number' || score < 0 || score > 100) {
      res.status(400).json({ success: false, error: 'Invalid score' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const { progress, xpEarned } = await progressService.addXP(
      userObjectId,
      score,
      activityType
    );

    res.json({
      success: true,
      message: 'XP added',
      xpEarned,
      totalXP: progress.xp,
      streak: progress.streak,
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get available certificates
router.get('/certificates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const certificates = await progressService.getAvailableCertificates(userObjectId);
    res.json({ success: true, certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Claim certificate
router.post('/certificates/:levelId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const levelIdStr = req.params.levelId;
    if (!levelIdStr) {
      res.status(400).json({ success: false, error: 'Level ID is required' });
      return;
    }

    const levelId = parseInt(levelIdStr);
    if (isNaN(levelId) || levelId < 1 || levelId > 10) {
      res.status(400).json({ success: false, error: 'Invalid level ID' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const canClaim = await progressService.canClaimCertificate(userObjectId, levelId);
    if (!canClaim) {
      res.status(400).json({
        success: false,
        error: 'Cannot claim certificate - level not completed or already claimed',
      });
      return;
    }

    const progress = await progressService.awardCertificate(userObjectId, levelId);
    res.json({
      success: true,
      message: 'Certificate awarded',
      certificates: progress.certificates,
    });
  } catch (error) {
    console.error('Error claiming certificate:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Unlock a premium game by spending XP
router.post('/games/:gameId/unlock', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const gameId = req.params.gameId;
    if (!gameId) {
      res.status(400).json({ success: false, error: 'Game ID is required' });
      return;
    }

    const cost = typeof req.body?.cost === 'number' ? Math.max(0, Math.floor(req.body.cost)) : 0;

    const userObjectId = new Types.ObjectId(userId);
    const { progress, unlocked, xpSpent } = await progressService.unlockGame(
      userObjectId,
      gameId,
      cost
    );

    if (!unlocked) {
      res.status(400).json({
        success: false,
        error: 'Not enough XP to unlock this game',
        xp: progress.xp,
      });
      return;
    }

    res.json({
      success: true,
      message: xpSpent > 0 ? 'Game unlocked' : 'Game already unlocked',
      xpSpent,
      xp: progress.xp,
      unlockedGames: progress.unlockedGames,
    });
  } catch (error) {
    console.error('Error unlocking game:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get achievements (computed + persisted)
router.get('/achievements', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const achievements = await achievementService.getAchievements(userObjectId);
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export { router as progressRoutes };
export default router;

import { Router, Response } from 'express';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import { allLevelExams } from '../config/examData.js';
import * as progressService from '../services/progressService.js';
import { recordMistakes, MistakeInput } from '../services/mistakeService.js';
import { Types } from 'mongoose';

/**
 * Shape of a client-supplied mistake payload (from QuizInterface's detail
 * callback). All fields are strings/arrays — easy to forward from the frontend.
 */
interface ClientMistake {
  question: string;
  options?: unknown;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

/** Coerces a raw client mistake array into validated MistakeInput records. */
const toMistakeInputs = (
  raw: unknown,
  source: 'exam' | 'lesson',
  sourceLabel: string,
  cefr?: string
): MistakeInput[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m): MistakeInput | null => {
      if (!m || typeof m !== 'object') return null;
      const item = m as ClientMistake;
      if (typeof item.question !== 'string' || typeof item.correctAnswer !== 'string') {
        return null;
      }
      return {
        source,
        sourceLabel,
        question: item.question,
        options: Array.isArray(item.options) ? (item.options as string[]) : undefined,
        userAnswer:
          typeof item.userAnswer === 'string' ? item.userAnswer : String(item.userAnswer ?? ''),
        correctAnswer: item.correctAnswer,
        explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
        cefr,
      };
    })
    .filter((m): m is MistakeInput => m !== null);
};

const router = Router();

// Get all levels with progress
router.get('/levels', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userProgress = await UserProgress.findOne({ userId });

    const levels = [];
    for (let levelId = 1; levelId <= 10; levelId++) {
      const lessonsInLevel = await Lesson.countDocuments({
        levelId,
      });

      if (lessonsInLevel > 0) {
        const completedLessons = userProgress?.completedLessons.filter(
          (l) => l.levelId === levelId
        ).length || 0;

        const currentLevel = userProgress?.currentLevel || 1;

        // A level is locked if its ID is greater than the user's current level.
        // currentLevel is the single source of truth, updated by both placement
        // tests and passing exams.
        const isLocked = levelId > currentLevel;
        const unlockedReason = isLocked
          ? `Complete previous levels to unlock Level ${levelId}.`
          : undefined;

        levels.push({
          levelId,
          title: `Level ${levelId}`,
          lessonsCompleted: completedLessons,
          totalLessons: 8,
          isLocked,
          unlockedReason: isLocked ? unlockedReason : undefined,
        });
      }
    }

    res.json({
      success: true,
      levels,
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all lessons for a specific level
router.get('/:levelId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const levelId = req.params.levelId ? parseInt(req.params.levelId) : undefined;

    if (!levelId) {
      res.status(400).json({ success: false, error: 'Invalid parameters' });
      return;
    }

    // Get all lessons for this level
    const lessons = await Lesson.find({
      levelId,
    }).sort({ lessonNumber: 1 });

    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });
    
    // Map lessons with completion status
    const lessonsWithProgress = lessons.map((lesson) => {
      const completed = userProgress?.completedLessons.find(
        (l) => l.levelId === levelId && l.lessonId === lesson.lessonNumber
      );

      return {
        id: lesson._id,
        levelId: lesson.levelId,
        lessonNumber: lesson.lessonNumber,
        title: lesson.title,
        description: lesson.description,
        isCompleted: !!completed,
        score: completed?.score,
        completedAt: completed?.completedAt,
      };
    });

    // Calculate if all lessons are completed for the final exam
    const allLessonsCompleted = lessons.length === 8 && 
      lessonsWithProgress.filter(l => l.isCompleted).length === 8;

    res.json({
      success: true,
      lessons: lessonsWithProgress,
      totalLessons: lessons.length,
      completedLessons: lessonsWithProgress.filter(l => l.isCompleted).length,
      examUnlocked: allLessonsCompleted,
    });
  } catch (error) {
    console.error('Error fetching level lessons:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get final exam for a level
router.get('/:levelId/exam', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const levelId = req.params.levelId ? parseInt(req.params.levelId) : undefined;

    if (!levelId) {
      res.status(400).json({ success: false, error: 'Invalid parameters' });
      return;
    }

    // Check if exam exists for this level (1-4)
    const exam = allLevelExams[levelId as keyof typeof allLevelExams];
    if (!exam) {
      res.status(404).json({ success: false, error: 'Exam not available for this level' });
      return;
    }

    // Get user progress to check completion status
    const userProgress = await UserProgress.findOne({ userId });
    
    // Count completed lessons for this level
    const completedLessons = userProgress?.completedLessons.filter(
      (l) => l.levelId === levelId
    ).length || 0;

    res.json({
      success: true,
      exam: exam,
      completedLessons,
      examUnlocked: true,
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Submit exam completion
router.post('/:levelId/exam/complete', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const levelId = req.params.levelId ? parseInt(req.params.levelId) : undefined;
    const { score, mistakes } = req.body;

    if (!levelId || score === undefined) {
      res.status(400).json({ success: false, error: 'Invalid parameters' });
      return;
    }

    // Capture wrong answers for the Mistakes review page (non-blocking).
    const examMistakes = toMistakeInputs(
      mistakes,
      'exam',
      `Level ${levelId} Final Exam`,
      progressService.CEFR_LEVEL_MAP[levelId]
    );
    if (examMistakes.length > 0) {
      recordMistakes(userId, examMistakes).catch((e) =>
        console.error('Failed to record exam mistakes:', e)
      );
    }

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      res.status(404).json({ success: false, error: 'User progress not found' });
      return;
    }

    // Record exam in completedExams for level locking logic.
    // Dedupe: only one entry per level — update score if a better attempt comes in.
    const numericScore = Math.min(100, Math.max(0, score || 0));
    const passedThreshold = numericScore >= 50; // 50% threshold for level unlock
    const existingExam = userProgress.completedExams.find((e) => e.levelId === levelId);
    if (existingExam) {
      // Keep the best score; only upgrade passedThreshold to true, never downgrade.
      if (numericScore > existingExam.score) existingExam.score = numericScore;
      if (passedThreshold) existingExam.passedThreshold = true;
      existingExam.completedAt = new Date();
    } else {
      userProgress.completedExams.push({
        levelId,
        score: numericScore,
        passedThreshold,
        completedAt: new Date(),
      });
    }

    // Also record in completedCourses (dedupe by level+course).
    const courseId = 1; // Default course is 1 for MVP
    const existingCourse = userProgress.completedCourses.find(
      (c) => c.levelId === levelId && c.courseId === courseId
    );
    if (existingCourse) {
      if (numericScore > existingCourse.finalExamScore) {
        existingCourse.finalExamScore = numericScore;
      }
      if (numericScore >= 70) existingCourse.passed = true;
      existingCourse.completedAt = new Date();
    } else {
      userProgress.completedCourses.push({
        levelId,
        courseId,
        finalExamScore: numericScore,
        passed: numericScore >= 70,
        completedAt: new Date(),
      });
    }

    // Whether this user has ever passed this exam before this attempt.
    // Used to decide if XP should be awarded (avoid farming via replays).
    const hadAlreadyPassedBefore =
      existingExam !== undefined && existingExam.passedThreshold;

    // Update current level if exam passed 70% and this is the current level
    if (numericScore >= 70 && levelId === userProgress.currentLevel) {
      userProgress.currentLevel = Math.min(10, levelId + 1);
      // Add level to completedLevels array
      if (!userProgress.completedLevels.includes(levelId)) {
        userProgress.completedLevels.push(levelId);
      }
    }

    await userProgress.save();

    // Award XP for exam completion — only the FIRST pass earns XP.
    let xpResult;
    try {
      const userObjectId = new Types.ObjectId(userId);
      const { progress: updatedProgress, xpEarned } = await progressService.addXP(
        userObjectId,
        numericScore,
        'exam',
        hadAlreadyPassedBefore // alreadyAwarded → skip XP on replays
      );
      xpResult = {
        xpEarned,
        totalXP: updatedProgress.xp,
        streak: updatedProgress.streak,
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
    }

    // Award certificate if passed with 70%+
    let certificateAwarded = false;
    if (numericScore >= 70) {
      try {
        const userObjectId = new Types.ObjectId(userId);
        await progressService.awardCertificate(userObjectId, levelId);
        certificateAwarded = true;
      } catch (error) {
        console.error('Error awarding certificate:', error);
      }
    }

    res.json({
      success: true,
      message: 'Exam completion recorded',
      passed: numericScore >= 70,
      unlockedNextLevel: numericScore >= 50,
      certificateAwarded,
      xpEarned: xpResult?.xpEarned,
      totalXP: xpResult?.totalXP,
      streak: xpResult?.streak,
      progress: userProgress,
    });
  } catch (error) {
    console.error('Error completing exam:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get specific lesson
router.get('/:levelId/:lessonNumber', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const levelId = req.params.levelId ? parseInt(req.params.levelId) : undefined;
    const lessonNumber = req.params.lessonNumber ? parseInt(req.params.lessonNumber) : undefined;

    if (!levelId || !lessonNumber) {
      res.status(400).json({ success: false, error: 'Invalid parameters' });
      return;
    }

    const lesson = await Lesson.findOne({
      levelId,
      lessonNumber,
    });

    if (!lesson) {
      res.status(404).json({ success: false, error: 'Lesson not found' });
      return;
    }

    res.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Submit lesson completion
router.post('/:levelId/:lessonNumber/complete', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const levelId = req.params.levelId ? parseInt(req.params.levelId) : undefined;
    const lessonNumber = req.params.lessonNumber ? parseInt(req.params.lessonNumber) : undefined;
    const { score, timeSpent, mistakes } = req.body;

    if (!levelId || !lessonNumber) {
      res.status(400).json({ success: false, error: 'Invalid parameters' });
      return;
    }

    // Capture wrong answers for the Mistakes review page (non-blocking).
    const lessonMistakes = toMistakeInputs(
      mistakes,
      'lesson',
      `Level ${levelId} · Lesson ${lessonNumber}`,
      progressService.CEFR_LEVEL_MAP[levelId]
    );
    if (lessonMistakes.length > 0) {
      recordMistakes(userId, lessonMistakes).catch((e) =>
        console.error('Failed to record lesson mistakes:', e)
      );
    }

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      res.status(404).json({ success: false, error: 'User progress not found' });
      return;
    }

    // Check if lesson already completed
    const alreadyCompleted = userProgress.completedLessons.find(
      (l) =>
        l.levelId === levelId &&
        l.lessonId === lessonNumber
    );

    const numericScore = Math.min(100, Math.max(0, score || 0));

    if (!alreadyCompleted) {
      userProgress.completedLessons.push({
        levelId,
        lessonId: lessonNumber,
        score: numericScore,
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
      });

      await userProgress.save();
    }

    // Award XP ONLY on first completion — replays don't farm XP.
    // (The streak still refreshes so reviewing on a new day keeps the streak alive.)
    let xpResult;
    try {
      const userObjectId = new Types.ObjectId(userId);
      const { progress: updatedProgress, xpEarned } = await progressService.addXP(
        userObjectId,
        numericScore,
        'lesson',
        Boolean(alreadyCompleted) // alreadyAwarded → skip XP on replays
      );
      xpResult = {
        xpEarned,
        totalXP: updatedProgress.xp,
        streak: updatedProgress.streak,
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
    }

    res.json({
      success: true,
      message: 'Lesson completion recorded',
      xpEarned: xpResult?.xpEarned,
      totalXP: xpResult?.totalXP,
      streak: xpResult?.streak,
      progress: userProgress,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export { router as lessonRoutes };
export default router;

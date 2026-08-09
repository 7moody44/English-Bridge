import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import { listeningExercises, ListeningExercise } from '../config/listeningExercisesData.js';
import { getHintCost, getHintTypeCost, ListeningHintType } from '../services/listeningService.js';
import * as progressService from '../services/progressService.js';
import { recordMistakes, MistakeInput } from '../services/mistakeService.js';
import UserProgress from '../models/UserProgress.js';
import { Types } from 'mongoose';

const router = Router();

/** Shape returned to the list view (no audioText/questions yet). */
const toListItem = (e: ListeningExercise) => ({
  id: e.id,
  title: e.title,
  level: e.level,
  levelNumber: e.levelNumber,
  category: e.category,
  icon: e.icon,
  description: e.description,
  duration: e.duration,
  questionCount: e.questions.length,
  hintCost: getHintCost(e.level),
});

// GET /api/practice/listening — list exercises, optionally filtered by level
router.get('/listening', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.query;
    let exercises = listeningExercises;

    if (level && level !== 'all') {
      exercises = listeningExercises.filter(
        (e) => e.level.toLowerCase().replace(/\s/g, '-') === String(level).toLowerCase()
      );
    }

    res.json({
      success: true,
      exercises: exercises.map(toListItem),
      total: exercises.length,
    });
  } catch (error) {
    console.error('Error fetching listening exercises:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/practice/listening/:exerciseId — full exercise (audioText, questions, hint costs)
router.get('/listening/:exerciseId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { exerciseId } = req.params;
    const exercise = listeningExercises.find((e) => e.id === exerciseId);

    if (!exercise) {
      res.status(404).json({ success: false, error: 'Listening exercise not found' });
      return;
    }

    res.json({
      success: true,
      exercise,
      hintCost: getHintCost(exercise.level),
      transcriptCost: getHintTypeCost(exercise.level, 'transcript'),
    });
  } catch (error) {
    console.error('Error fetching listening exercise:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/practice/listening/:exerciseId/hint
// Body: { hintType: 'fiftyFifty' | 'transcript' }
// Deducts the level-appropriate XP cost and returns the new balance.
router.post(
  '/listening/:exerciseId/hint',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { exerciseId } = req.params;
      const exercise = listeningExercises.find((e) => e.id === exerciseId);
      if (!exercise) {
        res.status(404).json({ success: false, error: 'Listening exercise not found' });
        return;
      }

      const { hintType } = req.body as { hintType?: ListeningHintType };
      if (hintType !== 'fiftyFifty' && hintType !== 'transcript') {
        res.status(400).json({ success: false, error: 'hintType must be "fiftyFifty" or "transcript"' });
        return;
      }

      const cost = getHintTypeCost(exercise.level, hintType);
      const userObjectId = new Types.ObjectId(userId);

      // Verify the balance before spending so we can give a clear error.
      const progress = await UserProgress.findOne({ userId: userObjectId });
      if (!progress) {
        res.status(404).json({ success: false, error: 'User progress not found' });
        return;
      }
      if (progress.xp < cost) {
        res.status(400).json({
          success: false,
          error: 'Insufficient XP for this hint',
          required: cost,
          balance: progress.xp,
        });
        return;
      }

      const { progress: updated, xpDeducted } = await progressService.deductXP(userObjectId, cost);

      res.json({
        success: true,
        hintType,
        xpDeducted,
        totalXP: updated.xp,
        hintCost: cost,
      });
    } catch (error) {
      console.error('Error purchasing listening hint:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// POST /api/practice/listening/:exerciseId/complete
// Body: { answers: number[], hintsUsed: number, timeSpent: number }
// Scores the answers, records mistakes, and awards XP.
router.post(
  '/listening/:exerciseId/complete',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { exerciseId } = req.params;
      const exercise = listeningExercises.find((e) => e.id === exerciseId);
      if (!exercise) {
        res.status(404).json({ success: false, error: 'Listening exercise not found' });
        return;
      }

      const { answers, hintsUsed, timeSpent } = req.body as {
        answers?: number[];
        hintsUsed?: number;
        timeSpent?: number;
      };
      if (!Array.isArray(answers)) {
        res.status(400).json({ success: false, error: 'answers array is required' });
        return;
      }

      // Score the submission.
      let correctAnswers = 0;
      const totalQuestions = exercise.questions.length;
      exercise.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Capture wrong answers for the Mistakes review page.
      const wrongItems: MistakeInput[] = [];
      exercise.questions.forEach((question, index) => {
        const userAns = answers[index];
        if (userAns !== question.correctAnswer) {
          const correctText = question.options?.[question.correctAnswer] ?? String(question.correctAnswer);
          const userText =
            typeof userAns === 'number' && question.options?.[userAns]
              ? question.options[userAns]
              : String(userAns ?? '(no answer)');
          wrongItems.push({
            source: 'practice',
            sourceLabel: `Listening: ${exercise.title}`,
            question: question.question ?? `(question ${index + 1})`,
            options: question.options,
            userAnswer: userText,
            correctAnswer: correctText,
            explanation: question.explanation,
            cefr: exercise.level,
          });
        }
      });
      if (wrongItems.length > 0) {
        recordMistakes(userId, wrongItems).catch((e) =>
          console.error('Failed to record listening mistakes:', e)
        );
      }

      // Award XP for practice completion (score 0-100 → scaled XP).
      let xpResult;
      try {
        const userObjectId = new Types.ObjectId(userId);
        const { progress, xpEarned } = await progressService.addXP(userObjectId, score, 'practice');
        xpResult = {
          xpEarned,
          totalXP: progress.xp,
          streak: progress.streak.currentStreak,
        };
      } catch (e) {
        console.error('Error awarding listening XP:', e);
      }

      res.json({
        success: true,
        message: 'Listening practice completed',
        results: {
          score,
          correctAnswers,
          totalQuestions,
          hintsUsed: hintsUsed ?? 0,
          timeSpent: timeSpent ?? 0,
          passed: score >= 70,
        },
        xpEarned: xpResult?.xpEarned,
        totalXP: xpResult?.totalXP,
        streak: xpResult?.streak,
      });
    } catch (error) {
      console.error('Error completing listening practice:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

export { router as listeningRoutes };
export default router;

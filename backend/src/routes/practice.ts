import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import { readingPassages } from '../config/readingPassagesData.js';
import * as progressService from '../services/progressService.js';
import { recordMistakes, MistakeInput } from '../services/mistakeService.js';
import { Types } from 'mongoose';

const router = Router();

// Get all reading passages (optionally filtered by level)
router.get('/reading', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.query;

    let filteredPassages = readingPassages;

    // Filter by level if provided
    if (level && level !== 'all') {
      filteredPassages = readingPassages.filter(
        (passage) => passage.level.toLowerCase().replace(/\s/g, '-') === (level as string).toLowerCase()
      );
    }

    // Return passages without the full question details for the list view
    const passagesList = filteredPassages.map((passage) => ({
      id: passage.id,
      title: passage.title,
      description: passage.passage.substring(0, 100) + '...',
      level: passage.level,
      category: passage.category,
      duration: passage.duration,
      questionCount: passage.questions.length,
    }));

    res.json({
      success: true,
      passages: passagesList,
      total: passagesList.length,
    });
  } catch (error) {
    console.error('Error fetching reading passages:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get a specific reading passage by ID
router.get('/reading/:passageId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { passageId } = req.params;

    const passage = readingPassages.find((p) => p.id === passageId);

    if (!passage) {
      res.status(404).json({ success: false, error: 'Passage not found' });
      return;
    }

    res.json({
      success: true,
      passage,
    });
  } catch (error) {
    console.error('Error fetching reading passage:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Submit reading practice completion (future: track progress)
router.post('/reading/:passageId/complete', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { passageId } = req.params;
    const { answers, timeSpent, hintsUsed } = req.body;

    const passage = readingPassages.find((p) => p.id === passageId);

    if (!passage) {
      res.status(404).json({ success: false, error: 'Passage not found' });
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = passage.questions.length;

    passage.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Capture wrong answers for the Mistakes review page.
    // correctAnswer is an index into `options`; we store the readable text.
    const wrongItems: MistakeInput[] = [];
    passage.questions.forEach((question, index) => {
      const userAns = answers[index];
      if (userAns !== question.correctAnswer) {
        const correctText =
          question.options?.[question.correctAnswer] ?? String(question.correctAnswer);
        const userText =
          typeof userAns === 'number' && question.options?.[userAns]
            ? question.options[userAns]
            : String(userAns ?? '(no answer)');
        wrongItems.push({
          source: 'practice',
          sourceLabel: `Reading: ${passage.title}`,
          question: question.question ?? `(question ${index + 1})`,
          options: question.options,
          userAnswer: userText,
          correctAnswer: correctText,
          explanation: question.explanation,
          cefr: passage.level,
        });
      }
    });
    if (wrongItems.length > 0) {
      recordMistakes(userId, wrongItems).catch((e) =>
        console.error('Failed to record reading mistakes:', e)
      );
    }

    // Award XP for practice completion
    let xpResult;
    try {
      const userObjectId = new Types.ObjectId(userId);
      const { progress: updatedProgress, xpEarned } = await progressService.addXP(
        userObjectId,
        score,
        'practice'
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
      message: 'Reading practice completed',
      results: {
        score,
        correctAnswers,
        totalQuestions,
        timeSpent,
        hintsUsed,
        passed: score >= 70,
      },
      xpEarned: xpResult?.xpEarned,
      totalXP: xpResult?.totalXP,
      streak: xpResult?.streak,
    });
  } catch (error) {
    console.error('Error completing reading practice:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export { router as practiceRoutes };
export default router;

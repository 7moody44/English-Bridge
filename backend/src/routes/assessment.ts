import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import {
  ASSESSMENT_QUESTIONS,
  toPublicQuestion,
} from '../config/assessmentQuestions.js';
import {
  gradeAssessment,
  saveAssessmentResult,
  getHistory,
} from '../services/assessmentService.js';
import UserProgress from '../models/UserProgress.js';

const router = Router();

/**
 * GET /api/assessment/questions
 * Returns the 24 questions WITHOUT correct answers / explanations.
 */
router.get('/questions', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    questions: ASSESSMENT_QUESTIONS.map(toPublicQuestion),
  });
});

/**
 * GET /api/assessment/status
 * Quick gate check: has the user completed the assessment, and what CEFR did they get?
 */
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const progress = await UserProgress.findOne({ userId }).lean();
    res.json({
      success: true,
      hasCompletedAssessment: Boolean(progress?.hasCompletedAssessment),
      assessmentCefrLevel: progress?.assessmentCefrLevel ?? null,
      cefrLevel: progress?.cefrLevel ?? 'A1',
      currentLevel: progress?.currentLevel ?? 1,
    });
  } catch (error) {
    console.error('Assessment status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/assessment/submit
 * Body: { answers: { [questionId]: selectedOptionIndex } }
 * Grades, persists the attempt, updates progress (CEFR/level only move up),
 * and records wrong answers into the Mistakes collection.
 */
router.post('/submit', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const rawAnswers = req.body?.answers;
    if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
      res.status(400).json({ success: false, error: 'answers object is required' });
      return;
    }

    // Coerce keys/values to numbers and drop anything invalid.
    const answers: Record<number, number> = {};
    for (const [k, v] of Object.entries(rawAnswers)) {
      const qid = Number(k);
      const opt = Number(v);
      if (!Number.isNaN(qid) && !Number.isNaN(opt)) {
        answers[qid] = opt;
      }
    }

    const { result, progress } = await saveAssessmentResult(userId, answers);

    res.status(201).json({
      success: true,
      message: 'Assessment graded successfully',
      result: {
        id: result._id,
        score: result.score,
        totalCorrect: result.totalCorrect,
        totalQuestions: result.totalQuestions,
        cefrLevel: result.cefrLevel,
        mappedLevel: result.mappedLevel,
        perBand: result.perBand,
        takenAt: result.takenAt,
      },
      progress: progress
        ? {
            cefrLevel: progress.cefrLevel,
            currentLevel: progress.currentLevel,
            hasCompletedAssessment: progress.hasCompletedAssessment,
            assessmentCefrLevel: progress.assessmentCefrLevel,
          }
        : undefined,
    });
  } catch (error) {
    console.error('Assessment submit error:', error);
    res.status(500).json({ success: false, error: 'Server error during assessment' });
  }
});

/**
 * Optional dev-only preview of how grading would go, without persisting.
 * Useful for sanity-checking the bank.
 */
router.post('/preview-grade', authMiddleware, (req: AuthRequest, res: Response): void => {
  const rawAnswers = req.body?.answers;
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    res.status(400).json({ success: false, error: 'answers object is required' });
    return;
  }
  const answers: Record<number, number> = {};
  for (const [k, v] of Object.entries(rawAnswers)) {
    const qid = Number(k);
    const opt = Number(v);
    if (!Number.isNaN(qid) && !Number.isNaN(opt)) answers[qid] = opt;
  }
  const grade = gradeAssessment(answers);
  res.json({ success: true, grade });
});

/**
 * GET /api/assessment/history
 * Past attempts, newest first.
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const history = await getHistory(userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Assessment history error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export { router as assessmentRoutes };
export default router;

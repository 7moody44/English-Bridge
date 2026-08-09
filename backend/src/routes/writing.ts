import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import { writingTopics, WritingTopic } from '../config/writingTopicsData.js';
import { evaluateWriting, WritingFeedbackRequest } from '../services/writingService.js';
import * as progressService from '../services/progressService.js';
import { Types } from 'mongoose';

const router = Router();

/** Shape returned to the list view. */
const toListItem = (t: WritingTopic) => ({
  id: t.id,
  title: t.title,
  level: t.level,
  levelNumber: t.levelNumber,
  icon: t.icon,
  minWords: t.minWords,
});

// GET /api/practice/writing — list topics, optionally filtered by level
router.get('/writing', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.query;
    let topics = writingTopics;

    if (level && level !== 'all') {
      topics = writingTopics.filter(
        (t) => t.level.toLowerCase().replace(/\s/g, '-') === String(level).toLowerCase()
      );
    }

    res.json({
      success: true,
      topics: topics.map(toListItem),
      total: topics.length,
    });
  } catch (error) {
    console.error('Error fetching writing topics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/practice/writing/:topicId — full topic (prompt, vocab, hint)
router.get('/writing/:topicId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;
    const topic = writingTopics.find((t) => t.id === topicId);

    if (!topic) {
      res.status(404).json({ success: false, error: 'Writing topic not found' });
      return;
    }

    res.json({ success: true, topic });
  } catch (error) {
    console.error('Error fetching writing topic:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/practice/writing/:topicId/check
// Body: { text: string }
// Returns structured writing feedback + awards XP.
router.post(
  '/writing/:topicId/check',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { topicId } = req.params;
      const topic = writingTopics.find((t) => t.id === topicId);
      if (!topic) {
        res.status(404).json({ success: false, error: 'Writing topic not found' });
        return;
      }

      const { text } = req.body as { text?: string };
      if (typeof text !== 'string') {
        res.status(400).json({ success: false, error: 'text is required' });
        return;
      }

      const feedbackRequest: WritingFeedbackRequest = {
        prompt: topic.prompt,
        text,
        targetVocabulary: topic.targetVocabulary.map((v) => v.word),
        level: topic.level,
        minWords: topic.minWords,
      };

      const feedback = await evaluateWriting(feedbackRequest);

      // Award XP for practice completion (score 0-100 → scaled XP).
      let xpResult;
      try {
        const userObjectId = new Types.ObjectId(userId);
        const { progress, xpEarned } = await progressService.addXP(
          userObjectId,
          feedback.score,
          'practice'
        );
        xpResult = {
          xpEarned,
          totalXP: progress.xp,
          streak: progress.streak.currentStreak,
        };
      } catch (e) {
        console.error('Error awarding writing XP:', e);
      }

      res.json({
        success: true,
        feedback,
        xpEarned: xpResult?.xpEarned,
        totalXP: xpResult?.totalXP,
        streak: xpResult?.streak,
      });
    } catch (error) {
      console.error('Error evaluating writing:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

export { router as writingRoutes };
export default router;

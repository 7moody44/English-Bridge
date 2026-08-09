import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import { speakingTopics, SpeakingTopic } from '../config/speakingTopicsData.js';
import { evaluateSpeaking, SpeakingFeedbackRequest } from '../services/speakingService.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { config } from '../config/config.js';
import * as progressService from '../services/progressService.js';
import { Types } from 'mongoose';

const router = Router();

/** Shape returned to the list view (no prompt/vocab details yet). */
const toListItem = (t: SpeakingTopic) => ({
  id: t.id,
  title: t.title,
  level: t.level,
  category: t.category,
  icon: t.icon,
  description: t.description,
  duration: t.duration,
});

// GET /api/practice/speaking  — list topics, optionally filtered by level
router.get('/speaking', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.query;
    let topics = speakingTopics;

    if (level && level !== 'all') {
      topics = speakingTopics.filter(
        (t) => t.level.toLowerCase().replace(/\s/g, '-') === String(level).toLowerCase()
      );
    }

    res.json({
      success: true,
      topics: topics.map(toListItem),
      total: topics.length,
    });
  } catch (error) {
    console.error('Error fetching speaking topics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/practice/speaking/:topicId — full topic (prompt, vocab, tips)
router.get('/speaking/:topicId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;
    const topic = speakingTopics.find((t) => t.id === topicId);

    if (!topic) {
      res.status(404).json({ success: false, error: 'Speaking topic not found' });
      return;
    }

    res.json({ success: true, topic });
  } catch (error) {
    console.error('Error fetching speaking topic:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/practice/speaking/transcribe
// Body (JSON): { audio: string (base64), mimeType: string }
// Returns the transcribed text + confidence via Groq Whisper.
router.post(
  '/speaking/transcribe',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!config.isGroqEnabled) {
        res.status(503).json({
          success: false,
          error:
            'Speech transcription is not configured. Add a free GROQ_API_KEY (see backend/.env.example).',
        });
        return;
      }

      const { audio, mimeType } = req.body as { audio?: string; mimeType?: string };
      if (typeof audio !== 'string' || audio.length === 0) {
        res.status(400).json({ success: false, error: 'No audio provided.' });
        return;
      }

      const result = await transcribeAudio(audio, mimeType || 'audio/webm');

      res.json({
        success: true,
        transcription: result.text,
        confidence: result.confidence,
      });
    } catch (error: any) {
      console.error('Error transcribing audio:', error?.message || error);
      const message = error?.message || 'Transcription failed.';
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/practice/speaking/:topicId/feedback
// Body: { transcription: string }
// Returns structured AI feedback + awards XP.
router.post(
  '/speaking/:topicId/feedback',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { topicId } = req.params;
      const topic = speakingTopics.find((t) => t.id === topicId);
      if (!topic) {
        res.status(404).json({ success: false, error: 'Speaking topic not found' });
        return;
      }

      const { transcription, avgConfidence, duration } = req.body as {
        transcription?: string;
        avgConfidence?: number;
        duration?: number;
      };
      if (typeof transcription !== 'string') {
        res.status(400).json({ success: false, error: 'transcription is required' });
        return;
      }

      const feedbackRequest: SpeakingFeedbackRequest = {
        prompt: topic.prompt,
        transcription,
        targetVocabulary: topic.targetVocabulary.map((v) => v.word),
        level: topic.level,
        avgConfidence,
        durationSeconds: typeof duration === 'number' && duration > 0 ? duration : undefined,
      };

      const feedback = await evaluateSpeaking(feedbackRequest);

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
        console.error('Error awarding speaking XP:', e);
      }

      res.json({
        success: true,
        feedback,
        xpEarned: xpResult?.xpEarned,
        totalXP: xpResult?.totalXP,
        streak: xpResult?.streak,
      });
    } catch (error) {
      console.error('Error evaluating speaking:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

export { router as speakingRoutes };
export default router;

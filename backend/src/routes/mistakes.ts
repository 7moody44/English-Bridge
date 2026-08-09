import { Router, Response } from 'express';
import { authMiddleware, AuthRequest, getCurrentUserId } from '../middleware/auth.js';
import { MistakeSource } from '../models/Mistake.js';
import {
  getMistakes,
  getMistakeStats,
  resolveMistake,
} from '../services/mistakeService.js';

const router = Router();

const isSource = (v: unknown): v is MistakeSource =>
  typeof v === 'string' &&
  ['assessment', 'practice', 'exam', 'lesson', 'game'].includes(v);

const parseResolved = (v: unknown): boolean | 'all' => {
  if (v === 'true' || v === true) return true;
  if (v === 'false' || v === false) return false;
  return 'all';
};

/**
 * GET /api/mistakes?source=&resolved=&page=&limit=
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const sourceParam = req.query.source as unknown;
    const resolvedParam = req.query.resolved as unknown;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await getMistakes(userId, {
      source: isSource(sourceParam) ? sourceParam : 'all',
      resolved: parseResolved(resolvedParam),
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 20 : limit,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Mistakes list error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/mistakes/stats
 */
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const stats = await getMistakeStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Mistakes stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/mistakes/:id/resolve
 */
router.post('/:id/resolve', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const ok = await resolveMistake(userId, req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Mistake not found' });
      return;
    }
    res.json({ success: true, message: 'Marked as resolved' });
  } catch (error) {
    console.error('Mistake resolve error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export { router as mistakeRoutes };
export default router;

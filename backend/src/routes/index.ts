import { Router } from 'express';
import { authRoutes } from './auth.js';
import { progressRoutes } from './progress.js';
import { lessonRoutes } from './lessons.js';
import { practiceRoutes } from './practice.js';
import { assessmentRoutes } from './assessment.js';
import { mistakeRoutes } from './mistakes.js';
import { speakingRoutes } from './speaking.js';
import { writingRoutes } from './writing.js';
import { listeningRoutes } from './listening.js';
import { tutorRoutes } from './tutor.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/progress', progressRoutes);
router.use('/lessons', lessonRoutes);
router.use('/practice', practiceRoutes);
router.use('/practice', speakingRoutes);
router.use('/practice', writingRoutes);
router.use('/practice', listeningRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/mistakes', mistakeRoutes);
router.use('/tutor', tutorRoutes);

// Root endpoint
router.get('/', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'English Bridge API is running',
    data: {
      version: '1.0.0',
      description: 'Backend API for English Bridge educational application',
      documentation: '/api/docs',
      health: '/health',
    },
  };
  res.json(response);
});

// API documentation placeholder
router.get('/docs', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'API Documentation',
    data: {
      endpoints: {
        auth: {
          'POST /api/auth/register': 'User registration',
          'POST /api/auth/login': 'User login',
          'POST /api/auth/logout': 'User logout',
          'GET /api/auth/me': 'Get current user',
        },
        progress: {
          'GET /api/progress/:userId': 'Get user progress',
          'POST /api/progress/lesson': 'Update lesson progress',
          'POST /api/progress/course': 'Update course progress',
          'GET /api/progress/:userId/access/:levelId/:courseId/:lessonId': 'Check lesson access',
        },
        lessons: {
          'GET /api/lessons/:levelId/:courseId': 'Get course lessons',
          'GET /api/lessons/:levelId/:courseId/:lessonId': 'Get specific lesson',
          'GET /api/lessons/structure': 'Get curriculum structure',
        },
        practice: {
          'GET /api/practice/reading': 'Get all reading passages (optional ?level= filter)',
          'GET /api/practice/reading/:passageId': 'Get specific reading passage',
          'POST /api/practice/reading/:passageId/complete': 'Submit reading practice completion',
          'GET /api/practice/speaking': 'Get all speaking topics (optional ?level= filter)',
          'GET /api/practice/speaking/:topicId': 'Get a specific speaking topic',
          'POST /api/practice/speaking/:topicId/feedback': 'Submit transcription and get AI feedback + XP',
          'GET /api/practice/writing': 'Get all writing topics (optional ?level= filter)',
          'GET /api/practice/writing/:topicId': 'Get a specific writing topic',
          'POST /api/practice/writing/:topicId/check': 'Submit writing text and get AI feedback + XP',
          'GET /api/practice/listening': 'Get all listening exercises (optional ?level= filter)',
          'GET /api/practice/listening/:exerciseId': 'Get a specific listening exercise',
          'POST /api/practice/listening/:exerciseId/hint': 'Spend XP on a hint (fiftyFifty / transcript)',
          'POST /api/practice/listening/:exerciseId/complete': 'Submit listening answers and earn XP',
        },
        tutor: {
          'POST /api/tutor/chat': 'Send a message to the AI English Teacher (multi-turn chat)',
        },
      },
    },
  };
  res.json(response);
});

export { router as apiRoutes };
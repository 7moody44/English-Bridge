// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Progress Types
export interface CompletedLesson {
  levelId: number;
  courseId: number;
  lessonId: number;
  score: number;
  completedAt: Date;
  timeSpent: number; // in minutes
}

export interface CompletedCourse {
  levelId: number;
  courseId: number;
  finalExamScore: number;
  passed: boolean;
  completedAt: Date;
}

export interface UserProgress {
  userId: string;
  currentLevel: number;
  currentCourse: number;
  currentLesson: number;
  completedLessons: CompletedLesson[];
  completedCourses: CompletedCourse[];
  completedLevels: number[];
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Lesson Types
export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'listening' | 'reading';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  audioPrompt?: string;
  explanation?: string;
}

export interface AudioContent {
  text: string;
  type: 'word' | 'phrase' | 'sentence';
  context: string;
}

export interface LessonContent {
  introduction: string;
  objectives: string[];
  mainContent: string;
  summary: string;
}

export interface Lesson {
  id: string;
  levelId: number;
  courseId: number;
  lessonNumber: number;
  title: string;
  description: string;
  content: LessonContent;
  exercises: Exercise[];
  audioContent?: AudioContent[];
  createdAt: Date;
  updatedAt: Date;
}

// Request Types with Authentication
// Note: Express.Request.user is augmented in src/middleware/auth.ts via Express.User.

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICompletedLesson {
  levelId: number;
  lessonId: number;
  score: number;
  completedAt: Date;
  timeSpent: number;
}

export interface ICompletedCourse {
  levelId: number;
  courseId: number;
  finalExamScore: number;
  passed: boolean;
  completedAt: Date;
}

export interface ICompletedExam {
  levelId: number;
  score: number;
  passedThreshold: boolean;
  completedAt: Date;
}

export interface ICertificate {
  levelId: number;
  cefrLevel: string;
  earnedAt: Date;
}

export interface IEarnedAchievement {
  achievementId: string;
  earnedAt: Date;
}

export interface IStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  currentLevel: number;
  currentCourse: number;
  currentLesson: number;
  completedLessons: ICompletedLesson[];
  completedCourses: ICompletedCourse[];
  completedExams: ICompletedExam[];
  completedLevels: number[];
  totalScore: number;
  xp: number;
  streak: IStreak;
  certificates: ICertificate[];
  /** Ids of premium games the user has purchased with XP. */
  unlockedGames: string[];
  /** Achievements earned (persisted so the earnedAt date survives). */
  achievements: IEarnedAchievement[];
  cefrLevel: string;
  hasCompletedAssessment: boolean;
  assessmentCefrLevel?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const completedLessonSchema = new Schema<ICompletedLesson>(
  {
    levelId: {
      type: Number,
      required: [true, 'Level ID is required'],
      min: [1, 'Level ID must be at least 1'],
      max: [10, 'Level ID must not exceed 10'],
    },
    lessonId: {
      type: Number,
      required: [true, 'Lesson ID is required'],
      min: [1, 'Lesson ID must be at least 1'],
      max: [8, 'Lesson ID must not exceed 8'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score must not exceed 100'],
    },
    completedAt: {
      type: Date,
      required: [true, 'Completion date is required'],
      default: Date.now,
    },
    timeSpent: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: [0, 'Time spent must be at least 0'],
      default: 0,
    },
  },
  { _id: false }
);

const completedCourseSchema = new Schema<ICompletedCourse>(
  {
    levelId: {
      type: Number,
      required: [true, 'Level ID is required'],
      min: [1, 'Level ID must be at least 1'],
      max: [10, 'Level ID must not exceed 10'],
    },
    courseId: {
      type: Number,
      required: [true, 'Course ID is required'],
      min: [1, 'Course ID must be at least 1'],
      max: [10, 'Course ID must not exceed 10'],
    },
    finalExamScore: {
      type: Number,
      required: [true, 'Final exam score is required'],
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score must not exceed 100'],
    },
    passed: {
      type: Boolean,
      required: [true, 'Passed flag is required'],
      validate: {
        validator: function (this: ICompletedCourse) {
          // Score must be 70 or higher to be passed
          return this.passed ? this.finalExamScore >= 70 : true;
        },
        message: 'Cannot mark course as passed with a score below 70',
      },
    },
    completedAt: {
      type: Date,
      required: [true, 'Completion date is required'],
      default: Date.now,
    },
  },
  { _id: false }
);

const completedExamSchema = new Schema<ICompletedExam>(
  {
    levelId: {
      type: Number,
      required: [true, 'Level ID is required'],
      min: [1, 'Level ID must be at least 1'],
      max: [10, 'Level ID must not exceed 10'],
    },
    score: {
      type: Number,
      required: [true, 'Exam score is required'],
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score must not exceed 100'],
    },
    passedThreshold: {
      type: Boolean,
      required: [true, 'Pass threshold flag is required'],
      validate: {
        validator: function (this: ICompletedExam) {
          // Score must be 50 or higher to pass threshold and unlock next level
          return this.passedThreshold ? this.score >= 50 : true;
        },
        message: 'Cannot mark as passed threshold with a score below 50',
      },
    },
    completedAt: {
      type: Date,
      required: [true, 'Completion date is required'],
      default: Date.now,
    },
  },
  { _id: false }
);

const certificateSchema = new Schema<ICertificate>(
  {
    levelId: {
      type: Number,
      required: [true, 'Level ID is required'],
      min: [1, 'Level ID must be at least 1'],
      max: [10, 'Level ID must not exceed 10'],
    },
    cefrLevel: {
      type: String,
      required: [true, 'CEFR level is required'],
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    earnedAt: {
      type: Date,
      required: [true, 'Earned date is required'],
      default: Date.now,
    },
  },
  { _id: false }
);

const earnedAchievementSchema = new Schema<IEarnedAchievement>(
  {
    achievementId: {
      type: String,
      required: [true, 'Achievement ID is required'],
      trim: true,
    },
    earnedAt: {
      type: Date,
      required: [true, 'Earned date is required'],
      default: Date.now,
    },
  },
  { _id: false }
);

const streakSchema = new Schema<IStreak>(
  {
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, 'Streak cannot be negative'],
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, 'Longest streak cannot be negative'],
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      unique: true,
      ref: 'User',
      index: true,
    },
    currentLevel: {
      type: Number,
      required: [true, 'Current level is required'],
      default: 1,
      min: [1, 'Level must be at least 1'],
      max: [10, 'Level must not exceed 10'],
    },
    currentCourse: {
      type: Number,
      required: [true, 'Current course is required'],
      default: 1,
      min: [1, 'Course must be at least 1'],
      max: [10, 'Course must not exceed 10'],
    },
    currentLesson: {
      type: Number,
      required: [true, 'Current lesson is required'],
      default: 1,
      min: [1, 'Lesson must be at least 1'],
      max: [8, 'Lesson must not exceed 8'],
    },
    completedLessons: {
      type: [completedLessonSchema],
      default: [],
    },
    completedCourses: {
      type: [completedCourseSchema],
      default: [],
    },
    completedExams: {
      type: [completedExamSchema],
      default: [],
    },
    completedLevels: {
      type: [Number],
      default: [],
      validate: {
        validator: function (v: number[]) {
          // Each level should be unique
          return v.length === new Set(v).size;
        },
        message: 'Completed levels must contain unique values',
      },
    },
    totalScore: {
      type: Number,
      required: [true, 'Total score is required'],
      default: 0,
      min: [0, 'Total score must be at least 0'],
    },
    xp: {
      type: Number,
      required: [true, 'XP is required'],
      default: 0,
      min: [0, 'XP must be at least 0'],
    },
    streak: {
      type: streakSchema,
      default: () => ({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
      }),
    },
    certificates: {
      type: [certificateSchema],
      default: [],
    },
    unlockedGames: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [earnedAchievementSchema],
      default: [],
    },
    cefrLevel: {
      type: String,
      required: [true, 'CEFR level is required'],
      default: 'A1',
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    hasCompletedAssessment: {
      type: Boolean,
      default: false,
    },
    assessmentCefrLevel: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'userprogress',
  }
);

// Create indexes
userProgressSchema.index({ userId: 1, currentLevel: 1 });
userProgressSchema.index({ updatedAt: -1 });

// Virtual to calculate completion percentage
userProgressSchema.virtual('completionPercentage').get(function (this: IUserProgress) {
  // Maximum lessons is 10 levels * 8 lessons = 80
  const totalPossibleLessons = 10 * 8;
  return (this.completedLessons.length / totalPossibleLessons) * 100;
});

// Virtual to get average score
userProgressSchema.virtual('averageScore').get(function (this: IUserProgress) {
  if (this.completedLessons.length === 0) return 0;
  const sum = this.completedLessons.reduce((acc, lesson) => acc + lesson.score, 0);
  return sum / this.completedLessons.length;
});

// Ensure virtuals are included when converting to JSON
userProgressSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to calculate total score
userProgressSchema.pre('save', function (next) {
  if (this.completedLessons.length > 0) {
    const sum = this.completedLessons.reduce((acc, lesson) => acc + lesson.score, 0);
    this.totalScore = Math.round(sum / this.completedLessons.length);
  } else {
    this.totalScore = 0;
  }
  next();
});

// Create and export model
const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);

export default UserProgress;

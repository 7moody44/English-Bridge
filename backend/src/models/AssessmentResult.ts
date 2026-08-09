import mongoose, { Document, Schema, Types } from 'mongoose';
import { CefrBand } from '../config/assessmentQuestions.js';

/**
 * A completed placement-assessment attempt. Kept in its own collection so that
 * taking/retaking the assessment does not bloat the userprogress document.
 */

export interface IAssessmentAnswer {
  questionId: number;
  cefr: CefrBand;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

export interface IAssessmentResult extends Document {
  userId: Types.ObjectId;
  answers: IAssessmentAnswer[];
  score: number; // 0-100 overall
  totalCorrect: number;
  totalQuestions: number;
  cefrLevel: CefrBand; // derived result
  mappedLevel: number; // 1-10 starting course level
  perBand: Record<CefrBand, { correct: number; total: number }>;
  takenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentAnswerSchema = new Schema<IAssessmentAnswer>(
  {
    questionId: { type: Number, required: true },
    cefr: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: true },
    userAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    correct: { type: Boolean, required: true },
  },
  { _id: false }
);

const assessmentResultSchema = new Schema<IAssessmentResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    answers: {
      type: [assessmentAnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalCorrect: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 0 },
    cefrLevel: {
      type: String,
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    mappedLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    perBand: {
      type: Schema.Types.Mixed,
      required: true,
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'assessmentresults',
  }
);

// Recent-first browsing of a user's attempts.
assessmentResultSchema.index({ userId: 1, takenAt: -1 });

const AssessmentResult = mongoose.model<IAssessmentResult>(
  'AssessmentResult',
  assessmentResultSchema
);

export default AssessmentResult;

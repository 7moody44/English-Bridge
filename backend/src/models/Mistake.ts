import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * A single recorded "mistake" — a question the user got wrong somewhere on the
 * site (assessment / practice / exam / lesson / game). Surfaced on the
 * "Mistakes" review page so the user can revisit and mark them resolved.
 */

export type MistakeSource =
  | 'assessment'
  | 'practice'
  | 'exam'
  | 'lesson'
  | 'game';

export interface IMistake extends Document {
  userId: Types.ObjectId;
  source: MistakeSource;
  /** Human label, e.g. "Level 1 Final Exam" or "Placement Assessment". */
  sourceLabel: string;
  question: string;
  /** Original option list, when applicable (multiple-choice). */
  options?: string[] | undefined;
  /** What the user answered (option text or index-as-string). */
  userAnswer: string;
  /** Correct option text. */
  correctAnswer: string;
  /** Optional explanation shown on review. */
  explanation?: string | undefined;
  /** CEFR band this question was pegged at, when known. */
  cefr?: string | undefined;
  resolved: boolean;
  resolvedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const mistakeSchema = new Schema<IMistake>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: ['assessment', 'practice', 'exam', 'lesson', 'game'],
    },
    sourceLabel: {
      type: String,
      required: [true, 'Source label is required'],
      trim: true,
      default: '',
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    options: {
      type: [String],
      default: undefined,
    },
    userAnswer: {
      type: String,
      required: [true, 'User answer is required'],
      trim: true,
      default: '',
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    cefr: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'mistakes',
  }
);

// Query the user's active (unresolved) mistakes efficiently.
mistakeSchema.index({ userId: 1, resolved: 1, createdAt: -1 });
// Used by dedupe-on-insert (see mistakeService.recordMistakes).
mistakeSchema.index({ userId: 1, question: 1, userAnswer: 1, resolved: 1 });

const Mistake = mongoose.model<IMistake>('Mistake', mistakeSchema);

export default Mistake;

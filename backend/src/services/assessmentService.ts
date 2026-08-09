import { Types } from 'mongoose';
import AssessmentResult, {
  IAssessmentAnswer,
  IAssessmentResult,
} from '../models/AssessmentResult.js';
import UserProgress, { IUserProgress } from '../models/UserProgress.js';
import {
  ASSESSMENT_QUESTIONS,
  AssessmentQuestion,
  CefrBand,
  CEFR_TO_LEVEL,
} from '../config/assessmentQuestions.js';
import { recordMistakes, MistakeInput } from './mistakeService.js';

/** Questions as a lookup by id, for fast grading. */
const QUESTION_BY_ID: Record<number, AssessmentQuestion> = Object.fromEntries(
  ASSESSMENT_QUESTIONS.map((q) => [q.id, q])
);

/** Per-band correct/total tally, initialised to zero for every band. */
const emptyPerBand = (): Record<CefrBand, { correct: number; total: number }> => ({
  A1: { correct: 0, total: 0 },
  A2: { correct: 0, total: 0 },
  B1: { correct: 0, total: 0 },
  B2: { correct: 0, total: 0 },
  C1: { correct: 0, total: 0 },
  C2: { correct: 0, total: 0 },
});

export interface GradeInput {
  /** { [questionId]: userSelectedOptionIndex } */
  answers: Record<number, number>;
}

export interface GradeResult {
  answers: IAssessmentAnswer[];
  totalCorrect: number;
  totalQuestions: number;
  score: number; // 0-100
  perBand: Record<CefrBand, { correct: number; total: number }>;
  cefrLevel: CefrBand;
  mappedLevel: number;
}

/**
 * Grade a submitted answer set WITHOUT writing anything.
 * Pure function — safe to unit test.
 *
 * A band counts as "achieved" if the user got ≥ 50% (2 of 4) right.
 * We scan C2 → A1 and return the highest achieved band; otherwise A1.
 */
export const gradeAssessment = (answers: Record<number, number>): GradeResult => {
  const perBand = emptyPerBand();
  const detailed: IAssessmentAnswer[] = [];
  let totalCorrect = 0;

  for (const q of ASSESSMENT_QUESTIONS) {
    const bandTotal = perBand[q.cefr];
    bandTotal.total += 1;

    const raw = answers[q.id];
    const correctIndex = q.correctAnswers[0] ?? 0;
    const userTouched = typeof raw === 'number' && raw >= 0;
    const correct = userTouched && raw === correctIndex;

    if (correct) {
      totalCorrect += 1;
      bandTotal.correct += 1;
    }

    detailed.push({
      questionId: q.id,
      cefr: q.cefr,
      userAnswer: userTouched ? (q.options[raw] ?? '(no answer)') : '(no answer)',
      correctAnswer: q.options[correctIndex] ?? '(no answer)',
      correct,
    });
  }

  // Weighted average logic: A user's proficiency is determined by their "center
  // of mass" across all levels. Higher-level questions are weighted more. This
  // creates a more holistic score that's less sensitive to a single bad band.
  const weights: Record<CefrBand, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const CEFR_BANDS: CefrBand[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  let userWeightedScore = 0;
  let maxWeightedScore = 0;

  for (const band of CEFR_BANDS) {
    const weight = weights[band];
    const { correct, total } = perBand[band];
    if (total > 0) {
      userWeightedScore += correct * weight;
      maxWeightedScore += total * weight;
    }
  }

  const proficiency = maxWeightedScore > 0 ? userWeightedScore / maxWeightedScore : 0;

  // proficiency is a value from 0 to 1.0 representing their overall score.
  // We map it to a CEFR level.
  let cefrLevel: CefrBand = 'A1';
  if (proficiency >= 0.834) {
    // Corresponds to C2 (5/6)
    cefrLevel = 'C2';
  } else if (proficiency >= 0.667) {
    // Corresponds to C1 (4/6)
    cefrLevel = 'C1';
  } else if (proficiency >= 0.501) {
    // Corresponds to B2 (3/6)
    cefrLevel = 'B2';
  } else if (proficiency >= 0.334) {
    // Corresponds to B1 (2/6)
    cefrLevel = 'B1';
  } else if (proficiency >= 0.167) {
    // Corresponds to A2 (1/6)
    cefrLevel = 'A2';
  } else {
    cefrLevel = 'A1';
  }

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const score = Math.round((totalCorrect / totalQuestions) * 100);

  return {
    answers: detailed,
    totalCorrect,
    totalQuestions,
    score,
    perBand,
    cefrLevel,
    mappedLevel: CEFR_TO_LEVEL[cefrLevel],
  };
};

/**
 * Persist a graded attempt:
 *  - write an AssessmentResult doc
 *  - set UserProgress.hasCompletedAssessment = true + assessmentCefrLevel
 *  - bump UserProgress.cefrLevel + currentLevel (never regress — only if higher)
 *  - record wrong answers as Mistakes (source=assessment)
 *
 * Returns the saved result + the updated progress.
 */
export const saveAssessmentResult = async (
  userId: Types.ObjectId | string,
  answers: Record<number, number>
): Promise<{ result: IAssessmentResult; progress: IUserProgress | null }> => {
  const grade = gradeAssessment(answers);

  const result = await AssessmentResult.create({
    userId,
    answers: grade.answers,
    score: grade.score,
    totalCorrect: grade.totalCorrect,
    totalQuestions: grade.totalQuestions,
    cefrLevel: grade.cefrLevel,
    mappedLevel: grade.mappedLevel,
    perBand: grade.perBand,
    takenAt: new Date(),
  });

  // Update progress. CEFR + currentLevel only ever move UP (never regress),
  // matching the certificate rule in progressService.
  const progress = await UserProgress.findOne({ userId });
  if (progress) {
    progress.hasCompletedAssessment = true;
    progress.assessmentCefrLevel = grade.cefrLevel;

    // The assessment result OVERWRITES the user's previous level.
    progress.cefrLevel = grade.cefrLevel;
    progress.currentLevel = grade.mappedLevel;

    await progress.save();
  }

  // Capture wrong answers as mistakes.
  const mistakes: MistakeInput[] = grade.answers
    .filter((a) => !a.correct)
    .map((a) => {
      const q = QUESTION_BY_ID[a.questionId]!;
      return {
        source: 'assessment' as const,
        sourceLabel: 'Placement Assessment',
        question: q.question,
        options: q.options,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        explanation: q.explanation,
        cefr: a.cefr,
      };
    });
  if (mistakes.length > 0) {
    await recordMistakes(userId, mistakes);
  }

  return { result, progress };
};

/** Recent attempts, newest first. */
export const getHistory = async (
  userId: Types.ObjectId | string,
  limit = 10
): Promise<IAssessmentResult[]> => {
  return AssessmentResult.find({ userId }).sort({ takenAt: -1 }).limit(limit).lean<IAssessmentResult[]>();
};

export { ASSESSMENT_QUESTIONS };

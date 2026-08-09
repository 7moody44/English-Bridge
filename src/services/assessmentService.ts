import api from './api';

export type CefrBand = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface PublicAssessmentQuestion {
  id: number;
  type: 'multiple-choice';
  question: string;
  options: string[];
  cefr: CefrBand;
}

export interface PerBandScore {
  correct: number;
  total: number;
}

export interface AssessmentResult {
  id: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  cefrLevel: CefrBand;
  mappedLevel: number;
  perBand: Record<CefrBand, PerBandScore>;
  takenAt: string;
}

export interface AssessmentStatus {
  hasCompletedAssessment: boolean;
  assessmentCefrLevel: CefrBand | null;
  cefrLevel: CefrBand;
  currentLevel: number;
}

/** { [questionId]: selectedOptionIndex } */
export type AssessmentAnswers = Record<number, number>;

export const assessmentService = {
  getQuestions: async (): Promise<{ questions: PublicAssessmentQuestion[]; totalQuestions: number }> => {
    const res = await api.get('/assessment/questions');
    return { questions: res.data.questions, totalQuestions: res.data.totalQuestions };
  },

  getStatus: async (): Promise<AssessmentStatus> => {
    const res = await api.get('/assessment/status');
    return res.data;
  },

  submit: async (answers: AssessmentAnswers): Promise<{ result: AssessmentResult; progress: unknown }> => {
    const res = await api.post('/assessment/submit', { answers });
    return { result: res.data.result, progress: res.data.progress };
  },

  getHistory: async (): Promise<AssessmentResult[]> => {
    const res = await api.get('/assessment/history');
    return res.data.history;
  },
};

export default assessmentService;

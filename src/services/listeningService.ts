import api from './api';

/** Exercise shape used by the list view. */
export interface ListeningExerciseListItem {
  id: string;
  title: string;
  level: string;
  levelNumber: number;
  category: string;
  icon: string;
  description: string;
  duration: number;
  questionCount: number;
  hintCost: number;
}

export interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/** Full exercise returned by the detail endpoint. */
export interface ListeningExercise extends Omit<ListeningExerciseListItem, 'questionCount' | 'hintCost'> {
  speechRate: number;
  audioText: string;
  questions: ListeningQuestion[];
}

export interface ListeningExercisesResponse {
  success: boolean;
  exercises: ListeningExerciseListItem[];
  total: number;
}

export interface ListeningExerciseResponse {
  success: boolean;
  exercise: ListeningExercise;
  hintCost: number;
  transcriptCost: number;
}

export type ListeningHintType = 'fiftyFifty' | 'transcript';

export interface ListeningHintResponse {
  success: boolean;
  hintType: ListeningHintType;
  xpDeducted: number;
  totalXP: number;
  hintCost: number;
}

export interface ListeningResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  hintsUsed: number;
  timeSpent: number;
  passed: boolean;
}

export interface ListeningCompleteResponse {
  success: boolean;
  message: string;
  results: ListeningResults;
  xpEarned?: number;
  totalXP?: number;
  streak?: number;
}

class ListeningService {
  /** Get all listening exercises, optionally filtered by CEFR level. */
  async getExercises(level?: string): Promise<ListeningExercisesResponse> {
    const params = level && level !== 'all' ? { level } : {};
    const response = await api.get<ListeningExercisesResponse>('/practice/listening', { params });
    return response.data;
  }

  /** Get the full detail for a single listening exercise (incl. hint costs). */
  async getExercise(exerciseId: string): Promise<ListeningExerciseResponse> {
    const response = await api.get<ListeningExerciseResponse>(`/practice/listening/${exerciseId}`);
    return response.data;
  }

  /** Spend XP on a hint (fiftyFifty or transcript). Returns the new balance. */
  async useHint(exerciseId: string, hintType: ListeningHintType): Promise<ListeningHintResponse> {
    const response = await api.post<ListeningHintResponse>(`/practice/listening/${exerciseId}/hint`, {
      hintType,
    });
    return response.data;
  }

  /** Submit answers and receive the score + XP. */
  async completeExercise(
    exerciseId: string,
    answers: number[],
    hintsUsed: number,
    timeSpent: number
  ): Promise<ListeningCompleteResponse> {
    const response = await api.post<ListeningCompleteResponse>(
      `/practice/listening/${exerciseId}/complete`,
      { answers, hintsUsed, timeSpent }
    );
    return response.data;
  }
}

const listeningService = new ListeningService();
export { listeningService };
export default listeningService;

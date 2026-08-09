import api from './api';

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  level: string;
  category: string;
  duration: number;
  passage: string;
  questions: ReadingQuestion[];
}

export interface ReadingPassageListItem {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: number;
  questionCount: number;
}

export interface ReadingPassagesResponse {
  success: boolean;
  passages: ReadingPassageListItem[];
  total: number;
}

export interface ReadingPassageResponse {
  success: boolean;
  passage: ReadingPassage;
}

export interface ReadingCompletionRequest {
  answers: { [key: number]: number };
  timeSpent: number;
  hintsUsed: number;
}

export interface ReadingCompletionResponse {
  success: boolean;
  message: string;
  results: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    hintsUsed: number;
    passed: boolean;
  };
}

class PracticeService {
  /**
   * Get all reading passages, optionally filtered by level
   */
  async getReadingPassages(level?: string): Promise<ReadingPassagesResponse> {
    const params = level && level !== 'all' ? { level } : {};
    const response = await api.get<ReadingPassagesResponse>('/practice/reading', { params });
    return response.data;
  }

  /**
   * Get a specific reading passage by ID
   */
  async getReadingPassage(passageId: string): Promise<ReadingPassageResponse> {
    const response = await api.get<ReadingPassageResponse>(`/practice/reading/${passageId}`);
    return response.data;
  }

  /**
   * Submit reading practice completion
   */
  async completeReadingPractice(
    passageId: string,
    data: ReadingCompletionRequest
  ): Promise<ReadingCompletionResponse> {
    const response = await api.post<ReadingCompletionResponse>(
      `/practice/reading/${passageId}/complete`,
      data
    );
    return response.data;
  }
}

const practiceService = new PracticeService();
export { practiceService };
export default practiceService;

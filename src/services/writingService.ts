import api from './api';

/** Topic shape used by the list view. */
export interface WritingTopicListItem {
  id: string;
  title: string;
  level: string;
  levelNumber: number;
  icon: string;
  minWords: number;
}

export interface WritingTargetWord {
  word: string;
  meaning: string;
}

/** Full topic returned by the detail endpoint. */
export interface WritingTopic extends WritingTopicListItem {
  prompt: string;
  targetVocabulary: WritingTargetWord[];
  hint: string;
}

export interface WritingTopicsResponse {
  success: boolean;
  topics: WritingTopicListItem[];
  total: number;
}

export interface WritingTopicResponse {
  success: boolean;
  topic: WritingTopic;
}

export type WritingErrorCategory = 'grammar' | 'spelling' | 'punctuation' | 'capitalization';

export interface WritingError {
  original: string;
  correction: string;
  explanation: string;
  category: WritingErrorCategory;
}

/** Objective measurements computed from the text. */
export interface WritingMetrics {
  wordCount: number;
  sentenceCount: number;
  uniqueWords: number;
  errorCount: number;
  lexicalDiversity: number;
  connectiveCount: number;
  advancedWordCount: number;
  avgWordsPerSentence: number;
  paragraphCount: number;
}

/** Structured feedback returned by the writing coach. */
export interface WritingFeedback {
  score: number;
  grammarScore: number;
  vocabularyScore: number;
  styleScore: number;
  passed: boolean;
  metrics: WritingMetrics;
  errors: WritingError[];
  improvedVersion: string;
  professionalRewrite: string;
  professionalTips: string[];
  writingTips: string[];
  strengths: string[];
  suggestions: string[];
  vocabularyUsed: string[];
  vocabularyMissed: string[];
}

export interface WritingFeedbackResponse {
  success: boolean;
  feedback: WritingFeedback;
  xpEarned?: number;
  totalXP?: number;
  streak?: number;
}

class WritingService {
  /** Get all writing topics, optionally filtered by CEFR level. */
  async getTopics(level?: string): Promise<WritingTopicsResponse> {
    const params = level && level !== 'all' ? { level } : {};
    const response = await api.get<WritingTopicsResponse>('/practice/writing', { params });
    return response.data;
  }

  /** Get the full detail for a single writing topic. */
  async getTopic(topicId: string): Promise<WritingTopicResponse> {
    const response = await api.get<WritingTopicResponse>(`/practice/writing/${topicId}`);
    return response.data;
  }

  /** Submit a writing text and receive AI feedback (+ XP). */
  async checkWriting(topicId: string, text: string): Promise<WritingFeedbackResponse> {
    const response = await api.post<WritingFeedbackResponse>(
      `/practice/writing/${topicId}/check`,
      { text }
    );
    return response.data;
  }
}

const writingService = new WritingService();
export { writingService };
export default writingService;

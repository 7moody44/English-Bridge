import api from './api';

/** Topic shape used by the list view. */
export interface SpeakingTopicListItem {
  id: string;
  title: string;
  level: string;
  category: string;
  icon: string;
  description: string;
  duration: number;
}

export interface SpeakingTargetWord {
  word: string;
  meaning: string;
}

/** Full topic returned by the detail endpoint. */
export interface SpeakingTopic extends SpeakingTopicListItem {
  prompt: string;
  targetVocabulary: SpeakingTargetWord[];
  tips: string[];
}

export interface SpeakingTopicsResponse {
  success: boolean;
  topics: SpeakingTopicListItem[];
  total: number;
}

export interface SpeakingTopicResponse {
  success: boolean;
  topic: SpeakingTopic;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
}

/** Objective measurements computed from the transcript. */
export interface SpeakingMetrics {
  wordCount: number;
  uniqueWords: number;
  wpm: number;
  durationSeconds: number;
  connectiveCount: number;
  fillerWordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  lexicalDiversity: number;
  advancedWordCount: number;
  topicRelevanceScore: number;
}

/** Structured feedback returned by the AI coach. */
export interface SpeakingFeedback {
  score: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  naturalnessScore: number;
  estimatedCEFR: string;
  metrics: SpeakingMetrics;
  vocabularyUsed: string[];
  vocabularyMissed: string[];
  grammarErrors: GrammarError[];
  strengths: string[];
  suggestions: string[];
  improvedVersion: string;
}

export interface SpeakingFeedbackResponse {
  success: boolean;
  feedback: SpeakingFeedback;
  xpEarned?: number;
  totalXP?: number;
  streak?: number;
}

export interface TranscriptionResponse {
  success: boolean;
  transcription: string;
  confidence: number;
}

class SpeakingService {
  /** Transcribe an audio blob via Groq Whisper on the backend. */
  async transcribe(audioBlob: Blob): Promise<TranscriptionResponse> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const b64 = reader.result.split(',')[1];
          resolve(b64 || '');
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const response = await api.post<TranscriptionResponse>(
      '/practice/speaking/transcribe',
      { audio: base64, mimeType: audioBlob.type }
    );
    return response.data;
  }

  /** Get all speaking topics, optionally filtered by CEFR level. */
  async getTopics(level?: string): Promise<SpeakingTopicsResponse> {
    const params = level && level !== 'all' ? { level } : {};
    const response = await api.get<SpeakingTopicsResponse>('/practice/speaking', { params });
    return response.data;
  }

  /** Get the full detail for a single speaking topic. */
  async getTopic(topicId: string): Promise<SpeakingTopicResponse> {
    const response = await api.get<SpeakingTopicResponse>(`/practice/speaking/${topicId}`);
    return response.data;
  }

  /** Submit a transcription and receive AI feedback (+ XP). */
  async submitFeedback(
    topicId: string,
    transcription: string,
    avgConfidence?: number,
    duration?: number
  ): Promise<SpeakingFeedbackResponse> {
    const response = await api.post<SpeakingFeedbackResponse>(
      `/practice/speaking/${topicId}/feedback`,
      { transcription, avgConfidence, duration }
    );
    return response.data;
  }
}

const speakingService = new SpeakingService();
export { speakingService };
export default speakingService;

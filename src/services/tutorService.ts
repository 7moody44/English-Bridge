import api from './api';

/** A single turn of the tutor conversation (matches the backend format). */
export interface TutorChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface TutorChatResponse {
  success: boolean;
  reply: string;
  /** True when the reply came from Gemini, false when from the built-in teacher. */
  ai: boolean;
  error?: string;
}

class TutorService {
  /**
   * Send a message to the AI English Teacher.
   * `history` is the prior conversation (excluding the current message) so
   * the tutor can keep context across turns.
   */
  async chat(message: string, history: TutorChatTurn[] = []): Promise<TutorChatResponse> {
    const res = await api.post('/tutor/chat', { message, history });
    return res.data;
  }
}

export const tutorService = new TutorService();

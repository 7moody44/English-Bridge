import api from './api';

export type MistakeSource = 'assessment' | 'practice' | 'exam' | 'lesson' | 'game';

export interface Mistake {
  _id: string;
  userId: string;
  source: MistakeSource;
  sourceLabel: string;
  question: string;
  options?: string[];
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  cefr?: string;
  resolved: boolean;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface MistakeStats {
  total: number;
  unresolved: number;
  resolved: number;
  bySource: Record<MistakeSource, number>;
}

export interface ListParams {
  source?: MistakeSource | 'all';
  resolved?: boolean | 'all';
  page?: number;
  limit?: number;
}

export const mistakeService = {
  list: async (params: ListParams = {}): Promise<{
    items: Mistake[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get('/mistakes', { params });
    return {
      items: res.data.items,
      total: res.data.total,
      page: res.data.page,
      totalPages: res.data.totalPages,
    };
  },

  /**
   * Fetch every mistake for the user (across pages) so the review page can
   * group them into category tabs client-side. Capped at a sane page ceiling.
   */
  getAllMistakes: async (): Promise<Mistake[]> => {
    const all: Mistake[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await mistakeService.list({ resolved: 'all', page, limit: 50 });
      all.push(...res.items);
      totalPages = res.totalPages;
      page += 1;
    } while (page <= totalPages && page <= 10);
    return all;
  },

  stats: async (): Promise<MistakeStats> => {
    const res = await api.get('/mistakes/stats');
    return res.data.stats;
  },

  resolve: async (id: string): Promise<void> => {
    await api.post(`/mistakes/${id}/resolve`);
  },
};

export default mistakeService;

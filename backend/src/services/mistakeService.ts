import { Types } from 'mongoose';
import Mistake, { IMistake, MistakeSource } from '../models/Mistake.js';

export interface MistakeInput {
  source: MistakeSource;
  sourceLabel: string;
  question: string;
  options?: string[] | undefined;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string | undefined;
  cefr?: string | undefined;
}

export interface ListOptions {
  source?: MistakeSource | 'all';
  resolved?: boolean | 'all';
  page?: number;
  limit?: number;
}

/**
 * Bulk-insert mistakes, deduping against existing UNRESOLVED entries so that
 * replaying a quiz never spams the review page with duplicates.
 *
 * Dedupe key: (userId, question, userAnswer) where the existing row is still
 * unresolved. If an unresolved match exists we skip the insert; resolved
 * matches are kept (history) but we still add a new unresolved row.
 */
export const recordMistakes = async (
  userId: Types.ObjectId | string,
  items: MistakeInput[]
): Promise<number> => {
  if (!items || items.length === 0) return 0;

  const userObjId = new Types.ObjectId(String(userId));
  let inserted = 0;

  for (const item of items) {
    // Cheap dedupe query before inserting.
    const dup = await Mistake.exists({
      userId: userObjId,
      question: item.question,
      userAnswer: item.userAnswer,
      resolved: false,
    });
    if (dup) continue;

    await Mistake.create({
      userId: userObjId,
      source: item.source,
      sourceLabel: item.sourceLabel,
      question: item.question,
      options: item.options ?? undefined,
      userAnswer: item.userAnswer,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation ?? undefined,
      cefr: item.cefr ?? undefined,
      resolved: false,
    });
    inserted += 1;
  }

  return inserted;
};

/**
 * List mistakes for the review page, paginated, optionally filtered.
 * Newest unresolved first, then resolved.
 */
export const getMistakes = async (
  userId: Types.ObjectId | string,
  opts: ListOptions = {}
): Promise<{ items: IMistake[]; total: number; page: number; totalPages: number }> => {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const userObjId = new Types.ObjectId(String(userId));

  const filter: Record<string, unknown> = { userId: userObjId };
  if (opts.source && opts.source !== 'all') filter.source = opts.source;
  if (opts.resolved !== undefined && opts.resolved !== 'all') {
    filter.resolved = opts.resolved;
  }

  const [total, items] = await Promise.all([
    Mistake.countDocuments(filter),
    Mistake.find(filter)
      .sort({ resolved: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export interface MistakeStats {
  total: number;
  unresolved: number;
  resolved: number;
  bySource: Record<MistakeSource, number>;
}

/**
 * Quick counts for the review page header / homepage badge.
 */
export const getMistakeStats = async (
  userId: Types.ObjectId | string
): Promise<MistakeStats> => {
  const userObjId = new Types.ObjectId(String(userId));
  const base = { userId: userObjId };

  const [total, unresolved, resolved, agg] = await Promise.all([
    Mistake.countDocuments(base),
    Mistake.countDocuments({ ...base, resolved: false }),
    Mistake.countDocuments({ ...base, resolved: true }),
    Mistake.aggregate<MistakeSource & { count: number }>([
      { $match: base },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
  ]);

  const bySource: Record<MistakeSource, number> = {
    assessment: 0,
    practice: 0,
    exam: 0,
    lesson: 0,
    game: 0,
  };
  for (const row of agg) {
    bySource[row._id as MistakeSource] = row.count;
  }

  return { total, unresolved, resolved, bySource };
};

export const resolveMistake = async (
  userId: Types.ObjectId | string,
  mistakeId: string
): Promise<boolean> => {
  const res = await Mistake.updateOne(
    { _id: mistakeId, userId: new Types.ObjectId(String(userId)) },
    { resolved: true, resolvedAt: new Date() }
  );
  return res.modifiedCount > 0;
};

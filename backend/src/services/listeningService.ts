/**
 * Listening Practice Service
 *
 * Centralises the XP-cost rules for listening hints so both the API and the
 * (optionally) pre-rendered cost tables stay in sync.
 *
 * Hint pricing scales with CEFR difficulty:
 *   - Pre-A1 → A2 : 10 XP per hint (beginner friendly)
 *   - B1          : 15 XP per hint
 *   - B2          : 20 XP per hint
 *   - C1          : 25 XP per hint (advanced content is "premium")
 *
 * Two hint types are offered:
 *   - `fiftyFifty` : removes two incorrect options for a question (1x cost)
 *   - `transcript` : reveals the full audio transcript (2x cost — premium)
 */

export type ListeningHintType = 'fiftyFifty' | 'transcript';

/** Base hint cost (in XP) for a given CEFR level. */
const HINT_COST_BY_LEVEL: Record<string, number> = {
  'pre-a1': 10,
  'a1': 10,
  'a2': 10,
  'b1': 15,
  'b2': 20,
  'c1': 25,
};

/** Normalise a level string like "Pre-A1" → "pre-a1". */
const normalizeLevel = (level: string): string =>
  level.toLowerCase().replace(/\s/g, '-');

/**
 * Return the base cost of a single hint for the given CEFR level.
 * Unknown levels fall back to the beginner price (10 XP).
 */
export const getHintCost = (level: string): number =>
  HINT_COST_BY_LEVEL[normalizeLevel(level)] ?? 10;

/**
 * Return the cost of a specific hint type for the given CEFR level.
 * The transcript is a premium feature and costs double the base hint price.
 */
export const getHintTypeCost = (level: string, hintType: ListeningHintType): number => {
  const base = getHintCost(level);
  return hintType === 'transcript' ? base * 2 : base;
};

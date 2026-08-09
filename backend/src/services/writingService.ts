/**
 * Writing coach evaluation engine.
 *
 * AI provider: Google Gemini 2.0 Flash (free tier) — used opportunistically to
 * produce a "professional rewrite" and refine scores. When no key is present
 * (or the API fails) a complete rule-based evaluation is returned instead, so
 * the feature always works end-to-end.
 *
 * The engine scores a learner's text on THREE skills — Grammar, Vocabulary and
 * Style — plus an overall weighted score, and returns:
 *   - a list of concrete mistakes (with corrections + explanations)
 *   - an "improved version" (spelling/grammar fixes applied)
 *   - a "professional rewrite" (more formal tone) + professionalism tips
 *   - strengths / areas-to-improve / writing tips
 */

import { config } from '../config/config.js';
import {
  GRAMMAR_PATTERNS,
  CONNECTIVES,
  SIMPLE_CONNECTOR_RE,
  ADVANCED_WORDS,
  tokenize,
  countOccurrences,
} from './speakingService.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface WritingFeedbackRequest {
  prompt: string;
  text: string;
  targetVocabulary: string[];
  level: string;
  /** Minimum words expected for this task (from the topic). */
  minWords: number;
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
  /** 0..1 — unique words / total words. */
  lexicalDiversity: number;
  connectiveCount: number;
  advancedWordCount: number;
  avgWordsPerSentence: number;
  paragraphCount: number;
}

export interface WritingFeedback {
  score: number;            // 0-100 overall (weighted blend)
  grammarScore: number;     // 0-100
  vocabularyScore: number;  // 0-100
  styleScore: number;       // 0-100
  /** True when the overall score reaches the pass mark (60). */
  passed: boolean;
  metrics: WritingMetrics;
  errors: WritingError[];
  /** Original text with spelling/grammar fixes applied. */
  improvedVersion: string;
  /** A more formal, professional version of the text. */
  professionalRewrite: string;
  /** "How to sound more professional" guidance. */
  professionalTips: string[];
  /** General writing tips shown with the improved version. */
  writingTips: string[];
  strengths: string[];
  suggestions: string[];
  vocabularyUsed: string[];
  vocabularyMissed: string[];
}

/** Pass mark (percent) required to pass a writing task. */
export const PASS_MARK = 60;

// ---------------------------------------------------------------------------
// Internal error-occurrence type (tracks position for inline highlighting)
// ---------------------------------------------------------------------------

interface ErrorOccurrence extends WritingError {
  index: number;
}

// ---------------------------------------------------------------------------
// Writing-specific error patterns (on top of the shared grammar patterns)
// ---------------------------------------------------------------------------

interface WritingPattern {
  re: RegExp;
  explanation: string;
  correction: (match: string) => string;
  category: WritingErrorCategory;
}

const WRITING_PATTERNS: WritingPattern[] = [
  // ---- Missing apostrophes in contractions (very common in casual typing) ----
  { re: /\bdont\b/g, explanation: 'Add the apostrophe: "don\'t".', correction: () => "don't", category: 'spelling' },
  { re: /\bdidnt\b/g, explanation: 'Add the apostrophe: "didn\'t".', correction: () => "didn't", category: 'spelling' },
  { re: /\bdoesnt\b/g, explanation: 'Add the apostrophe: "doesn\'t".', correction: () => "doesn't", category: 'spelling' },
  { re: /\bisnt\b/g, explanation: 'Add the apostrophe: "isn\'t".', correction: () => "isn't", category: 'spelling' },
  { re: /\barent\b/g, explanation: 'Add the apostrophe: "aren\'t".', correction: () => "aren't", category: 'spelling' },
  { re: /\bwasnt\b/g, explanation: 'Add the apostrophe: "wasn\'t".', correction: () => "wasn't", category: 'spelling' },
  { re: /\bcouldnt\b/g, explanation: 'Add the apostrophe: "couldn\'t".', correction: () => "couldn't", category: 'spelling' },
  { re: /\bwouldnt\b/g, explanation: 'Add the apostrophe: "wouldn\'t".', correction: () => "wouldn't", category: 'spelling' },
  { re: /\bshouldnt\b/g, explanation: 'Add the apostrophe: "shouldn\'t".', correction: () => "shouldn't", category: 'spelling' },
  { re: /\bive\b/g, explanation: 'Capitalise and add the apostrophe: "I\'ve".', correction: () => "I've", category: 'spelling' },
  { re: /\bim\b/g, explanation: 'Capitalise and add the apostrophe: "I\'m".', correction: () => "I'm", category: 'spelling' },
  { re: /\bIm\b/g, explanation: 'Add the apostrophe: "I\'m".', correction: () => "I'm", category: 'spelling' },
  { re: /\bcant\b/g, explanation: 'Add the apostrophe: "can\'t".', correction: () => "can't", category: 'spelling' },
  { re: /\bwont\b/g, explanation: 'Add the apostrophe: "won\'t".', correction: () => "won't", category: 'spelling' },
  { re: /\blets\b/g, explanation: 'Add the apostrophe: "let\'s".', correction: () => "let's", category: 'spelling' },
  { re: /\bthats\b/g, explanation: 'Add the apostrophe: "that\'s".', correction: () => "that's", category: 'spelling' },
  { re: /\byoure\b/g, explanation: 'Add the apostrophe: "you\'re".', correction: () => "you're", category: 'spelling' },
  { re: /\btheyre\b/g, explanation: 'Add the apostrophe: "they\'re".', correction: () => "they're", category: 'spelling' },

  // ---- Confused words / grammar ----
  { re: /\bafter than\b/gi, explanation: 'Use "after that" (not "after than").', correction: () => 'after that', category: 'grammar' },
  { re: /\balot\b/gi, explanation: '"A lot" is two words.', correction: () => 'a lot', category: 'spelling' },

  // ---- Common misspellings ----
  { re: /\bbecuase\b/gi, explanation: 'Spelling: "because".', correction: () => 'because', category: 'spelling' },
  { re: /\bbeacuse\b/gi, explanation: 'Spelling: "because".', correction: () => 'because', category: 'spelling' },
  { re: /\brecieve\b/gi, explanation: 'Spelling: "receive" (i before e except after c).', correction: () => 'receive', category: 'spelling' },
  { re: /\bdefinately\b/gi, explanation: 'Spelling: "definitely".', correction: () => 'definitely', category: 'spelling' },
  { re: /\bseperate\b/gi, explanation: 'Spelling: "separate".', correction: () => 'separate', category: 'spelling' },
  { re: /\buntill\b/gi, explanation: 'Spelling: "until" (one l).', correction: () => 'until', category: 'spelling' },
  { re: /\bwich\b/gi, explanation: 'Spelling: "which".', correction: () => 'which', category: 'spelling' },
  { re: /\bfreind\b/gi, explanation: 'Spelling: "friend" (i before e).', correction: () => 'friend', category: 'spelling' },
  { re: /\bthier\b/gi, explanation: 'Spelling: "their".', correction: () => 'their', category: 'spelling' },
  { re: /\btommorow\b/gi, explanation: 'Spelling: "tomorrow".', correction: () => 'tomorrow', category: 'spelling' },
  { re: /\btommorrow\b/gi, explanation: 'Spelling: "tomorrow".', correction: () => 'tomorrow', category: 'spelling' },
  { re: /\bwierd\b/gi, explanation: 'Spelling: "weird".', correction: () => 'weird', category: 'spelling' },
  { re: /\bhappend\b/gi, explanation: 'Spelling: "happened".', correction: () => 'happened', category: 'spelling' },

  // ---- Repeated words ("the the") ----
  {
    re: /\b(\w+)\s+\1\b/gi,
    explanation: 'Remove the repeated word.',
    correction: (m) => (m.split(/\s+/)[0] ?? m),
    category: 'grammar',
  },
];

/** Proper past-tense forms used to fix irregular-verb errors mechanically. */
const IRREGULAR_PAST_FIX: Record<string, string> = {
  goed: 'went', eated: 'ate', buyed: 'bought', thinked: 'thought', runned: 'ran',
  swimmed: 'swam', drived: 'drove', flyed: 'flew', catched: 'caught', teached: 'taught',
  speaked: 'spoke', writed: 'wrote', readed: 'read', bringed: 'brought', taked: 'took',
  maked: 'made', getted: 'got', knowed: 'knew', sitted: 'sat', standed: 'stood',
  understanded: 'understood', forgetted: 'forgot', sleeped: 'slept', weared: 'wore',
  payed: 'paid', sayed: 'said',
};

// ---------------------------------------------------------------------------
// Error detection (position-aware, so the UI can highlight inline)
// ---------------------------------------------------------------------------

const pushMatches = (
  text: string,
  re: RegExp,
  explanation: string,
  correction: (m: string) => string,
  category: WritingErrorCategory,
  out: ErrorOccurrence[]
): void => {
  const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m: RegExpExecArray | null;
  while ((m = global.exec(text)) !== null) {
    out.push({ original: m[0], correction: correction(m[0]), explanation, category, index: m.index });
    if (m.index === global.lastIndex) global.lastIndex++; // guard zero-length matches
  }
};

/** Lowercase standalone "i" pronoun + sentence-initial capitals. */
const detectCapitalization = (text: string, out: ErrorOccurrence[]): void => {
  // The personal pronoun "i" must always be uppercase.
  pushMatches(text, /\bi\b/g, "The personal pronoun 'I' should be uppercase.", () => 'I', 'capitalization', out);

  // A sentence that starts with a lowercase letter (other than the pronoun "i",
  // which is already handled above with a clearer message).
  const sentRe = /(?:^|[.!?]\s+)([a-hj-z])/g;
  let m: RegExpExecArray | null;
  while ((m = sentRe.exec(text)) !== null) {
    const letter = m[1] ?? '';
    const letterIndex = m.index + m[0].length - 1;
    out.push({
      original: letter,
      correction: letter.toUpperCase(),
      explanation: 'Sentences should start with a capital letter.',
      category: 'capitalization',
      index: letterIndex,
    });
  }
};

/**
 * Scan the text for every mistake. Returns de-duplicated occurrences sorted by
 * position (overlapping matches keep the earliest/longest hit).
 */
const detectAllErrors = (text: string): ErrorOccurrence[] => {
  const out: ErrorOccurrence[] = [];

  // Shared grammar patterns (subject-verb agreement, tense, articles, …).
  for (const { re, explanation, correction } of GRAMMAR_PATTERNS) {
    pushMatches(text, re, explanation, correction, 'grammar', out);
  }
  // Writing-specific patterns (contractions, misspellings, confused words, …).
  for (const { re, explanation, correction, category } of WRITING_PATTERNS) {
    pushMatches(text, re, explanation, correction, category, out);
  }
  // Capitalization rules.
  detectCapitalization(text, out);

  // Patch identity corrections we can fix mechanically (irregular past tense).
  for (const e of out) {
    if (e.correction.toLowerCase() === e.original.toLowerCase()) {
      const fix = IRREGULAR_PAST_FIX[e.original.toLowerCase()];
      if (fix) e.correction = fix;
    }
  }

  // Sort by position; on a tie keep the longer match. Then drop overlaps.
  out.sort((a, b) => a.index - b.index || b.original.length - a.original.length);
  const result: ErrorOccurrence[] = [];
  let lastEnd = -1;
  for (const e of out) {
    if (e.index >= lastEnd) {
      result.push(e);
      lastEnd = e.index + e.original.length;
    }
  }
  return result;
};

/** Apply every mechanical fix to produce the "improved version". */
const applyCorrections = (text: string, errors: ErrorOccurrence[]): string => {
  const fixable = errors
    .filter((e) => e.correction && e.correction !== e.original)
    .sort((a, b) => b.index - a.index); // reverse order keeps earlier indices valid
  let result = text;
  for (const e of fixable) {
    result = result.slice(0, e.index) + e.correction + result.slice(e.index + e.original.length);
  }
  return result;
};

// ---------------------------------------------------------------------------
// Deterministic text analysis
// ---------------------------------------------------------------------------

interface TextAnalysis {
  wordCount: number;
  uniqueWords: number;
  lexicalDiversity: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  paragraphCount: number;
  connectiveCount: number;
  simpleConnectorCount: number;
  advancedWordCount: number;
  conditionalCount: number;
  relativeClauseCount: number;
  passiveCount: number;
  hasEndPunctuation: boolean;
  vocabularyUsed: string[];
  vocabularyMissed: string[];
  errors: ErrorOccurrence[];
  errorDensity: number; // errors per 100 words
}

const analyzeText = (req: WritingFeedbackRequest): TextAnalysis => {
  const text = req.text.trim();
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const wordCount = tokens.length;
  const uniqueSet = new Set(tokens);
  const uniqueWords = uniqueSet.size;
  const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
  const paragraphCount = paragraphs.length;

  // Connectives: multi-word phrases first, then single-word connectors.
  let connectiveCount = 0;
  for (const phrase of CONNECTIVES) {
    if (phrase.includes(' ')) {
      connectiveCount += lower.split(phrase).length - 1;
    } else {
      connectiveCount += countOccurrences(lower, new RegExp(`\\b${phrase}\\b`, 'gi'));
    }
  }
  const simpleConnectorCount = countOccurrences(lower, SIMPLE_CONNECTOR_RE);
  const advancedWordCount = tokens.filter((t) => ADVANCED_WORDS.has(t)).length;

  // Grammatical complexity signals.
  const conditionalCount =
    countOccurrences(lower, /\bif\b/gi) + countOccurrences(lower, /\bunless\b/gi) +
    countOccurrences(lower, /\bwould\b/gi) + countOccurrences(lower, /\bcould have\b/gi);
  const relativeClauseCount = countOccurrences(lower, /\b(which|who|whom|whose|that)\b/gi);
  const passiveCount = countOccurrences(lower, /\b(am|is|are|was|were|be|been|being)\s+\w+(ed|wn|en)\b/gi);

  const hasEndPunctuation = /[.!?]\s*$/.test(text);

  // Target vocabulary coverage.
  const vocabularyUsed = req.targetVocabulary.filter((w) => lower.includes(w.toLowerCase()));
  const vocabularyMissed = req.targetVocabulary.filter((w) => !lower.includes(w.toLowerCase()));

  const errors = detectAllErrors(text);
  const errorDensity = wordCount > 0 ? (errors.length / wordCount) * 100 : 0;

  return {
    wordCount,
    uniqueWords,
    lexicalDiversity,
    sentenceCount,
    avgWordsPerSentence,
    paragraphCount,
    connectiveCount,
    simpleConnectorCount,
    advancedWordCount,
    conditionalCount,
    relativeClauseCount,
    passiveCount,
    hasEndPunctuation,
    vocabularyUsed,
    vocabularyMissed,
    errors,
    errorDensity,
  };
};

// ---------------------------------------------------------------------------
// Rule-based skill scores
// ---------------------------------------------------------------------------

const clampScore = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const blend = (a: number, b: number, weightA: number): number => a * weightA + b * (1 - weightA);

const ruleGrammar = (a: TextAnalysis): number => {
  if (a.wordCount === 0) return 0;
  let score = 90;
  score -= Math.min(60, a.errors.length * 10);
  score -= Math.min(20, a.errorDensity * 2.5);
  // Reward complex structures.
  score += Math.min(8, a.conditionalCount * 4);
  score += Math.min(6, a.relativeClauseCount * 2);
  score += Math.min(5, a.passiveCount * 2);
  if (a.sentenceCount >= 2) score += 4;
  if (a.wordCount < 8) score = Math.min(score, 45); // too short to judge fairly
  return clampScore(score);
};

const ruleVocabulary = (a: TextAnalysis, req: WritingFeedbackRequest): number => {
  if (a.wordCount === 0) return 0;
  // Lexical diversity (type-token ratio) — ~0.7+ is excellent.
  const ttrScore = Math.min(1, a.lexicalDiversity / 0.75) * 45;
  // Sophistication — advanced words for the level.
  const advRatio = a.advancedWordCount / Math.max(10, a.wordCount);
  const advScore = Math.min(1, advRatio / 0.06) * 20;
  // Target vocabulary coverage.
  const vocabTotal = Math.max(1, req.targetVocabulary.length);
  const targetScore = req.targetVocabulary.length
    ? (a.vocabularyUsed.length / vocabTotal) * 20
    : Math.min(20, (a.uniqueWords / 15) * 20);
  // Volume relative to the task target.
  const volumeScore = Math.min(15, (a.wordCount / Math.max(1, req.minWords)) * 15);
  return clampScore(ttrScore + advScore + targetScore + volumeScore);
};

const ruleStyle = (a: TextAnalysis): number => {
  if (a.wordCount === 0) return 0;
  let score = 30; // base
  // Linking words make writing flow.
  const connectiveDensity = (a.connectiveCount + a.simpleConnectorCount / 2) / Math.max(1, a.sentenceCount);
  score += Math.min(25, connectiveDensity * 15);
  // Sentence variety / organisation.
  if (a.sentenceCount >= 3) score += 10;
  else if (a.sentenceCount >= 2) score += 5;
  // Paragraph structure.
  if (a.paragraphCount >= 3) score += 13;
  else if (a.paragraphCount >= 2) score += 8;
  // Finished with proper punctuation.
  if (a.hasEndPunctuation) score += 7;
  // Penalise run-on sentences.
  if (a.avgWordsPerSentence > 30) score -= 12;
  else if (a.avgWordsPerSentence > 22) score -= 6;
  // Very short writing can't demonstrate style.
  if (a.wordCount < 12) score = Math.min(score, 30);
  return clampScore(score);
};

/** Weighted overall score. */
const computeOverall = (s: { grammar: number; vocabulary: number; style: number }): number =>
  clampScore(s.grammar * 0.4 + s.vocabulary * 0.3 + s.style * 0.3);

// ---------------------------------------------------------------------------
// Rule-based feedback builders
// ---------------------------------------------------------------------------

const buildStrengths = (a: TextAnalysis, req: WritingFeedbackRequest): string[] => {
  const strengths: string[] = [];
  if (a.lexicalDiversity >= 0.6) {
    strengths.push(`Good vocabulary diversity (${Math.round(a.lexicalDiversity * 100)}% unique words).`);
  }
  if (a.wordCount >= req.minWords) {
    strengths.push(`You wrote ${a.wordCount} words — you met the task target!`);
  }
  if (a.sentenceCount >= 3) strengths.push(`You organised your writing into ${a.sentenceCount} sentences.`);
  if (a.connectiveCount >= 2) strengths.push('Nice use of linking words to connect your ideas.');
  if (a.vocabularyUsed.length > 0) strengths.push(`You used target words: ${a.vocabularyUsed.join(', ')}.`);
  if (a.errors.length === 0 && a.wordCount > 0) strengths.push('No grammar mistakes detected — excellent!');
  if (a.advancedWordCount >= 2) strengths.push(`You used ${a.advancedWordCount} advanced words — impressive!`);
  if (strengths.length === 0) strengths.push('Thanks for your writing — every attempt makes you better!');
  return strengths.slice(0, 4);
};

const buildSuggestions = (a: TextAnalysis, _req: WritingFeedbackRequest): string[] => {
  const suggestions: string[] = [];
  if (a.wordCount < 80) suggestions.push('Aim for at least 80–100 words to fully develop your ideas.');
  if (a.connectiveCount === 0) suggestions.push('Add linking words: "however", "therefore", "furthermore", "in addition".');
  if (a.avgWordsPerSentence > 25) suggestions.push('Some sentences are very long — break them up for clarity.');
  if (a.errors.length > 0) suggestions.push(`Fix the ${a.errors.length} grammar error(s) highlighted above.`);
  if (a.paragraphCount < 2 && a.wordCount >= 50) suggestions.push('Organise your writing into paragraphs: introduction, body, conclusion.');
  if (!a.hasEndPunctuation && a.wordCount >= 15) suggestions.push('End your sentences with proper punctuation (. ! ?).');
  if (a.vocabularyMissed.length > 0) suggestions.push(`Try to use more target vocabulary: ${a.vocabularyMissed.slice(0, 4).join(', ')}.`);
  if (suggestions.length === 0) suggestions.push('Excellent work! Try a harder topic to keep growing.');
  return suggestions.slice(0, 4);
};

const buildWritingTips = (a: TextAnalysis): string[] => {
  const tips: string[] = [];
  if (a.connectiveCount < 2) {
    tips.push('Add linking words to improve flow: "Furthermore, …" / "However, …" / "As a result, …" / "In addition, …"');
  }
  if (a.paragraphCount < 3) {
    tips.push('Expand your answer to at least 3 paragraphs: introduction, main body, conclusion.');
  }
  tips.push('Try using more advanced vocabulary: instead of "big" → "significant"; "bad" → "detrimental"; "think" → "believe/consider".');
  if (a.avgWordsPerSentence > 20) {
    tips.push('Keep most sentences under 20 words so each idea is easy to follow.');
  }
  return tips.slice(0, 3);
};

const buildProfessionalTips = (a: TextAnalysis): string[] => {
  const tips: string[] = [];
  if (a.sentenceCount <= 1 || a.avgWordsPerSentence > 25) {
    tips.push('Break long single-sentence answers into 2–3 sentences — one idea per sentence reads as more professional.');
  }
  tips.push('Open with a clear topic sentence, then use transitions like "Furthermore," "In addition," or "As a result," to connect ideas formally.');
  tips.push('End every sentence with proper punctuation — professional writing is never left unfinished.');
  return tips.slice(0, 3);
};

/** Rule-based "professional" rewrite used when the AI is unavailable. */
const ruleProfessionalRewrite = (improved: string): string => {
  const sentences = improved
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (/[.!?]$/.test(s) ? s : s + '.'));

  if (sentences.length === 0) return improved;

  const transitions = ['Furthermore,', 'In addition,', 'Moreover,'];
  const formal: string[] = [];
  sentences.forEach((s, i) => {
    // Capitalise the first letter.
    const capped = s.charAt(0).toUpperCase() + s.slice(1);
    if (i === 0) {
      formal.push(capped);
    } else if (/^(and|but|so|then|also|after that)\b/i.test(capped)) {
      // Replace informal openers with formal transitions.
      formal.push(capped.replace(/^(and|but|so|then|also|after that)\b,?\s*/i, `${transitions[(i - 1) % transitions.length]} `));
    } else {
      formal.push(`${transitions[(i - 1) % transitions.length]} ${capped.charAt(0).toLowerCase()}${capped.slice(1)}`);
    }
  });
  return formal.join(' ');
};

// ---------------------------------------------------------------------------
// Gemini AI path (professional rewrite + score refinement)
// ---------------------------------------------------------------------------

const WRITING_SCHEMA = {
  type: 'OBJECT',
  properties: {
    grammarScore: { type: 'INTEGER' },
    vocabularyScore: { type: 'INTEGER' },
    styleScore: { type: 'INTEGER' },
    professionalRewrite: { type: 'STRING' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['grammarScore', 'vocabularyScore', 'styleScore', 'professionalRewrite', 'strengths', 'suggestions'],
};

const WRITING_SYSTEM_INSTRUCTION = `You are a friendly, encouraging English writing coach for second-language learners.
You will receive a writing task (the prompt), the learner's text, their level, and objective measurements.

Do THREE things:
1. Score grammarScore, vocabularyScore and styleScore (each 0-100). Be fair and consistent with the objective measurements provided.
2. Write "professionalRewrite": rewrite the learner's text in a more formal, professional tone. Keep their meaning and roughly their length. Fix all grammar/spelling mistakes, use formal transitions, and vary sentence structure — but do NOT invent new facts.
3. Give 2-4 specific "strengths" and 2-4 actionable "suggestions".

Return ONLY JSON matching the provided schema. Clamp all scores to 0-100.`;

interface AIWritingFeedback {
  grammarScore: number;
  vocabularyScore: number;
  styleScore: number;
  professionalRewrite: string;
  strengths: string[];
  suggestions: string[];
}

const parseAIWriting = (raw: string): AIWritingFeedback => {
  let parsed: Record<string, unknown> | null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini response was not valid JSON');
    parsed = JSON.parse(match[0]);
  }
  const clamp = (n: unknown, fallback = 50): number => {
    const num = Number(n);
    if (!Number.isFinite(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
  };
  return {
    grammarScore: clamp(parsed?.grammarScore),
    vocabularyScore: clamp(parsed?.vocabularyScore),
    styleScore: clamp(parsed?.styleScore),
    professionalRewrite: String(parsed?.professionalRewrite ?? '').trim(),
    strengths: Array.isArray(parsed?.strengths) ? parsed.strengths.filter((s) => typeof s === 'string') : [],
    suggestions: Array.isArray(parsed?.suggestions) ? parsed.suggestions.filter((s) => typeof s === 'string') : [],
  };
};

const callGeminiWriting = async (req: WritingFeedbackRequest, a: TextAnalysis): Promise<AIWritingFeedback> => {
  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
    encodeURIComponent(config.geminiApiKey);

  const userPrompt = [
    'WRITING TASK (prompt):',
    req.prompt,
    '',
    'LEARNER TEXT:',
    `"${req.text}"`,
    '',
    'TARGET VOCABULARY:',
    req.targetVocabulary.length > 0 ? req.targetVocabulary.join(', ') : '(none for this task)',
    '',
    `LEARNER LEVEL: ${req.level}`,
    '',
    'OBJECTIVE MEASUREMENTS:',
    `- Words written: ${a.wordCount} (${a.uniqueWords} unique)`,
    `- Sentences: ${a.sentenceCount}`,
    `- Paragraphs: ${a.paragraphCount}`,
    `- Linking words used: ${a.connectiveCount}`,
    `- Advanced (B2+) words: ${a.advancedWordCount}`,
    `- Mistakes detected: ${a.errors.length}`,
    '',
    'Now produce the feedback JSON (grammarScore, vocabularyScore, styleScore, professionalRewrite, strengths, suggestions).',
  ].join('\n');

  const body = {
    system_instruction: { parts: [{ text: WRITING_SYSTEM_INSTRUCTION }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: WRITING_SCHEMA,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    } | null;
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no content');
    return parseAIWriting(text);
  } finally {
    clearTimeout(timeout);
  }
};

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate a writing attempt. Objective metrics and mistakes are always
 * computed in code; the professional rewrite (and score refinement) come from
 * Gemini when available, with a full rule-based fallback otherwise.
 */
export const evaluateWriting = async (req: WritingFeedbackRequest): Promise<WritingFeedback> => {
  const a = analyzeText(req);

  const metrics: WritingMetrics = {
    wordCount: a.wordCount,
    sentenceCount: a.sentenceCount,
    uniqueWords: a.uniqueWords,
    errorCount: a.errors.length,
    lexicalDiversity: Math.round(a.lexicalDiversity * 100) / 100,
    connectiveCount: a.connectiveCount,
    advancedWordCount: a.advancedWordCount,
    avgWordsPerSentence: Math.round(a.avgWordsPerSentence * 10) / 10,
    paragraphCount: a.paragraphCount,
  };

  // Empty text — nothing to score.
  if (!req.text || req.text.trim().length === 0) {
    return {
      score: 0,
      grammarScore: 0,
      vocabularyScore: 0,
      styleScore: 0,
      passed: false,
      metrics,
      errors: [],
      improvedVersion: '',
      professionalRewrite: '',
      professionalTips: buildProfessionalTips(a),
      writingTips: buildWritingTips(a),
      strengths: [],
      suggestions: ['No text was submitted. Start writing and try again.'],
      vocabularyUsed: [],
      vocabularyMissed: req.targetVocabulary,
    };
  }

  // Rule-based scores — always computed (fallback + blending baseline).
  const rule = {
    grammar: ruleGrammar(a),
    vocabulary: ruleVocabulary(a, req),
    style: ruleStyle(a),
  };

  const improvedVersion = applyCorrections(req.text, a.errors);
  const errors: WritingError[] = a.errors.slice(0, 12).map(({ original, correction, explanation, category }) => ({
    original,
    correction,
    explanation,
    category,
  }));

  let scores = rule;
  let professionalRewrite = ruleProfessionalRewrite(improvedVersion);
  let strengths = buildStrengths(a, req);
  let suggestions = buildSuggestions(a, req);

  if (config.isGeminiEnabled) {
    try {
      const ai = await callGeminiWriting(req, a);
      // Blend AI judgement with objective measurements (AI leads, data grounds).
      scores = {
        grammar: clampScore(blend(ai.grammarScore, rule.grammar, 0.65)),
        vocabulary: clampScore(blend(ai.vocabularyScore, rule.vocabulary, 0.6)),
        style: clampScore(blend(ai.styleScore, rule.style, 0.6)),
      };
      if (ai.professionalRewrite) professionalRewrite = ai.professionalRewrite;
      if (ai.strengths.length) strengths = ai.strengths.slice(0, 4);
      if (ai.suggestions.length) suggestions = ai.suggestions.slice(0, 4);
    } catch (err) {
      console.error('Gemini writing feedback failed, using fallback:', err);
    }
  }

  const score = computeOverall(scores);

  return {
    score,
    grammarScore: scores.grammar,
    vocabularyScore: scores.vocabulary,
    styleScore: scores.style,
    passed: score >= PASS_MARK,
    metrics,
    errors,
    improvedVersion,
    professionalRewrite,
    professionalTips: buildProfessionalTips(a),
    writingTips: buildWritingTips(a),
    strengths,
    suggestions,
    vocabularyUsed: a.vocabularyUsed,
    vocabularyMissed: a.vocabularyMissed,
  };
};

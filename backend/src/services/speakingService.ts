/**
 * Speaking coach evaluation engine.
 *
 * AI provider: Google Gemini 2.0 Flash (free tier — 1,500 requests/day).
 * Docs: https://ai.google.dev/gemini-api/docs
 *
 * The engine scores a learner's answer on SIX skills:
 *   Pronunciation, Fluency, Grammar, Vocabulary, Confidence, Naturalness
 * plus topic relevance and an estimated CEFR band.
 *
 * Objective measurements (word count, unique words, speaking speed/wpm,
 * connectives, filler words, sentence stats, lexical richness, grammar
 * pattern errors) are ALWAYS computed deterministically in code. When a
 * Gemini key is configured the AI's subjective judgements are blended with
 * these measurements; otherwise a full rule-based fallback is used so the
 * feature always works end-to-end without any API key.
 */

import { config } from '../config/config.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SpeakingFeedbackRequest {
  prompt: string;
  transcription: string;
  targetVocabulary: string[];
  level: string;
  /** Average recognition confidence 0..1 reported by the speech-to-text
   *  engine. Used to ground the pronunciation score. */
  avgConfidence?: number | undefined;
  /** Recording duration in seconds — used for words-per-minute (pace). */
  durationSeconds?: number | undefined;
}

export interface GrammarError {
  original: string;       // what the learner said
  correction: string;     // the corrected form
  explanation: string;    // short reason
}

/** Objective, deterministic measurements extracted from the transcript. */
export interface SpeakingMetrics {
  wordCount: number;
  uniqueWords: number;
  /** Words per minute (0 when no duration was provided). */
  wpm: number;
  durationSeconds: number;
  connectiveCount: number;
  fillerWordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  /** 0..1 — unique words / total words. */
  lexicalDiversity: number;
  /** Number of B2+ level words detected in the answer. */
  advancedWordCount: number;
  /** 0..100 — how closely the answer matches the topic. */
  topicRelevanceScore: number;
}

export interface SpeakingFeedback {
  score: number;                          // 0-100 overall (weighted blend)
  pronunciationScore: number;             // 0-100
  fluencyScore: number;                   // 0-100
  grammarScore: number;                   // 0-100
  vocabularyScore: number;                // 0-100
  confidenceScore: number;                // 0-100
  naturalnessScore: number;               // 0-100
  /** Estimated CEFR band of the answer, e.g. "A2", or "Not assessed". */
  estimatedCEFR: string;
  metrics: SpeakingMetrics;
  vocabularyUsed: string[];               // target words the learner actually used
  vocabularyMissed: string[];             // target words they could have used
  grammarErrors: GrammarError[];
  strengths: string[];                    // what they did well
  suggestions: string[];                  // how to improve
  improvedVersion: string;                // a model answer at the learner's level
}

// ---------------------------------------------------------------------------
// Lexicons used by the deterministic analyzer
// ---------------------------------------------------------------------------

export const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','then','else','when','while','of','at','by','for','with',
  'about','against','between','into','through','during','before','after','above','below','to',
  'from','up','down','in','out','on','off','over','under','again','further','once','here','there',
  'all','any','both','each','few','more','most','other','some','such','no','nor','not','only',
  'own','same','so','than','too','very','can','will','just','should','now','is','am','are','was',
  'were','be','been','being','have','has','had','do','does','did','i','me','my','we','our','you',
  'your','he','him','his','she','her','it','its','they','them','their','this','that','these',
  'those','what','which','who','whom','as','because','until','s','t','don','ll','ve','re','m',
  'd','o','also','like','get','got','make','made','go','went','one','two','much','many','well',
]);

/** Discourse connectives — linking words that make speech flow naturally. */
export const CONNECTIVES = [
  'however', 'therefore', 'furthermore', 'moreover', 'although', 'though', 'because', 'since',
  'while', 'whereas', 'consequently', 'nevertheless', 'nonetheless', 'meanwhile', 'otherwise',
  'additionally', 'finally', 'eventually', 'recently', 'lately', 'instead', 'overall',
  'in addition', 'as a result', 'for example', 'for instance', 'on the other hand', 'in conclusion',
  'in my opinion', 'in fact', 'in other words', 'in particular', 'on the contrary', 'as well as',
  'due to', 'according to', 'even though', 'in order to', 'so that', 'such as', 'first of all',
  'in the end', 'at the same time', 'for this reason', 'in contrast',
];

/** Simple connectors counted with a lighter weight than full connectives. */
export const SIMPLE_CONNECTOR_RE = /\b(and|but|so|because|although|though|while|when|if|or|then)\b/gi;

/** Filler / hesitation sounds and words. */
const FILLER_RE = /\b(um+|uh+|er+|ah+|hmm+|huh)\b/gi;

/** Contrastive / additive discourse markers (a subset of connectives). */
const CONTRAST_RE = /\b(however|although|though|but|whereas|while|on the other hand|in contrast|even though)\b/gi;
const ADDITIVE_RE = /\b(and|also|moreover|furthermore|in addition|additionally|as well as|plus)\b/gi;
/** Advanced (B2+) vocabulary sample used to gauge lexical sophistication. */
export const ADVANCED_WORDS = new Set([
  'significant', 'substantial', 'considerable', 'crucial', 'essential', 'vital', 'fundamental',
  'demonstrate', 'illustrate', 'indicate', 'reveal', 'convey', 'emphasize', 'highlight',
  'perspective', 'viewpoint', 'standpoint', 'consequently', 'therefore', 'nevertheless',
  'furthermore', 'moreover', 'additionally', 'whereas', 'despite', 'although', 'regardless',
  'phenomenon', 'phenomena', 'inevitable', 'unprecedented', 'remarkable', 'extraordinary',
  'comprehensive', 'thorough', 'extensive', 'profound', 'complex', 'sophisticated',
  'achieve', 'accomplish', 'acquire', 'adapt', 'adjust', 'analyze', 'assess', 'benefit',
  'challenge', 'circumstance', 'commit', 'communicate', 'compare', 'concentrate', 'concept',
  'contribute', 'controversial', 'convince', 'critical', 'debate', 'decline', 'determine',
  'develop', 'distinguish', 'diverse', 'eliminate', 'encourage', 'enhance', 'enormous',
  'establish', 'evaluate', 'evidence', 'exaggerate', 'examine', 'exceed', 'exclude', 'expand',
  'experience', 'explain', 'explore', 'facilitate', 'fluctuate', 'focus', 'generate', 'gradual',
  'guarantee', 'identify', 'ignore', 'impact', 'implement', 'imply', 'impose', 'improve',
  'include', 'increase', 'influence', 'inform', 'initial', 'innovative', 'insight', 'interpret',
  'investigate', 'involve', 'issue', 'justify', 'maintain', 'major', 'measure', 'method',
  'minimize', 'modify', 'negotiate', 'notion', 'obtain', 'obvious', 'occur', 'opportunity',
  'participate', 'perceive', 'persuade', 'potential', 'precise', 'predict', 'prefer', 'preserve',
  'prevent', 'previous', 'primary', 'principle', 'prior', 'proceed', 'process', 'promote',
  'proportion', 'propose', 'pursue', 'range', 'recognize', 'recommend', 'reduce', 'reflect',
  'regard', 'reinforce', 'reject', 'relevant', 'rely', 'remove', 'require', 'research',
  'resolve', 'respond', 'restrict', 'retain', 'reveal', 'seek', 'select', 'similar', 'solve',
  'specific', 'strategy', 'stress', 'structure', 'struggle', 'sufficient', 'suggest', 'support',
  'survive', 'sustain', 'tend', 'threat', 'transform', 'trend', 'undergo', 'undertake', 'unique',
  'utilize', 'valid', 'vary', 'vast', 'violate', 'visible', 'widespread', 'withdraw',
]);

/** Common uncountable nouns that learners wrongly pluralise. */
const UNCOUNTABLES = [
  'informations', 'advices', 'furnitures', 'homeworks', 'knowledges', 'musics', 'breads',
  'luggages', 'baggages', 'equipments', 'researches', 'feedbacks', 'staffs', 'peoples',
  'childs', 'womans', 'mans', 'tooths', 'foots', 'moneys', 'news are',
];

const IRREGULAR_PAST_ERRORS = [
  'goed', 'eated', 'buyed', 'thinked', 'runned', 'swimmed', 'drived', 'flyed', 'catched',
  'teached', 'speaked', 'writed', 'readed', 'bringed', 'taked', 'maked', 'getted', 'knowed',
  'sitted', 'standed', 'understanded', 'forgetted', 'sleeped', 'weared', 'payed', 'sayed',
];

const BASE_VERBS = [
  'go', 'eat', 'play', 'work', 'study', 'watch', 'read', 'write', 'come', 'take', 'make',
  'get', 'see', 'meet', 'visit', 'travel', 'buy', 'drink', 'sleep', 'wake', 'drive', 'run',
  'speak', 'talk', 'give', 'find', 'think', 'know', 'say', 'tell', 'leave', 'lose', 'pay',
];

const PROFESSIONS = [
  'student', 'teacher', 'doctor', 'engineer', 'lawyer', 'nurse', 'driver', 'worker', 'artist',
  'writer', 'farmer', 'chef', 'pilot', 'dentist', 'manager', 'developer', 'designer',
  'accountant', 'scientist', 'musician', 'actor', 'actress', 'waiter', 'waitress', 'soldier',
  'singer', 'player', 'person', 'man', 'woman', 'boy', 'girl', 'engineer', 'professor',
];

const HEDGING_RE = /\b(maybe|perhaps|kind of|sort of|i guess|i don't know|not sure)\b/gi;
/** Contractions — apostrophe optional because speech-to-text often drops it. */
const CONTRACTION_RE = /\b(i'?m|i'?ve|i'?ll|i'?d|don'?t|doesn'?t|didn'?t|can'?t|couldn'?t|won'?t|wouldn'?t|isn'?t|aren'?t|wasn'?t|weren'?t|it'?s|that'?s|there'?s|let'?s|we'?re|they'?re|you'?re)\b/gi;

// ---------------------------------------------------------------------------
// Grammar error patterns (rule-based detection for the fallback scorer)
// ---------------------------------------------------------------------------

export interface GrammarPattern {
  re: RegExp;
  explanation: string;
  correction: (match: string) => string;
}

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    // Apostrophe optional — Whisper transcripts often drop it ("dont").
    re: /\b(he|she|it)\s+(don'?t)\b/gi,
    explanation: 'Use "doesn\'t" with he/she/it.',
    correction: (m) => m.replace(/don'?t/i, "doesn't"),
  },
  {
    re: /\b(he|she|it)\s+(go|do|have|want|need|like|play|work|study|eat|drink|watch|read|write|speak|come|take|make|get|know|think|see|look|live|love|enjoy|prefer|try|use|help|start|learn)\b/gi,
    explanation: 'Third-person singular needs -s: "he goes", "she likes".',
    correction: (m) => {
      const parts = m.split(/\s+/);
      const verb = parts[1] ?? '';
      const s = verb.endsWith('o') || verb.endsWith('ch') || verb.endsWith('sh') ? 'es' : verb.endsWith('y') ? 'ies' : 's';
      return `${parts[0]} ${verb.endsWith('y') ? verb.slice(0, -1) + s : verb + s}`;
    },
  },
  {
    re: /\b(they|we|you|i)\s+is\b/gi,
    explanation: 'Use "are" with they/we/you and "am" with I.',
    correction: (m) => m.replace(/\bis\b/i, (m.match(/^i\b/i) ? 'am' : 'are')),
  },
  {
    re: /\bI\s+am\s+agree\b/gi,
    explanation: '"Agree" is a verb — say "I agree" (no "am").',
    correction: () => 'I agree',
  },
  {
    re: /\bI\s+am\s+interesting\s+in\b/gi,
    explanation: 'Say "I am interested in" (feeling = -ed adjective).',
    correction: () => 'I am interested in',
  },
  {
    re: new RegExp(`\\b(${UNCOUNTABLES.join('|')})\\b`, 'gi'),
    explanation: 'This noun is uncountable — it has no plural form.',
    correction: (m) => {
      const w = m.toLowerCase().replace(/ are$/, '');
      return w.endsWith('s') ? w.slice(0, -1) : w;
    },
  },
  {
    re: new RegExp(`\\b(${IRREGULAR_PAST_ERRORS.join('|')})\\b`, 'gi'),
    explanation: 'This verb has an irregular past tense (go → went, eat → ate).',
    correction: (m) => m,
  },
  {
    re: /\bmore\s+(better|easier|bigger|faster|worse|harder|higher|lower|cheaper|nicer|prettier)\b/gi,
    explanation: 'Don\'t use "more" with -er comparatives: "better", not "more better".',
    correction: (m) => m.replace(/more\s+/i, ''),
  },
  {
    re: new RegExp(`\\byesterday\\s+I\\s+(${BASE_VERBS.join('|')})\\b`, 'gi'),
    explanation: 'With "yesterday" use the past tense: "yesterday I went".',
    correction: (m) => m,
  },
  {
    // Past-time marker at the END of the sentence: "I go work yesterday."
    // [^.!?]* keeps the match inside a single sentence.
    re: new RegExp(
      `\\b(i|we|they|he|she)\\s+(${BASE_VERBS.join('|')})\\b[^.!?]*\\b(yesterday|last week|last month|last year|two days ago|a week ago|an hour ago)\\b`,
      'gi'
    ),
    explanation: 'With past-time words ("yesterday", "last week") use the past tense.',
    correction: (m) => m,
  },
  {
    re: /\bgoing to\s+(went|came|took|made|got|saw|ate|did|had|was|were)\b/gi,
    explanation: 'After "going to" use the base verb: "going to go".',
    correction: (m) => m,
  },
  {
    re: /\bhave\s+(went|came|took|made|got|saw|ate|did|gave|found|thought|told|knew)\b/gi,
    explanation: 'After "have" use the past participle: "have gone", "have seen".',
    correction: (m) => m,
  },
  {
    re: new RegExp(`\\b(?:i am|he is|she is|you are|they are|we are)\\s+(?:${PROFESSIONS.join('|')})\\b`, 'gi'),
    explanation: 'Singular professions need an article: "I am a student".',
    correction: (m) => m.replace(/\s+(?=[a-z])/i, ' a '),
  },
  {
    re: /\bI\s+no\s+(have|like|want|need|know|understand|speak|eat|drink|play|work|study|go|watch)\b/gi,
    explanation: 'Use "don\'t" for negation: "I don\'t like".',
    correction: (m) => m.replace(/\bno\b/i, "don't"),
  },
  {
    re: /\bdidn'?t\s+(went|came|took|made|got|saw|ate|did|had|was|were|could|would|should)\b/gi,
    explanation: 'After "didn\'t" use the base verb: "didn\'t go".',
    correction: (m) => m,
  },
  {
    re: /\b(can|must|should|will|would|could|may|might)\s+to\s+\w+\b/gi,
    explanation: 'Modal verbs take the base form without "to": "can swim".',
    correction: (m) => m.replace(/\s+to\b/i, ''),
  },
  {
    re: /\bmarried\s+with\b/gi,
    explanation: 'Say "married to someone" (not "married with").',
    correction: () => 'married to',
  },
  {
    re: /\bI\s+have\s+\d+\s+years\b/gi,
    explanation: 'In English say "I am 25 years old" (not "I have 25 years").',
    correction: (m) => m.replace(/I have (\d+) years/i, 'I am $1 years old'),
  },
  {
    re: /\blook forward to\s+(see|meet|hear|visit|go|come)\b/gi,
    explanation: '"Look forward to" takes -ing: "look forward to seeing".',
    correction: (m) => m.replace(/\b(see|meet|hear|visit|go|come)\b/i, (v) => v + 'ing'),
  },
  {
    re: /\benjoy\s+to\s+\w+\b/gi,
    explanation: '"Enjoy" takes -ing: "enjoy playing".',
    correction: (m) => m.replace(/\bto\s+(\w+)/i, '$1ing'),
  },
  {
    re: /\bwant\s+that\s+you\b/gi,
    explanation: 'Say "want you to..." instead of "want that you...".',
    correction: () => 'want you to',
  },
];

/** Scan the transcript for common grammar mistakes (deterministic). */
const detectGrammarErrors = (transcript: string): GrammarError[] => {
  const errors: GrammarError[] = [];
  const seen = new Set<string>();
  for (const { re, explanation, correction } of GRAMMAR_PATTERNS) {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m: RegExpExecArray | null;
    while ((m = global.exec(transcript)) !== null) {
      const original = m[0];
      const key = `${re.source}::${original.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      errors.push({ original, correction: correction(original), explanation });
      if (errors.length >= 12) return errors;
    }
  }
  return errors;
};

// ---------------------------------------------------------------------------
// Deterministic transcript analysis
// ---------------------------------------------------------------------------

export const countOccurrences = (text: string, re: RegExp): number => {
  const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  return (text.match(global) || []).length;
};

export const tokenize = (text: string): string[] =>
  text.toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(Boolean);

/** Expected answer length (words) for a full score at each CEFR band. */
const wordTargetForLevel = (level: string): number => {
  const l = (level || '').toUpperCase();
  if (l.includes('PRE-A1')) return 10;
  if (l.includes('A1')) return 15;
  if (l.includes('A2')) return 25;
  if (l.includes('B1')) return 40;
  if (l.includes('B2')) return 60;
  if (l.includes('C1')) return 80;
  return 25;
};

/** Speaking-pace score: 110–150 wpm is the ideal conversational range. */
const paceScore = (wpm: number): number => {
  if (wpm <= 0) return 0;
  if (wpm < 40) return 15;
  if (wpm < 60) return 30;
  if (wpm < 80) return 45;
  if (wpm < 100) return 60;
  if (wpm < 110) return 75;
  if (wpm <= 150) return 90;
  if (wpm <= 170) return 78;
  return 60;
};

const clampScore = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const blend = (a: number, b: number, weightA: number): number => a * weightA + b * (1 - weightA);

interface TranscriptAnalysis {
  wordCount: number;
  uniqueWords: number;
  lexicalDiversity: number;
  wpm: number;
  durationSeconds: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  connectiveCount: number;
  simpleConnectorCount: number;
  contrastCount: number;
  additiveCount: number;
  fillerWordCount: number;
  contractionCount: number;
  hedgingCount: number;
  advancedWordCount: number;
  conditionalCount: number;
  relativeClauseCount: number;
  passiveCount: number;
  gerundCount: number;
  vocabularyUsed: string[];
  vocabularyMissed: string[];
  detectedErrors: GrammarError[];
  topicRelevanceScore: number;
  errorDensity: number; // errors per 100 words
}

const analyzeTranscript = (req: SpeakingFeedbackRequest): TranscriptAnalysis => {
  const transcript = req.transcription.trim();
  const lower = transcript.toLowerCase();
  const tokens = tokenize(transcript);
  const wordCount = tokens.length;
  const uniqueSet = new Set(tokens);
  const uniqueWords = uniqueSet.size;
  const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

  const durationSeconds =
    typeof req.durationSeconds === 'number' && req.durationSeconds > 0
      ? Math.round(req.durationSeconds)
      : 0;
  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

  const sentences = transcript.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

  // Connectives: multi-word phrases first, then single-word connectors.
  let connectiveCount = 0;
  for (const phrase of CONNECTIVES) {
    if (phrase.includes(' ')) {
      const idx = lower.split(phrase).length - 1;
      connectiveCount += idx;
    } else {
      connectiveCount += countOccurrences(lower, new RegExp(`\\b${phrase}\\b`, 'gi'));
    }
  }
  const simpleConnectorCount = countOccurrences(lower, SIMPLE_CONNECTOR_RE);
  const contrastCount = countOccurrences(lower, CONTRAST_RE);
  const additiveCount = countOccurrences(lower, ADDITIVE_RE);

  const fillerWordCount = countOccurrences(lower, FILLER_RE);
  const contractionCount = countOccurrences(lower, CONTRACTION_RE);
  const hedgingCount = countOccurrences(lower, HEDGING_RE);

  const advancedWordCount = tokens.filter((t) => ADVANCED_WORDS.has(t)).length;

  // Grammatical complexity signals.
  const conditionalCount =
    countOccurrences(lower, /\bif\b/gi) + countOccurrences(lower, /\bunless\b/gi) +
    countOccurrences(lower, /\bwould\b/gi) + countOccurrences(lower, /\bcould have\b/gi);
  const relativeClauseCount = countOccurrences(lower, /\b(which|who|whom|whose|that)\b/gi);
  const passiveCount = countOccurrences(
    lower,
    /\b(am|is|are|was|were|be|been|being)\s+\w+(ed|wn|en)\b/gi
  );
  const gerundCount = countOccurrences(
    lower,
    /\b(enjoy|avoid|finish|mind|suggest|keep|practice|practise|consider|imagine|risk|miss)\s+\w+ing\b/gi
  );

  // Target vocabulary coverage.
  const vocabularyUsed = req.targetVocabulary.filter((w) => lower.includes(w.toLowerCase()));
  const vocabularyMissed = req.targetVocabulary.filter((w) => !lower.includes(w.toLowerCase()));

  // Deterministic grammar-error scan.
  const detectedErrors = detectGrammarErrors(transcript);
  const errorDensity = wordCount > 0 ? (detectedErrors.length / wordCount) * 100 : 0;

  // Topic relevance: keyword overlap between the prompt and the answer.
  const promptKeywords = tokenize(req.prompt).filter((w) => !STOPWORDS.has(w) && w.length > 2);
  const promptUnique = Array.from(new Set(promptKeywords));
  let overlap = 0;
  for (const kw of promptUnique) {
    if (uniqueSet.has(kw) || uniqueSet.has(kw.endsWith('s') ? kw.slice(0, -1) : kw + 's')) overlap++;
  }
  const overlapRatio = promptUnique.length > 0 ? overlap / promptUnique.length : 0;
  const vocabCoverage =
    req.targetVocabulary.length > 0 ? vocabularyUsed.length / req.targetVocabulary.length : 0;
  const topicRelevanceScore = clampScore(
    (overlapRatio * 0.6 + vocabCoverage * 0.4) * 100 * 1.4
  );

  return {
    wordCount,
    uniqueWords,
    lexicalDiversity,
    wpm,
    durationSeconds,
    sentenceCount,
    avgWordsPerSentence,
    connectiveCount,
    simpleConnectorCount,
    contrastCount,
    additiveCount,
    fillerWordCount,
    contractionCount,
    hedgingCount,
    advancedWordCount,
    conditionalCount,
    relativeClauseCount,
    passiveCount,
    gerundCount,
    vocabularyUsed,
    vocabularyMissed,
    detectedErrors,
    topicRelevanceScore,
    errorDensity,
  };
};

// ---------------------------------------------------------------------------
// Rule-based skill scores (used directly in fallback, blended with the AI)
// ---------------------------------------------------------------------------

const rulePronunciation = (a: TranscriptAnalysis, req: SpeakingFeedbackRequest): number => {
  if (req.avgConfidence != null) {
    return clampScore(Math.max(35, Math.min(100, req.avgConfidence * 100)));
  }
  // No recognition data — derive a modest heuristic from speech completeness.
  const target = wordTargetForLevel(req.level);
  const completion = Math.min(1, a.wordCount / Math.max(1, target));
  return clampScore(50 + completion * 25);
};

const ruleFluency = (a: TranscriptAnalysis): number => {
  if (a.wordCount === 0) return 0;
  let score = a.wpm > 0 ? paceScore(a.wpm) : 55; // no timing → neutral pace
  // Fillers hurt the flow.
  score -= Math.min(25, a.fillerWordCount * 6);
  // Complete, well-formed sentences help.
  if (a.sentenceCount >= 2) score += 8;
  if (a.avgWordsPerSentence >= 6 && a.avgWordsPerSentence <= 20) score += 7;
  // Very short answers can't demonstrate fluency.
  if (a.wordCount < 10) score -= 20;
  return clampScore(score);
};

const ruleGrammar = (a: TranscriptAnalysis): number => {
  if (a.wordCount === 0) return 0;
  let score = 92;
  score -= Math.min(60, a.detectedErrors.length * 12);
  score -= Math.min(20, a.errorDensity * 4);
  // Reward complex structures.
  score += Math.min(10, a.conditionalCount * 5);
  score += Math.min(6, a.relativeClauseCount * 2);
  score += Math.min(5, a.passiveCount * 2);
  score += Math.min(5, a.gerundCount * 3);
  if (a.sentenceCount >= 2) score += 4;
  if (a.wordCount < 8) score = Math.min(score, 45); // too short to judge
  return clampScore(score);
};

const ruleVocabulary = (a: TranscriptAnalysis, req: SpeakingFeedbackRequest): number => {
  if (a.wordCount === 0) return 0;
  // Lexical diversity (type-token ratio) — expect ~0.5–0.9 for good answers.
  const ttrScore = Math.min(1, a.lexicalDiversity / 0.7) * 40;
  // Sophistication — advanced words for the level.
  const advRatio = a.advancedWordCount / Math.max(10, a.wordCount);
  const advScore = Math.min(1, advRatio / 0.08) * 25;
  // Target vocabulary coverage.
  const vocabTotal = Math.max(1, req.targetVocabulary.length);
  const targetScore = req.targetVocabulary.length
    ? (a.vocabularyUsed.length / vocabTotal) * 25
    : Math.min(25, (a.uniqueWords / 15) * 25);
  // Volume bonus.
  const volumeScore = Math.min(10, (a.wordCount / wordTargetForLevel(req.level)) * 10);
  return clampScore(ttrScore + advScore + targetScore + volumeScore);
};

const ruleConfidence = (a: TranscriptAnalysis, req: SpeakingFeedbackRequest): number => {
  if (a.wordCount === 0) return 0;
  const target = wordTargetForLevel(req.level);
  // Speaking volume relative to the level expectation.
  let score = Math.min(1, a.wordCount / (target * 1.5)) * 55;
  // Comfortable pace signals confidence.
  if (a.wpm > 0) {
    if (a.wpm >= 100 && a.wpm <= 160) score += 25;
    else if (a.wpm >= 80) score += 15;
    else score += 5;
  } else {
    score += 12; // no timing data → neutral
  }
  // Hesitation reduces perceived confidence.
  score -= Math.min(20, (a.fillerWordCount + a.hedgingCount) * 5);
  // Committing to multi-sentence answers.
  if (a.sentenceCount >= 3) score += 10;
  else if (a.sentenceCount >= 2) score += 5;
  return clampScore(score);
};

const ruleNaturalness = (a: TranscriptAnalysis): number => {
  if (a.wordCount === 0) return 0;
  // Connective density — one per ~2 sentences is natural.
  const totalConnectives = a.connectiveCount + Math.floor(a.simpleConnectorCount / 2);
  const density = a.sentenceCount > 0 ? totalConnectives / a.sentenceCount : 0;
  let score = Math.min(40, density * 30);
  // Using both contrast and addition links ideas like a native speaker.
  if (a.contrastCount > 0) score += 10;
  if (a.additiveCount > 0) score += 5;
  // Contractions are how people really speak.
  score += Math.min(15, a.contractionCount * 5);
  // Sentence variety (mix of short and long).
  if (a.sentenceCount >= 3 && a.avgWordsPerSentence >= 8) score += 10;
  // Fillers sound unnatural.
  score -= Math.min(15, a.fillerWordCount * 4);
  // Very short answers can't sound natural.
  if (a.wordCount < 12) score = Math.min(score, 30);
  return clampScore(score);
};

/** Estimate the CEFR band the answer demonstrates. */
const estimateCEFR = (a: TranscriptAnalysis, grammarScore: number, vocabularyScore: number): string => {
  if (a.wordCount < 5) return 'Not assessed';
  const complexity =
    Math.min(2, a.conditionalCount) + Math.min(2, a.relativeClauseCount) +
    Math.min(1, a.passiveCount) + Math.min(1, a.gerundCount);
  let points = 0;
  if (a.wordCount >= 15) points++;
  if (a.wordCount >= 35) points++;
  if (a.wordCount >= 60) points++;
  if (a.wordCount >= 100) points++;
  if (a.uniqueWords >= 20) points++;
  if (a.uniqueWords >= 45) points++;
  if (a.advancedWordCount >= 2) points++;
  if (a.advancedWordCount >= 6) points++;
  if (a.connectiveCount >= 2) points++;
  if (a.connectiveCount >= 4) points++;
  if (complexity >= 2) points++;
  if (complexity >= 4) points++;
  if (grammarScore >= 75) points++;
  if (vocabularyScore >= 70) points++;

  if (points <= 2) return 'Pre-A1';
  if (points <= 5) return 'A1';
  if (points <= 8) return 'A2';
  if (points <= 11) return 'B1';
  if (points <= 13) return 'B2';
  return 'C1';
};

/** Weighted overall score from the six skill scores. */
const computeOverall = (s: {
  pronunciation: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  confidence: number;
  naturalness: number;
}): number =>
  clampScore(
    s.grammar * 0.25 +
    s.fluency * 0.2 +
    s.vocabulary * 0.2 +
    s.pronunciation * 0.15 +
    s.confidence * 0.1 +
    s.naturalness * 0.1
  );

/** Build strengths / suggestions from the deterministic analysis. */
const buildRuleFeedback = (
  a: TranscriptAnalysis,
  req: SpeakingFeedbackRequest,
  scores: { fluency: number; grammar: number; vocabulary: number; confidence: number; naturalness: number }
): { strengths: string[]; suggestions: string[] } => {
  const strengths: string[] = [];
  const suggestions: string[] = [];

  if (a.wordCount >= wordTargetForLevel(req.level)) {
    strengths.push(`You spoke ${a.wordCount} words — a full, detailed answer!`);
  }
  if (a.sentenceCount >= 3) strengths.push(`You organised your answer into ${a.sentenceCount} sentences.`);
  if (a.vocabularyUsed.length > 0) {
    strengths.push(`You used target words: ${a.vocabularyUsed.join(', ')}.`);
  }
  if (a.uniqueWords >= 20) strengths.push(`Good lexical variety — ${a.uniqueWords} unique words.`);
  if (a.connectiveCount >= 2) strengths.push('Nice use of linking words to connect your ideas.');
  if (a.wpm >= 110 && a.wpm <= 150) strengths.push(`Your speaking pace (${a.wpm} wpm) sounds natural.`);
  if (a.conditionalCount > 0) strengths.push('You attempted complex sentence structures — great!');
  if (strengths.length === 0) strengths.push('Thanks for your answer — every attempt makes you better!');

  if (scores.grammar < 70 && a.detectedErrors.length > 0) {
    const first = a.detectedErrors[0];
    if (first) suggestions.push(`Watch out for: "${first.original}" → "${first.correction}" (${first.explanation})`);
  }
  if (a.wpm > 0 && a.wpm < 110) {
    suggestions.push(`Your pace was ${a.wpm} wpm — aim for 110–150 wpm for natural conversation.`);
  }
  if (a.fillerWordCount > 1) {
    suggestions.push(`Try to avoid filler sounds ("um", "uh") — you used ${a.fillerWordCount}. A short silent pause is better.`);
  }
  if (a.vocabularyMissed.length > 0) {
    suggestions.push(`Try to use more target vocabulary: ${a.vocabularyMissed.slice(0, 4).join(', ')}.`);
  }
  if (a.connectiveCount === 0) {
    suggestions.push('Link your ideas with connectives like "however", "because", or "for example".');
  }
  if (a.wordCount < wordTargetForLevel(req.level)) {
    suggestions.push(`Aim for a longer answer — about ${wordTargetForLevel(req.level)}+ words at your level.`);
  }
  if (scores.confidence < 60) {
    suggestions.push('Speak with confidence: keep talking, use full sentences, and avoid "maybe" or "I don\'t know".');
  }
  if (suggestions.length === 0) suggestions.push('Excellent work! Try a harder topic to keep growing.');

  return { strengths: strengths.slice(0, 4), suggestions: suggestions.slice(0, 4) };
};

// ---------------------------------------------------------------------------
// Gemini AI path (blended with the deterministic measurements)
// ---------------------------------------------------------------------------

/** Strict JSON schema the model must return. */
const FEEDBACK_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pronunciationScore: { type: 'INTEGER' },
    fluencyScore: { type: 'INTEGER' },
    grammarScore: { type: 'INTEGER' },
    vocabularyScore: { type: 'INTEGER' },
    confidenceScore: { type: 'INTEGER' },
    naturalnessScore: { type: 'INTEGER' },
    estimatedCEFR: { type: 'STRING' },
    vocabularyUsed: { type: 'ARRAY', items: { type: 'STRING' } },
    vocabularyMissed: { type: 'ARRAY', items: { type: 'STRING' } },
    grammarErrors: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          original: { type: 'STRING' },
          correction: { type: 'STRING' },
          explanation: { type: 'STRING' },
        },
        required: ['original', 'correction', 'explanation'],
      },
    },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
    improvedVersion: { type: 'STRING' },
  },
  required: [
    'pronunciationScore',
    'fluencyScore',
    'grammarScore',
    'vocabularyScore',
    'confidenceScore',
    'naturalnessScore',
    'estimatedCEFR',
    'vocabularyUsed',
    'vocabularyMissed',
    'grammarErrors',
    'strengths',
    'suggestions',
    'improvedVersion',
  ],
};

const SYSTEM_INSTRUCTION = `You are a friendly, encouraging English speaking coach for second-language learners.
You will receive:
- "prompt": the speaking task the learner was answering
- "transcription": what the learner actually said (transcribed automatically — it may contain recognition errors)
- "targetVocabulary": words the learner was encouraged to try to use
- objective measurements: speaking speed (wpm), word count, unique words, connectives, filler words

Score the learner on SIX skills (each 0-100):
1. pronunciationScore — clarity of speech (use the recognition confidence when provided)
2. fluencyScore — smoothness and pace of delivery (110-150 wpm is ideal; penalise fillers/hesitation)
3. grammarScore — grammatical accuracy (tenses, agreement, articles, sentence structure)
4. vocabularyScore — range and appropriacy of words used (reward unique/advanced words and target vocabulary)
5. confidenceScore — speaking volume, steady pace, assertive language (no excessive hedging)
6. naturalnessScore — native-like flow: connectives, contractions, sentence variety, discourse markers

Also:
- estimatedCEFR: the CEFR band the answer demonstrates (Pre-A1, A1, A2, B1, B2, or C1)
- grammarErrors: ONLY real mistakes — do not invent errors. Each needs original, correction, explanation.
- Be warm and specific. When transcription is garbled or nearly empty, give partial credit.
Return ONLY JSON matching the provided schema. Clamp all scores to 0-100.`;

const buildUserPrompt = (req: SpeakingFeedbackRequest, a: TranscriptAnalysis): string => {
  return [
    `SPEAKING TASK (prompt):`,
    req.prompt,
    ``,
    `LEARNER TRANSCRIPTION:`,
    `"${req.transcription}"`,
    ``,
    `TARGET VOCABULARY:`,
    req.targetVocabulary.length > 0
      ? req.targetVocabulary.join(', ')
      : '(none for this task)',
    ``,
    `LEARNER LEVEL: ${req.level}`,
    ``,
    `OBJECTIVE MEASUREMENTS:`,
    `- Speaking speed: ${a.wpm > 0 ? `${a.wpm} words per minute` : 'not measured'} (ideal: 110-150 wpm)`,
    `- Words spoken: ${a.wordCount} (${a.uniqueWords} unique)`,
    `- Sentences: ${a.sentenceCount}`,
    `- Connectives used: ${a.connectiveCount}`,
    `- Filler words (um/uh): ${a.fillerWordCount}`,
    `- Advanced (B2+) words: ${a.advancedWordCount}`,
    ``,
    `SPEECH RECOGNITION CONFIDENCE:`,
    req.avgConfidence != null
      ? `Average recognition confidence: ${(req.avgConfidence * 100).toFixed(0)}%. Use this to help estimate the pronunciation score.`
      : 'Not available — estimate pronunciation from the text quality.',
    ``,
    `Now produce the feedback JSON with all six skill scores, estimatedCEFR, grammarErrors, strengths, suggestions and improvedVersion.`,
  ].join('\n');
};

interface AIFeedback {
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  naturalnessScore: number;
  estimatedCEFR: string;
  vocabularyUsed: string[];
  vocabularyMissed: string[];
  grammarErrors: GrammarError[];
  strengths: string[];
  suggestions: string[];
  improvedVersion: string;
}

/** Parse + sanitise the model's JSON, clamping scores to valid ranges. */
const parseAIFeedback = (raw: string, req: SpeakingFeedbackRequest): AIFeedback => {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Some models occasionally wrap JSON in prose — try to extract it.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini response was not valid JSON');
    parsed = JSON.parse(match[0]);
  }

  const clamp = (n: any, fallback = 50): number => {
    const num = Number(n);
    if (!Number.isFinite(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const lowerTranscript = req.transcription.toLowerCase();
  const vocabularyUsed: string[] = (parsed.vocabularyUsed ?? [])
    .filter((w: any) => typeof w === 'string' && w.trim().length > 0)
    .map((w: any) => String(w));
  // Sanity-check claimed vocabulary against what was actually said.
  const verifiedUsed: string[] = Array.from(
    new Set(vocabularyUsed.filter((w) => lowerTranscript.includes(w.toLowerCase())))
  );
  const claimedMissed: string[] = Array.isArray(parsed.vocabularyMissed)
    ? parsed.vocabularyMissed.filter((w: any) => typeof w === 'string').map((w: any) => String(w))
    : req.targetVocabulary;
  const verifiedMissed: string[] = claimedMissed.filter((w) => !verifiedUsed.includes(w));

  const cefr = String(parsed.estimatedCEFR ?? '').trim();
  const validCEFR = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'].find(
    (l) => l.toLowerCase() === cefr.toLowerCase()
  );

  return {
    pronunciationScore: clamp(parsed.pronunciationScore),
    fluencyScore: clamp(parsed.fluencyScore),
    grammarScore: clamp(parsed.grammarScore),
    vocabularyScore: clamp(parsed.vocabularyScore),
    confidenceScore: clamp(parsed.confidenceScore),
    naturalnessScore: clamp(parsed.naturalnessScore),
    estimatedCEFR: validCEFR ?? 'Not assessed',
    vocabularyUsed: verifiedUsed,
    vocabularyMissed: verifiedMissed,
    grammarErrors: Array.isArray(parsed.grammarErrors)
      ? parsed.grammarErrors
          .map((e: any) => ({
            original: String(e?.original ?? ''),
            correction: String(e?.correction ?? ''),
            explanation: String(e?.explanation ?? ''),
          }))
          .filter((e: GrammarError) => e.original || e.correction)
      : [],
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.filter((s: any) => typeof s === 'string')
      : [],
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((s: any) => typeof s === 'string')
      : [],
    improvedVersion: String(parsed.improvedVersion ?? '').trim(),
  };
};

/** Call Gemini 2.0 Flash free tier with structured (JSON schema) output. */
const callGemini = async (
  req: SpeakingFeedbackRequest,
  a: TranscriptAnalysis
): Promise<AIFeedback> => {
  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
    encodeURIComponent(config.geminiApiKey);

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildUserPrompt(req, a) }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: FEEDBACK_SCHEMA,
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

    const data: any = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned no content');
    }

    return parseAIFeedback(text, req);
  } finally {
    clearTimeout(timeout);
  }
};

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate a speaking attempt. Objective metrics are always computed in code;
 * subjective skill scores come from Gemini (blended with rule-based scores)
 * when a key is configured, or from the deterministic fallback otherwise.
 */
export const evaluateSpeaking = async (
  req: SpeakingFeedbackRequest
): Promise<SpeakingFeedback> => {
  const a = analyzeTranscript(req);

  const metrics: SpeakingMetrics = {
    wordCount: a.wordCount,
    uniqueWords: a.uniqueWords,
    wpm: a.wpm,
    durationSeconds: a.durationSeconds,
    connectiveCount: a.connectiveCount,
    fillerWordCount: a.fillerWordCount,
    sentenceCount: a.sentenceCount,
    avgWordsPerSentence: Math.round(a.avgWordsPerSentence * 10) / 10,
    lexicalDiversity: Math.round(a.lexicalDiversity * 100) / 100,
    advancedWordCount: a.advancedWordCount,
    topicRelevanceScore: a.topicRelevanceScore,
  };

  // Empty transcription — nothing to score.
  if (!req.transcription || req.transcription.trim().length === 0) {
    return {
      score: 0,
      pronunciationScore: 0,
      fluencyScore: 0,
      grammarScore: 0,
      vocabularyScore: 0,
      confidenceScore: 0,
      naturalnessScore: 0,
      estimatedCEFR: 'Not assessed',
      metrics,
      vocabularyUsed: [],
      vocabularyMissed: req.targetVocabulary,
      grammarErrors: [],
      strengths: [],
      suggestions: ['No speech was detected. Tap the microphone and try again.'],
      improvedVersion: '',
    };
  }

  // Rule-based scores — always computed, used as fallback and for blending.
  const rule = {
    pronunciation: rulePronunciation(a, req),
    fluency: ruleFluency(a),
    grammar: ruleGrammar(a),
    vocabulary: ruleVocabulary(a, req),
    confidence: ruleConfidence(a, req),
    naturalness: ruleNaturalness(a),
  };

  if (config.isGeminiEnabled) {
    try {
      const ai = await callGemini(req, a);

      // Blend AI judgement with objective measurements (AI leads, data grounds).
      const blended = {
        pronunciation: clampScore(blend(ai.pronunciationScore, rule.pronunciation, 0.7)),
        fluency: clampScore(blend(ai.fluencyScore, rule.fluency, 0.6)),
        grammar: clampScore(blend(ai.grammarScore, rule.grammar, 0.65)),
        vocabulary: clampScore(blend(ai.vocabularyScore, rule.vocabulary, 0.6)),
        confidence: clampScore(blend(ai.confidenceScore, rule.confidence, 0.55)),
        naturalness: clampScore(blend(ai.naturalnessScore, rule.naturalness, 0.55)),
      };

      // Merge AI-detected errors with deterministically detected ones.
      const errorKey = (e: GrammarError) =>
        `${e.original.toLowerCase()}::${e.correction.toLowerCase()}`;
      const mergedErrors = [...ai.grammarErrors];
      const aiKeys = new Set(mergedErrors.map(errorKey));
      for (const e of a.detectedErrors) {
        if (!aiKeys.has(errorKey(e)) && mergedErrors.length < 12) mergedErrors.push(e);
      }

      const vocabularyUsed = Array.from(new Set([...ai.vocabularyUsed, ...a.vocabularyUsed]));
      const vocabularyMissed = req.targetVocabulary.filter(
        (w) => !vocabularyUsed.some((u) => u.toLowerCase() === w.toLowerCase())
      );

      return {
        score: computeOverall(blended),
        pronunciationScore: blended.pronunciation,
        fluencyScore: blended.fluency,
        grammarScore: blended.grammar,
        vocabularyScore: blended.vocabulary,
        confidenceScore: blended.confidence,
        naturalnessScore: blended.naturalness,
        estimatedCEFR:
          ai.estimatedCEFR !== 'Not assessed'
            ? ai.estimatedCEFR
            : estimateCEFR(a, blended.grammar, blended.vocabulary),
        metrics,
        vocabularyUsed,
        vocabularyMissed,
        grammarErrors: mergedErrors,
        strengths: ai.strengths.length ? ai.strengths : buildRuleFeedback(a, req, blended).strengths,
        suggestions: ai.suggestions.length ? ai.suggestions : buildRuleFeedback(a, req, blended).suggestions,
        improvedVersion: ai.improvedVersion,
      };
    } catch (err) {
      console.error('Gemini speaking feedback failed, using fallback:', err);
    }
  }

  // Deterministic fallback — full rule-based evaluation.
  const grammarErrors = a.detectedErrors;
  const { strengths, suggestions } = buildRuleFeedback(a, req, rule);
  const cefr = estimateCEFR(a, rule.grammar, rule.vocabulary);

  return {
    score: computeOverall(rule),
    pronunciationScore: rule.pronunciation,
    fluencyScore: rule.fluency,
    grammarScore: rule.grammar,
    vocabularyScore: rule.vocabulary,
    confidenceScore: rule.confidence,
    naturalnessScore: rule.naturalness,
    estimatedCEFR: cefr,
    metrics,
    vocabularyUsed: a.vocabularyUsed,
    vocabularyMissed: a.vocabularyMissed,
    grammarErrors,
    strengths,
    suggestions,
    improvedVersion: [
      'Here is a great way to start:',
      (req.prompt.split('.')[0] ?? req.prompt) + '.',
      'Then, add 2-3 more details with linking words like "because" and "however".',
    ].join(' '),
  };
};

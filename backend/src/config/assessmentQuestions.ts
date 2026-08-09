/**
 * Placement Assessment question bank.
 *
 * 24 multiple-choice questions, 4 per CEFR band (A1 → C2), difficulty ascending.
 * Shape matches the existing exam question format so the frontend QuizInterface
 * can render these without any special-casing:
 *   { type, question, options, correctAnswers, explanation, cefr }
 *
 * NOTE: when serving to the client we STRIP `correctAnswers` and `explanation`
 * (see routes/assessment.ts) so the answers can't be inspected in the browser.
 */

export type CefrBand = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface AssessmentQuestion {
  id: number;
  type: 'multiple-choice';
  question: string;
  options: string[];
  /** index into `options` that is correct (always exactly one for assessment) */
  correctAnswers: number[];
  explanation: string;
  cefr: CefrBand;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ─────────────────────────── A1 (1-4) ───────────────────────────
  {
    id: 1,
    type: 'multiple-choice',
    question: 'Choose the correct greeting for the morning.',
    options: ['Good night', 'Good morning', 'Goodbye', 'See you later'],
    correctAnswers: [1],
    explanation: '"Good morning" is used before noon.',
    cefr: 'A1',
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'What is the plural of "apple"?',
    options: ['apples', 'applis', 'applees', 'apple'],
    correctAnswers: [0],
    explanation: 'Most nouns form the plural by adding -s.',
    cefr: 'A1',
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: 'Complete: "I ___ a student."',
    options: ['am', 'are', 'is', 'be'],
    correctAnswers: [0],
    explanation: 'Use "am" with the subject "I".',
    cefr: 'A1',
  },
  {
    id: 4,
    type: 'multiple-choice',
    question: 'Which word is a color?',
    options: ['table', 'blue', 'run', 'quickly'],
    correctAnswers: [1],
    explanation: '"Blue" is a color.',
    cefr: 'A1',
  },

  // ─────────────────────────── A2 (5-8) ───────────────────────────
  {
    id: 5,
    type: 'multiple-choice',
    question: 'Choose the correct past tense of "go".',
    options: ['goed', 'gone', 'went', 'going'],
    correctAnswers: [2],
    explanation: '"go" is irregular: go → went → gone.',
    cefr: 'A2',
  },
  {
    id: 6,
    type: 'multiple-choice',
    question: 'Complete: "There ___ many books on the shelf."',
    options: ['is', 'are', 'was', 'be'],
    correctAnswers: [1],
    explanation: '"books" is plural, so we use "are".',
    cefr: 'A2',
  },
  {
    id: 7,
    type: 'multiple-choice',
    question: 'What does "often" mean?',
    options: ['never', 'sometimes', 'many times', 'once'],
    correctAnswers: [2],
    explanation: '"Often" means happening many times / frequently.',
    cefr: 'A2',
  },
  {
    id: 8,
    type: 'multiple-choice',
    question: 'Choose the correct article: "I have ___ umbrella."',
    options: ['a', 'an', 'the', '—'],
    correctAnswers: [1],
    explanation: 'Use "an" before a vowel sound: an umbrella.',
    cefr: 'A2',
  },

  // ─────────────────────────── B1 (9-12) ──────────────────────────
  {
    id: 9,
    type: 'multiple-choice',
    question: 'Choose the correct form: "If it rains, we ___ at home."',
    options: ['stay', 'will stay', 'stayed', 'would stay'],
    correctAnswers: [0],
    explanation: 'First conditional: present simple in the if-clause.',
    cefr: 'B1',
  },
  {
    id: 10,
    type: 'multiple-choice',
    question: 'Which sentence uses the present perfect correctly?',
    options: [
      'I have seen her yesterday.',
      'I saw her yesterday.',
      'I have seen her before.',
      'I am seeing her yesterday.',
    ],
    correctAnswers: [2],
    explanation: 'Present perfect cannot be used with a specific past time like "yesterday".',
    cefr: 'B1',
  },
  {
    id: 11,
    type: 'multiple-choice',
    question: '"She is looking forward to ___ you." — which form is correct?',
    options: ['meet', 'meeting', 'met', 'meets'],
    correctAnswers: [1],
    explanation: '"look forward to" is followed by a gerund (-ing).',
    cefr: 'B1',
  },
  {
    id: 12,
    type: 'multiple-choice',
    question: 'Choose the synonym of "happy".',
    options: ['sad', 'angry', 'glad', 'tired'],
    correctAnswers: [2],
    explanation: '"Glad" means happy or pleased.',
    cefr: 'B1',
  },

  // ─────────────────────────── B2 (13-16) ─────────────────────────
  {
    id: 13,
    type: 'multiple-choice',
    question: 'Choose the correct sentence:',
    options: [
      'I wish I am taller.',
      'I wish I was taller.',
      'I wish I will be taller.',
      'I wish I can be taller.',
    ],
    correctAnswers: [1],
    explanation: 'After "wish", use the past simple for present unreal situations.',
    cefr: 'B2',
  },
  {
    id: 14,
    type: 'multiple-choice',
    question: 'The report ___ by the team before the deadline.',
    options: ['was finished', 'is finishing', 'finished', 'has finish'],
    correctAnswers: [0],
    explanation: 'Passive voice (was + past participle) — the report received the action.',
    cefr: 'B2',
  },
  {
    id: 15,
    type: 'multiple-choice',
    question: '"Despite ___ tired, she finished the race."',
    options: ['she was', 'being', 'of being', 'to be'],
    correctAnswers: [1],
    explanation: '"Despite" is followed by a gerund: despite being…',
    cefr: 'B2',
  },
  {
    id: 16,
    type: 'multiple-choice',
    question: 'Choose the word that best fits: "His argument was completely ___."',
    options: ['flawless', 'unconvincing', 'ridicule', 'succeed'],
    correctAnswers: [1],
    explanation: 'Need an adjective; "unconvincing" fits grammatically and semantically.',
    cefr: 'B2',
  },

  // ─────────────────────────── C1 (17-20) ─────────────────────────
  {
    id: 17,
    type: 'multiple-choice',
    question: 'Choose the most natural phrasing:',
    options: [
      'Hardly I had arrived when it started raining.',
      'Hardly had I arrived when it started raining.',
      'I hardly had arrived when it started raining.',
      'Hardly when I arrived it started raining.',
    ],
    correctAnswers: [1],
    explanation: 'Negative adverbial inversion: Hardly + auxiliary + subject + verb.',
    cefr: 'C1',
  },
  {
    id: 18,
    type: 'multiple-choice',
    question: 'Which is a "nuance"?',
    options: [
      'A loud noise',
      'A subtle difference in meaning',
      'A type of clothing',
      'A financial report',
    ],
    correctAnswers: [1],
    explanation: 'A nuance is a subtle distinction or variation in meaning/expression.',
    cefr: 'C1',
  },
  {
    id: 19,
    type: 'multiple-choice',
    question: 'Pick the sentence with correct modal usage:',
    options: [
      'You mustn’t have seen him — he’s abroad. (logical deduction)',
      'You can’t have seen him — he’s abroad. (logical deduction)',
      'You shouldn’t have seen him — he’s abroad. (logical deduction)',
      'You wouldn’t have seen him — he’s abroad. (logical deduction)',
    ],
    correctAnswers: [1],
    explanation: 'For strong logical deduction about the past, use "can’t have + past participle".',
    cefr: 'C1',
  },
  {
    id: 20,
    type: 'multiple-choice',
    question: 'Choose the idiom meaning "to avoid the main topic":',
    options: ['beat around the bush', 'bite the bullet', 'break the ice', 'cut corners'],
    correctAnswers: [0],
    explanation: '"Beat around the bush" means to avoid speaking directly.',
    cefr: 'C1',
  },

  // ─────────────────────────── C2 (21-24) ─────────────────────────
  {
    id: 21,
    type: 'multiple-choice',
    question: 'Identify the correct cleft sentence:',
    options: [
      'It was the manager who approved the budget.',
      'The manager it was who approved the budget.',
      'Was the manager who approved the budget.',
      'It the manager who approved the budget.',
    ],
    correctAnswers: [0],
    explanation: 'Standard it-cleft: "It was X who/that …".',
    cefr: 'C2',
  },
  {
    id: 22,
    type: 'multiple-choice',
    question: 'Which best defines "obfuscate"?',
    options: ['to clarify', 'to make unclear', 'to remove', 'to celebrate'],
    correctAnswers: [1],
    explanation: 'To obfuscate is to deliberately make something unclear or hard to understand.',
    cefr: 'C2',
  },
  {
    id: 23,
    type: 'multiple-choice',
    question: 'Choose the sentence with the most sophisticated, natural phrasing:',
    options: [
      'Not only did she excel academically, but she also demonstrated remarkable leadership.',
      'Not only she excelled academically, but she also demonstrated remarkable leadership.',
      'She not only excelled academically, but also she demonstrated remarkable leadership.',
      'She did not only excel academically, but also demonstrated remarkable leadership.',
    ],
    correctAnswers: [0],
    explanation: 'After "Not only" at the start of a clause, invert subject and auxiliary.',
    cefr: 'C2',
  },
  {
    id: 24,
    type: 'multiple-choice',
    question: 'Pick the option that preserves the meaning of: "The findings were inconclusive."',
    options: [
      'The findings were decisive.',
      'The findings were ambiguous.',
      'The findings were irrelevant.',
      'The findings were exaggerated.',
    ],
    correctAnswers: [1],
    explanation: '"Inconclusive" → not leading to a firm conclusion; closest synonym is "ambiguous".',
    cefr: 'C2',
  },
];

/** Maps a CEFR band to its starting course level (1-10). */
export const CEFR_TO_LEVEL: Record<CefrBand, number> = {
  A1: 1,
  A2: 3,
  B1: 5,
  B2: 7,
  C1: 9,
  C2: 10,
};

/** Order used when scanning C2 → A1 to find the highest achieved band. */
export const CEFR_DESCENDING: CefrBand[] = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

/** Public-facing question (answers stripped). */
export interface PublicAssessmentQuestion {
  id: number;
  type: 'multiple-choice';
  question: string;
  options: string[];
  cefr: CefrBand;
}

export const toPublicQuestion = (q: AssessmentQuestion): PublicAssessmentQuestion => ({
  id: q.id,
  type: q.type,
  question: q.question,
  options: q.options,
  cefr: q.cefr,
});

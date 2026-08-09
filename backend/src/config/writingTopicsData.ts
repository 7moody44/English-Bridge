/**
 * Writing Practice Topics - CEFR Levels Pre-A1 to B2
 *
 * Each topic is a self-contained writing task. The learner writes a short
 * text, then the evaluation engine (rule-based + optional Gemini AI) returns
 * grammar/vocabulary/style scores, highlighted mistakes, an improved version
 * and a professional rewrite.
 *
 * This is the source of truth — the frontend fetches these via the API so the
 * content can change without redeploying the client.
 */

export interface WritingTopic {
  id: string;
  title: string;
  level: string;        // CEFR band, e.g. "Pre-A1"
  levelNumber: number;  // sequential number shown on the card ("Level 1")
  icon: string;         // short emoji used in the topic card
  prompt: string;       // the actual writing instruction
  minWords: number;     // minimum words required before checking
  targetVocabulary: { word: string; meaning: string }[];
  hint: string;         // vocabulary hint revealed on demand
}

export const writingTopics: WritingTopic[] = [
  // ---------------- Pre-A1 ----------------
  {
    id: 'pre-a1-writing-1',
    title: 'Me and My Things',
    level: 'Pre-A1',
    levelNumber: 1,
    icon: '🎒',
    prompt: 'Write simple sentences about yourself: your name, age, home, and something you like.',
    minWords: 25,
    targetVocabulary: [
      { word: 'name', meaning: 'what people call you' },
      { word: 'live', meaning: 'your home' },
      { word: 'like', meaning: 'enjoy' },
      { word: 'have', meaning: 'own something' },
    ],
    hint: 'Try words like: name, live, like, have. Example: "My name is… I live in… I like…"',
  },
  {
    id: 'pre-a1-writing-2',
    title: 'My Family',
    level: 'Pre-A1',
    levelNumber: 2,
    icon: '👨‍👩‍👧',
    prompt: 'Write about your family. Who are they? How many people are there? Say one thing about each person.',
    minWords: 25,
    targetVocabulary: [
      { word: 'mother', meaning: 'female parent' },
      { word: 'father', meaning: 'male parent' },
      { word: 'brother', meaning: 'male sibling' },
      { word: 'sister', meaning: 'female sibling' },
    ],
    hint: 'Try words like: mother, father, brother, sister. Example: "My mother is… I have a…"',
  },

  // ---------------- A1 ----------------
  {
    id: 'a1-writing-1',
    title: 'My Daily Routine',
    level: 'A1',
    levelNumber: 3,
    icon: '⏰',
    prompt: 'Describe what you do every day from morning to night.',
    minWords: 40,
    targetVocabulary: [
      { word: 'wake up', meaning: 'stop sleeping' },
      { word: 'breakfast', meaning: 'first meal of the day' },
      { word: 'then', meaning: 'next / after that' },
      { word: 'usually', meaning: 'most of the time' },
    ],
    hint: 'Try words like: wake up, breakfast, then, usually. Use time words to order your day.',
  },
  {
    id: 'a1-writing-2',
    title: 'My Best Friend',
    level: 'A1',
    levelNumber: 4,
    icon: '🤝',
    prompt: 'Write about your best friend. What do they look like? What do you do together? Why do you like them?',
    minWords: 40,
    targetVocabulary: [
      { word: 'friend', meaning: 'someone you like and enjoy time with' },
      { word: 'together', meaning: 'with each other' },
      { word: 'funny', meaning: 'makes you laugh' },
      { word: 'kind', meaning: 'friendly and good' },
    ],
    hint: 'Try words like: friend, together, funny, kind. Example: "My best friend is… We play together…"',
  },

  // ---------------- A2 ----------------
  {
    id: 'a2-writing-1',
    title: 'My Last Holiday',
    level: 'A2',
    levelNumber: 5,
    icon: '🏖️',
    prompt: 'Write about your last holiday. Where did you go? What did you do? Did you enjoy it? Use the past tense.',
    minWords: 60,
    targetVocabulary: [
      { word: 'travelled', meaning: 'went to a place' },
      { word: 'visited', meaning: 'went to see a place or person' },
      { word: 'enjoyed', meaning: 'liked / had fun' },
      { word: 'because', meaning: 'the reason why' },
    ],
    hint: 'Try past-tense words like: travelled, visited, enjoyed. Connect ideas with "because".',
  },
  {
    id: 'a2-writing-2',
    title: 'My Favourite Food',
    level: 'A2',
    levelNumber: 6,
    icon: '🍕',
    prompt: 'Describe your favourite food. What is it? How does it taste? When do you eat it? Can you cook it?',
    minWords: 60,
    targetVocabulary: [
      { word: 'delicious', meaning: 'very tasty' },
      { word: 'recipe', meaning: 'instructions for cooking' },
      { word: 'ingredients', meaning: 'the foods used to make a dish' },
      { word: 'favourite', meaning: 'the one you like most' },
    ],
    hint: 'Try words like: delicious, recipe, ingredients, favourite. Describe taste and smell.',
  },

  // ---------------- B1 ----------------
  {
    id: 'b1-writing-1',
    title: 'My Dream Job',
    level: 'B1',
    levelNumber: 7,
    icon: '💼',
    prompt: 'Describe your dream job. What is it? Why does it interest you? What skills do you need? How will you get it?',
    minWords: 80,
    targetVocabulary: [
      { word: 'career', meaning: 'a long-term profession' },
      { word: 'skills', meaning: 'abilities you can learn' },
      { word: 'achieve', meaning: 'succeed in reaching a goal' },
      { word: 'passionate', meaning: 'having strong enthusiasm' },
    ],
    hint: 'Try words like: career, skills, achieve, passionate. Give reasons with "because" and "so that".',
  },
  {
    id: 'b1-writing-2',
    title: 'A Memorable Experience',
    level: 'B1',
    levelNumber: 8,
    icon: '🌟',
    prompt: 'Write about a memorable experience from your life. What happened? Why do you still remember it? How did it change you?',
    minWords: 80,
    targetVocabulary: [
      { word: 'unforgettable', meaning: 'impossible to forget' },
      { word: 'experience', meaning: 'something that happens to you' },
      { word: 'realised', meaning: 'became aware of something' },
      { word: 'however', meaning: 'but / on the other hand' },
    ],
    hint: 'Try words like: unforgettable, experience, realised, however. Structure it: beginning, middle, end.',
  },

  // ---------------- B2 ----------------
  {
    id: 'b2-writing-1',
    title: 'Technology in Our Lives',
    level: 'B2',
    levelNumber: 9,
    icon: '📱',
    prompt: 'Discuss how technology has changed daily life. What are the benefits and drawbacks? Give your opinion with examples.',
    minWords: 100,
    targetVocabulary: [
      { word: 'significant', meaning: 'important / large in effect' },
      { word: 'convenient', meaning: 'easy and suitable' },
      { word: 'drawback', meaning: 'a disadvantage' },
      { word: 'furthermore', meaning: 'in addition' },
    ],
    hint: 'Try words like: significant, convenient, drawback, furthermore. Present both sides, then your view.',
  },
  {
    id: 'b2-writing-2',
    title: 'The Environment',
    level: 'B2',
    levelNumber: 10,
    icon: '🌍',
    prompt: 'Write about an environmental problem in your country. What causes it? What can individuals and governments do about it?',
    minWords: 100,
    targetVocabulary: [
      { word: 'pollution', meaning: 'harmful substances in the environment' },
      { word: 'sustainable', meaning: 'able to continue without damage' },
      { word: 'responsibility', meaning: 'a duty to deal with something' },
      { word: 'therefore', meaning: 'for that reason' },
    ],
    hint: 'Try words like: pollution, sustainable, responsibility, therefore. Use cause-and-effect language.',
  },
];

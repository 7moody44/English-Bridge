/**
 * Speaking Practice Topics - CEFR Levels Pre-A1 to C1
 *
 * Each topic is a self-contained speaking prompt the learner responds to out loud.
 * The browser transcribes their speech (Web Speech API), then the Gemini free-tier
 * AI returns grammar + word-choice feedback against `prompt` and `targetVocabulary`.
 *
 * This is the source of truth — the frontend fetches these via the API so the
 * content can change without redeploying the client.
 */

export interface SpeakingTopic {
  id: string;
  title: string;
  level: string;        // CEFR band, e.g. "Pre-A1"
  category: string;     // e.g. "Personal"
  icon: string;         // short emoji used in the topic card
  description: string;  // one-line summary shown in the list
  duration: number;     // estimated minutes
  prompt: string;       // the actual question/scenario the learner answers
  targetVocabulary: { word: string; meaning: string }[];
  tips: string[];       // hints shown before recording
}

export const speakingTopics: SpeakingTopic[] = [
  // ---------------- Pre-A1 ----------------
  {
    id: 'pre-a1-speaking-1',
    title: 'Introduce Yourself',
    level: 'Pre-A1',
    category: 'Personal',
    icon: '👋',
    description: 'Say your name, age, and where you are from.',
    duration: 2,
    prompt:
      'Introduce yourself. Say your name, how old you are, and where you are from. Try to use full sentences.',
    targetVocabulary: [
      { word: 'name', meaning: 'what people call you' },
      { word: 'old', meaning: 'age in years' },
      { word: 'from', meaning: 'where you were born or live' },
      { word: 'live', meaning: 'your home' },
    ],
    tips: [
      'Speak slowly and clearly.',
      'Use full sentences: "My name is…", "I am … years old."',
      'You can repeat your answer if you make a mistake.',
    ],
  },
  {
    id: 'pre-a1-speaking-2',
    title: 'My Family',
    level: 'Pre-A1',
    category: 'Personal',
    icon: '👨‍👩‍👧',
    description: 'Talk about the people in your family.',
    duration: 2,
    prompt:
      'Talk about your family. How many people are in your family? Who are they? Mention at least two people.',
    targetVocabulary: [
      { word: 'mother', meaning: 'female parent' },
      { word: 'father', meaning: 'male parent' },
      { word: 'brother', meaning: 'male sibling' },
      { word: 'sister', meaning: 'female sibling' },
    ],
    tips: [
      'Use "This is my…" or "I have a…" to introduce family members.',
      'Add one detail about each person (age, job).',
    ],
  },

  // ---------------- A1 ----------------
  {
    id: 'a1-speaking-1',
    title: 'Daily Routine',
    level: 'A1',
    category: 'Lifestyle',
    icon: '⏰',
    description: 'Describe what you do every morning.',
    duration: 3,
    prompt:
      'Describe your morning routine. What do you do from the time you wake up until you leave home? Use time words like "first", "then", "after that".',
    targetVocabulary: [
      { word: 'wake up', meaning: 'stop sleeping' },
      { word: 'brush', meaning: 'clean teeth' },
      { word: 'breakfast', meaning: 'first meal of the day' },
      { word: 'leave', meaning: 'go away from home' },
    ],
    tips: [
      'Use the present simple: "I wake up", "I eat".',
      'Connect your ideas with "then" and "after that".',
      'Mention at least four activities.',
    ],
  },
  {
    id: 'a1-speaking-2',
    title: 'Hobbies',
    level: 'A1',
    category: 'Lifestyle',
    icon: '🎨',
    description: 'Talk about what you like to do in your free time.',
    duration: 2,
    prompt:
      'Talk about your hobbies. What do you like to do in your free time, and why do you enjoy it? Mention at least two hobbies.',
    targetVocabulary: [
      { word: 'enjoy', meaning: 'to like doing something' },
      { word: 'free time', meaning: 'time not working or studying' },
      { word: 'play', meaning: 'do an activity for fun' },
      { word: 'because', meaning: 'gives a reason' },
    ],
    tips: [
      'Use "I like…" + an -ing verb: "I like reading".',
      'Explain why: "because it is relaxing".',
    ],
  },

  // ---------------- A2 ----------------
  {
    id: 'a2-speaking-1',
    title: 'Last Weekend',
    level: 'A2',
    category: 'Storytelling',
    icon: '🗓️',
    description: 'Tell a short story about your last weekend.',
    duration: 3,
    prompt:
      'Talk about what you did last weekend. Describe at least three things you did and who you were with. Use the past tense.',
    targetVocabulary: [
      { word: 'went', meaning: 'past of "go"' },
      { word: 'visited', meaning: 'went to see someone/somewhere' },
      { word: 'friends', meaning: 'people you know and like' },
      { word: 'enjoyed', meaning: 'had a good time' },
    ],
    tips: [
      'Use regular past tense endings: -ed (visited, watched).',
      'Remember irregular verbs: go → went, see → saw, eat → ate.',
      'Start with "Last weekend, I…".',
    ],
  },
  {
    id: 'a2-speaking-2',
    title: 'Food You Like',
    level: 'A2',
    category: 'Lifestyle',
    icon: '🍽️',
    description: 'Describe your favourite food and a dish you can cook.',
    duration: 2,
    prompt:
      'Talk about food. What is your favourite food? Can you cook anything? Describe a dish you like and explain why you enjoy it.',
    targetVocabulary: [
      { word: 'favourite', meaning: 'the one you like most' },
      { word: 'delicious', meaning: 'tastes very good' },
      { word: 'cook', meaning: 'prepare food with heat' },
      { word: 'spicy', meaning: 'has a strong hot flavour' },
    ],
    tips: [
      'Use adjectives: delicious, sweet, salty, spicy.',
      'Mention where you eat it (home, restaurant).',
    ],
  },

  // ---------------- B1 ----------------
  {
    id: 'b1-speaking-1',
    title: 'A Memorable Trip',
    level: 'B1',
    category: 'Storytelling',
    icon: '✈️',
    description: 'Describe a trip you remember well.',
    duration: 4,
    prompt:
      'Describe a memorable trip you have taken. Where did you go, who did you go with, what did you do, and why was it memorable? Speak for about a minute.',
    targetVocabulary: [
      { word: 'journey', meaning: 'the act of travelling' },
      { word: 'scenery', meaning: 'natural views around you' },
      { word: 'unforgettable', meaning: 'impossible to forget' },
      { word: 'explore', meaning: 'travel to discover' },
    ],
    tips: [
      'Use a mix of past tenses: past simple + past continuous.',
      'Add descriptive adjectives (stunning, exhausting, fascinating).',
      'Structure: setting → events → why it mattered.',
    ],
  },
  {
    id: 'b1-speaking-2',
    title: 'Your Job or Studies',
    level: 'B1',
    category: 'Professional',
    icon: '💼',
    description: 'Talk about what you do for work or study.',
    duration: 3,
    prompt:
      'Talk about your job or your studies. What do you do? What do you like or dislike about it? What are your plans for the future?',
    targetVocabulary: [
      { word: 'responsibilities', meaning: 'things you must do' },
      { word: 'deadline', meaning: 'time a task must be finished' },
      { word: 'ambition', meaning: 'a strong goal' },
      { word: 'team', meaning: 'group you work with' },
    ],
    tips: [
      'Use present simple for facts, present continuous for current projects.',
      'Use "going to" or "would like to" for future plans.',
    ],
  },

  // ---------------- B2 ----------------
  {
    id: 'b2-speaking-1',
    title: 'Technology in Daily Life',
    level: 'B2',
    category: 'Discussion',
    icon: '📱',
    description: 'Discuss how technology has changed your daily life.',
    duration: 4,
    prompt:
      'Discuss the role of technology in your daily life. How has it changed the way you work, learn, or communicate? Mention both benefits and drawbacks. Speak for about two minutes.',
    targetVocabulary: [
      { word: 'convenience', meaning: 'making things easier' },
      { word: 'drawback', meaning: 'a disadvantage' },
      { word: 'rely on', meaning: 'depend on something' },
      { word: 'inevitable', meaning: 'sure to happen' },
    ],
    tips: [
      'Use discourse markers: on the one hand, however, in addition.',
      'Give concrete examples to support each point.',
      'Balance pros and cons rather than a one-sided list.',
    ],
  },

  // ---------------- C1 ----------------
  {
    id: 'c1-speaking-1',
    title: 'A Social Issue You Care About',
    level: 'C1',
    category: 'Discussion',
    icon: '🌍',
    description: 'Argue a position on a social issue that matters to you.',
    duration: 5,
    prompt:
      'Choose a social issue you care about (education, environment, equality…). Explain why it matters, what you think should be done, and respond to one possible counter-argument. Speak for about two minutes.',
    targetVocabulary: [
      { word: 'pressing', meaning: 'urgent and important' },
      { word: 'inequality', meaning: 'unfair difference between groups' },
      { word: 'accountable', meaning: 'responsible for actions' },
      { word: 'sustainable', meaning: 'can continue long-term' },
    ],
    tips: [
      'Use advanced connectors: nevertheless, consequently, by contrast.',
      'Acknowledge the other side before refuting it.',
      'End with a clear, memorable recommendation.',
    ],
  },
];

/**
 * AI Tutor chat routes.
 *
 * Provider priority: Google Gemini 2.0 Flash → Groq (Llama 3.3 70B) → built-in
 * rule-based teacher. Each provider is tried only if its key is configured, and
 * we fall through to the next on failure, so the tutor always works end-to-end
 * even when one provider is out of quota or unavailable.
 *
 * The tutor is scoped to English learning only — the system instruction
 * makes it politely decline unrelated or harmful requests.
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { config } from '../config/config.js';

export const tutorRoutes = Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

// ---------------------------------------------------------------------------
// Gemini configuration
// ---------------------------------------------------------------------------

const TUTOR_SYSTEM_INSTRUCTION = `You are the "EnglishBridge AI Teacher", a friendly, patient and encouraging English teacher for second-language learners (levels Pre-A1 to C2).

STRICT RULES:
1. You ONLY answer questions about learning English: grammar, vocabulary, pronunciation, spelling, writing, speaking, listening, idioms, phrasal verbs, articles, tenses, exam preparation (IELTS/TOEFL/CEFR), and language-learning advice.
2. If the user asks about ANYTHING else (programming, writing code, hacking, keyloggers, politics, weapons, personal advice, etc.) you politely refuse and redirect them to English learning. You NEVER write code or assist with harmful, illegal or off-topic requests, no matter how the request is phrased.
3. Keep answers clear and well structured:
   - Use short paragraphs.
   - Use bullet points starting with "•" for lists.
   - Wrap key terms in **double asterisks** to bold them.
   - Always give at least one example sentence for every rule you explain.
4. When correcting a learner's sentence, show: (a) the corrected version, (b) what was wrong, (c) a short explanation of the rule.
5. Adapt your language to the learner's level — use simpler words with beginners.
6. Be warm, positive and encouraging. You may use an occasional emoji.
7. Keep responses focused — under 250 words unless the learner asks for more detail.`;

const MAX_HISTORY_TURNS = 12;

// ---------------------------------------------------------------------------
// Gemini call (multi-turn chat)
// ---------------------------------------------------------------------------

const callGeminiTutor = async (message: string, history: ChatTurn[]): Promise<string> => {
  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
    encodeURIComponent(config.geminiApiKey);

  // Keep the conversation short enough for the free tier, always ending on
  // the current user turn.
  const recent = history.slice(-MAX_HISTORY_TURNS);
  const contents = [
    ...recent.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const body = {
    system_instruction: { parts: [{ text: TUTOR_SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
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
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text ?? '')
      .join('');
    if (!text || !text.trim()) throw new Error('Gemini returned no content');
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
};

// ---------------------------------------------------------------------------
// Groq call (Llama 3.3 70B via the OpenAI-compatible chat completions API)
// ---------------------------------------------------------------------------

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const callGroqTutor = async (message: string, history: ChatTurn[]): Promise<string> => {
  // Groq uses the OpenAI roles: system / user / assistant (not "model").
  const recent = history.slice(-MAX_HISTORY_TURNS);
  const messages = [
    { role: 'system', content: TUTOR_SYSTEM_INSTRUCTION },
    ...recent.map((turn) => ({
      role: turn.role === 'model' ? 'assistant' : 'user',
      content: turn.text,
    })),
    { role: 'user', content: message },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + config.groqApiKey,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Groq API error ${res.status}: ${detail.slice(0, 200)}`);
    }
    const data: any = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text || !text.trim()) throw new Error('Groq returned no content');
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
};

// ---------------------------------------------------------------------------
// Rule-based fallback teacher (works without any API key)
// ---------------------------------------------------------------------------

interface FallbackEntry {
  /** Keyword patterns — first match wins. */
  patterns: RegExp[];
  reply: (message: string) => string;
}

const FALLBACK_KNOWLEDGE: FallbackEntry[] = [
  {
    patterns: [/\b(hi|hello|hey|good (morning|afternoon|evening)|greetings)\b/i],
    reply: () =>
      `Hello! 👋 I'm your **AI English Teacher**, here 24/7 to help you with:\n\n• 📖 **Grammar** — tenses, articles, prepositions\n• 📚 **Vocabulary** — meanings, synonyms, usage\n• 🗣️ **Speaking** — pronunciation tips\n• ✍️ **Writing** — corrections and style\n• 🎧 **Listening** & exam preparation\n\nWhat would you like to learn today?`,
  },
  {
    patterns: [/present\s+perfect/i],
    reply: () =>
      `Great question! The **Present Perfect** connects the past with the present. 🔗\n\n**Structure:** Subject + **have/has** + past participle\n• I **have finished** my homework.\n• She **has visited** London twice.\n\n**When to use it:**\n1. Life experiences — *I have never eaten sushi.*\n2. Recent actions with a present result — *He has just left.*\n3. Unfinished time (with **for/since**) — *We have lived here for 5 years.*\n\n**Signal words:** already, yet, just, ever, never, for, since 🌟\n\n⚠️ Don't use it with finished time words: say *I **saw** him yesterday*, NOT *I have seen him yesterday*.\n\nWould you like a practice quiz on this?`,
  },
  {
    patterns: [/past\s+perfect/i],
    reply: () =>
      `Excellent question! The **Past Perfect** shows that one past action happened *before* another past action. ⏪\n\n**Structure:** Subject + **had** + past participle\n• I **had finished** dinner before she arrived.\n• They **had never seen** snow before they moved to Canada.\n\n**When to use it:**\n1. The earlier of two past actions — *When I got to the station, the train **had already left**.*\n2. With **before / after / by the time** — *She **had studied** English before she moved to London.*\n3. Reported speech & regrets — *I wished I **had listened**.*\n\n**Signal words:** already, before, after, by the time, never, until 🌟\n\n⚠️ Don't overuse it: if the order is already clear (e.g., with "before"), the Past Simple is often enough — *She arrived after I **finished**.*\n\nWant a quick quiz to practice?`,
  },
  {
    patterns: [/past\s+(simple|tense)|simple\s+past/i],
    reply: () =>
      `Great! The **Past Simple** talks about finished actions at a specific time in the past. ⏱️\n\n**Structure:** Subject + verb-**ed** (or the irregular form)\n• I **watched** a film last night.\n• She **went** to Paris in 2019.\n\n**When to use it:**\n1. Completed actions — *We **finished** the project yesterday.*\n2. Past habits — *He **played** football every weekend.*\n3. A sequence of past events — *I **woke** up, **had** coffee and **left**.*\n\n**Signal words:** yesterday, last week, ago, in 2010, when 🌟\n\n⚠️ Questions & negatives use **did**: *Did you go?* / *I didn't go* (NOT "I didn't went").\n\nWould you like some practice sentences?`,
  },
  {
    patterns: [/present\s+(continuous|progressive)|continuous\s+present/i],
    reply: () =>
      `Nice one! The **Present Continuous** describes actions happening right now or around now. 🔄\n\n**Structure:** Subject + **am/is/are** + verb-**ing**\n• I **am studying** English.\n• She **is working** from home this week.\n\n**When to use it:**\n1. Actions happening now — *Look! It **is raining**.*\n2. Temporary situations — *They **are staying** with us for a few days.*\n3. Fixed future plans — *We **are meeting** them at 6 PM.*\n\n**Signal words:** now, right now, at the moment, currently, today 🌟\n\n⚠️ Don't use it with state verbs like *know, want, believe*: say *I **know** the answer*, NOT "I am knowing".\n\nWant a quiz on this tense?`,
  },
  {
    patterns: [/future\s+tense|simple\s+future|future\s+simple/i],
    reply: () =>
      `Good question! English has two main ways to talk about the future. 🔮\n\n**1. Will** — decisions, predictions, promises:\n• I think it **will rain** tomorrow.\n• I'**ll help** you with that!\n\n**2. Going to** — plans & evidence-based predictions:\n• We'**re going to travel** in June. (a plan)\n• Look at those clouds — it'**s going to rain**. (evidence)\n\n**Structure:**\n• will + base verb → *She **will call** you.*\n• am/is/are + going to + base verb → *He **is going to study** medicine.*\n\n**Signal words:** tomorrow, next week, soon, in the future 🌟\n\n⚠️ For timetables, use the Present Simple: *The train **leaves** at 9 AM.*\n\nShall I give you some practice?`,
  },
  {
    patterns: [/\b(article|a an the|an?\b.*\bthe)\b/i, /what is article/i],
    reply: () =>
      `**Articles in English: A, AN, THE** 📝\n\n🔵 **A / AN** (indefinite) — one non-specific thing:\n• **A** before consonant sounds: *a book, a university*\n• **AN** before vowel sounds: *an apple, an hour*\n\n🟢 **THE** (definite) — a specific thing both people know:\n• *The sun is bright today.*\n• *The book you gave me is great.*\n\n⚠️ **No article** for general plurals: *Cats are cute* (NOT "The cats are cute" when talking generally).\n\n**Quick test:** "I saw ___ elephant at ___ zoo." → *an, the* ✅\n\nWant more examples?`,
  },
  {
    patterns: [/affect.*effect|effect.*affect/i],
    reply: () =>
      `**Affect vs Effect** — one of the most common confusions! 🎯\n\n• **Affect** = verb (to influence): *The weather **affects** my mood.*\n• **Effect** = noun (the result): *The weather has a big **effect** on my mood.*\n\n**Memory trick:** **A**ffect is an **A**ction (verb). **E**ffect is an **E**nd result (noun). 🧠\n\n**Practice:** "The new law will ___ everyone." → *affect* ✅\n\nShall I give you more practice sentences?`,
  },
  {
    patterns: [/phrasal\s+verb/i],
    reply: () =>
      `**Phrasal verbs** = verb + particle with a new meaning. 🚀 Here are 5 essential ones:\n\n• **give up** — stop trying: *Don't give up on your English!*\n• **look for** — search: *I'm looking for my keys.*\n• **turn on/off** — start/stop a device: *Turn on the light.*\n• **wake up** — stop sleeping: *I wake up at 7 AM.*\n• **find out** — discover: *I found out the answer.*\n\n**Tip:** Learn them in sentences, not lists — context makes them stick! 📌\n\nWould you like a quiz on phrasal verbs?`,
  },
  {
    patterns: [/correct.*(grammar|sentence|this)|she don'?t/i],
    reply: (message: string) => {
      if (/she don'?t/i.test(message)) {
        return `Let's fix that! ✏️\n\n❌ *She don't like apples.*\n✅ **She doesn't like apples.**\n\n**Why?** With **he/she/it** (third person singular), use **doesn't** — not "don't":\n• He **doesn't** smoke.\n• It **doesn't** work.\n• They **don't** know. ← plural keeps "don't"\n\n**Rule:** don't → I/you/we/they · doesn't → he/she/it\n\nWant to try another correction? Send me any sentence!`;
      }
      return `I'd love to help! ✏️ Send me your sentence and I'll show you:\n\n• The **corrected version**\n• **What** was wrong\n• **Why** — the rule behind it\n\nFor example: *"She don't like apples"* → **"She doesn't like apples."** (third person singular uses *doesn't*)\n\nGo ahead, paste your sentence! 📝`;
    },
  },
  {
    patterns: [/\b(quiz|test me|practice questions?|exercise)\b/i],
    reply: () =>
      `Let's practice! 🎯 **Quick quiz — choose the correct answer:**\n\n**1.** She ___ to school every day.\n• a) go · b) goes · c) going\n\n**2.** I have lived here ___ 2019.\n• a) for · b) since · c) at\n\n**3.** Could you ___ me a favor?\n• a) make · b) do · c) give\n\nReply with your three answers (like "b, b, b") and I'll check them! ✅`,
  },
  {
    patterns: [/\b(thank|thanks|thx)\b/i],
    reply: () =>
      `You're very welcome! 😊 Keep practicing every day — even 10 minutes makes a big difference. 💪\n\nIs there anything else you'd like to learn? I'm here 24/7!`,
  },
  {
    patterns: [/\b(who are you|what can you do|help|how do(es)? this work)\b/i],
    reply: () =>
      `I'm your **AI English Teacher**! 🤖📚 Here's what I can help you with:\n\n• 📖 **Grammar** — "Explain the Present Perfect tense"\n• 📚 **Vocabulary** — "What does 'ubiquitous' mean?"\n• ✍️ **Corrections** — "Correct my grammar: She don't like apples"\n• 🗣️ **Speaking tips** — "How do I pronounce 'th'?"\n• 🎯 **Quizzes** — "Give me a quick quiz"\n\nJust type your question below! 👇`,
  },
];

const OFF_TOPIC_REPLY = `I appreciate your curiosity, but I'm your **English teacher** — I can only help with learning English! 📚🇬🇧\n\nI can't help with that request, but I'd love to help you with:\n\n• **Grammar** — tenses, articles, prepositions\n• **Vocabulary** — new words and meanings\n• **Corrections** — fix your sentences\n• **Quizzes** — test your level\n\nWhat English topic shall we explore? 😊`;

const getFallbackReply = (message: string): string => {
  for (const entry of FALLBACK_KNOWLEDGE) {
    if (entry.patterns.some((p) => p.test(message))) {
      return entry.reply(message);
    }
  }
  // Detect likely off-topic / harmful requests (code, hacking, etc.)
  if (/\b(code|program|hack|keylogger|script|exploit|weapon|bomb|virus)\b/i.test(message)) {
    return OFF_TOPIC_REPLY;
  }
  return `That's an interesting question! 🤔 As your English teacher, let me help you best:\n\n• Ask me about **grammar** — "Explain the Present Perfect"\n• Ask about **vocabulary** — "What's the difference between affect and effect?"\n• Send a sentence to **correct** — "Correct my grammar: ..."\n• Say **"quiz"** and I'll test you!\n\nTry rephrasing your question in English — that's great practice too! 💪`;
};

// ---------------------------------------------------------------------------
// POST /api/tutor/chat
// Body: { message: string, history?: Array<{ role: 'user' | 'model', text: string }> }
// Returns: { success: true, reply: string, ai: boolean }
// ---------------------------------------------------------------------------

tutorRoutes.post('/chat', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: ChatTurn[];
    };

    if (typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, error: 'message is required' });
      return;
    }

    const trimmed = message.trim().slice(0, 2000);
    const safeHistory: ChatTurn[] = Array.isArray(history)
      ? history
          .filter(
            (h): h is ChatTurn =>
              !!h &&
              (h.role === 'user' || h.role === 'model') &&
              typeof h.text === 'string'
          )
          .slice(-MAX_HISTORY_TURNS)
          .map((h) => ({ role: h.role, text: h.text.slice(0, 2000) }))
      : [];

    let reply: string | undefined;
    let ai = false;

    // Provider chain: Gemini → Groq → rule-based fallback. Each step is tried
    // only when configured, and we fall through to the next on any failure.
    if (config.isGeminiEnabled) {
      try {
        reply = await callGeminiTutor(trimmed, safeHistory);
        ai = true;
      } catch (err) {
        console.error('Gemini tutor failed, trying next provider:', (err as Error)?.message || err);
      }
    }

    if (!reply && config.isGroqEnabled) {
      try {
        reply = await callGroqTutor(trimmed, safeHistory);
        ai = true;
      } catch (err) {
        console.error('Groq tutor failed, using rule-based fallback:', (err as Error)?.message || err);
      }
    }

    if (!reply) {
      reply = getFallbackReply(trimmed);
    }

    res.json({ success: true, reply, ai });
  } catch (error: any) {
    console.error('Tutor chat error:', error?.message || error);
    res.status(500).json({ success: false, error: 'The tutor is unavailable right now. Please try again.' });
  }
});

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Mic,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { tutorService, type TutorChatTurn } from '@/services/tutorService';
import { speakingService } from '@/services/speakingService';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME_MESSAGE =
  "Hello! I'm your AI English Teacher 🖐️ I'm here 24/7 to help you with grammar, vocabulary, pronunciation, writing, speaking, and anything else you need. What would you like to learn today?";

const SUGGESTIONS = [
  'Explain the Present Perfect tense',
  "What is the difference between 'affect' and 'effect'?",
  'How do I use phrasal verbs?',
  "Correct my grammar: 'She don't like apples'",
  'Give me a quick quiz',
];

/* ------------------------------------------------------------------ */
/* Lightweight rich-text renderer (bold + bullets from the tutor)      */
/* ------------------------------------------------------------------ */

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-semibold">
        {part}
      </strong>
    ) : (
      <React.Fragment key={`${keyPrefix}-t${i}`}>{part}</React.Fragment>
    )
  );
};

const RichText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={key} className="space-y-1 my-1.5">
        {items.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary-500 dark:text-primary-400 shrink-0 mt-px">•</span>
            <span>{renderInline(b, `${key}-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets(`bl-${idx}`);
      return;
    }
    const bulletMatch = trimmed.match(/^[•\-*]\s+(.*)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1]);
      return;
    }
    flushBullets(`bl-${idx}`);
    blocks.push(
      <p key={`p-${idx}`} className="my-1">
        {renderInline(trimmed, `p-${idx}`)}
      </p>
    );
  });
  flushBullets('bl-end');

  return <div className="text-sm leading-relaxed">{blocks}</div>;
};

/* ------------------------------------------------------------------ */
/* Typing indicator bubble                                             */
/* ------------------------------------------------------------------ */

const TypingBubble: React.FC = () => (
  <div className="flex items-end gap-2 animate-fade-in">
    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
      <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export const AITutorPage: React.FC = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  // Whether replies are coming from the real Gemini AI or the built-in teacher.
  const [aiStatus, setAiStatus] = useState<'unknown' | 'ai' | 'fallback'>('unknown');
  const [offlineDismissed, setOfflineDismissed] = useState(false);

  const recorder = useAudioRecorder();
  const pendingVoiceRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the latest message in view.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  // Transcribe the blob as soon as the recorder produces one.
  useEffect(() => {
    if (!pendingVoiceRef.current || !recorder.audioBlob) return;
    pendingVoiceRef.current = false;
    const blob = recorder.audioBlob;
    setIsTranscribing(true);
    speakingService
      .transcribe(blob)
      .then((res) => {
        if (res.success && res.transcription) {
          setInput((prev) => (prev ? `${prev.trim()} ${res.transcription}` : res.transcription));
          inputRef.current?.focus();
        } else {
          setError('Could not understand the audio. Please try again.');
        }
      })
      .catch(() => setError('Voice transcription failed. Please try again.'))
      .finally(() => {
        setIsTranscribing(false);
        recorder.reset();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.audioBlob]);

  /* ----------------------------- actions ---------------------------- */

  const handleSend = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || isTyping) return;

    setInput('');
    setError(null);
    const userMsg: ChatMessage = { id: uid(), role: 'user', text: content };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setIsTyping(true);

    try {
      const history: TutorChatTurn[] = withUser.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));
      const res = await tutorService.chat(content, history);
      setAiStatus(res.ai ? 'ai' : 'fallback');
      const reply = res.reply || 'I had trouble with that one — could you ask again? 😊';
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: reply }]);
    } catch {
      setError('The teacher is busy right now. Please try again in a moment.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleMic = async () => {
    if (isTranscribing) return;
    if (!recorder.isRecording) {
      pendingVoiceRef.current = true;
      await recorder.start();
    } else {
      await recorder.stop();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isTyping;

  /* ------------------------------ view ------------------------------ */

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-3.5 shrink-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">AI English Teacher</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {aiStatus !== 'fallback' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    aiStatus === 'fallback' ? 'bg-amber-400' : 'bg-green-400'
                  }`}
                />
              </span>
              <span className="text-xs text-white/70">
                {aiStatus === 'ai'
                  ? 'AI online'
                  : aiStatus === 'fallback'
                    ? 'Built-in teacher · AI offline'
                    : 'Always available'}
              </span>
            </div>
          </div>

          <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-medium">Free</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 pb-52 space-y-4">
          {aiStatus === 'fallback' && !offlineDismissed && (
            <div className="flex items-start gap-2.5 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3.5 py-3 text-amber-800 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
              <div className="space-y-1">
                <p className="font-semibold">You're chatting with the built-in mini-teacher.</p>
                <p className="leading-relaxed">
                  The AI providers (Gemini / Groq) are unavailable right now, so answers are limited
                  to a few common topics. To unlock full AI answers, make sure a valid{' '}
                  <span className="font-mono">GROQ_API_KEY</span> (or{' '}
                  <span className="font-mono">GEMINI_API_KEY</span>) is set in{' '}
                  <span className="font-mono">backend/.env</span> and restart the server.
                </p>
              </div>
              <button
                onClick={() => setOfflineDismissed(true)}
                className="ml-auto font-semibold hover:underline shrink-0"
              >
                Got it
              </button>
            </div>
          )}

          {messages.map((m) =>
            m.role === 'assistant' ? (
              <div key={m.id} className="flex items-end gap-2 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="max-w-[85%] sm:max-w-[75%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-gray-800 dark:text-gray-100">
                  <RichText text={m.text} />
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end animate-slide-up">
                <div className="max-w-[85%] sm:max-w-[75%] bg-primary-600 dark:bg-primary-700 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            )
          )}

          {isTyping && <TypingBubble />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Composer pinned above the bottom navigation */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 pt-2.5 pb-3">
          {/* Suggestion chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={isTyping}
                className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Voice / transcription status */}
          {(recorder.isRecording || isTranscribing) && (
            <div className="flex items-center gap-2 text-xs mb-2 px-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {isTranscribing
                  ? 'Transcribing your voice…'
                  : `Listening (${recorder.duration}s) — tap the mic to stop`}
              </span>
            </div>
          )}

          {/* Error banner */}
          {(error || recorder.error) && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error || recorder.error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto font-semibold hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMic}
              disabled={!recorder.isSupported || isTranscribing}
              className={`p-3 rounded-full transition-all shrink-0 ${
                recorder.isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
              } disabled:opacity-40`}
              aria-label={recorder.isRecording ? 'Stop recording' : 'Speak your question'}
              title={recorder.isRecording ? 'Stop recording' : 'Speak your question'}
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your teacher anything…"
              className="flex-1 min-w-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent"
            />

            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              className="p-3 rounded-full bg-primary-600 dark:bg-primary-700 text-white shadow-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-all disabled:opacity-40 disabled:shadow-none shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AITutorPage;

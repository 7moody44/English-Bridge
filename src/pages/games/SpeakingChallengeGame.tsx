import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Mic, Square, CheckCircle } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { speakingService } from '../../services/speakingService';

const PHRASES = [
  'Hello, how are you today?',
  'I would like a cup of coffee.',
  'The weather is really nice outside.',
  'Can you help me with this, please?',
];

const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

/** Word-overlap similarity (0-100) between the spoken text and the target. */
const similarity = (spoken: string, target: string): number => {
  const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);
  const targetWords = normalize(target).split(/\s+/).filter(Boolean);
  if (targetWords.length === 0) return 0;
  const spokenSet = new Set(spokenWords);
  const hits = targetWords.filter((w) => spokenSet.has(w)).length;
  return Math.round((hits / targetWords.length) * 100);
};

export const SpeakingChallengeGame: React.FC = () => {
  const navigate = useNavigate();
  const recorder = useAudioRecorder();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [transcript, setTranscript] = useState('');
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const pendingRef = useRef(false);

  const phrase = PHRASES[index];
  const isLast = index === PHRASES.length - 1;

  // Transcribe automatically once a recording lands.
  useEffect(() => {
    if (!recorder.audioBlob || !pendingRef.current) return;
    pendingRef.current = false;
    const run = async () => {
      setChecking(true);
      try {
        const res = await speakingService.transcribe(recorder.audioBlob as Blob);
        const text = res.transcription || '';
        setTranscript(text);
        setFeedback(similarity(text, phrase));
      } catch (error) {
        console.error('Transcription failed:', error);
        setTranscript('');
        setFeedback(0);
      } finally {
        setChecking(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.audioBlob]);

  const handleRecord = async () => {
    setFeedback(null);
    setTranscript('');
    await recorder.start();
  };

  const handleStop = async () => {
    pendingRef.current = true;
    await recorder.stop();
  };

  const handleNext = () => {
    const nextResults = [...results, feedback ?? 0];
    setResults(nextResults);
    recorder.reset();
    setFeedback(null);
    setTranscript('');
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const finalScore =
    results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : 0;

  const handleFinish = async () => {
    try {
      await addXP(finalScore, 'game');
    } catch (error) {
      console.error('Failed to save XP:', error);
    }
    navigate('/games');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-orange-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/games')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Speaking Challenge</h1>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{results.length}/{PHRASES.length}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {!finished ? (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Phrase {index + 1} of {PHRASES.length} — say it out loud
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm mb-5 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">{phrase}</p>
            </div>

            {recorder.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">{recorder.error}</p>
            )}

            {/* Record controls */}
            <div className="flex flex-col items-center mb-5">
              {!recorder.isRecording ? (
                <button
                  onClick={handleRecord}
                  disabled={checking}
                  className="w-20 h-20 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white flex items-center justify-center shadow-lg transition-colors"
                >
                  <Mic className="w-9 h-9" />
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors animate-pulse"
                >
                  <Square className="w-8 h-8" fill="currentColor" />
                </button>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {checking ? 'Checking…' : recorder.isRecording ? `Recording… ${recorder.duration}s` : 'Tap to record'}
              </p>
            </div>

            {feedback !== null && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-5 h-5 ${feedback >= 60 ? 'text-green-600' : 'text-orange-500'}`} />
                  <span className="font-semibold text-gray-900 dark:text-white">Match: {feedback}%</span>
                </div>
                {transcript && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">You said: "{transcript}"</p>
                )}
              </div>
            )}

            {feedback !== null && (
              <button
                onClick={handleNext}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {isLast ? 'Finish' : 'Next phrase'}
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🎤
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Challenge complete!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Average match: {finalScore}%</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">You earned +{calculateXP(finalScore)} XP</p>
              <button onClick={handleFinish} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingChallengeGame;

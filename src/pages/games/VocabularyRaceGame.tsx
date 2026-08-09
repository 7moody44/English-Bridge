import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Timer } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

const PAIRS = [
  { word: 'Big', meaning: 'Large' },
  { word: 'Small', meaning: 'Tiny' },
  { word: 'Cold', meaning: 'Chilly' },
  { word: 'Hot', meaning: 'Warm' },
  { word: 'Easy', meaning: 'Simple' },
  { word: 'Hard', meaning: 'Difficult' },
  { word: 'Rich', meaning: 'Wealthy' },
  { word: 'Poor', meaning: 'Needy' },
];

const GAME_SECONDS = 30;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const VocabularyRaceGame: React.FC = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setupRound = (idx: number) => {
    const correct = PAIRS[idx % PAIRS.length];
    const distractors = shuffle(PAIRS.filter((p) => p.word !== correct.word))
      .slice(0, 3)
      .map((p) => p.meaning);
    setOptions(shuffle([correct.meaning, ...distractors]));
  };

  useEffect(() => {
    setupRound(0);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentPair = PAIRS[round % PAIRS.length];

  const handlePick = (meaning: string) => {
    if (finished) return;
    if (meaning === currentPair.meaning) {
      setScore((s) => s + 1);
    }
    const next = round + 1;
    setRound(next);
    setupRound(next);
  };

  // Score-based: each correct answer is worth a slice of 100.
  const finalScore = Math.min(100, score * 12);

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
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-pink-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/games')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Vocabulary Race</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <Timer className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {!finished ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm mb-5 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Pick the meaning of</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{currentPair.word}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handlePick(option)}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🏁
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Time's up!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">{score} correct answers</p>
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

export default VocabularyRaceGame;

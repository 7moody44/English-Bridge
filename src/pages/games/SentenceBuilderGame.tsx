import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

const SENTENCES = [
  'I love learning English',
  'She reads a book every night',
  'The sun rises in the east',
  'We play football on weekends',
  'He drinks coffee in the morning',
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const SentenceBuilderGame: React.FC = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [bank, setBank] = useState<string[]>(() => shuffle(SENTENCES[0].split(' ')));
  const [built, setBuilt] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const target = SENTENCES[index];
  const isLast = index === SENTENCES.length - 1;
  const isCorrect = built.join(' ') === target;

  const pickWord = (word: string, i: number) => {
    if (checked) return;
    setBuilt((prev) => [...prev, word]);
    setBank((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeWord = (i: number) => {
    if (checked) return;
    setBank((prev) => [...prev, built[i]]);
    setBuilt((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleCheck = () => {
    setChecked(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    const next = index + 1;
    setIndex(next);
    setBank(shuffle(SENTENCES[next].split(' ')));
    setBuilt([]);
    setChecked(false);
  };

  const finalScore = Math.round((correctCount / SENTENCES.length) * 100);

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
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/games')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Sentence Builder</h1>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{correctCount}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {!finished ? (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Sentence {index + 1} of {SENTENCES.length} — tap the words in order
            </p>

            {/* Built area */}
            <div className="min-h-[64px] bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm mb-4 flex flex-wrap gap-2 items-center">
              {built.length === 0 && (
                <span className="text-gray-400 text-sm">Your sentence appears here…</span>
              )}
              {built.map((word, i) => (
                <button
                  key={i}
                  onClick={() => removeWord(i)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm ${
                    checked
                      ? isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Word bank */}
            <div className="flex flex-wrap gap-2 mb-6">
              {bank.map((word, i) => (
                <button
                  key={i}
                  onClick={() => pickWord(word, i)}
                  disabled={checked}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>

            {checked && (
              <div className={`flex items-center gap-2 mb-4 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {isCorrect ? 'Correct!' : `Answer: "${target}"`}
              </div>
            )}

            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={built.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Check
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {isLast ? 'Finish' : 'Next'}
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${finalScore >= 50 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                {finalScore >= 50 ? <CheckCircle className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-orange-600" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {correctCount} / {SENTENCES.length} correct
              </h2>
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

export default SentenceBuilderGame;

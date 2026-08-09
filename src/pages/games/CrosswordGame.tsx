import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

interface Clue {
  number: number;
  clue: string;
  answer: string;
}

const CLUES: Clue[] = [
  { number: 1, clue: 'Opposite of "hot"', answer: 'COLD' },
  { number: 2, clue: 'You write with a ___', answer: 'PEN' },
  { number: 3, clue: 'A baby dog is a ___', answer: 'PUPPY' },
  { number: 4, clue: 'Opposite of "night"', answer: 'DAY' },
  { number: 5, clue: 'Frozen water is ___', answer: 'ICE' },
  { number: 6, clue: 'You read a ___', answer: 'BOOK' },
];

export const CrosswordGame: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleChange = (num: number, value: string) => {
    if (checked) return;
    setAnswers((prev) => ({ ...prev, [num]: value.toUpperCase() }));
  };

  const correctCount = CLUES.filter(
    (c) => (answers[c.number] || '').trim().toUpperCase() === c.answer
  ).length;

  const handleCheck = () => setChecked(true);

  const finalScore = Math.round((correctCount / CLUES.length) * 100);

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
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/games')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Crossword</h1>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{checked ? correctCount : 0}/{CLUES.length}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {!finished ? (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Fill in each word from the clue
            </p>
            <div className="space-y-3 mb-6">
              {CLUES.map((c) => {
                const value = answers[c.number] || '';
                const isRight = value.trim().toUpperCase() === c.answer;
                return (
                  <div key={c.number} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center">
                        {c.number}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{c.clue}</p>
                      {checked && (isRight ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />)}
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(c.number, e.target.value)}
                      disabled={checked}
                      placeholder={`${c.answer.length} letters`}
                      className={`w-full p-3 border rounded-lg uppercase tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 ${
                        checked
                          ? isRight
                            ? 'border-green-500 text-green-700 dark:text-green-300'
                            : 'border-red-500 text-red-700 dark:text-red-300'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {checked && !isRight && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Answer: {c.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {!checked ? (
              <button
                onClick={handleCheck}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Check answers
              </button>
            ) : (
              <button
                onClick={() => setFinished(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                See result
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
                {correctCount} / {CLUES.length} correct
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

export default CrosswordGame;

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

interface Question {
  question: string;
  answer: string;
  options: string[];
}

const POOL: Question[] = [
  { question: 'What is the plural of "child"?', answer: 'children', options: ['childs', 'children', 'childes', 'child'] },
  { question: 'Choose the correct verb: "She ___ a doctor."', answer: 'is', options: ['are', 'am', 'is', 'be'] },
  { question: 'Which word means "very tired"?', answer: 'exhausted', options: ['excited', 'exhausted', 'expired', 'exposed'] },
  { question: 'Pick the synonym of "begin".', answer: 'start', options: ['stop', 'start', 'end', 'pause'] },
  { question: 'What is the past tense of "go"?', answer: 'went', options: ['goed', 'gone', 'went', 'going'] },
  { question: 'Which is a preposition?', answer: 'under', options: ['run', 'under', 'happy', 'quickly'] },
  { question: 'Choose the correct article: "___ hour ago."', answer: 'an', options: ['a', 'an', 'the', 'some'] },
  { question: 'Which word is spelled correctly?', answer: 'necessary', options: ['neccessary', 'necessary', 'necesary', 'necessery'] },
];

const QUESTIONS_PER_DAY = 5;

/** Deterministic date seed so the same 5 questions appear all day, changing daily. */
const dateSeed = (): number => {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
};

const pickDaily = (): Question[] => {
  let seed = dateSeed();
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const shuffled = [...POOL].sort(() => rand() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_DAY);
};

export const DailyChallengeGame: React.FC = () => {
  const navigate = useNavigate();
  const questions = useMemo(pickDaily, []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const handlePick = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const finalScore = Math.round((correctCount / questions.length) * 100);

  const handleFinish = async () => {
    try {
      await addXP(finalScore, 'game');
    } catch (error) {
      console.error('Failed to save XP:', error);
    }
    navigate('/games');
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-rose-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/games')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Daily Challenge</h1>
              <p className="text-xs opacity-90">{today}</p>
            </div>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Question {index + 1} of {questions.length}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-5">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{question.question}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-5">
              {question.options.map((option) => {
                const isAnswer = option === question.answer;
                const isPicked = option === selected;
                let cls = 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-gray-700';
                if (selected) {
                  if (isAnswer) cls = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                  else if (isPicked) cls = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                  else cls = 'bg-white dark:bg-gray-800 text-gray-400';
                }
                return (
                  <button
                    key={option}
                    onClick={() => handlePick(option)}
                    disabled={!!selected}
                    className={`p-4 rounded-xl font-semibold text-left transition-all ${cls}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {selected && (
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
                {correctCount} / {questions.length} correct
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Come back tomorrow for a new set!</p>
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

export default DailyChallengeGame;

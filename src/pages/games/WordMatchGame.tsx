import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Heart, CheckCircle, XCircle } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

interface WordPair {
  id: number;
  word: string;
  meaning: string;
}

const wordPairs: WordPair[] = [
  { id: 1, word: 'Happy', meaning: 'Feeling joy' },
  { id: 2, word: 'Sad', meaning: 'Feeling sorrow' },
  { id: 3, word: 'Brave', meaning: 'Showing courage' },
  { id: 4, word: 'Smart', meaning: 'Intelligent' },
  { id: 5, word: 'Fast', meaning: 'Quick speed' },
  { id: 6, word: 'Strong', meaning: 'Having power' },
];

type SelectedItem = { type: 'word' | 'meaning'; id: number; value: string };

export const WordMatchGame: React.FC = () => {
  const navigate = useNavigate();
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState<number[]>([]);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [words, setWords] = useState<WordPair[]>([]);
  const [meanings, setMeanings] = useState<WordPair[]>([]);

  useEffect(() => {
    // Shuffle words and meanings
    const shuffledWords = [...wordPairs].sort(() => Math.random() - 0.5);
    const shuffledMeanings = [...wordPairs].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    setMeanings(shuffledMeanings);
  }, []);

  const handleSelect = (type: 'word' | 'meaning', id: number, value: string) => {
    if (matched.includes(id)) return;

    const newSelected: SelectedItem = { type, id, value };

    if (!selected) {
      setSelected(newSelected);
      return;
    }

    // Check if selecting same item
    if (selected.type === type && selected.id === id) {
      setSelected(null);
      return;
    }

    // Check if selecting from different columns
    if (selected.type !== type) {
      // Check if they match
      const wordId = type === 'word' ? id : selected.id;
      const meaningId = type === 'meaning' ? id : selected.id;

      if (wordId === meaningId) {
        // Correct match!
        setMatched([...matched, wordId]);
        setScore(score + 10);
        setSelected(null);

        // Check if game won
        if (matched.length + 1 === wordPairs.length) {
          setGameOver(true);
        }
      } else {
        // Wrong match
        setLives(lives - 1);
        setSelected(null);

        if (lives - 1 <= 0) {
          setGameOver(true);
        }
      }
    } else {
      // Selecting from same column, just update selection
      setSelected(newSelected);
    }
  };

  const handleFinish = async () => {
    const finalScore = (score / (wordPairs.length * 10)) * 100;
    
    try {
      // Save XP to backend
      const result = await addXP(finalScore, 'game');
      console.log('XP Earned:', result.xpEarned, 'Total XP:', result.totalXP);
    } catch (error) {
      console.error('Failed to save XP:', error);
    }
    
    navigate('/games');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/games')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Word Match</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Lives */}
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <Heart className="w-4 h-4 text-red-300" fill="currentColor" />
              <span className="font-bold">{lives}</span>
            </div>
            {/* Score */}
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="px-4 py-6">
        {!gameOver ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Words Column */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 text-center">
                Words
              </h3>
              {words.map((item) => (
                <button
                  key={`word-${item.id}`}
                  onClick={() => handleSelect('word', item.id, item.word)}
                  disabled={matched.includes(item.id)}
                  className={`w-full p-4 rounded-xl font-semibold text-left transition-all ${
                    matched.includes(item.id)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : selected?.type === 'word' && selected.id === item.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.word}</span>
                    {matched.includes(item.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Meanings Column */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 text-center">
                Meanings
              </h3>
              {meanings.map((item) => (
                <button
                  key={`meaning-${item.id}`}
                  onClick={() => handleSelect('meaning', item.id, item.meaning)}
                  disabled={matched.includes(item.id)}
                  className={`w-full p-4 rounded-xl font-medium text-left text-sm transition-all ${
                    matched.includes(item.id)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : selected?.type === 'meaning' && selected.id === item.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.meaning}</span>
                    {matched.includes(item.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="max-w-md mx-auto mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              {lives > 0 ? (
                <>
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You matched all the words!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Game Over
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You ran out of lives!
                  </p>
                </>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">{score}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">XP Earned</span>
                  <span className="font-bold text-orange-600">
                    +{calculateXP((score / (wordPairs.length * 10)) * 100)} XP
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordMatchGame;

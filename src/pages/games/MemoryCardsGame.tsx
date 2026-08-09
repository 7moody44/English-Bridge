import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

interface Card {
  key: string; // pair id
  label: string;
  kind: 'word' | 'meaning';
}

const PAIRS = [
  { word: 'Happy', meaning: 'Feeling joy' },
  { word: 'Brave', meaning: 'Showing courage' },
  { word: 'Quick', meaning: 'Very fast' },
  { word: 'Smart', meaning: 'Intelligent' },
  { word: 'Calm', meaning: 'Peaceful' },
  { word: 'Bright', meaning: 'Full of light' },
];

const buildDeck = (): Card[] => {
  const cards: Card[] = [];
  PAIRS.forEach((p, i) => {
    cards.push({ key: String(i), label: p.word, kind: 'word' });
    cards.push({ key: String(i), label: p.meaning, kind: 'meaning' });
  });
  return cards.sort(() => Math.random() - 0.5);
};

export const MemoryCardsGame: React.FC = () => {
  const navigate = useNavigate();
  const [deck] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  const allMatched = matched.length === PAIRS.length;

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      const cardA = deck[a];
      const cardB = deck[b];
      setMoves((m) => m + 1);
      if (cardA.key === cardB.key && cardA.kind !== cardB.kind) {
        const timer = setTimeout(() => {
          setMatched((prev) => [...prev, cardA.key]);
          setFlipped([]);
        }, 500);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setFlipped([]), 900);
      return () => clearTimeout(timer);
    }
  }, [flipped, deck]);

  useEffect(() => {
    if (allMatched && !finished) setFinished(true);
  }, [allMatched, finished]);

  const handleFlip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(deck[i].key)) return;
    setFlipped((prev) => [...prev, i]);
  };

  // Fewer moves => higher score. Par is PAIRS.length moves.
  const finalScore = Math.max(0, Math.round((PAIRS.length / Math.max(moves, PAIRS.length)) * 100));

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
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-cyan-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/games')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Memory Cards</h1>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{matched.length}/{PAIRS.length}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {!finished ? (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
              Match each word with its meaning · {moves} moves
            </p>
            <div className="grid grid-cols-3 gap-3">
              {deck.map((card, i) => {
                const isUp = flipped.includes(i) || matched.includes(card.key);
                const isDone = matched.includes(card.key);
                return (
                  <button
                    key={i}
                    onClick={() => handleFlip(i)}
                    className={`h-24 rounded-xl p-2 text-sm font-semibold flex items-center justify-center text-center transition-all ${
                      isDone
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : isUp
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isUp ? card.label : '?'}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All matched!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Finished in {moves} moves</p>
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

export default MemoryCardsGame;

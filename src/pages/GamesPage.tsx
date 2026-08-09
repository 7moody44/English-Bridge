import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Trophy, Lock, X } from 'lucide-react';
import { getProgress, unlockGame } from '@/services/progressService';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  /** XP earned for playing (shown in the badge). */
  xpReward: number;
  route: string;
  /** XP price to unlock. Omitted for always-free games. */
  cost?: number;
}

const GAMES: Game[] = [
  {
    id: 'word-match',
    title: 'Word Match',
    description: 'Match words with meanings',
    icon: '🔤',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    xpReward: 120,
    route: '/games/word-match',
  },
  {
    id: 'hangman',
    title: 'Hangman',
    description: 'Guess word letter by letter',
    icon: '🎯',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    xpReward: 120,
    route: '/games/hangman',
  },
  {
    id: 'word-search',
    title: 'Word Search',
    description: 'Find hidden words in grid',
    icon: '🔍',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    xpReward: 150,
    route: '/games/word-search',
  },
  {
    id: 'fill-blank',
    title: 'Fill the Blank',
    description: 'Pick the missing word',
    icon: '✏️',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    xpReward: 100,
    route: '/games/fill-blank',
    cost: 100,
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    description: 'Flip & match the pairs',
    icon: '🎴',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    xpReward: 100,
    route: '/games/memory-cards',
    cost: 100,
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    description: 'Order words into a sentence',
    icon: '📝',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    xpReward: 120,
    route: '/games/sentence-builder',
    cost: 150,
  },
  {
    id: 'vocabulary-race',
    title: 'Vocabulary Race',
    description: 'Beat the clock, match fast',
    icon: '🏃',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    xpReward: 120,
    route: '/games/vocabulary-race',
    cost: 150,
  },
  {
    id: 'crossword',
    title: 'Crossword',
    description: 'Fill the word grid',
    icon: '🧩',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    xpReward: 150,
    route: '/games/crossword',
    cost: 200,
  },
  {
    id: 'speaking-challenge',
    title: 'Speaking Challenge',
    description: 'Say the phrase out loud',
    icon: '🎤',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    xpReward: 150,
    route: '/games/speaking-challenge',
    cost: 200,
  },
  {
    id: 'daily-challenge',
    title: 'Daily Challenge',
    description: 'A fresh quiz every day',
    icon: '⚡',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    xpReward: 200,
    route: '/games/daily-challenge',
    cost: 250,
  },
];

export const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);
  const [unlockedGames, setUnlockedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseTarget, setPurchaseTarget] = useState<Game | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const loadProgress = useCallback(async () => {
    try {
      const data = await getProgress();
      setXp(data.xp ?? 0);
      setUnlockedGames(data.unlockedGames ?? []);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const isUnlocked = (game: Game): boolean =>
    !game.cost || unlockedGames.includes(game.id);

  const handleGameClick = (game: Game) => {
    if (isUnlocked(game)) {
      navigate(game.route);
    } else {
      setPurchaseError('');
      setPurchaseTarget(game);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseTarget || !purchaseTarget.cost) return;
    setPurchasing(true);
    setPurchaseError('');
    try {
      const result = await unlockGame(purchaseTarget.id, purchaseTarget.cost);
      setXp(result.xp);
      setUnlockedGames(result.unlockedGames);
      const target = purchaseTarget;
      setPurchaseTarget(null);
      navigate(target.route);
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Not enough XP to unlock this game';
      setPurchaseError(message);
      // Refresh balance in case it changed server-side.
      loadProgress();
    } finally {
      setPurchasing(false);
    }
  };

  const dailyChallenge = GAMES.find((g) => g.id === 'daily-challenge');
  const canAfford = (game: Game): boolean =>
    !game.cost || xp >= game.cost;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-pink-500 dark:from-primary-800 dark:via-primary-900 dark:to-pink-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/practice')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Games & Activities</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{loading ? '…' : xp}</span>
          </div>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      {dailyChallenge && (
        <div className="px-4 pt-6 pb-4">
          <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Daily Challenge</h3>
                  <p className="text-sm opacity-90">
                    {isUnlocked(dailyChallenge)
                      ? 'Complete today for bonus XP!'
                      : `Unlock with ${dailyChallenge.cost} XP`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleGameClick(dailyChallenge)}
                className="bg-white text-primary-600 px-5 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                {isUnlocked(dailyChallenge) ? 'Play' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => {
            const unlocked = isUnlocked(game);
            return (
              <button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left relative"
              >
                {/* Reward / cost badge */}
                <div
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    unlocked
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800/80 text-yellow-300'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <Trophy className="w-3 h-3" />
                      {game.xpReward}
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      {game.cost}
                    </>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${game.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-3`}
                >
                  {game.icon}
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{game.title}</h3>

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {unlocked ? game.description : `Unlock with ${game.cost} XP`}
                </p>

                {/* Lock Overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/30 rounded-2xl">
                    <div className="text-2xl">🔒</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase Modal */}
      {purchaseTarget && purchaseTarget.cost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 ${purchaseTarget.iconBg} rounded-2xl flex items-center justify-center text-3xl`}
                >
                  {purchaseTarget.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {purchaseTarget.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {purchaseTarget.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPurchaseTarget(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Cost</span>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {purchaseTarget.cost} XP
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Your balance</span>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {xp} XP
                </span>
              </div>
            </div>

            {purchaseError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">
                {purchaseError}
              </p>
            )}

            <button
              onClick={handleConfirmPurchase}
              disabled={purchasing || !canAfford(purchaseTarget)}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {purchasing
                ? 'Unlocking…'
                : canAfford(purchaseTarget)
                ? `Unlock for ${purchaseTarget.cost} XP`
                : 'Not enough XP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesPage;

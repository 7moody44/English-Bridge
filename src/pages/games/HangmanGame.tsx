import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Heart, XCircle } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

const words = [
  { word: 'HAPPINESS', hint: 'A state of joy' },
  { word: 'COMPUTER', hint: 'Electronic device' },
  { word: 'ELEPHANT', hint: 'Large animal' },
  { word: 'MOUNTAIN', hint: 'Very high land' },
  { word: 'SUNSHINE', hint: 'Light from the sun' },
  { word: 'BUTTERFLY', hint: 'Flying insect' },
  { word: 'RAINBOW', hint: 'Colorful arc in sky' },
  { word: 'TEACHER', hint: 'Someone who educates' },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const HangmanGame: React.FC = () => {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState({ word: '', hint: '' });
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [lives, setLives] = useState(6);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    startNewWord();
  }, []);

  const startNewWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
  };

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (currentWord.word.includes(letter)) {
      // Correct guess
      setScore(score + 10);

      // Check if word is complete
      const wordComplete = currentWord.word
        .split('')
        .every((l) => newGuessedLetters.includes(l));

      if (wordComplete) {
        const newWordsCompleted = wordsCompleted + 1;
        setWordsCompleted(newWordsCompleted);
        setScore(score + 50); // Bonus for completing word

        if (newWordsCompleted >= 3) {
          // Win condition: complete 3 words
          setWon(true);
          setGameOver(true);
        } else {
          // Start new word after delay
          setTimeout(() => {
            startNewWord();
          }, 1000);
        }
      }
    } else {
      // Wrong guess
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setWon(false);
        setGameOver(true);
      }
    }
  };

  const getDisplayWord = () => {
    return currentWord.word
      .split('')
      .map((letter) => (guessedLetters.includes(letter) ? letter : '_'))
      .join(' ');
  };

  const handleFinish = async () => {
    const finalScore = (score / 180) * 100; // Max score: 3 words * 60 points each
    
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
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-orange-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/games')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Hangman</h1>
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
          <>
            {/* Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Words Completed
                </span>
                <span className="font-bold text-primary-600">{wordsCompleted} / 3</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(wordsCompleted / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Hint */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Hint:
              </p>
              <p className="text-blue-900 dark:text-blue-100">{currentWord.hint}</p>
            </div>

            {/* Word Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-6 shadow-sm">
              <p className="text-3xl font-bold text-center tracking-wider text-gray-900 dark:text-white font-mono">
                {getDisplayWord()}
              </p>
            </div>

            {/* Keyboard */}
            <div className="space-y-2">
              {KEYBOARD_ROWS.map((row, idx) => (
                <div key={idx} className="flex justify-center gap-1">
                  {row.map((letter) => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isCorrect = isGuessed && currentWord.word.includes(letter);
                    const isWrong = isGuessed && !currentWord.word.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={isGuessed}
                        className={`w-10 h-12 rounded-lg font-bold text-sm transition-all ${
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : isWrong
                            ? 'bg-red-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                        } ${isGuessed ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Game Over Screen */
          <div className="max-w-md mx-auto mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              {won ? (
                <>
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Victory!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You completed 3 words!
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
                  <span className="text-gray-600 dark:text-gray-400">Words Completed</span>
                  <span className="font-bold text-gray-900 dark:text-white">{wordsCompleted}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">{score}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">XP Earned</span>
                  <span className="font-bold text-orange-600">
                    +{calculateXP((score / 180) * 100)} XP
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

export default HangmanGame;

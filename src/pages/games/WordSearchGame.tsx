import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy } from 'lucide-react';
import { calculateXP } from '../../utils/xpCalculator';
import { addXP } from '../../services/progressService';

const GRID_SIZE = 10;
const WORDS = ['HAPPY', 'SMILE', 'LOVE', 'LEARN', 'BOOK', 'PLAY'];

type Cell = {
  letter: string;
  row: number;
  col: number;
  isPartOfWord: boolean;
  wordId?: number;
};

type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
};

export const WordSearchGame: React.FC = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [foundWords, setFoundWords] = useState<number[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    // Create empty grid
    const newGrid: Cell[][] = Array(GRID_SIZE)
      .fill(null)
      .map((_, row) =>
        Array(GRID_SIZE)
          .fill(null)
          .map((_, col) => ({
            letter: '',
            row,
            col,
            isPartOfWord: false,
          }))
      );

    // Place words
    WORDS.forEach((word, wordId) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(newGrid, word, row, col, direction)) {
          placeWord(newGrid, word, row, col, direction, wordId);
          placed = true;
        }
      }
    });

    // Fill empty cells with random letters
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].letter) {
          newGrid[row][col].letter = String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          );
        }
      }
    }

    setGrid(newGrid);
  };

  const canPlaceWord = (
    grid: Cell[][],
    word: string,
    row: number,
    col: number,
    direction: number
  ): boolean => {
    const deltas = [
      { dr: 0, dc: 1 }, // horizontal
      { dr: 1, dc: 0 }, // vertical
      { dr: 1, dc: 1 }, // diagonal
    ];
    const { dr, dc } = deltas[direction];

    for (let i = 0; i < word.length; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;

      if (
        newRow < 0 ||
        newRow >= GRID_SIZE ||
        newCol < 0 ||
        newCol >= GRID_SIZE ||
        (grid[newRow][newCol].letter && grid[newRow][newCol].letter !== word[i])
      ) {
        return false;
      }
    }

    return true;
  };

  const placeWord = (
    grid: Cell[][],
    word: string,
    row: number,
    col: number,
    direction: number,
    wordId: number
  ) => {
    const deltas = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
    ];
    const { dr, dc } = deltas[direction];

    for (let i = 0; i < word.length; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      grid[newRow][newCol].letter = word[i];
      grid[newRow][newCol].isPartOfWord = true;
      grid[newRow][newCol].wordId = wordId;
    }
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelection({ start: { row, col }, end: { row, col } });
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isSelecting && selection) {
      setSelection({ ...selection, end: { row, col } });
    }
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
    checkSelection();
  };

  const checkSelection = () => {
    if (!selection) return;

    const { start, end } = selection;
    const selectedCells: Cell[] = [];

    // Determine direction
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const dr = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
    const dc = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;

    // Get selected cells
    let row = start.row;
    let col = start.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;

    for (let i = 0; i < steps; i++) {
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        selectedCells.push(grid[row][col]);
      }
      row += dr;
      col += dc;
    }

    // Check if forms a word
    const selectedWord = selectedCells.map((cell) => cell.letter).join('');
    const reverseWord = selectedWord.split('').reverse().join('');

    const wordIndex = WORDS.findIndex(
      (word) => word === selectedWord || word === reverseWord
    );

    if (wordIndex !== -1 && !foundWords.includes(wordIndex)) {
      // Found a word!
      setFoundWords([...foundWords, wordIndex]);
      setScore(score + 20);

      // Check if all words found
      if (foundWords.length + 1 === WORDS.length) {
        setGameOver(true);
      }
    }

    setSelection(null);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    if (!selection) return false;

    const { start, end } = selection;
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const dr = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
    const dc = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;

    let r = start.row;
    let c = start.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;

    for (let i = 0; i < steps; i++) {
      if (r === row && c === col) return true;
      r += dr;
      c += dc;
    }

    return false;
  };

  const isCellInFoundWord = (row: number, col: number): boolean => {
    const cell = grid[row][col];
    return cell.isPartOfWord && cell.wordId !== undefined && foundWords.includes(cell.wordId);
  };

  const handleFinish = async () => {
    const finalScore = (foundWords.length / WORDS.length) * 100;
    
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-teal-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/games')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Word Search</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="px-4 py-6">
        {!gameOver ? (
          <>
            {/* Word List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Find these words:
              </h3>
              <div className="flex flex-wrap gap-2">
                {WORDS.map((word, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                      foundWords.includes(idx)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 line-through'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div
                className="inline-grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                }}
                onMouseLeave={() => setIsSelecting(false)}
              >
                {grid.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                      onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                      onMouseUp={handleCellMouseUp}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer select-none transition-all rounded ${
                        isCellInFoundWord(rowIdx, colIdx)
                          ? 'bg-green-500 text-white'
                          : isCellSelected(rowIdx, colIdx)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cell.letter}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                Click and drag to select words horizontally, vertically, or diagonally
              </p>
            </div>
          </>
        ) : (
          /* Game Over Screen */
          <div className="max-w-md mx-auto mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Excellent!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You found all the words!
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">Words Found</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {foundWords.length} / {WORDS.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">{score}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">XP Earned</span>
                  <span className="font-bold text-orange-600">
                    +{calculateXP((foundWords.length / WORDS.length) * 100)} XP
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

export default WordSearchGame;

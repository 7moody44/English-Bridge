import React, { useState } from 'react';
import type { VocabWord } from '@/data/vocabularyData';
import { Check } from 'lucide-react';

interface WordSelectorProps {
  words: VocabWord[];
  onConfirm: (selectedWords: VocabWord[]) => void;
  onCancel: () => void;
  mode: 'flashcard' | 'quiz';
}

export const WordSelector: React.FC<WordSelectorProps> = ({
  words,
  onConfirm,
  onCancel,
  mode,
}) => {
  const [selectedWords, setSelectedWords] = useState<VocabWord[]>([]);

  const toggleWord = (word: VocabWord) => {
    if (selectedWords.find(w => w.word === word.word)) {
      setSelectedWords(selectedWords.filter(w => w.word !== word.word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const selectAll = () => {
    setSelectedWords([...words]);
  };

  const deselectAll = () => {
    setSelectedWords([]);
  };

  const isSelected = (word: VocabWord) => {
    return selectedWords.find(w => w.word === word.word) !== undefined;
  };

  const canProceed = mode === 'quiz' ? selectedWords.length >= 4 : selectedWords.length >= 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Select Words for {mode === 'flashcard' ? 'Flashcards' : 'Quiz'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === 'quiz' && 'Select at least 4 words for the quiz'}
            {mode === 'flashcard' && 'Select the words you want to study'}
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Select All ({words.length})
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Deselect All
            </button>
            <div className="ml-auto text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center">
              {selectedWords.length} selected
            </div>
          </div>
        </div>

        {/* Word Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {words.map((word, index) => (
              <button
                key={index}
                onClick={() => toggleWord(word)}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  isSelected(word)
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {word.word}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#7F00FF', color: 'white' }}>
                        {word.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {word.pronunciation}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {word.definition}
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded capitalize" style={{ backgroundColor: '#778DA9', color: 'white' }}>
                      {word.category}
                    </span>
                  </div>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected(word)
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected(word) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedWords)}
            disabled={!canProceed}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
              canProceed
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Start {mode === 'flashcard' ? 'Flashcards' : 'Quiz'} ({selectedWords.length})
          </button>
        </div>
      </div>
    </div>
  );
};

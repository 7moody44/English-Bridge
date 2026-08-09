import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Volume2, RotateCcw, CheckCircle, XCircle, ChevronRight, Plus } from 'lucide-react';
import { vocabularyWords } from '@/data/vocabularyData';
import type { VocabWord } from '@/data/vocabularyData';
import { WordSelector } from '@/components/Vocab/WordSelector';

type TabType = 'words' | 'flashcards' | 'quiz';
type CategoryType = 'all' | 'business' | 'travel' | 'technology' | 'health' | 'food' | 'education' | 'sports' | 'nature' | 'society';

export const VocabPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('words');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Word selection state
  const [showWordSelector, setShowWordSelector] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [customSelectedWords, setCustomSelectedWords] = useState<VocabWord[]>([]);
  
  // Flashcard state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hardWords, setHardWords] = useState<VocabWord[]>([]);
  const [flashcardQueue, setFlashcardQueue] = useState<VocabWord[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showFlashcardComplete, setShowFlashcardComplete] = useState(false);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  const filteredWords = useMemo(() => {
    return vocabularyWords.filter((word) => {
      const matchesSearch = 
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || word.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Get the words to use for quiz/flashcards
  const getActiveWords = () => {
    if (customSelectedWords.length > 0) {
      return customSelectedWords;
    }
    return filteredWords;
  };

  const activeWords = getActiveWords();

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'business', label: 'Business' },
    { id: 'travel', label: 'Travel' },
    { id: 'technology', label: 'Technology' },
    { id: 'health', label: 'Health' },
    { id: 'food', label: 'Food' },
    { id: 'education', label: 'Education' },
    { id: 'sports', label: 'Sports' },
    { id: 'nature', label: 'Nature' },
    { id: 'society', label: 'Society' },
  ];

  const playPronunciation = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  // Initialize flashcard queue
  const startFlashcards = (words?: VocabWord[]) => {
    const wordsToUse = words || filteredWords;
    setFlashcardQueue([...wordsToUse]);
    setCurrentFlashcardIndex(0);
    setHardWords([]);
    setCompletedCount(0);
    setIsFlipped(false);
    setShowFlashcardComplete(false);
    setCustomSelectedWords([]);
  };

  // Handle custom flashcard creation
  const handleCreateFlashcards = () => {
    setSelectorMode('flashcard');
    setShowWordSelector(true);
  };

  const handleConfirmFlashcardSelection = (selectedWords: VocabWord[]) => {
    setShowWordSelector(false);
    setCustomSelectedWords(selectedWords);
    startFlashcards(selectedWords);
  };

  // Handle "Hard" button
  const handleHard = () => {
    const currentWord = flashcardQueue[currentFlashcardIndex];
    setHardWords([...hardWords, currentWord]);
    moveToNextFlashcard();
  };

  // Handle "Got it!" button
  const handleGotIt = () => {
    setCompletedCount(completedCount + 1);
    moveToNextFlashcard();
  };

  // Move to next flashcard
  const moveToNextFlashcard = () => {
    setIsFlipped(false);
    
    if (currentFlashcardIndex < flashcardQueue.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else if (hardWords.length > 0) {
      // Restart with hard words
      setFlashcardQueue([...hardWords]);
      setHardWords([]);
      setCurrentFlashcardIndex(0);
    } else {
      // All cards completed
      setShowFlashcardComplete(true);
    }
  };

  // Generate quiz options
  const generateQuizOptions = (correctWord: VocabWord, allWords: VocabWord[]) => {
    const options = [correctWord];
    const otherWords = allWords.filter(w => w.word !== correctWord.word);
    
    // Shuffle and pick 3 random wrong answers
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    options.push(...shuffled.slice(0, 3));
    
    // Shuffle all options
    return options.sort(() => Math.random() - 0.5);
  };

  const startQuiz = (words?: VocabWord[]) => {
    const wordsToUse = words || filteredWords;
    setQuizStarted(true);
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizAnswers([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setCustomSelectedWords([]);
    // Use the provided words or filtered words
    if (words) {
      // Store custom words somewhere if needed
    }
  };

  // Handle custom quiz creation
  const handleCreateQuiz = () => {
    setSelectorMode('quiz');
    setShowWordSelector(true);
  };

  const handleConfirmQuizSelection = (selectedWords: VocabWord[]) => {
    setShowWordSelector(false);
    setCustomSelectedWords(selectedWords);
    // We need to pass selected words to quiz, so let's update filteredWords temporarily
    startQuiz(selectedWords);
  };

  const handleQuizAnswer = (optionIndex: number, correctWord: string, selectedWord: string) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(optionIndex);
    const isCorrect = selectedWord === correctWord;
    setQuizAnswers([...quizAnswers, isCorrect]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < filteredWords.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    startQuiz();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Word Selector Modal */}
      {showWordSelector && (
        <WordSelector
          words={filteredWords}
          onConfirm={selectorMode === 'flashcard' ? handleConfirmFlashcardSelection : handleConfirmQuizSelection}
          onCancel={() => setShowWordSelector(false)}
          mode={selectorMode}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 dark:from-purple-800 dark:via-purple-900 dark:to-pink-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Vocabulary</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[60px] z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('words')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'words'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Words
            {activeTab === 'words' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'flashcards'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Flashcards
            {activeTab === 'flashcards' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'quiz'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Quiz
            {activeTab === 'quiz' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></div>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'words' && (
        <>
          {/* Search Bar */}
          <div className="px-4 py-4 bg-white dark:bg-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search words or definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-4 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Word Count */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
              <span>{filteredWords.length} words</span>
              <button className="text-purple-600 dark:text-purple-400 hover:underline">
                Tap speaker to hear pronunciation
              </button>
            </p>
          </div>

          {/* Words List */}
          <div className="px-4 py-4 space-y-3">
            {filteredWords.map((word, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 relative"
              >
                {/* CEFR Level Badge - Top Left */}
                <span className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded-md">
                  {word.level}
                </span>



                <div className="flex items-start justify-between mb-2 mt-6">
                  <div className="flex-1 pr-12">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {word.word}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {word.pronunciation}
                    </p>
                  </div>
                  <button
                    onClick={() => playPronunciation(word.word)}
                    className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-900 dark:text-white mb-2">
                  {word.definition}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">
                  "{word.example}"
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Badge */}
                  <span className="px-2 py-1 text-xs font-medium rounded-md" style={{ backgroundColor: '#051650', color: 'white' }}>
                    {word.category.charAt(0).toUpperCase() + word.category.slice(1)}
                  </span>
                  {word.synonyms && word.synonyms.length > 0 && (
                    word.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {syn}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'flashcards' && (
        <div className="px-4 py-6">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No words available in this category</p>
            </div>
          ) : flashcardQueue.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Flashcards</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Review {filteredWords.length} words with flashcards
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => startFlashcards()}
                    className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors"
                  >
                    Start All Words
                  </button>
                  <button
                    onClick={handleCreateFlashcards}
                    className="px-8 py-4 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-xl font-semibold text-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Custom
                  </button>
                </div>
              </div>
            </div>
          ) : showFlashcardComplete ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You've reviewed all flashcards
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={startFlashcards}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Study Again
                  </button>
                  <button
                    onClick={() => setActiveTab('words')}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back to Words
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Flashcard Progress */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentFlashcardIndex + 1} / {flashcardQueue.length}
                </p>
                <p className="text-sm text-gray-400">Tap card to flip</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-6">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentFlashcardIndex + 1) / flashcardQueue.length) * 100}%` }}
                ></div>
              </div>

              {/* Flashcard */}
              <div
                className="relative cursor-pointer mb-6"
                style={{ height: '420px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front of card - Word */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-500 dark:from-purple-800 dark:to-pink-700 rounded-3xl shadow-2xl p-10 h-full flex flex-col items-center justify-center text-white relative">
                      {/* CEFR Level Badge - Top Left - Electric Purple */}
                      {flashcardQueue[currentFlashcardIndex]?.level && (
                        <span className="absolute top-6 left-6 text-sm font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#7F00FF', color: 'white' }}>
                          {flashcardQueue[currentFlashcardIndex].level}
                        </span>
                      )}
                      {/* Category Badge - Bottom Left */}
                      {flashcardQueue[currentFlashcardIndex]?.category && (
                        <span className="absolute bottom-6 left-6 text-xs font-medium px-3 py-1 rounded-md" style={{ backgroundColor: '#051650', color: 'white' }}>
                          {flashcardQueue[currentFlashcardIndex].category.charAt(0).toUpperCase() + flashcardQueue[currentFlashcardIndex].category.slice(1)}
                        </span>
                      )}
                      <h2 className="text-5xl font-bold mb-4 text-center">{flashcardQueue[currentFlashcardIndex]?.word}</h2>
                      <p className="text-xl opacity-90 mb-3">{flashcardQueue[currentFlashcardIndex]?.pronunciation}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); playPronunciation(flashcardQueue[currentFlashcardIndex]?.word); }}
                        className="mt-4 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Volume2 className="w-5 h-5" />
                        Hear pronunciation
                      </button>
                      <p className="mt-8 text-sm opacity-75">Tap card to see definition</p>
                    </div>
                  </div>

                  {/* Back of card - Definition */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="bg-gradient-to-br from-green-500 to-cyan-500 dark:from-green-700 dark:to-cyan-700 rounded-3xl shadow-2xl p-10 h-full flex flex-col items-center justify-center text-white">
                      <p className="text-sm opacity-75 mb-3">Definition</p>
                      <p className="text-2xl text-center font-medium mb-6 leading-relaxed">{flashcardQueue[currentFlashcardIndex]?.definition}</p>
                      <div className="bg-white/20 rounded-2xl p-5 mb-6 max-w-lg">
                        <p className="text-base italic text-center">"{flashcardQueue[currentFlashcardIndex]?.example}"</p>
                      </div>
                      {flashcardQueue[currentFlashcardIndex]?.synonyms && flashcardQueue[currentFlashcardIndex].synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {flashcardQueue[currentFlashcardIndex].synonyms.map((syn, idx) => (
                            <span key={idx} className="text-sm px-3 py-1.5 bg-white/20 rounded-full">
                              {syn}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-8 text-sm opacity-75">Tap card to flip back</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show when flipped */}
              {isFlipped && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleHard(); }}
                    className="px-6 py-4 bg-white dark:bg-gray-800 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-2xl font-semibold text-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-6 h-6" />
                    Hard
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleGotIt(); }}
                    className="px-6 py-4 bg-green-600 text-white rounded-2xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    Got it!
                  </button>
                </div>
              )}

              {/* "Flip to see definition" button when not flipped */}
              {!isFlipped && (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full px-6 py-4 bg-purple-600 text-white rounded-2xl font-semibold text-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Flip to see definition
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {filteredWords.length < 4 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Need at least 4 words to start a quiz</p>
            </div>
          ) : !quizStarted ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vocabulary Quiz</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Test your knowledge with {activeWords.length} words from the {selectedCategory === 'all' ? 'all categories' : selectedCategory + ' category'}.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => startQuiz()}
                    className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors"
                  >
                    Start All Words
                  </button>
                  <button
                    onClick={handleCreateQuiz}
                    className="px-8 py-4 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-xl font-semibold text-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Custom
                  </button>
                </div>
              </div>
            </div>
          ) : showResult ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  {score >= filteredWords.length * 0.8 ? (
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                    </div>
                  )}
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
                  <p className="text-gray-600 dark:text-gray-400">You scored</p>
                  <p className="text-5xl font-bold text-purple-600 dark:text-purple-400 my-4">
                    {score}/{filteredWords.length}
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {Math.round((score / filteredWords.length) * 100)}% correct
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={restartQuiz}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setQuizStarted(false);
                      setActiveTab('words');
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back to Words
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Quiz Header */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Question {currentQuizIndex + 1} of {filteredWords.length}
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Score: {score}
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-6">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuizIndex + 1) / filteredWords.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Card */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">What is the definition of:</p>
                <div className="bg-gradient-to-br from-purple-600 to-pink-500 dark:from-purple-800 dark:to-pink-700 rounded-3xl p-8 shadow-lg text-white text-center relative">
                  {/* CEFR Level Badge - Top Left */}
                  {filteredWords[currentQuizIndex]?.level && (
                    <span className="absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#7F00FF', color: 'white' }}>
                      {filteredWords[currentQuizIndex].level}
                    </span>
                  )}
                  {/* Category Badge - Bottom Left */}
                  {filteredWords[currentQuizIndex]?.category && (
                    <span className="absolute bottom-4 left-4 text-xs font-medium px-2.5 py-1 rounded-md" style={{ backgroundColor: '#051650', color: 'white' }}>
                      {filteredWords[currentQuizIndex].category.charAt(0).toUpperCase() + filteredWords[currentQuizIndex].category.slice(1)}
                    </span>
                  )}
                  <h3 className="text-4xl font-bold mb-3">
                    {filteredWords[currentQuizIndex].word}
                  </h3>
                  <p className="text-lg opacity-90 mb-4">
                    {filteredWords[currentQuizIndex].pronunciation}
                  </p>
                  <button
                    onClick={() => playPronunciation(filteredWords[currentQuizIndex].word)}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Hear it
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Choose the correct definition:</p>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {generateQuizOptions(filteredWords[currentQuizIndex], filteredWords).map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = option.word === filteredWords[currentQuizIndex].word;
                  const showFeedback = selectedAnswer !== null;
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index, filteredWords[currentQuizIndex].word, option.word)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${
                        showFeedback
                          ? isCorrect
                            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-600 dark:border-green-400'
                            : isSelected
                            ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-600 dark:border-red-400'
                            : 'bg-white dark:bg-gray-800 border-2 border-transparent'
                          : 'bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 border-2 border-transparent shadow-sm'
                      } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            showFeedback && isCorrect
                              ? 'bg-green-600 text-white'
                              : showFeedback && isSelected
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {optionLabel}
                          </span>
                          <p className={`text-sm flex-1 ${
                            showFeedback && isCorrect
                              ? 'text-green-900 dark:text-green-100 font-medium'
                              : showFeedback && isSelected
                              ? 'text-red-900 dark:text-red-100'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {option.definition}
                          </p>
                        </div>
                        {showFeedback && isCorrect && (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next Button */}
              {selectedAnswer !== null && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        {quizAnswers[quizAnswers.length - 1] ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200 italic">
                        "{filteredWords[currentQuizIndex].example}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Question Button */}
              {selectedAnswer !== null && (
                <button
                  onClick={nextQuizQuestion}
                  className="w-full px-6 py-4 bg-purple-600 text-white rounded-2xl font-semibold text-lg hover:bg-purple-700 transition-colors"
                >
                  {currentQuizIndex < filteredWords.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Volume2, Lightbulb } from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { practiceService, type ReadingPassage } from '@/services/practiceService';

export const ReadingPassagePage: React.FC = () => {
  const navigate = useNavigate();
  const { passageId } = useParams<{ passageId: string }>();
  const [passageData, setPassageData] = useState<ReadingPassage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showHint, setShowHint] = useState<{ [key: number]: boolean }>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Load speech synthesis voices
  useEffect(() => {
    // Some browsers need this to load voices
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      // Listen for voices changed event (some browsers load voices async)
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    }
  }, []);

  // Fetch passage from API
  useEffect(() => {
    const fetchPassage = async () => {
      if (!passageId) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await practiceService.getReadingPassage(passageId);
        setPassageData(response.passage);
      } catch (err) {
        console.error('Error fetching passage:', err);
        setError('Failed to load passage. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassage();

    // Cleanup: stop any playing speech when component unmounts
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [passageId]);

  const handleListenClick = () => {
    if (!passageData) return;

    // Stop any currently playing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(passageData.passage);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en-'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Handle speech end
    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    // Handle speech error
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlayingAudio(false);
    };

    // Speak the passage
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const toggleHint = (questionIndex: number) => {
    if (!showHint[questionIndex]) {
      setHintsUsed(hintsUsed + 1);
    }
    setShowHint({
      ...showHint,
      [questionIndex]: !showHint[questionIndex],
    });
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getLevelColor = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'pre-a1': 'bg-purple-600',
      'a1': 'bg-blue-600',
      'b1': 'bg-purple-600',
      'b2': 'bg-rose-600',
      'c1': 'bg-red-600',
    };
    return levelMap[level.toLowerCase()] || 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading passage..." />
      </div>
    );
  }

  if (error || !passageData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 dark:text-red-400 mb-4 text-center">
          {error || 'Passage not found'}
        </p>
        <button
          onClick={() => navigate('/practice/reading')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Passages
        </button>
      </div>
    );
  }

  const currentQuestion = passageData.questions[currentQuestionIndex];
  const totalQuestions = passageData.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/practice/reading')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{passageData.title}</h1>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 mt-3 text-sm">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getLevelColor(passageData.level)}`}>
            {passageData.level}
          </span>
          <span className="text-white/80">{passageData.category}</span>
          <div className="flex items-center gap-1 text-white/80">
            <Volume2 className="w-3 h-3" />
            <span>{passageData.duration} min</span>
          </div>
        </div>
      </div>

      {/* Passage Section */}
      <div className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Passage
          </h2>
          <button
            onClick={handleListenClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${
                isPlayingAudio
                  ? 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600'
                  : 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
              }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
          </button>
        </div>

        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
          {passageData.passage}
        </p>
      </div>

      {/* Question Section */}
      <div className="px-4 mt-6">
        {/* Question Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
            <div className="flex gap-1">
              {passageData.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 dark:bg-primary-500'
                      : selectedAnswers[index] !== undefined
                      ? 'bg-primary-400 dark:bg-primary-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                  ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold flex-shrink-0
                  ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-primary-600 dark:bg-primary-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getOptionLabel(index)}
                </div>
                <span className="text-base text-gray-800 dark:text-gray-200">{option}</span>
              </button>
            ))}
          </div>

          {/* Hint Button & Display */}
          <div className="mt-4">
            <button
              onClick={() => toggleHint(currentQuestionIndex)}
              className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint[currentQuestionIndex] ? 'Hide' : 'Show'} Hint ({hintsUsed})</span>
            </button>

            {showHint[currentQuestionIndex] && (
              <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          )}
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors
                ${
                  selectedAnswers[currentQuestionIndex] !== undefined
                    ? 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={async () => {
                // Submit answers to backend
                try {
                  const answers: { [key: number]: number } = {};
                  Object.keys(selectedAnswers).forEach((key) => {
                    answers[parseInt(key)] = selectedAnswers[parseInt(key)];
                  });

                  const response = await practiceService.completeReadingPractice(passageId!, {
                    answers,
                    timeSpent: 0, // TODO: Track actual time
                    hintsUsed,
                  });

                  // Show results (you can create a results page or modal)
                  alert(
                    `Quiz completed!\nScore: ${response.results.score}%\nCorrect: ${response.results.correctAnswers}/${response.results.totalQuestions}\n${response.results.passed ? 'Passed!' : 'Keep practicing!'}`
                  );
                  navigate('/practice/reading');
                } catch (err) {
                  console.error('Error submitting results:', err);
                  alert('Failed to submit results. Please try again.');
                }
              }}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors
                ${
                  selectedAnswers[currentQuestionIndex] !== undefined
                    ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingPassagePage;

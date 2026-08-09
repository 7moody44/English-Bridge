import { useState, useEffect } from 'react';
import { AudioPlayer } from '@/components/Audio/AudioPlayer';

interface Exercise {
  _id: string;
  type: 'multiple-choice' | 'listening' | 'reading';
  question: string;
  options?: string[];
  correctAnswers: (string | number)[];
  audioPrompt?: string;
  explanation?: string;
}

/**
 * A wrong answer captured for the Mistakes review page. Mirrors the backend's
 * ClientMistake shape so it can be forwarded to /lessons/.../complete as-is.
 */
export interface QuizMistake {
  question: string;
  options?: string[];
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

interface QuizInterfaceProps {
  exercises: Exercise[];
  onComplete: (scores: number[], mistakes: QuizMistake[]) => void;
  onCancel?: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  exercises,
  onComplete,
  onCancel,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  useEffect(() => {
    setAnswers(new Array(exercises.length).fill(null));
  }, [exercises]);

  useEffect(() => {
    // Reset text input value when changing exercises
    const currentAnswer = answers[currentExerciseIndex];
    if (currentExercise.type === 'reading' && currentAnswer) {
      setTextInputValue(currentAnswer as string);
    } else {
      setTextInputValue('');
    }
  }, [currentExerciseIndex, currentExercise.type, answers]);

  const handleAnswer = (answer: string | number) => {
    const newAnswers = [...answers];
    newAnswers[currentExerciseIndex] = answer;
    setAnswers(newAnswers);
    setIsAnswered(true);
    setShowFeedback(true);
  };

  const handleTextInputSubmit = () => {
    if (textInputValue.trim()) {
      handleAnswer(textInputValue);
    }
  };

  const handleTextInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInputValue.trim()) {
      handleTextInputSubmit();
    }
  };

  const handleNext = () => {
    if (isLastExercise) {
      const scores = calculateScores();
      const mistakes = collectMistakes();
      onComplete(scores, mistakes);
    } else {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setShowFeedback(false);
      setIsAnswered(false);
    }
  };

  const normalizeAnswer = (answer: string | number): string => {
    return typeof answer === 'string' ? answer.trim().toLowerCase() : String(answer);
  };

  /**
   * Build the list of wrong answers (with the user's choice resolved to option
   * text for multiple-choice/listening) so the backend can store them on the
   * Mistakes review page.
   */
  const collectMistakes = (): QuizMistake[] => {
    const mistakes: QuizMistake[] = [];

    exercises.forEach((exercise, index) => {
      const userAnswer = answers[index];
      if (userAnswer === null || userAnswer === undefined) return;

      const correctAnswers = exercise.correctAnswers;
      const isChoice = exercise.type === 'multiple-choice' || exercise.type === 'listening';

      const isCorrect =
        typeof userAnswer === 'string'
          ? correctAnswers.some((ca) => normalizeAnswer(ca) === normalizeAnswer(userAnswer))
          : correctAnswers.includes(userAnswer);

      if (isCorrect) return;

      const userAnswerText =
        isChoice && exercise.options
          ? (exercise.options[userAnswer as number] ?? String(userAnswer))
          : String(userAnswer);
      const correctAnswerText =
        isChoice && exercise.options
          ? (exercise.options[correctAnswers[0] as number] ?? String(correctAnswers[0]))
          : String(correctAnswers[0]);

      mistakes.push({
        question: exercise.question,
        options: exercise.options,
        userAnswer: userAnswerText,
        correctAnswer: correctAnswerText,
        explanation: exercise.explanation,
      });
    });

    return mistakes;
  };

  const calculateScores = (): number[] => {
    return exercises.map((exercise, index) => {
      const userAnswer = answers[index];
      const correctAnswers = exercise.correctAnswers;
      
      // Check if answer is in the correctAnswers array
      if (userAnswer === null || userAnswer === undefined) {
        return 0;
      }

      // For string answers, do case-insensitive comparison with trimming
      if (typeof userAnswer === 'string') {
        const normalizedUserAnswer = normalizeAnswer(userAnswer);
        const isCorrect = correctAnswers.some(
          (correctAnswer) => normalizeAnswer(correctAnswer) === normalizedUserAnswer
        );
        return isCorrect ? 100 : 0;
      }
      
      // For numeric answers (multiple choice), check if in array
      return correctAnswers.includes(userAnswer) ? 100 : 0;
    });
  };

  const currentAnswer = answers[currentExerciseIndex];
  
  // Check if answer is correct with case-insensitive comparison for strings
  const isCorrect = (() => {
    if (!currentAnswer && currentAnswer !== 0) return false;
    
    const correctAnswers = currentExercise.correctAnswers;
    
    // For string answers, do case-insensitive comparison with trimming
    if (typeof currentAnswer === 'string') {
      const normalizedUserAnswer = normalizeAnswer(currentAnswer);
      return correctAnswers.some(
        (correctAnswer) => normalizeAnswer(correctAnswer) === normalizedUserAnswer
      );
    }
    
    // For numeric answers (multiple choice), check if in array
    return correctAnswers.includes(currentAnswer);
  })();
  
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Question {currentExerciseIndex + 1} of {exercises.length}
        </p>
      </div>

      {/* Exercise */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {currentExercise.question}
        </h3>

        {currentExercise.type === 'listening' && currentExercise.audioPrompt && (
          <div className="mb-6">
            <AudioPlayer text={currentExercise.audioPrompt} />
          </div>
        )}

        {/* Multiple Choice Options */}
        {currentExercise.type === 'multiple-choice' && currentExercise.options && (
          <div className="space-y-2">
            {currentExercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  currentAnswer === index
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                } disabled:cursor-default`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Listening Options */}
        {currentExercise.type === 'listening' && currentExercise.options && (
          <div className="space-y-2">
            {currentExercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  currentAnswer === index
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                } disabled:cursor-default`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Reading/Text Input */}
        {currentExercise.type === 'reading' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Type your answer here"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyPress={handleTextInputKeyPress}
              disabled={isAnswered}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            />
            {!isAnswered && textInputValue.trim() && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Press Enter or click Submit to check your answer
                </p>
                <button
                  onClick={handleTextInputSubmit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <p className="font-semibold mb-2">
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {!isCorrect && (
            <p className="text-sm mb-2">
              <span className="font-medium">Correct answer: </span>
              {currentExercise.type === 'multiple-choice' || currentExercise.type === 'listening'
                ? currentExercise.options?.[currentExercise.correctAnswers[0] as number]
                : currentExercise.correctAnswers[0]}
            </p>
          )}
          {currentExercise.explanation && (
            <p className="text-sm">{currentExercise.explanation}</p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentExerciseIndex > 0 && (
          <button
            onClick={() => {
              setCurrentExerciseIndex(currentExerciseIndex - 1);
              setShowFeedback(false);
              setIsAnswered(false);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          {isLastExercise ? 'Complete Quiz' : 'Next'}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

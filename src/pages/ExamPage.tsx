import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { QuizInterface } from '@/components/Quiz/QuizInterface';
import type { QuizMistake } from '@/components/Quiz/QuizInterface';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { AudioPlayer } from '@/components/Audio/AudioPlayer';
import { useAuth } from '@/context/AuthContext';

interface Exercise {
  _id: string;
  type: 'multiple-choice' | 'listening' | 'reading';
  question: string;
  options?: string[];
  correctAnswers: (string | number)[];
  audioPrompt?: string;
  explanation?: string;
}

interface ExamContent {
  introduction: string;
  objectives: string[];
  mainContent: string;
  summary: string;
}

interface Exam {
  levelId: number;
  title: string;
  description: string;
  content: ExamContent;
  exercises: Exercise[];
  audioContent?: Array<{
    text: string;
    type: 'word' | 'phrase' | 'sentence';
    context?: string;
  }>;
}

export const ExamPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState<'intro' | 'exercises' | 'result'>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [examScore, setExamScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/lessons/${levelId}/exam`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch exam');
        }

        const data = await response.json();
        setExam(data.exam);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && levelId) {
      fetchExam();
    }
  }, [token, levelId]);

  const handleExamComplete = async (scores: number[], mistakes: QuizMistake[]) => {
    setIsSubmitting(true);
    const timeSpent = Math.round((Date.now() - startTime) / 60000);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const correctCount = scores.filter(s => s === 100).length;

    setExamScore(averageScore);
    setScoreBreakdown({
      correct: correctCount,
      total: scores.length,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/lessons/${levelId}/exam/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: averageScore,
          timeSpent,
          mistakes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      setCurrentSection('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exam result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentSection === 'intro') {
      setCurrentSection('exercises');
    } else if (currentSection === 'result') {
      navigate(`/learn/${levelId}`);
    }
  };

  const handleBack = () => {
    if (currentSection === 'exercises') {
      setCurrentSection('intro');
    } else if (currentSection === 'result') {
      navigate(`/learn/${levelId}`);
    } else {
      navigate(`/learn/${levelId}`);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading Exam...">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner message="Loading exam..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/learn/${levelId}`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Level
          </button>
        </div>
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout title="Exam Not Found">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Exam not found</p>
          <button
            onClick={() => navigate(`/learn/${levelId}`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Level
          </button>
        </div>
      </Layout>
    );
  }

  const sectionProgress = {
    intro: 1,
    exercises: 2,
    result: 3,
  };

  const progress = (sectionProgress[currentSection] / 3) * 100;

  return (
    <Layout title={exam.title}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Section {sectionProgress[currentSection]} of 3
        </p>
      </div>

      {/* Exam Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {currentSection === 'intro' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {exam.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {exam.content.introduction}
            </p>
            {exam.content.introduction && (
              <div className="mt-4">
                <AudioPlayer text={exam.content.introduction} />
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Exam Information:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>📋 <span className="font-semibold">{exam.exercises.length} questions</span> to complete</li>
                <li>⏱️ Take your time - there's no time limit</li>
                <li>📊 You need <span className="font-semibold">70% to pass</span></li>
                <li>🔓 Passing the exam unlocks the next level</li>
              </ul>
            </div>
          </div>
        )}

        {currentSection === 'exercises' && exam.exercises && exam.exercises.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Final Exam Questions
            </h2>
            <QuizInterface
              exercises={exam.exercises}
              onComplete={handleExamComplete}
              onCancel={() => navigate(`/learn/${levelId}`)}
            />
          </div>
        )}

        {currentSection === 'result' && examScore !== null && scoreBreakdown && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Exam Results
            </h2>

            <div className={`rounded-lg p-8 mb-6 text-center ${
              examScore >= 70
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900'
                : 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900'
            }`}>
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Final Score</p>
                <p className={`text-5xl font-bold ${
                  examScore >= 70 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {examScore}%
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-opacity-20 border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <span className="font-semibold">{scoreBreakdown.correct} out of {scoreBreakdown.total}</span> questions answered correctly
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Score Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Correct Answers:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{scoreBreakdown.correct}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Total Questions:</span>
                  <span className="font-semibold">{scoreBreakdown.total}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Accuracy:</span>
                  <span className="font-semibold">{Math.round((scoreBreakdown.correct / scoreBreakdown.total) * 100)}%</span>
                </div>
              </div>
            </div>

            {examScore >= 70 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                <p className="text-green-900 dark:text-green-300">
                  🎉 Congratulations! You passed the exam and unlocked the next level!
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
                <p className="text-orange-900 dark:text-orange-300">
                  📚 You need 70% to pass. Review the material and try again!
                </p>
              </div>
            )}
          </div>
        )}

        {isSubmitting && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner message="Saving your exam result..." />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentSection !== 'exercises' && !isSubmitting && (
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {currentSection === 'intro' ? 'Back to Level' : 'Back to Level'}
          </button>

          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {currentSection === 'intro' ? 'Start Exam' : 'Back to Level'}
          </button>
        </div>
      )}
    </Layout>
  );
};

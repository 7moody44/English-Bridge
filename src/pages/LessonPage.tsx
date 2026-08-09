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

interface LessonContent {
  introduction: string;
  objectives: string[];
  mainContent: string;
  summary: string;
}

interface Lesson {
  _id: string;
  levelId: number;
  lessonNumber: number;
  title: string;
  description: string;
  content: LessonContent;
  exercises: Exercise[];
  audioContent?: Array<{
    text: string;
    type: 'word' | 'phrase' | 'sentence';
    context?: string;
  }>;
}

export const LessonPage: React.FC = () => {
  const { levelId, lessonNumber } = useParams<{
    levelId: string;
    lessonNumber: string;
  }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState<'intro' | 'objectives' | 'content' | 'summary' | 'exercises' | 'review'>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [lessonScore, setLessonScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(
          `${apiUrl}/lessons/${levelId}/${lessonNumber}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }

        const data = await response.json();
        setLesson(data.lesson);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && levelId && lessonNumber) {
      fetchLesson();
    }
  }, [token, levelId, lessonNumber]);

  const handleQuizComplete = async (scores: number[], mistakes: QuizMistake[]) => {
    if (!lesson) return;

    setIsSubmitting(true);
    const timeSpent = Math.round((Date.now() - startTime) / 60000); // Convert to minutes
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const correctCount = scores.filter(s => s === 100).length;

    // Store review data
    setLessonScore(averageScore);
    setScoreBreakdown({
      correct: correctCount,
      total: scores.length,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(
        `${apiUrl}/lessons/${levelId}/${lessonNumber}/complete`,
        {
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
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit lesson completion');
      }

      // Show review section
      setCurrentSection('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    switch (currentSection) {
      case 'intro':
        setCurrentSection('objectives');
        break;
      case 'objectives':
        setCurrentSection('content');
        break;
      case 'content':
        setCurrentSection('summary');
        break;
      case 'summary':
        setCurrentSection('exercises');
        break;
      case 'review':
        navigate('/learn');
        break;
    }
  };

  const handleBack = () => {
    switch (currentSection) {
      case 'objectives':
        setCurrentSection('intro');
        break;
      case 'content':
        setCurrentSection('objectives');
        break;
      case 'summary':
        setCurrentSection('content');
        break;
      case 'exercises':
        setCurrentSection('summary');
        break;
      case 'review':
        setCurrentSection('exercises');
        break;
      case 'intro':
        navigate('/learn');
        break;
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner message="Loading lesson..." />
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
            onClick={() => navigate('/learn')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout title="Not Found">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Lesson not found</p>
          <button
            onClick={() => navigate('/learn')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </Layout>
    );
  }

  const sectionProgress = {
    intro: 1,
    objectives: 2,
    content: 3,
    summary: 4,
    exercises: 5,
    review: 6,
  };

  const progress = (sectionProgress[currentSection] / 6) * 100;

  return (
    <Layout title={lesson.title}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Section {sectionProgress[currentSection]} of 6
        </p>
      </div>

      {/* Lesson Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {currentSection === 'intro' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {lesson.content.introduction}
            </p>
            {lesson.content.introduction && (
              <div className="mt-4">
                <AudioPlayer text={lesson.content.introduction} />
              </div>
            )}
          </div>
        )}

        {currentSection === 'objectives' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Learning Objectives
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {lesson.content.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
            {lesson.content.objectives.length > 0 && (
              <div className="mt-4">
                <AudioPlayer text={lesson.content.objectives.join('. ')} />
              </div>
            )}
          </div>
        )}

        {currentSection === 'content' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Main Content
            </h2>
            <div className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {lesson.content.mainContent}
            </div>
            {lesson.content.mainContent && (
              <div className="mt-4">
                <AudioPlayer text={lesson.content.mainContent} />
              </div>
            )}
          </div>
        )}

        {currentSection === 'summary' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {lesson.content.summary}
            </p>
            {lesson.content.summary && (
              <div className="mt-4">
                <AudioPlayer text={lesson.content.summary} />
              </div>
            )}
          </div>
        )}

        {currentSection === 'exercises' && lesson.exercises && lesson.exercises.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Practice Exercises
            </h2>
            <QuizInterface
              exercises={lesson.exercises}
              onComplete={handleQuizComplete}
              onCancel={() => navigate('/learn')}
            />
          </div>
        )}

        {currentSection === 'review' && lessonScore !== null && scoreBreakdown && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Lesson Complete!
            </h2>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-8 mb-6 text-center">
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Your Score</p>
                <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                  {lessonScore}%
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <span className="font-semibold">{scoreBreakdown.correct} out of {scoreBreakdown.total}</span> questions answered correctly
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Breakdown
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

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-900 dark:text-blue-300">
                {lessonScore >= 70
                  ? '🎉 Great work! You have completed this lesson successfully.'
                  : '💡 Good effort! Consider reviewing the content and trying again to improve your score.'}
              </p>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner message="Saving your progress..." />
          </div>
        )}
      </div>

      {/* Navigation Buttons (only show for non-exercise sections) */}
      {currentSection !== 'exercises' && !isSubmitting && (
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {currentSection === 'intro' ? 'Back to Courses' : currentSection === 'review' ? 'Redo Exercises' : 'Previous'}
          </button>

          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {currentSection === 'summary' ? 'Start Exercises' : currentSection === 'review' ? 'Continue to Course' : 'Next'}
          </button>
        </div>
      )}
    </Layout>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { ContentCard } from '@/components/Shared/ContentCard';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

interface LessonSummary {
  id: string;
  levelId: number;
  lessonNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  score?: number;
  completedAt?: Date;
}

interface LevelLessonsData {
  lessons: LessonSummary[];
  totalLessons: number;
  completedLessons: number;
  examUnlocked: boolean;
}

export const CourseLessonsPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [data, setData] = useState<LevelLessonsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      if (!levelId) {
        setError('Invalid level parameters');
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(
          `${apiUrl}/lessons/${levelId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }

        const result = await response.json();
        setData({
          lessons: result.lessons || [],
          totalLessons: result.totalLessons || 0,
          completedLessons: result.completedLessons || 0,
          examUnlocked: result.examUnlocked || false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchLessons();
    }
  }, [levelId, token]);

  const handleLessonClick = (lessonNumber: number) => {
    navigate(`/learn/${levelId}/${lessonNumber}`);
  };

  const handleExamClick = () => {
    navigate(`/learn/${levelId}/exam`);
  };

  const handleBackClick = () => {
    navigate('/learn');
  };

  if (isLoading) {
    return (
      <Layout title={`Level ${levelId}`}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner message="Loading lessons..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={`Level ${levelId}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={handleBackClick}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Back to Levels
          </button>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout title={`Level ${levelId}`}>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No data available</p>
        </div>
      </Layout>
    );
  }

  const progress = data.totalLessons > 0 
    ? (data.completedLessons / data.totalLessons) * 100 
    : 0;

  return (
    <Layout title={`Level ${levelId}`}>
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={handleBackClick}
          className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <span className="mr-2">←</span>
          <span>Back to Levels</span>
        </button>

        {/* Level progress summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Level Progress
          </h2>
          <div className="mb-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-purple-600 dark:bg-purple-400 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.completedLessons} of {data.totalLessons} lessons completed ({Math.round(progress)}%)
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Take the final exam to unlock the next level.
        </p>

        {/* Lessons grid */}
        <div className="grid gap-4">
          {data.lessons.map((lesson) => {
            return (
              <ContentCard
                key={lesson.lessonNumber}
                title={`Lesson ${lesson.lessonNumber}: ${lesson.title}`}
                onClick={() => handleLessonClick(lesson.lessonNumber)}
                className="cursor-pointer"
              >
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {lesson.isCompleted ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Completed
                          {lesson.score !== undefined && ` - ${lesson.score}%`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Not started
                      </span>
                    )}
                  </div>
                </div>
              </ContentCard>
            );
          })}

          {/* Final Exam Card */}
          <ContentCard
            title="Final Exam"
            onClick={handleExamClick}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ready to take the exam! Test your knowledge.
              </p>
            </div>
          </ContentCard>
        </div>
      </div>
    </Layout>
  );
};

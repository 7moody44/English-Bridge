import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { ContentCard } from '@/components/Shared/ContentCard';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface Level {
  levelId: number;
  title: string;
  lessonsCompleted: number;
  totalLessons: number;
  isLocked: boolean;
  unlockedReason?: string;
}

export const LearnPage: React.FC = () => {
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get('/lessons/levels');
        setLevels(response.data.levels || []);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchLevels();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return (
      <Layout title="Learn">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner message="Loading levels..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Learn">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Learn">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Choose your level. Complete all 8 lessons to unlock the final exam.
        </p>

        <div className="grid gap-4">
          {levels.map((level) => {
            const progress = (level.lessonsCompleted / level.totalLessons) * 100;

            return (
              <ContentCard
                key={`${level.levelId}`}
                title={level.title}
                progress={progress}
                disabled={level.isLocked}
                onClick={() => {
                  if (!level.isLocked) {
                    navigate(`/learn/${level.levelId}`);
                  }
                }}
                className={level.isLocked ? '' : 'cursor-pointer'}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {level.lessonsCompleted} of {level.totalLessons} lessons completed
                  </p>
                  {level.isLocked && (
                    <span className="text-2xl">🔒</span>
                  )}
                </div>
                {level.isLocked && level.unlockedReason && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    {level.unlockedReason}
                  </p>
                )}
              </ContentCard>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

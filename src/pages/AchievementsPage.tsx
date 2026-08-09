import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { getAchievements } from '@/services/progressService';
import type { Achievement } from '@/services/progressService';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';

export const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading achievements..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-pink-500 dark:from-primary-800 dark:via-primary-900 dark:to-pink-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Achievements</h1>
        </div>
        <p className="text-sm opacity-90 mt-1 ml-9">
          {earned.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-5">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-primary-500 to-pink-500 h-2.5 rounded-full transition-all"
            style={{
              width: `${achievements.length ? (earned.length / achievements.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No achievements available yet.</p>
          </div>
        ) : (
          <>
            {earned.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Unlocked</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {earned.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 border-yellow-200 dark:border-yellow-700/60 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {a.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{a.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{a.description}</p>
                        {a.earnedAt && (
                          <p className="text-[11px] text-yellow-600 dark:text-yellow-400 mt-0.5">
                            Earned {new Date(a.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {locked.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {earned.length > 0 ? 'Locked' : 'Achievements to unlock'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {locked.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3 opacity-80"
                    >
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                        <span className="text-2xl grayscale">{a.icon}</span>
                        <Lock className="w-3.5 h-3.5 text-gray-400 absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{a.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;

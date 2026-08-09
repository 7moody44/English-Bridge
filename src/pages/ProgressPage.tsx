import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getProgressStats } from '@/services/progressService';
import { Star, Flame, Trophy, BarChart3 } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  useAuth(); // user unused
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    cefrLevel: 'A1',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const data = await getProgressStats();
        setStats({
          xp: data.xp,
          streak: data.streak,
          cefrLevel: data.cefrLevel,
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading your progress..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header - Standardized height */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-6 py-6 h-24 flex flex-col justify-center">
        <h1 className="text-2xl font-bold leading-tight">My Progress</h1>
      </div>

      {/* Main Stats Cards */}
      <div className="px-4 py-6 space-y-4">
        {/* CEFR Level */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Star className="w-7 h-7 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CEFR Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cefrLevel}</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-orange-600 dark:text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.streak} days</p>
            </div>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-purple-600 dark:text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.xp} XP</p>
            </div>
          </div>
        </div>

        {/* View Detailed Report Button */}
        <button
          onClick={() => navigate('/progress/detailed')}
          className="w-full bg-primary-600 dark:bg-primary-700 text-white py-4 rounded-2xl font-semibold 
            hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-5 h-5" />
          <span>View Detailed Report</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ProgressPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Calendar, Award, Target, Clock, BookOpen, Lock, Flame, Trophy } from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getProgressStats, getProgress } from '@/services/progressService';

interface DetailedStats {
  xp: number;
  streak: number;
  longestStreak: number;
  cefrLevel: string;
  certificates: number;
  completedLevels: number;
  completedLessons: number;
}

export const DetailedReportPage: React.FC = () => {
  const navigate = useNavigate();
  useAuth(); // user unused
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        setIsLoading(true);
        const data = await getProgressStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching detailed stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading detailed report..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load report</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/progress')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Detailed Report</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.xp}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total XP</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.streak}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.cefrLevel}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">CEFR Level</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.longestStreak}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Longest Streak</p>
          </div>
        </div>

        {/* Progress Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Learning Progress</h2>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Lessons completed</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.completedLessons}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Levels completed</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.completedLevels}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Certificates earned</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.certificates}</span>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Achievements</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {stats.xp > 0 
                ? `Keep learning! You've earned ${stats.xp} XP so far.`
                : 'Start learning to unlock achievements!'}
            </p>
          </div>
        </div>

        {/* View Certificates Button */}
        <button
          onClick={() => navigate('/certificates')}
          className="w-full bg-primary-600 dark:bg-primary-700 text-white py-4 rounded-2xl font-semibold 
            hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Award className="w-5 h-5" />
          <span>View Certificates</span>
        </button>
      </div>
    </div>
  );
};

export default DetailedReportPage;

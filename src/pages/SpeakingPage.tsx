import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, Clock, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { speakingService, type SpeakingTopicListItem } from '@/services/speakingService';

const levelFilters = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'pre-a1', label: 'Pre-A1', value: 'Pre-A1' },
  { id: 'a1', label: 'A1', value: 'A1' },
  { id: 'a2', label: 'A2', value: 'A2' },
  { id: 'b1', label: 'B1', value: 'B1' },
  { id: 'b2', label: 'B2', value: 'B2' },
  { id: 'c1', label: 'C1', value: 'C1' },
];

// Keep level → colour mapping consistent with the rest of the app.
const getLevelColor = (level: string): string => {
  const map: Record<string, string> = {
    'pre-a1': 'bg-purple-600 dark:bg-purple-700',
    'a1': 'bg-blue-600 dark:bg-blue-700',
    'a2': 'bg-indigo-600 dark:bg-indigo-700',
    'b1': 'bg-pink-600 dark:bg-pink-700',
    'b2': 'bg-rose-600 dark:bg-rose-700',
    'c1': 'bg-red-600 dark:bg-red-700',
  };
  return map[level.toLowerCase().replace(/\s/g, '-')] || 'bg-gray-600';
};

export const SpeakingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [topics, setTopics] = useState<SpeakingTopicListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await speakingService.getTopics(selectedLevel);
        setTopics(response.topics);
      } catch (err) {
        console.error('Error fetching speaking topics:', err);
        setError('Failed to load speaking topics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, [selectedLevel]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            <h1 className="text-xl font-bold">Speaking Practice</h1>
          </div>
        </div>
        <p className="text-sm opacity-90 mt-1 ml-9">Speak, get instant AI feedback</p>
      </div>

      {/* Level Filter Pills */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 sticky top-[68px] z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {levelFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedLevel(filter.value)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all
                ${
                  selectedLevel === filter.value
                    ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {topics.length} topic{topics.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Mic className="w-4 h-4" />
            <span>Tap a topic to start</span>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading topics..." />
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && topics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No speaking topics found for this level.
            </p>
          </div>
        )}

        {!isLoading && !error && topics.length > 0 && (
          <div className="space-y-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => navigate(`/practice/speaking/${topic.id}`)}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm
                  hover:shadow-md transition-all duration-200 active:scale-[0.98] group
                  border border-gray-200 dark:border-gray-700 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getLevelColor(topic.level)}`}>
                        {topic.level}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{topic.category}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl" aria-hidden="true">{topic.icon}</span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {topic.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {topic.description}
                    </p>

                    <div className="flex items-center gap-1 mt-2 text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{topic.duration} min</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <div className="flex items-center gap-1 px-3 py-2 bg-primary-600 dark:bg-primary-700
                      text-white rounded-lg text-sm font-medium group-hover:bg-primary-700
                      dark:group-hover:bg-primary-600 transition-colors">
                      <span>Speak</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingPage;

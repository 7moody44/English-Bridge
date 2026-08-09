import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { practiceService, type ReadingPassageListItem } from '@/services/practiceService';

const levelFilters = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'pre-a1', label: 'Pre-A1', value: 'pre-a1' },
  { id: 'a1', label: 'A1', value: 'a1' },
  { id: 'a1-a2', label: 'A1-A2', value: 'a1-a2' },
  { id: 'a2', label: 'A2', value: 'a2' },
  { id: 'a2-b1', label: 'A2-B1', value: 'a2-b1' },
  { id: 'b1', label: 'B1', value: 'b1' },
  { id: 'b1-b2', label: 'B1-B2', value: 'b1-b2' },
  { id: 'b2', label: 'B2', value: 'b2' },
  { id: 'b2-c1', label: 'B2-C1', value: 'b2-c1' },
  { id: 'c1', label: 'C1', value: 'c1' },
];

export const ReadingAloudPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [passages, setPassages] = useState<ReadingPassageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch passages from API
  useEffect(() => {
    const fetchPassages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await practiceService.getReadingPassages(selectedLevel);
        setPassages(response.passages);
      } catch (err) {
        console.error('Error fetching passages:', err);
        setError('Failed to load passages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassages();
  }, [selectedLevel]);

  const handlePassageClick = (passageId: string) => {
    navigate(`/practice/reading/${passageId}`);
  };

  const getLevelColor = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'pre-a1': 'bg-purple-600 dark:bg-purple-700',
      'a1': 'bg-blue-600 dark:bg-blue-700',
      'a1-a2': 'bg-purple-600 dark:bg-purple-700',
      'a2': 'bg-indigo-600 dark:bg-indigo-700',
      'a2-b1': 'bg-cyan-600 dark:bg-cyan-700',
      'b1': 'bg-purple-600 dark:bg-purple-700',
      'b1-b2': 'bg-pink-600 dark:bg-pink-700',
      'b2': 'bg-rose-600 dark:bg-rose-700',
      'b2-c1': 'bg-orange-600 dark:bg-orange-700',
      'c1': 'bg-red-600 dark:bg-red-700',
    };
    return levelMap[level.toLowerCase().replace(/\s/g, '-')] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Reading</h1>
        </div>
      </div>

      {/* Level Filter Pills */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 sticky top-14 z-10 border-b border-gray-200 dark:border-gray-700">
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

      {/* Passages List */}
      <div className="p-4">
        {/* Info Text */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {passages.length} passage{passages.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Volume2 className="w-4 h-4" />
            <span>Tap any passage for audio</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading passages..." />
          </div>
        )}

        {/* Error State */}
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

        {/* Empty State */}
        {!isLoading && !error && passages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No passages found for this level.
            </p>
          </div>
        )}

        {/* Passages */}
        {!isLoading && !error && passages.length > 0 && (
          <div className="space-y-3">
            {passages.map((passage) => (
              <button
                key={passage.id}
                onClick={() => handlePassageClick(passage.id)}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm 
                  hover:shadow-md transition-all duration-200 active:scale-[0.98] group
                  border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 text-left">
                    {/* Level Badge & Category */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getLevelColor(
                          passage.level
                        )}`}
                      >
                        {passage.level}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {passage.category}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Volume2 className="w-3 h-3" />
                        <span className="text-xs">{passage.duration} min</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {passage.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {passage.description}
                    </p>

                    {/* Question Count */}
                    <div className="flex items-center gap-1 mt-2 text-primary-600 dark:text-primary-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-xs font-medium">
                        {passage.questionCount} comprehension questions
                      </span>
                    </div>
                  </div>

                  {/* Start Button */}
                  <div className="flex-shrink-0">
                    <div
                      className="flex items-center gap-1 px-3 py-2 bg-primary-600 dark:bg-primary-700 
                      text-white rounded-lg text-sm font-medium group-hover:bg-primary-700 
                      dark:group-hover:bg-primary-600 transition-colors"
                    >
                      <span>Start</span>
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

export default ReadingAloudPage;

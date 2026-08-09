import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { Mic, BookOpen, Pencil, Headphones, ChevronRight, Gamepad2 } from 'lucide-react';

interface PracticeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  bgColor: string;
  iconColor: string;
}

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();

  const practiceOptions: PracticeOption[] = [
    {
      id: 'speaking',
      title: 'Speaking Practice',
      description: 'Improve your accent & fluency',
      icon: <Mic className="w-6 h-6" />,
      route: '/practice/speaking',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'reading',
      title: 'Reading Aloud',
      description: 'Read & get pronunciation score',
      icon: <BookOpen className="w-6 h-6" />,
      route: '/practice/reading',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'writing',
      title: 'Writing Workshop',
      description: 'AI-powered writing coach',
      icon: <Pencil className="w-6 h-6" />,
      route: '/practice/writing',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      id: 'listening',
      title: 'Listening Skills',
      description: 'Train your ear with native audio',
      icon: <Headphones className="w-6 h-6" />,
      route: '/practice/listening',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'games',
      title: 'Games & Activities',
      description: 'Fun learning games',
      icon: <Gamepad2 className="w-6 h-6" />,
      route: '/games',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
  ];

  const handleOptionClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header - Standardized height */}
      <div className="bg-primary-600 dark:bg-primary-800 text-white px-6 py-6 h-24 flex flex-col justify-center">
        <h1 className="text-2xl font-bold leading-tight">Practice</h1>
        <p className="text-sm opacity-90 mt-1">Choose a skill to practice</p>
      </div>

      {/* Practice Options */}
      <div className="p-6 space-y-4">
        {practiceOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.route)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl ${option.bgColor} 
              hover:shadow-md transition-all duration-200 active:scale-[0.98] group`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${option.bgColor} ${option.iconColor} 
                flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                {option.icon}
              </div>

              {/* Text */}
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 
              group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" 
            />
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PracticePage;

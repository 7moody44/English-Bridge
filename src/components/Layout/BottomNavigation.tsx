import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, Bot, BarChart3, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-6 h-6" />,
      path: '/home',
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: <BookOpen className="w-6 h-6" />,
      path: '/learn',
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: <Gamepad2 className="w-6 h-6" />,
      path: '/practice',
    },
    {
      id: 'tutor',
      label: 'AI Tutor',
      icon: <Bot className="w-6 h-6" />,
      path: '/tutor',
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/progress',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-6 h-6" />,
      path: '/profile',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full group relative"
              title={item.label}
            >
              {/* Tooltip on hover */}
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {item.label}
              </span>

              {/* Icon */}
              <div
                className={`transition-all duration-200 ${
                  active
                    ? 'text-primary-600 dark:text-primary-500 scale-110'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500 group-hover:scale-105'
                }`}
              >
                {item.icon}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 whitespace-nowrap transition-colors ${
                  active
                    ? 'text-primary-600 dark:text-primary-500 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <div className="absolute top-0 w-1 h-1 bg-primary-600 dark:bg-primary-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

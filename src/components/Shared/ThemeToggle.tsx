import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-2xl">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="text-sm font-medium">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

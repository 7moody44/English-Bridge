import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 dark:border-t-purple-400`} />
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      )}
    </div>
  );
};

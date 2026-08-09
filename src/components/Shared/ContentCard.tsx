import React, { type ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  title?: string;
  progress?: number;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  title,
  progress,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all ${
        !disabled && onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
      )}

      {progress !== undefined && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {children}
    </div>
  );
};

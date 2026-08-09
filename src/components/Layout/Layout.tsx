import React, { type ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import logo from '@/assets/logo.png';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, onBack }) => {
  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Header - Standardized height */}
      {title && (
        <header className="sticky top-0 bg-primary-600 dark:bg-primary-800 text-white px-6 py-6 h-24 flex items-center shadow-md z-10">
          <div className="flex items-center gap-4 w-full">
            {showBack && (
              <button
                onClick={onBack}
                className="text-2xl hover:opacity-80 transition"
              >
                ←
              </button>
            )}
            <img
              src={logo}
              alt="English Bridge"
              className="w-10 h-10 rounded-lg object-contain bg-white/20 shadow-md"
            />
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

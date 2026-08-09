import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgGradient?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  bgGradient = 'bg-primary-600 dark:bg-primary-800',
}) => {
  return (
    <div className={`${bgGradient} text-white px-6 py-6 h-24 flex flex-col justify-center`}>
      <h1 className="text-2xl font-bold leading-tight">{title}</h1>
      {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
    </div>
  );
};

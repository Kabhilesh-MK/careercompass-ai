import React from 'react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading career intelligence...',
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
          {message}
        </span>
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="card p-4 h-20 skeleton animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

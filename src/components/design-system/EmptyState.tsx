import React from 'react';
import { Compass } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`card p-10 flex flex-col items-center justify-center text-center space-y-3 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
        {icon || <Compass size={28} />}
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="btn-primary text-xs mt-3 px-4 py-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

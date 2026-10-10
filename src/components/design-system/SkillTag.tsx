import React from 'react';

interface SkillTagProps {
  name: string;
  level?: number;
  variant?: 'default' | 'verified' | 'accent' | 'critical';
  size?: 'xs' | 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

export const SkillTag: React.FC<SkillTagProps> = ({
  name,
  level,
  variant = 'default',
  size = 'sm',
  onRemove,
  className = '',
}) => {
  const sizeClass = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }[size];

  const variantClass = {
    default: 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700/80',
    verified: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    accent: 'bg-accent/10 text-cyan-600 dark:text-cyan-400 border-accent/20',
    critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border transition-all ${variantClass} ${sizeClass} ${className}`}
    >
      <span>{name}</span>
      {level !== undefined && (
        <span className="font-semibold opacity-80 text-[10px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
          {level}%
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none ml-0.5"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

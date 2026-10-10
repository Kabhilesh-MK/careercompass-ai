import React from 'react';
import { ProgressBar } from './ProgressBar';

interface SkillBarProps {
  name: string;
  proficiency: number;
  category?: string;
  target?: number;
  verified?: boolean;
  status?: 'Strong' | 'Developing' | 'Needs Attention';
  className?: string;
  onClick?: () => void;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  name,
  proficiency,
  category,
  target,
  verified = false,
  status,
  className = '',
  onClick,
}) => {
  const getStatusColor = (prof: number): 'success' | 'primary' | 'warning' | 'danger' => {
    if (prof >= 75) return 'success';
    if (prof >= 60) return 'primary';
    if (prof >= 45) return 'warning';
    return 'danger';
  };

  const variant = getStatusColor(proficiency);

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 hover:border-primary/40 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gray-900 dark:text-slate-100 truncate">
            {name}
          </span>
          {verified && (
            <span
              title="Verified by assessment or project"
              className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium"
            >
              ✓ Verified
            </span>
          )}
          {category && (
            <span className="text-[10px] text-gray-400 dark:text-slate-500 hidden sm:inline">
              • {category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {target !== undefined && (
            <span className="text-[11px] text-gray-400 dark:text-slate-500">
              Target: {target}%
            </span>
          )}
          <span className="font-bold text-gray-900 dark:text-slate-100">
            {proficiency}%
          </span>
        </div>
      </div>

      <ProgressBar value={proficiency} variant={variant} size="sm" />

      {status && (
        <div className="mt-1 flex justify-end">
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            {status}
          </span>
        </div>
      )}
    </div>
  );
};

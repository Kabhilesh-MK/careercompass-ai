import React from 'react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  selectedId,
  onSelect,
  className = '',
  size = 'sm',
}) => {
  const sizeClasses = {
    xs: 'text-[11px] px-2.5 py-1',
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-3.5 py-2',
  }[size];

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 ${className}`}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`inline-flex items-center gap-1.5 font-medium rounded-xl transition-all shrink-0 whitespace-nowrap ${sizeClasses} ${
              isSelected
                ? 'bg-primary text-white shadow-glow'
                : 'bg-slate-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-transparent dark:border-slate-800'
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-black/10 dark:bg-white/10 text-gray-500 dark:text-slate-400'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

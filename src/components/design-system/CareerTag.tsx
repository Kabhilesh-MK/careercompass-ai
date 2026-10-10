import React from 'react';
import { Compass } from 'lucide-react';

interface CareerTagProps {
  label: string;
  size?: 'xs' | 'sm' | 'md';
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CareerTag: React.FC<CareerTagProps> = ({
  label,
  size = 'sm',
  clickable = false,
  onClick,
  className = '',
}) => {
  const sizeClass = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border border-primary/20 bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-300 transition-all ${
        clickable ? 'hover:bg-primary/25 cursor-pointer hover:border-primary/40' : 'cursor-default'
      } ${sizeClass} ${className}`}
    >
      <Compass size={size === 'xs' ? 10 : 12} className="shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </button>
  );
};

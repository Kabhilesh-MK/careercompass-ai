import React from 'react';

export type StatusVariant = 
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'demo';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<StatusVariant, { bg: string; text: string; dot: string; border: string }> = {
  primary: {
    bg: 'bg-primary/10 dark:bg-primary/15',
    text: 'text-primary dark:text-primary-300',
    dot: 'bg-primary',
    border: 'border-primary/20',
  },
  secondary: {
    bg: 'bg-secondary/10 dark:bg-secondary/15',
    text: 'text-secondary dark:text-secondary-300',
    dot: 'bg-secondary',
    border: 'border-secondary/20',
  },
  accent: {
    bg: 'bg-accent/10 dark:bg-accent/15',
    text: 'text-accent dark:text-cyan-400',
    dot: 'bg-accent',
    border: 'border-accent/20',
  },
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/20',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-500/20',
  },
  danger: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    border: 'border-rose-500/20',
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-slate-800',
    text: 'text-gray-700 dark:text-slate-300',
    dot: 'bg-gray-400 dark:bg-slate-500',
    border: 'border-gray-200 dark:border-slate-700',
  },
  demo: {
    bg: 'bg-purple-950/60 border border-purple-500/30',
    text: 'text-purple-300 font-semibold uppercase tracking-wider',
    dot: 'bg-purple-400 animate-pulse',
    border: 'border-purple-500/40',
  },
};

const sizeStyles = {
  xs: 'text-[10px] px-2 py-0.5 rounded-full font-medium',
  sm: 'text-xs px-2.5 py-1 rounded-full font-medium',
  md: 'text-sm px-3 py-1.5 rounded-full font-medium',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  icon,
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border transition-colors ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
};

import type { ReactNode } from 'react';

export function Badge({
  children,
  color = 'primary',
  className = '',
}: {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
  className?: string;
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    gray: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`chip ${colors[color]} ${className}`}>{children}</span>;
}

export function Chip({
  children,
  active = false,
  onClick,
  className = '',
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip transition-all duration-200 ${
        active
          ? 'bg-primary text-white shadow-glow'
          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
      } ${className}`}
    >
      {children}
    </button>
  );
}

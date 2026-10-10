import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  badge?: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  trend,
  badge,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const accentBorder = {
    default: 'hover:border-slate-700/80',
    primary: 'border-l-4 border-l-primary hover:border-l-primary',
    accent: 'border-l-4 border-l-accent hover:border-l-accent',
    success: 'border-l-4 border-l-emerald-500 hover:border-l-emerald-500',
  }[variant];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`card p-5 relative overflow-hidden transition-all duration-200 ${accentBorder} ${
        onClick ? 'cursor-pointer hover:shadow-elevated' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
              {value}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-primary flex items-center justify-center shrink-0 border border-gray-100 dark:border-slate-700/60 shadow-sm">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive !== false
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.isPositive !== false ? '↑' : '↓'} {trend.value}
          </span>
          {trend.label && (
            <span className="text-gray-400 dark:text-slate-500">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

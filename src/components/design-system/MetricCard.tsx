import React from 'react';
import { ProgressBar } from './ProgressBar';

interface MetricItem {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: React.ReactNode;
  items?: MetricItem[];
  footer?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  items = [],
  footer,
  className = '',
}) => {
  return (
    <div className={`card p-5 space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">
              {value}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-600 dark:text-slate-300">{item.label}</span>
                <span className="text-gray-900 dark:text-slate-100 font-semibold">{item.value}%</span>
              </div>
              <ProgressBar
                value={item.value}
                max={item.max || 100}
                size="sm"
                color={item.color}
              />
            </div>
          ))}
        </div>
      )}

      {footer && (
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

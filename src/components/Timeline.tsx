import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TimelineItem {
  id: string;
  week: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  progress: number;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-slate-800" />
      <div className="space-y-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative pl-12"
          >
            <div
              className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                item.status === 'completed'
                  ? 'bg-success border-success text-white'
                  : item.status === 'in-progress'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400'
              }`}
            >
              {item.status === 'completed' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : item.status === 'in-progress' ? (
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              ) : (
                <span className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full" />
              )}
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-primary">{item.week}</span>
                <StatusBadge status={item.status} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.description}</p>
              {item.progress > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.status === 'completed' ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TimelineItem['status'] }) {
  const map = {
    completed: { label: 'Completed', cls: 'bg-success/10 text-success' },
    'in-progress': { label: 'In Progress', cls: 'bg-primary/10 text-primary' },
    upcoming: { label: 'Upcoming', cls: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400' },
  };
  const c = map[status];
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
          <div className="skeleton h-8 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

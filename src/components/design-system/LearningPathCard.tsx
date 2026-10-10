import React from 'react';
import { motion } from 'framer-motion';
import { Map, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { LearningPath } from '@/types/careerCompass';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface LearningPathCardProps {
  path: LearningPath;
  onSelect?: (path: LearningPath) => void;
  className?: string;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({
  path,
  onSelect,
  className = '',
}) => {
  const percentComplete = Math.round((path.completedStages / path.totalStages) * 100);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-elevated transition-all ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge
            label={path.careerTrack}
            size="xs"
            variant="primary"
            icon={<Map size={12} />}
          />
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {path.estimatedDuration}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            {path.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {path.description}
          </p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Layers size={13} className="text-primary" />
              {path.completedStages} of {path.totalStages} Stages Completed
            </span>
            <span className="font-bold text-gray-900 dark:text-slate-100">
              {percentComplete}%
            </span>
          </div>
          <ProgressBar value={percentComplete} size="sm" variant="primary" />
        </div>

        {/* Stage snapshots */}
        <div className="space-y-1.5 pt-1">
          {path.stages.slice(0, 3).map((stage) => (
            <div
              key={stage.stageNumber}
              className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-gray-600 dark:text-slate-300"
            >
              <div className="flex items-center gap-2 truncate">
                {stage.status === 'completed' ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
                <span className="truncate">{stage.title}</span>
              </div>
              <span className="text-[10px] font-semibold opacity-70 shrink-0 capitalize">
                {stage.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={() => onSelect && onSelect(path)}
          className="btn-primary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium"
        >
          <span>View Curriculum</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { CheckCircle2, Lock, ArrowRight, Play, BookOpen } from 'lucide-react';
import { RoadmapItem } from '@/types/careerCompass';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface RoadmapStepProps {
  item: RoadmapItem;
  onStart?: (item: RoadmapItem) => void;
  onContinue?: (item: RoadmapItem) => void;
  onComplete?: (item: RoadmapItem) => void;
  className?: string;
}

export const RoadmapStep: React.FC<RoadmapStepProps> = ({
  item,
  onStart,
  onContinue,
  onComplete,
  className = '',
}) => {
  const isCompleted = item.status === 'Completed';
  const isInProgress = item.status === 'In Progress';
  const isAvailable = item.status === 'Available';
  const isLocked = item.status === 'Locked';

  return (
    <div
      className={`card p-4 transition-all border ${
        isCompleted
          ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
          : isInProgress
          ? 'border-primary/40 bg-primary/[0.02] shadow-sm'
          : isAvailable
          ? 'border-gray-200 dark:border-slate-800 hover:border-primary/40'
          : 'border-dashed border-gray-200 dark:border-slate-800/60 opacity-65'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              label={item.status}
              size="xs"
              variant={
                isCompleted
                  ? 'success'
                  : isInProgress
                  ? 'primary'
                  : isAvailable
                  ? 'accent'
                  : 'neutral'
              }
              dot={isInProgress}
              icon={
                isCompleted ? (
                  <CheckCircle2 size={12} />
                ) : isLocked ? (
                  <Lock size={12} />
                ) : undefined
              }
            />
            <span className="text-xs font-semibold text-primary">
              Skill: {item.skill}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">
              (Current: {item.currentLevel}% → Target: {item.requiredLevel}%)
            </span>
          </div>

          <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            {item.title}
          </h4>

          <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-slate-400 pt-1">
            <span>
              <strong>Prerequisite:</strong> {item.prerequisite}
            </span>
            <span>
              <strong>Resource:</strong> {item.resource}
            </span>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="sm:text-right shrink-0 space-y-2 pt-2 sm:pt-0">
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
            <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
              {item.progress}% Progress
            </span>
            <div className="w-28">
              <ProgressBar
                value={item.progress}
                size="xs"
                variant={isCompleted ? 'success' : 'primary'}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            {isCompleted && onContinue && (
              <button
                type="button"
                onClick={() => onContinue(item)}
                className="btn-outline text-xs py-1 px-2.5 rounded-lg"
              >
                Review
              </button>
            )}

            {isInProgress && (
              <>
                {onContinue && (
                  <button
                    type="button"
                    onClick={() => onContinue(item)}
                    className="btn-primary text-xs py-1 px-2.5 rounded-lg flex items-center gap-1"
                  >
                    <Play size={11} fill="currentColor" />
                    <span>Continue</span>
                  </button>
                )}
                {onComplete && (
                  <button
                    type="button"
                    onClick={() => onComplete(item)}
                    className="btn text-xs py-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    title="Mark step as complete"
                  >
                    ✓ Complete
                  </button>
                )}
              </>
            )}

            {isAvailable && onStart && (
              <button
                type="button"
                onClick={() => onStart(item)}
                className="btn-primary text-xs py-1 px-3 rounded-lg flex items-center gap-1"
              >
                <BookOpen size={12} />
                <span>Start Step</span>
              </button>
            )}

            {isLocked && (
              <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                <Lock size={12} />
                <span>Prerequisites incomplete</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

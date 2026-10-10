import React from 'react';
import { RoadmapPhase, RoadmapItem } from '@/types/careerCompass';
import { RoadmapStep } from './RoadmapStep';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
  onStartStep?: (item: RoadmapItem) => void;
  onContinueStep?: (item: RoadmapItem) => void;
  onCompleteStep?: (item: RoadmapItem) => void;
  className?: string;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  phases,
  onStartStep,
  onContinueStep,
  onCompleteStep,
  className = '',
}) => {
  return (
    <div className={`space-y-8 relative ${className}`}>
      {phases.map((phase, idx) => {
        const isCompleted = phase.status === 'completed';
        const isCurrent = phase.status === 'current';
        const isLocked = phase.status === 'locked';

        return (
          <div key={phase.id} className="relative pl-8 sm:pl-10">
            {/* Vertical timeline connecting line */}
            {idx < phases.length - 1 && (
              <div
                className={`absolute left-3.5 sm:left-4 top-8 bottom-0 w-0.5 -ml-[1px] ${
                  isCompleted ? 'bg-emerald-500/40' : 'bg-gray-200 dark:bg-slate-800'
                }`}
              />
            )}

            {/* Timeline Phase Node */}
            <div
              className={`absolute left-0 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ${
                isCompleted
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                  : isCurrent
                  ? 'border-primary bg-primary text-white shadow-glow ring-4 ring-primary/20'
                  : 'border-gray-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} />
              ) : isLocked ? (
                <Lock size={14} />
              ) : (
                <span className="text-xs font-bold">{phase.phaseNumber}</span>
              )}
            </div>

            {/* Phase Header */}
            <div className="mb-3 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Phase {phase.phaseNumber}
                </span>
                <span className="text-gray-300 dark:text-slate-700">•</span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                  {phase.phaseTitle}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {phase.subtitle}
              </p>
            </div>

            {/* Steps in this phase */}
            <div className="space-y-3">
              {phase.items.map((item) => (
                <RoadmapStep
                  key={item.id}
                  item={item}
                  onStart={onStartStep}
                  onContinue={onContinueStep}
                  onComplete={onCompleteStep}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

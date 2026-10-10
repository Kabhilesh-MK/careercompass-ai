import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Clock, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { Simulation } from '@/types/careerCompass';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';
import { ProgressBar } from './ProgressBar';

interface SimulationCardProps {
  simulation: Simulation;
  onOpen?: (simulation: Simulation) => void;
  className?: string;
}

export const SimulationCard: React.FC<SimulationCardProps> = ({
  simulation,
  onOpen,
  className = '',
}) => {
  const isCompleted = simulation.status === 'Completed';
  const isInProgress = simulation.status === 'In Progress';
  const completedTasks = simulation.tasks.filter((t) => t.status === 'completed').length;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-elevated transition-all ${className}`}
    >
      <div className="space-y-3">
        {/* Company & track header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 truncate">
                {simulation.companyContext}
              </p>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight truncate">
                {simulation.title}
              </h3>
            </div>
          </div>
          <StatusBadge
            label={simulation.difficulty}
            size="xs"
            variant={simulation.difficulty === 'Advanced' ? 'warning' : 'neutral'}
          />
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {simulation.skills.map((skill, idx) => (
            <SkillTag key={idx} name={skill} size="xs" />
          ))}
        </div>

        {/* Meta / Task status */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {simulation.estimatedDuration}
            </span>
            <span className="font-semibold text-gray-700 dark:text-slate-300">
              {completedTasks} / {simulation.tasks.length} modules done
            </span>
          </div>

          <ProgressBar
            value={simulation.progress}
            size="xs"
            variant={isCompleted ? 'success' : 'accent'}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <StatusBadge
          label={simulation.status}
          size="xs"
          variant={isCompleted ? 'success' : isInProgress ? 'accent' : 'neutral'}
          dot
        />

        <button
          type="button"
          onClick={() => onOpen && onOpen(simulation)}
          className="btn-primary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={13} />
              <span>Review Simulation</span>
            </>
          ) : isInProgress ? (
            <>
              <Play size={12} fill="currentColor" />
              <span>Resume Tasks</span>
            </>
          ) : (
            <>
              <span>Enter Lab</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

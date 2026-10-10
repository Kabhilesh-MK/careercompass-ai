import React from 'react';
import { motion } from 'framer-motion';
import { Compass, TrendingUp, DollarSign, ArrowRight, GitCompare } from 'lucide-react';
import { Career } from '@/types/careerCompass';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';

interface CareerCardProps {
  career: Career;
  onExplore?: (career: Career) => void;
  onCompare?: (career: Career) => void;
  isSelectedForCompare?: boolean;
  className?: string;
}

export const CareerCard: React.FC<CareerCardProps> = ({
  career,
  onExplore,
  onCompare,
  isSelectedForCompare = false,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-elevated transition-all duration-200 ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
              {career.careerTrack}
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight mt-0.5">
              {career.title}
            </h3>
          </div>

          {career.demoMatchScore !== undefined && (
            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {career.demoMatchScore}% Match
              </span>
              <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">Demo score</p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {career.shortDescription}
        </p>

        {/* Badges / Metrics row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500 dark:text-slate-400">
          <StatusBadge
            label={career.learningDifficulty}
            size="xs"
            variant={
              career.learningDifficulty === 'Advanced' ? 'warning' : 'primary'
            }
          />
          <span className="flex items-center gap-1">
            <DollarSign size={12} className="text-emerald-500" />
            {career.salaryRange}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} className="text-accent" />
            Demand: {career.demandRating}
          </span>
        </div>

        {/* Core skills */}
        <div className="pt-2">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            Core Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {career.coreSkills.slice(0, 4).map((skill, idx) => (
              <SkillTag key={idx} name={skill} size="xs" />
            ))}
            {career.coreSkills.length > 4 && (
              <span className="text-[10px] text-gray-400 self-center">
                +{career.coreSkills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Typical tools */}
        {career.typicalTools && career.typicalTools.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Typical Tools
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
              {career.typicalTools.slice(0, 4).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {onCompare && (
          <button
            type="button"
            onClick={() => onCompare(career)}
            className={`btn text-xs py-1.5 px-2.5 rounded-lg border transition-all flex items-center gap-1 ${
              isSelectedForCompare
                ? 'bg-secondary/20 text-secondary border-secondary/40 font-semibold'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitCompare size={13} />
            {isSelectedForCompare ? 'Selected' : 'Compare'}
          </button>
        )}

        {onExplore && (
          <button
            type="button"
            onClick={() => onExplore(career)}
            className="btn-primary text-xs py-1.5 px-3 rounded-lg ml-auto flex items-center gap-1"
          >
            <span>Explore</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

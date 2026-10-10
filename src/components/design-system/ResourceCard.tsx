import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, BookOpen, CheckCircle2, Play } from 'lucide-react';
import { LearningResource } from '@/types/careerCompass';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';
import { ProgressBar } from './ProgressBar';

interface ResourceCardProps {
  resource: LearningResource;
  onAction?: (resource: LearningResource) => void;
  className?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onAction,
  className = '',
}) => {
  const platformColor = {
    Coursera: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    DataCamp: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Pluralsight: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    Forage: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    edX: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    Internal: 'text-primary bg-primary/10 border-primary/20',
    'Official Docs': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  }[resource.platform] || 'text-gray-500 bg-gray-500/10';

  const isCompleted = resource.progress === 100;
  const isInProgress = (resource.progress || 0) > 0 && !isCompleted;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-elevated transition-all duration-200 ${className}`}
    >
      <div className="space-y-3">
        {/* Top meta */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${platformColor}`}>
            {resource.platform}
          </span>
          <div className="flex items-center gap-1.5">
            {resource.badge && (
              <StatusBadge
                label={resource.badge}
                size="xs"
                variant={resource.badge === 'Completed' ? 'success' : resource.badge === 'Closing Gap' ? 'accent' : 'primary'}
              />
            )}
            <StatusBadge label={resource.level} size="xs" variant="neutral" />
          </div>
        </div>

        {/* Title */}
        <div>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            {resource.resourceType}
          </span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight mt-0.5 line-clamp-2">
            {resource.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {resource.skills.slice(0, 3).map((skill, idx) => (
            <SkillTag key={idx} name={skill} size="xs" />
          ))}
          {resource.skills.length > 3 && (
            <span className="text-[10px] text-gray-400 self-center">
              +{resource.skills.length - 3}
            </span>
          )}
        </div>

        {/* Duration & Progress */}
        <div className="pt-1 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {resource.duration}
          </span>
          {resource.progress !== undefined && (
            <span className="font-semibold text-gray-700 dark:text-slate-300">
              {resource.progress}% complete
            </span>
          )}
        </div>

        {resource.progress !== undefined && resource.progress > 0 && (
          <ProgressBar
            value={resource.progress}
            size="xs"
            variant={isCompleted ? 'success' : 'primary'}
          />
        )}
      </div>

      {/* CTA Footer */}
      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary flex items-center gap-1 font-medium transition-colors"
          >
            <span>Curriculum</span>
            <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-[11px] text-gray-400 dark:text-slate-500 italic">
            Catalog Resource
          </span>
        )}

        <button
          type="button"
          onClick={() => onAction && onAction(resource)}
          className={`btn text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
            isCompleted
              ? 'btn-outline text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : isInProgress
              ? 'btn-primary'
              : 'btn-secondary'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={13} />
              <span>Review</span>
            </>
          ) : isInProgress ? (
            <>
              <Play size={13} fill="currentColor" />
              <span>Continue</span>
            </>
          ) : (
            <>
              <BookOpen size={13} />
              <span>Start Course</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

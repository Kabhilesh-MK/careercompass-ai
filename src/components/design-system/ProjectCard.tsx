import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FolderGit2, ArrowRight, Github, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types/careerCompass';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';
import { ProgressBar } from './ProgressBar';

interface ProjectCardProps {
  project: Project;
  onOpenDetails?: (project: Project) => void;
  onStatusChange?: (project: Project, newStatus: Project['status']) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenDetails,
  onStatusChange,
  className = '',
}) => {
  const isCompleted = project.status === 'Completed';
  const isInProgress = project.status === 'In Progress';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-elevated transition-all ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge
            label={project.status}
            size="xs"
            variant={
              isCompleted ? 'success' : isInProgress ? 'primary' : 'neutral'
            }
            dot
          />
          <StatusBadge
            label={project.difficulty}
            size="xs"
            variant={project.difficulty === 'Advanced' ? 'warning' : 'neutral'}
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight line-clamp-1">
            {project.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {project.problemStatement}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {project.skills.slice(0, 4).map((skill, idx) => (
            <SkillTag key={idx} name={skill} size="xs" />
          ))}
          {project.skills.length > 4 && (
            <span className="text-[10px] text-gray-400 self-center">
              +{project.skills.length - 4}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="pt-1 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {project.estimatedDuration}
          </span>
          <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-300">
            {project.tasks.filter((t) => t.completed).length} / {project.tasks.length} tasks
          </span>
        </div>

        {project.progress > 0 && (
          <ProgressBar
            value={project.progress}
            size="xs"
            variant={isCompleted ? 'success' : 'primary'}
          />
        )}
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <Github size={15} />
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors"
              title="Live Demo"
            >
              <ExternalLink size={15} />
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenDetails && onOpenDetails(project)}
          className="btn-primary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium ml-auto"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={13} />
              <span>Review Project</span>
            </>
          ) : isInProgress ? (
            <>
              <span>Continue</span>
              <ArrowRight size={13} />
            </>
          ) : (
            <>
              <FolderGit2 size={13} />
              <span>Start Project</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

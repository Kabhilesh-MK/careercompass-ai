import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Map,
  ArrowRight,
  Layers,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  BookOpen,
} from 'lucide-react';
import { DEMO_LEARNING_PATHS } from '@/data/learningResources';
import { StatusBadge, ProgressBar } from '@/components/design-system';

export default function LearningPathsView() {
  const navigate = useNavigate();
  const [selectedPathId, setSelectedPathId] = useState<string>(DEMO_LEARNING_PATHS[0].id);

  const selectedPath =
    DEMO_LEARNING_PATHS.find((p) => p.id === selectedPathId) || DEMO_LEARNING_PATHS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Structured Learning Paths
            </h1>
            <StatusBadge label="Curriculum V2" size="xs" variant="primary" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            End-to-end staged progression roadmaps engineered for target career specializations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Map size={14} className="text-primary" />
          <span>My Active Roadmap</span>
        </button>
      </div>

      {/* Path Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DEMO_LEARNING_PATHS.map((path) => (
          <button
            key={path.id}
            type="button"
            onClick={() => setSelectedPathId(path.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedPath.id === path.id
                ? 'bg-primary text-white border-primary shadow-glow'
                : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-slate-300 border-gray-100 dark:border-slate-800 hover:border-primary/40'
            }`}
          >
            <GraduationCap size={15} />
            <span>{path.title}</span>
          </button>
        ))}
      </div>

      {/* Selected Path Hero Banner */}
      <div className="card p-6 bg-gradient-to-br from-[#111827] via-[#161F36] to-[#111827] border-primary/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge
            label={selectedPath.careerTrack}
            size="xs"
            variant="accent"
          />
          <span className="text-xs font-semibold text-gray-400">
            Estimated Duration: {selectedPath.estimatedDuration}
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {selectedPath.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {selectedPath.description}
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5 max-w-md">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Overall Track Completion</span>
            <span className="font-bold text-primary">
              {Math.round((selectedPath.completedStages / selectedPath.totalStages) * 100)}%
            </span>
          </div>
          <ProgressBar
            value={(selectedPath.completedStages / selectedPath.totalStages) * 100}
            size="sm"
            variant="primary"
          />
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Curriculum Stages ({selectedPath.stages.length} Milestones)
        </h3>

        <div className="space-y-3">
          {selectedPath.stages.map((stage) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in-progress';
            const isAvailable = stage.status === 'available';
            const isLocked = stage.status === 'locked';

            return (
              <div
                key={stage.stageNumber}
                className={`card p-5 border transition-all ${
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                    : isInProgress
                    ? 'border-primary/40 bg-primary/[0.02] shadow-sm'
                    : isAvailable
                    ? 'border-gray-200 dark:border-slate-800'
                    : 'border-dashed border-gray-200 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                        Stage {stage.stageNumber}
                      </span>
                      <StatusBadge
                        label={stage.status}
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
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                      {stage.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                      {stage.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-[11px] font-semibold text-gray-400">
                        Skills:
                      </span>
                      {stage.skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Progress and Action */}
                  <div className="sm:text-right shrink-0 space-y-2 pt-2 sm:pt-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-100 block">
                      {stage.progress}% Complete
                    </span>

                    <div className="w-28 sm:ml-auto">
                      <ProgressBar
                        value={stage.progress}
                        size="xs"
                        variant={isCompleted ? 'success' : 'primary'}
                      />
                    </div>

                    <div>
                      {isCompleted ? (
                        <button
                          type="button"
                          className="btn-outline text-xs py-1 px-3 rounded-lg"
                        >
                          Review Modules
                        </button>
                      ) : isInProgress ? (
                        <button
                          type="button"
                          onClick={() => navigate('/learning/courses')}
                          className="btn-primary text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1 font-semibold"
                        >
                          <Play size={11} fill="currentColor" />
                          <span>Resume Stage</span>
                        </button>
                      ) : isAvailable ? (
                        <button
                          type="button"
                          onClick={() => navigate('/learning/courses')}
                          className="btn-primary text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1"
                        >
                          <BookOpen size={12} />
                          <span>Enroll</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Lock size={12} />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

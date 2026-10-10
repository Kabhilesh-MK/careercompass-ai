import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Map,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  BookOpen,
  FolderGit2,
  Calendar,
  Flame,
  Info,
  Compass,
} from 'lucide-react';
import {
  StatCard,
  SkillRing,
  ProgressBar,
  StatusBadge,
} from '@/components/design-system';
import { useAppState } from '@/hooks/useAppState';
import { useLearning } from '@/hooks/useLearning';

export default function LearningProgressPage() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const { completedResources, projects, completedSimulations } = useLearning();

  const intel = state.careerIntelligence?.intelligenceResult;
  const targetCareer = state.careerIntelligence?.activeTargetCareer || 'AI & Machine Learning Engineering';
  const targetSource = state.careerIntelligence?.targetSource || 'model_prediction';
  const roadmapProgress = state.careerIntelligence?.roadmapProgress || {};

  // Roadmap metrics
  const roadmapItems = intel?.roadmap || [];
  const totalRoadmapItems = roadmapItems.length;
  const completedRoadmapCount = roadmapItems.filter(
    (i: any) => (roadmapProgress[i.id] || i.status) === 'completed'
  ).length;
  const inProgressRoadmapCount = roadmapItems.filter(
    (i: any) => (roadmapProgress[i.id] || i.status) === 'in_progress'
  ).length;
  const remainingRoadmapCount = Math.max(0, totalRoadmapItems - completedRoadmapCount);
  const roadmapCompletionPercent =
    totalRoadmapItems > 0 ? Math.round((completedRoadmapCount / totalRoadmapItems) * 100) : 0;

  // Skill Coverage metrics from ontology
  const coverage = intel?.required_skill_coverage;
  const coveragePercent = coverage ? coverage.percentage : 0;
  const presentSkillsCount = intel?.present_required_skills?.length || 0;
  const missingSkillsCount = intel?.missing_required_skills?.length || 0;

  const weeklyActivity = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 5.0 },
    { day: 'Sun', hours: 2.0 },
  ];
  const maxHours = Math.max(...weeklyActivity.map((d) => d.hours));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Progress & Growth Analytics
            </h1>
            <StatusBadge label="Telemetry Phase 5" size="xs" variant="primary" dot />
            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
              Task Completion & Coverage Tracking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Empirical velocity tracking of completed roadmap milestones, verified skills acquired, and learning catalog engagement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto font-semibold shadow-glow"
        >
          <span>Continue Roadmap</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Target Role & Completion Banner */}
      <div className="card p-6 bg-gradient-to-br from-[#111827] via-[#161F36] to-[#111827] border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Current Career Objective
              </span>
              <StatusBadge
                label={targetSource === 'model_prediction' ? 'Predicted by ML' : 'Selected by You'}
                size="xs"
                variant={targetSource === 'model_prediction' ? 'primary' : 'success'}
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight" id="progress-target-career">
              {targetCareer}
            </h2>
            <p className="text-xs text-gray-400 max-w-xl">
              Progress is measured by completed roadmap learning tasks and verified canonical competency coverage, not
              speculative proficiency percentages or ML confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 shrink-0 text-center">
            <div className="flex flex-col items-center">
              <SkillRing value={roadmapCompletionPercent} size={90} sublabel="Tasks" color="#6366F1" />
              <span className="text-xs font-bold text-white mt-2">Roadmap Completion</span>
              <span className="text-[10px] text-gray-400">{completedRoadmapCount} of {totalRoadmapItems} milestones</span>
            </div>

            <div className="flex flex-col items-center">
              <SkillRing value={Math.round(coveragePercent)} size={90} sublabel="Coverage" color="#10B981" />
              <span className="text-xs font-bold text-white mt-2">Required Coverage</span>
              <span className="text-[10px] text-gray-400">{presentSkillsCount} of {presentSkillsCount + missingSkillsCount} skills</span>
            </div>

            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <SkillRing
                value={completedResources.length > 0 ? Math.min(100, completedResources.length * 25) : 0}
                size={90}
                sublabel="Catalog"
                color="#F59E0B"
              />
              <span className="text-xs font-bold text-white mt-2">Courses Done</span>
              <span className="text-[10px] text-gray-400">{completedResources.length} completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Completed Roadmap Skills"
          value={completedRoadmapCount}
          subtitle={`${roadmapCompletionPercent}% of career progression path`}
          variant="primary"
          icon={<CheckCircle2 size={18} className="text-primary" />}
        />
        <StatCard
          label="Remaining Roadmap Skills"
          value={remainingRoadmapCount}
          subtitle={`${inProgressRoadmapCount} currently in progress`}
          variant="default"
          icon={<Clock size={18} className="text-amber-500" />}
        />
        <StatCard
          label="Verified Skills in Track"
          value={presentSkillsCount}
          subtitle="Satisfied ontology requirements"
          variant="success"
          icon={<Target size={18} className="text-emerald-500" />}
        />
        <StatCard
          label="Target Competency Gaps"
          value={missingSkillsCount}
          subtitle="Awaiting roadmap completion"
          variant="accent"
          icon={<TrendingUp size={18} className="text-rose-500" />}
        />
      </div>

      {/* Two Column Layout: Milestone Breakdown & Study Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Staged Milestone Completion Matrix */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Staged Milestone Completion
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Discrete task-completion across the 5 career progression stages
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/roadmap')}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Manage Milestones</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {roadmapItems.map((item: any) => {
              const currentStatus = roadmapProgress[item.id] || item.status;
              const isCompleted = currentStatus === 'completed';
              const isInProgress = currentStatus === 'in_progress';

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{item.title}</span>
                      <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10">
                        S{item.stage}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono block">Skill: {item.skill}</span>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <StatusBadge
                      label={isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                      size="xs"
                      variant={isCompleted ? 'success' : isInProgress ? 'warning' : 'neutral'}
                    />
                    <div className="w-16 hidden sm:block">
                      <ProgressBar
                        value={isCompleted ? 100 : isInProgress ? 50 : 0}
                        size="xs"
                        variant={isCompleted ? 'success' : 'primary'}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {roadmapItems.length === 0 && (
              <p className="text-xs text-gray-400 py-6 text-center">
                No roadmap items found. Please visit the Skill Gap or Roadmap page to generate your career plan.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Study Velocity & Activity */}
        <div className="space-y-6">
          {/* Weekly Velocity */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Study Velocity</h3>
                <span className="text-xs text-gray-400">Hours invested this week</span>
              </div>
              <Flame size={16} className="text-amber-500" />
            </div>

            <div className="flex items-end justify-between gap-2 h-36 pt-4">
              {weeklyActivity.map((day) => {
                const heightPercent = Math.round((day.hours / maxHours) * 100);
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] text-gray-400 font-mono">{day.hours}h</div>
                    <div className="w-full bg-slate-800 rounded-t-md relative flex items-end h-24 overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-accent rounded-t-md transition-all"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Governance Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-gray-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Info size={14} />
              <span>Metrics Governance</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              <strong>Roadmap Completion = completed roadmap items / total roadmap items.</strong> This represents
              user task completion progress. It is not an ML model probability or an automated career readiness
              judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

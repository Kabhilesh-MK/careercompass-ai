import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map,
  Target,
  ArrowRight,
  Sparkles,
  GitBranch,
  Layers,
  CheckCircle2,
  BookOpen,
  Clock,
  Play,
  RotateCcw,
  Check,
  Compass,
  AlertCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  StatusBadge,
  ProgressBar,
  StatCard,
} from '@/components/design-system';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/context/ToastContext';
import {
  evaluateCareerIntelligence,
  CareerIntelligenceResponse,
  RoadmapItem,
} from '@/services/api/careerIntelligence';

const STAGE_COLORS: Record<number, string> = {
  1: 'from-blue-600 to-indigo-600',
  2: 'from-indigo-600 to-violet-600',
  3: 'from-violet-600 to-purple-600',
  4: 'from-purple-600 to-pink-600',
  5: 'from-pink-600 to-rose-600',
};

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { state, dispatch } = useAppState();

  const persistedIntel = state.careerIntelligence?.intelligenceResult as CareerIntelligenceResponse | null;
  const persistedTrack = state.careerIntelligence?.activeTargetCareer || 'AI & Machine Learning Engineering';
  const persistedSkills = state.careerIntelligence?.selectedSkills || [];
  const roadmapProgress = state.careerIntelligence?.roadmapProgress || {};

  const [targetTrack, setTargetTrack] = useState<string>(persistedTrack);
  const [intelligence, setIntelligence] = useState<CareerIntelligenceResponse | null>(persistedIntel);
  const [isLoading, setIsLoading] = useState<boolean>(!persistedIntel);
  const [loadError, setLoadError] = useState<string | null>(null);

  const defaultSkills = useMemo(() => {
    if (persistedSkills.length > 0) return persistedSkills;
    const latestPred = state.predictionHistory.find((p) => p.isRealMl);
    if (latestPred && latestPred.submittedSkills?.length) return latestPred.submittedSkills;
    return ['python', 'machine_learning', 'data_analysis'];
  }, [persistedSkills, state.predictionHistory]);

  const loadRoadmap = async (skillsToRun: string[], track: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await evaluateCareerIntelligence({
        skills: skillsToRun,
        target_career_track: track,
      });
      setIntelligence(response);
      dispatch({
        type: 'SET_CAREER_INTELLIGENCE',
        payload: {
          intelligence: response,
          selectedSkills: skillsToRun,
        },
      });
    } catch (err: any) {
      setLoadError(err?.userMessage || 'Failed to load career roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!persistedIntel) {
      loadRoadmap(defaultSkills, targetTrack);
    }
  }, []);

  const roadmapItems = intelligence?.roadmap || [];

  // Group items by stage (1-5)
  const stages = useMemo(() => {
    const grouped: Record<number, { title: string; items: RoadmapItem[] }> = {};
    for (const item of roadmapItems) {
      if (!grouped[item.stage]) {
        grouped[item.stage] = {
          title: item.stage_title,
          items: [],
        };
      }
      grouped[item.stage].items.push(item);
    }
    return Object.entries(grouped)
      .map(([stageStr, data]) => ({
        stageNumber: Number(stageStr),
        title: data.title,
        items: data.items,
      }))
      .sort((a, b) => a.stageNumber - b.stageNumber);
  }, [roadmapItems]);

  // Compute overall completion stats
  const totalItems = roadmapItems.length;
  const completedCount = roadmapItems.filter(
    (item) => (roadmapProgress[item.id] || item.status) === 'completed'
  ).length;
  const inProgressCount = roadmapItems.filter(
    (item) => (roadmapProgress[item.id] || item.status) === 'in_progress'
  ).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleStatusChange = (itemId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    dispatch({
      type: 'UPDATE_INTELLIGENCE_ROADMAP_STATUS',
      payload: { itemId, status: newStatus },
    });
    if (newStatus === 'completed') {
      addToast('Milestone marked as completed!', 'success');
    } else if (newStatus === 'in_progress') {
      addToast('Milestone marked as in-progress.', 'info');
    } else {
      addToast('Milestone status reset.', 'info');
    }
  };

  const isModelPredicted = intelligence?.target_source === 'model_prediction';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              My Career Roadmap
            </h1>
            <StatusBadge label="5-Stage Engine Phase 5" size="xs" variant="primary" dot />
            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
              Deterministic Progressive Milestones
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Personalized, prerequisite-aware roadmap generated from the authoritative career competency framework.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/skills/gap')}
            className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
            id="view-skill-gap-btn"
          >
            <GitBranch size={14} className="text-primary" />
            <span>Target Skill Gap</span>
          </button>
          <button
            type="button"
            onClick={() => loadRoadmap(defaultSkills, targetTrack)}
            disabled={isLoading}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold"
            id="reload-roadmap-btn"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Roadmap</span>
          </button>
        </div>
      </div>

      {/* Target Career Objective Banner */}
      <div className="card p-6 bg-gradient-to-r from-[#111827] via-[#161F36] to-[#111827] border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Active Career Objective
            </span>
            <StatusBadge
              label={isModelPredicted ? 'Predicted by ML' : 'Selected by You'}
              size="xs"
              variant={isModelPredicted ? 'primary' : 'success'}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight" id="roadmap-target-track-title">
            {intelligence?.target_career_track || targetTrack}
          </h2>
          <p className="text-xs text-gray-400">
            Roadmap progression dynamically ordered from foundational prerequisites to advanced capstones.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Roadmap Completion</span>
            <span className="text-xl font-black text-primary font-mono" id="roadmap-completion-percent">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-24">
            <ProgressBar value={completionPercentage} size="sm" variant="primary" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {loadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Milestones"
          value={totalItems}
          subtitle="Curated across 5 progression stages"
          variant="primary"
          icon={<Map size={18} className="text-primary" />}
        />
        <StatCard
          label="Completed Milestones"
          value={completedCount}
          subtitle={`${completionPercentage}% task completion progress`}
          variant="success"
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          subtitle="Active study milestones underway"
          variant="default"
          icon={<Clock size={18} className="text-amber-500" />}
        />
      </div>

      {/* Staged Roadmap Timeline */}
      <div className="space-y-6">
        {stages.map((stage) => {
          const stageItems = stage.items;
          const stageCompleted = stageItems.filter(
            (i) => (roadmapProgress[i.id] || i.status) === 'completed'
          ).length;
          const stagePercent = stageItems.length > 0 ? Math.round((stageCompleted / stageItems.length) * 100) : 0;

          return (
            <div
              key={stage.stageNumber}
              className="card overflow-hidden border-slate-800 bg-slate-950/60 shadow-card"
              id={`roadmap-stage-${stage.stageNumber}`}
            >
              {/* Stage Header */}
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                      STAGE_COLORS[stage.stageNumber] || 'from-primary to-accent'
                    } flex items-center justify-center text-white font-black text-xs font-mono shadow-sm`}
                  >
                    S{stage.stageNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{stage.title}</h3>
                    <span className="text-[11px] text-gray-400">
                      {stageCompleted} of {stageItems.length} competencies completed ({stagePercent}%)
                    </span>
                  </div>
                </div>

                <div className="w-32">
                  <ProgressBar value={stagePercent} size="xs" variant={stagePercent === 100 ? 'success' : 'primary'} />
                </div>
              </div>

              {/* Stage Items Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {stageItems.map((item) => {
                  const currentStatus = roadmapProgress[item.id] || item.status;
                  const isCompleted = currentStatus === 'completed';
                  const isInProgress = currentStatus === 'in_progress';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                      id={`roadmap-item-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white block">{item.title}</span>
                          </div>
                          <span className="text-[11px] font-mono text-primary mt-0.5 block">
                            Skill: {item.skill}
                          </span>
                        </div>
                        <StatusBadge
                          label={
                            isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'
                          }
                          size="xs"
                          variant={isCompleted ? 'success' : isInProgress ? 'warning' : 'neutral'}
                        />
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>

                      {/* Prerequisites info */}
                      {item.prerequisites.length > 0 && (
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                          <span>Prereqs:</span>
                          <span
                            className={item.prerequisites_met ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}
                          >
                            {item.prerequisites.join(', ')} ({item.prerequisites_met ? 'Met' : 'Pending'})
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => navigate('/learning')}
                          className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                        >
                          <BookOpen size={12} />
                          <span>Resources</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'not_started')}
                              className="text-[10px] py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold flex items-center gap-1"
                              title="Undo completion"
                            >
                              <RotateCcw size={10} />
                              <span>Undo</span>
                            </button>
                          ) : isInProgress ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'completed')}
                                className="text-[10px] py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow-sm"
                              >
                                <Check size={11} />
                                <span>Complete</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'not_started')}
                                className="text-[10px] py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400"
                                title="Reset"
                              >
                                <RotateCcw size={10} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'in_progress')}
                              className="text-[10px] py-1 px-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <Play size={10} />
                              <span>Start</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Academic Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-gray-400 flex items-start gap-2.5">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Academic Governance Note: </strong>
          Roadmap completion is a milestone tracking metric reflecting completed study tasks. It is not an ML
          prediction score or statistical proficiency estimate. Machine learning predictions are generated strictly
          via the locked Random Forest model on the prediction route.
        </span>
      </div>
    </div>
  );
}

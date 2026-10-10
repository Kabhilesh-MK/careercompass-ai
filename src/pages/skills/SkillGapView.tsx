import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Target,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  Info,
  Check,
  AlertCircle,
  Compass,
} from 'lucide-react';
import {
  StatusBadge,
  ProgressBar,
  StatCard,
} from '@/components/design-system';
import { useAppState } from '@/hooks/useAppState';
import {
  evaluateCareerIntelligence,
  CareerIntelligenceResponse,
  CareerIntelligenceError,
} from '@/services/api/careerIntelligence';
import { getCareerSkillVocabulary } from '@/services/api/mlInference';

const SUPPORTED_ML_TRACKS = [
  'Software Development & Engineering',
  'AI & Machine Learning Engineering',
  'Data Analytics & Business Intelligence',
  'Cloud, DevOps & Systems Engineering',
];

export default function SkillGapView() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const persistedIntel = state.careerIntelligence?.intelligenceResult as CareerIntelligenceResponse | null;
  const persistedTrack = state.careerIntelligence?.activeTargetCareer || 'AI & Machine Learning Engineering';
  const persistedSkills = state.careerIntelligence?.selectedSkills || [];

  // Determine active skills to evaluate
  const defaultSkills = useMemo(() => {
    if (persistedSkills.length > 0) return persistedSkills;
    const latestPred = state.predictionHistory.find((p) => p.isRealMl);
    if (latestPred && latestPred.submittedSkills?.length) return latestPred.submittedSkills;
    const profileSkills = state.skills.map((s) => s.name.toLowerCase().replace(/\s+/g, '_'));
    return profileSkills.length > 0 ? profileSkills : ['python', 'machine_learning', 'data_analysis'];
  }, [persistedSkills, state.predictionHistory, state.skills]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultSkills);
  const [targetTrack, setTargetTrack] = useState<string>(persistedTrack);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(!persistedIntel);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [intelligence, setIntelligence] = useState<CareerIntelligenceResponse | null>(persistedIntel);
  const [canonicalVocab, setCanonicalVocab] = useState<string[]>([]);

  // Load canonical vocabulary for quick skill vector suggestions
  useEffect(() => {
    getCareerSkillVocabulary()
      .then((res) => setCanonicalVocab(res.skills))
      .catch(() => {});
  }, []);

  const runIntelligenceEvaluation = async (skillsToRun: string[], trackOverride?: string | null) => {
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const response = await evaluateCareerIntelligence({
        skills: skillsToRun,
        target_career_track: trackOverride !== undefined ? trackOverride : targetTrack,
      });
      setIntelligence(response);
      setTargetTrack(response.target_career_track);
      dispatch({
        type: 'SET_CAREER_INTELLIGENCE',
        payload: {
          intelligence: response,
          selectedSkills: skillsToRun,
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof CareerIntelligenceError
          ? err.userMessage
          : 'Unable to evaluate skill gaps from Career Intelligence service.';
      setEvalError(msg);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    if (!persistedIntel) {
      runIntelligenceEvaluation(defaultSkills, null);
    }
  }, []);

  const handleTrackChange = (newTrack: string) => {
    setTargetTrack(newTrack);
    dispatch({ type: 'SET_CAREER_TARGET_OVERRIDE', payload: { targetCareer: newTrack } });
    runIntelligenceEvaluation(selectedSkills, newTrack);
  };

  const handleToggleSkill = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    if (updated.length > 0) {
      runIntelligenceEvaluation(updated, targetTrack);
    }
  };

  const coverage = intelligence?.required_skill_coverage;
  const prioritizedGaps = intelligence?.prioritized_gaps || [];
  const coreGaps = prioritizedGaps.filter((g) => g.priority === 'core');
  const supportingGaps = prioritizedGaps.filter((g) => g.priority === 'supporting');
  const advancedGaps = prioritizedGaps.filter((g) => g.priority === 'advanced');
  const nextActionableGap = prioritizedGaps.find((g) => g.prerequisites_met);

  const isModelPredicted = intelligence?.target_source === 'model_prediction';
  const mlPredictedTrack = intelligence?.prediction?.career_track;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Career Skill Gap Intelligence
            </h1>
            <StatusBadge label="Ontology Engine Phase 5" size="xs" variant="primary" dot />
            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
              Deterministic Competency Framework
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Transparent comparison of verified student competencies against authoritative career track requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => runIntelligenceEvaluation(selectedSkills, targetTrack)}
            disabled={isEvaluating}
            className="btn-outline text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
            id="refresh-gap-analysis-btn"
          >
            <RefreshCw size={13} className={isEvaluating ? 'animate-spin text-primary' : 'text-gray-400'} />
            <span>Re-evaluate</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold shadow-glow"
            id="open-roadmap-btn"
          >
            <span>Open Career Roadmap</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Target Career Track Selector & ML Advisory Banner */}
      <div className="card p-5 bg-gradient-to-r from-[#111827] via-[#161F36] to-[#111827] border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Authoritative Planning Target
            </span>
            <StatusBadge
              label={isModelPredicted ? 'Predicted by ML' : 'Selected by You'}
              size="xs"
              variant={isModelPredicted ? 'primary' : 'success'}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight" id="active-target-track-title">
              {intelligence?.target_career_track || targetTrack}
            </h2>
          </div>
          {mlPredictedTrack && mlPredictedTrack !== targetTrack && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
              <Compass size={13} />
              <span>
                ML Model Prediction: <strong className="text-cyan-300">{mlPredictedTrack}</strong> (Advisory).
                You manually targeted <strong className="text-white">{targetTrack}</strong> for gap planning.
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">Target Role Override:</span>
          <select
            value={targetTrack}
            onChange={(e) => handleTrackChange(e.target.value)}
            disabled={isEvaluating}
            className="text-xs py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold focus:border-primary focus:outline-none"
            id="target-career-override-select"
          >
            {SUPPORTED_ML_TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {evalError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Evaluation Error: </span>
            <span>{evalError}</span>
          </div>
        </div>
      )}

      {/* Unknown Skills Warning */}
      {intelligence && intelligence.unknown_skills.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              <strong>{intelligence.unknown_skills.length} non-canonical skill(s) excluded: </strong>
              {intelligence.unknown_skills.join(', ')} (not in 29-feature canonical vocabulary).
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono opacity-80">Audited</span>
        </div>
      )}

      {/* Active Skill Vector Chips */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase text-[10px] tracking-wider text-gray-400">
            Active Verified Skill Vector ({selectedSkills.length} tokens):
          </span>
          <span className="text-[11px] text-gray-500">Toggle skill presence to simulate gap changes</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {canonicalVocab.map((skill) => {
            const isPresent = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleToggleSkill(skill)}
                className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono transition-all ${
                  isPresent
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-gray-400 border border-slate-700 hover:border-primary/40'
                }`}
                id={`gap-skill-chip-${skill}`}
              >
                {isPresent && <Check size={11} />}
                <span>{skill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Required Skill Coverage"
          value={coverage ? `${coverage.percentage}%` : '0%'}
          subtitle={coverage ? `${coverage.present_count} of ${coverage.required_count} required skills verified` : 'Awaiting evaluation'}
          variant="primary"
          icon={<Target size={18} className="text-primary" />}
        />
        <StatCard
          label="Core Competency Gaps"
          value={coreGaps.length}
          subtitle="Priority 1 — Foundational competencies"
          variant="accent"
          icon={<AlertTriangle size={18} className="text-rose-500" />}
        />
        <StatCard
          label="Supporting Gaps"
          value={supportingGaps.length}
          subtitle="Priority 2 — Applied systems & engineering"
          variant="default"
          icon={<Layers size={18} className="text-amber-500" />}
        />
        <StatCard
          label="Next Actionable Skill"
          value={nextActionableGap ? nextActionableGap.skill : 'All Met'}
          subtitle={nextActionableGap ? 'Prerequisites fully satisfied' : 'Prerequisites complete'}
          variant="success"
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
        />
      </div>

      {/* Present vs Missing Skill Partition */}
      {intelligence && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 space-y-3 border-emerald-500/30 bg-emerald-950/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                  Present Required Skills ({intelligence.present_required_skills.length})
                </h3>
              </div>
              <StatusBadge label="Verified" size="xs" variant="success" />
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[42px]">
              {intelligence.present_required_skills.length > 0 ? (
                intelligence.present_required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold"
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No required skills currently verified in candidate vector.</p>
              )}
            </div>
          </div>

          <div className="card p-5 space-y-3 border-rose-500/30 bg-rose-950/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                  Missing Required Skills ({intelligence.missing_required_skills.length})
                </h3>
              </div>
              <StatusBadge label="Gaps" size="xs" variant="danger" />
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[42px]">
              {intelligence.missing_required_skills.length > 0 ? (
                intelligence.missing_required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-semibold"
                  >
                    ✕ {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-emerald-400 font-semibold">100% required competency coverage achieved!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prioritized Competency Gap Matrix Table */}
      <div className="card overflow-hidden shadow-card">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
              Deterministic Prioritized Skill Gap Matrix
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Ranked by ontology competency tier and prerequisite satisfaction.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge label="Curated Framework" size="xs" variant="neutral" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]" id="prioritized-gaps-table">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Order</th>
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Priority Tier</th>
                <th className="py-3 px-4">Prerequisites Status</th>
                <th className="py-3 px-4">Curricular Rationale</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {prioritizedGaps.map((gap) => {
                const isCore = gap.priority === 'core';
                const isSupporting = gap.priority === 'supporting';

                return (
                  <tr
                    key={gap.skill}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      #{gap.recommended_order}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-gray-900 dark:text-slate-100 text-sm">
                        {gap.skill}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge
                        label={gap.priority.toUpperCase()}
                        size="xs"
                        variant={isCore ? 'danger' : isSupporting ? 'warning' : 'neutral'}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      {gap.prerequisites.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {gap.prerequisites_met ? (
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Ready to Learn
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                                <Clock size={12} /> Needs Prerequisite
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">
                            Prereq: {gap.prerequisites.join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">None (Foundational)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 dark:text-slate-300 font-medium max-w-sm">
                      {gap.reason}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/learning')}
                        className="btn-primary text-xs py-1 px-2.5 rounded-lg inline-flex items-center gap-1 font-semibold shadow-sm"
                      >
                        <span>Learn</span>
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {prioritizedGaps.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    {isEvaluating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating competency ontology...</span>
                      </div>
                    ) : (
                      'No skill gaps detected! All required ontology competencies are verified.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Learning Preview */}
      {intelligence && intelligence.learning_recommendations.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Recommended Learning Path for Gaps
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Curated courseware directly addressing your highest priority missing skills.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/learning')}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore All Learning Resources</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {intelligence.learning_recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.resource_id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-primary uppercase">
                    Stage {rec.roadmap_stage} · {rec.skill}
                  </span>
                  <StatusBadge label={rec.provider} size="xs" variant="neutral" />
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{rec.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>Effort: {rec.estimated_effort}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold">{rec.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Governance Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-gray-400 flex items-start gap-2.5">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Methodological Governance Note: </strong>
          Required Skill Coverage is a deterministic curricular metric calculated strictly from the CareerCompass
          competency ontology. It does not represent an ML confidence score, career suitability prediction, or statistical
          proficiency weakness. Machine learning prediction is generated separately by the locked Candidate H Random Forest.
        </span>
      </div>
    </div>
  );
}

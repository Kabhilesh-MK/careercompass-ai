import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  BookOpen,
  FolderGit2,
  Clock,
  Target,
  AlertTriangle,
  ArrowUpRight,
  Map,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Code2,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  StatCard,
  MetricCard,
  SkillBar,
  StatusBadge,
  ProgressBar,
} from '@/components/design-system';
import { useAppState } from '@/hooks/useAppState';
import { useSkills } from '@/hooks/useSkills';
import { useRoadmap } from '@/hooks/useRoadmap';
import { useLearning } from '@/hooks/useLearning';
import { getProjectRecommendations, RecommendedProject } from '@/services/api/projectRecommendations';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useAppState();
  const { skills } = useSkills();
  const { activePhase, overallProgress: roadmapOverallProgress } = useRoadmap();
  const { completedResources, projects } = useLearning();

  const name = state.profile.name || user?.full_name || 'Alex Johnson';
  const firstName = name.split(' ')[0];

  const intel = state.careerIntelligence?.intelligenceResult as any | null;
  const targetCareer = state.careerIntelligence?.activeTargetCareer || (intel?.target_career) || 'Software Development & Engineering';
  const targetSource = state.careerIntelligence?.targetSource || 'model_prediction';
  const latestReal = state.predictionHistory.find((p) => p.isRealMl);

  // Recommended project state for dashboard spotlight
  const [topProject, setTopProject] = useState<RecommendedProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  // Active verified skills
  const activeSkills = state.careerIntelligence?.selectedSkills?.length
    ? state.careerIntelligence.selectedSkills
    : state.skills.map((s) => s.id.replace('sk-', ''));

  useEffect(() => {
    let isMounted = true;
    async function loadSpotlightProject() {
      if (!activeSkills.length) return;
      try {
        setLoadingProject(true);
        const res = await getProjectRecommendations({
          skills: activeSkills,
          target_career_track: targetCareer,
        });
        if (isMounted && res.projects?.length > 0) {
          setTopProject(res.projects[0]);
        }
      } catch {
        // Non-blocking for dashboard
      } finally {
        if (isMounted) setLoadingProject(false);
      }
    }
    loadSpotlightProject();
    return () => {
      isMounted = false;
    };
  }, [targetCareer, activeSkills.length]);

  // Derived deterministic readiness components
  // 1. Required Skill Coverage
  const skillCoveragePercent = Math.round((intel?.skill_coverage?.coverage_ratio || 0) * 100);

  // 2. Roadmap Completion
  const totalMilestones = intel?.roadmap_stages
    ? intel.roadmap_stages.reduce((acc: number, st: any) => acc + (st.milestones?.length || 0), 0)
    : 0;
  const completedMilestoneCount = state.careerIntelligence?.completedRoadmapItemIds?.length || 0;
  const roadmapCompletionPercent = totalMilestones > 0
    ? Math.min(100, Math.round((completedMilestoneCount / totalMilestones) * 100))
    : roadmapOverallProgress;

  // 3. Learning Completion
  const totalLearningRecs = intel?.learning_recommendations?.length || 0;
  const learningCompletionPercent = totalLearningRecs > 0
    ? Math.min(100, Math.round((completedResources.length / totalLearningRecs) * 100))
    : (completedResources.length > 0 ? 50 : 0);

  // 4. Project Completion
  const careerProjectsList = Object.values(state.careerProjects || {});
  const completedProjectsCount = careerProjectsList.filter((p) => p.status === 'completed').length;
  const projectCompletionPercent = careerProjectsList.length > 0
    ? Math.round((completedProjectsCount / careerProjectsList.length) * 100)
    : (projects.filter((p) => p.status === 'Completed').length > 0 ? 50 : 0);

  // 5. Portfolio Evidence Coverage
  let totalEvidenceItems = 0;
  let completedEvidenceItems = 0;
  careerProjectsList.forEach((cp) => {
    completedEvidenceItems += (cp.completedEvidence?.length || 0);
    totalEvidenceItems += 4; // standard 4 evidence items per project
  });
  const portfolioEvidenceCoveragePercent = totalEvidenceItems > 0
    ? Math.min(100, Math.round((completedEvidenceItems / totalEvidenceItems) * 100))
    : 0;

  // Career Plan Completion (transparent deterministic aggregate)
  const careerPlanCompletion = Math.round(
    (skillCoveragePercent * 0.3) +
    (roadmapCompletionPercent * 0.25) +
    (learningCompletionPercent * 0.15) +
    (projectCompletionPercent * 0.15) +
    (portfolioEvidenceCoveragePercent * 0.15)
  );

  const topMissingSkills = intel?.prioritized_gaps?.slice(0, 4) || intel?.missing_skills?.slice(0, 4) || [];
  const nextLearning = intel?.learning_recommendations?.[0];

  const hasIntelligence = Boolean(intel || latestReal);

  const recentActivities = [
    {
      id: 'act-1',
      title: 'Candidate H Random Forest Evaluated',
      subtitle: `Model inference synchronized for ${targetCareer}`,
      time: 'Recent',
      icon: <Sparkles size={16} className="text-primary" />,
      tag: 'ML Inference',
    },
    {
      id: 'act-2',
      title: 'Ontology Gap Analysis Completed',
      subtitle: `${intel?.skill_coverage?.missing_target_skills?.length || 0} missing target competencies identified`,
      time: 'Recent',
      icon: <Target size={16} className="text-secondary" />,
      tag: 'Skill Gap',
    },
    {
      id: 'act-3',
      title: 'Career Roadmap & Projects Configured',
      subtitle: `${careerProjectsList.length} portfolio projects tracked`,
      time: 'Recent',
      icon: <FolderGit2 size={16} className="text-accent" />,
      tag: 'Portfolio',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* SECTION A: Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">
              Good morning, {firstName}
            </h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Career intelligence overview, curated project roadmap, and portfolio evidence tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/career/prediction')}
            className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
          >
            <Compass size={14} className="text-primary" />
            <span>ML Prediction</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/portfolio')}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
          >
            <Briefcase size={14} />
            <span>My Portfolio</span>
          </button>
        </div>
      </div>

      {/* EMPTY STATE BANNER IF NO CAREER INTELLIGENCE PLAN EXISTS */}
      {!hasIntelligence && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 bg-gradient-to-r from-primary/15 via-secondary/15 to-transparent border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Career Intelligence Uninitialized
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Run Career Intelligence to generate your personalized plan.
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              Evaluate your current competencies against the Candidate H Random Forest model. Generate your ontology-derived skill gaps, custom multi-stage roadmap, verified courseware recommendations, curated project deliverables, and portfolio evidence checklist.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/skills/gap')}
            className="btn-primary py-3 px-6 rounded-xl flex items-center gap-2 text-sm font-bold shadow-glow shrink-0"
          >
            <span>Run Career Intelligence</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* SECTION B & C: Career Direction Card & Career Plan Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SECTION B: Career Direction Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-7 card p-6 bg-gradient-to-br from-[#111827] via-[#161F36] to-[#111827] border-primary/20 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-primary-300">
                Target Career Track
              </span>
              <div className="flex items-center gap-2">
                {targetSource === 'user_selected' ? (
                  <StatusBadge label="USER TARGET OVERRIDE" variant="warning" size="xs" dot />
                ) : (
                  <StatusBadge label="ML MODEL RECOMMENDED" variant="primary" size="xs" dot />
                )}
                {latestReal && (
                  <StatusBadge label="REAL INFERENCE" variant="neutral" size="xs" />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {targetCareer}
              </h2>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                {targetSource === 'user_selected'
                  ? `Active target set by user override. Planning, gap ontology, and project catalog are aligned to ${targetCareer}.`
                  : latestReal
                  ? `Advisory ML prediction from Candidate H Random Forest classifier based on verified skills.`
                  : 'Target career track benchmarks actively guide your skill ontology and roadmap recommendations.'}
              </p>
            </div>

            {/* Model Match / Target info */}
            <div className="flex flex-wrap items-center gap-4 py-2 border-y border-gray-100 dark:border-slate-800/80 text-xs">
              <div>
                <span className="text-gray-400 dark:text-slate-500 block text-[10px] uppercase font-bold">
                  {latestReal ? 'Advisory Probability' : 'Planning Model'}
                </span>
                <span className="text-lg font-black text-primary dark:text-primary-300">
                  {latestReal ? `${latestReal.confidenceEstimate}%` : 'Candidate H'}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-gray-200 dark:bg-slate-800" />
              <div>
                <span className="text-gray-400 dark:text-slate-500 block text-[10px] uppercase font-bold">
                  Target Required Skills
                </span>
                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                  {intel?.skill_coverage
                    ? `${intel.skill_coverage.acquired_target_skills?.length || 0} / ${intel.skill_coverage.total_required_skills} Acquired (${skillCoveragePercent}%)`
                    : 'Awaiting Run'}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-gray-200 dark:bg-slate-800" />
              <div>
                <span className="text-gray-400 dark:text-slate-500 block text-[10px] uppercase font-bold">
                  ML Governance
                </span>
                <span className="text-xs font-semibold text-emerald-500">
                  Advisory · Locked RF
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => navigate('/career/prediction')}
              className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
              id="dashboard-prediction-cta"
            >
              <span>{latestReal ? 'Explore Prediction & SHAP' : 'Run Live ML Prediction'}</span>
              <ArrowRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/skills/gap')}
              className="btn-outline text-xs py-2 px-3.5 rounded-xl"
            >
              Skill Gap & Target Override
            </button>
          </div>
        </motion.div>

        {/* SECTION C: Career Plan Completion (Step 14 & 15) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="lg:col-span-5"
        >
          <MetricCard
            title="Career Plan Completion"
            value={`${careerPlanCompletion}%`}
            subtitle="Deterministic task & evidence completion across required track components"
            badge={
              <StatusBadge
                label="Deterministic Metric"
                size="xs"
                variant="primary"
              />
            }
            items={[
              { label: 'Required Skill Coverage', value: skillCoveragePercent, color: 'bg-primary' },
              { label: 'Roadmap Milestones', value: roadmapCompletionPercent, color: 'bg-secondary' },
              { label: 'Learning Modules', value: learningCompletionPercent, color: 'bg-emerald-500' },
              { label: 'Project Progress', value: projectCompletionPercent, color: 'bg-amber-500' },
              { label: 'Portfolio Evidence', value: portfolioEvidenceCoveragePercent, color: 'bg-accent' },
            ]}
            footer={
              <p className="text-[11px] text-gray-400 dark:text-slate-500 italic">
                * Deterministic progress tracking metric. Does not predict or guarantee employment or hiring outcomes.
              </p>
            }
          />
        </motion.div>
      </div>

      {/* SECTION G: Key Intelligence Pillars (4 Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Required Skill Coverage"
          value={`${skillCoveragePercent}%`}
          subtitle={
            intel?.skill_coverage
              ? `${intel.skill_coverage.acquired_target_skills?.length || 0} of ${intel.skill_coverage.total_required_skills} met`
              : 'Evaluation pending'
          }
          icon={<Target size={18} className="text-primary" />}
          onClick={() => navigate('/skills/gap')}
        />
        <StatCard
          label="Roadmap Progress"
          value={`${roadmapCompletionPercent}%`}
          subtitle={
            totalMilestones > 0
              ? `${completedMilestoneCount} of ${totalMilestones} milestones`
              : 'Roadmap active'
          }
          icon={<Map size={18} className="text-secondary" />}
          onClick={() => navigate('/roadmap')}
        />
        <StatCard
          label="Portfolio Projects"
          value={String(careerProjectsList.length)}
          subtitle={`${completedProjectsCount} completed`}
          icon={<FolderGit2 size={18} className="text-accent" />}
          onClick={() => navigate('/portfolio/projects')}
        />
        <StatCard
          label="Evidence Coverage"
          value={`${portfolioEvidenceCoveragePercent}%`}
          subtitle={`${completedEvidenceItems} items documented`}
          icon={<ShieldCheck size={18} className="text-emerald-500" />}
          onClick={() => navigate('/portfolio')}
        />
      </div>

      {/* SECTION H: Next Best Actions — Learning & Project Bridge (Step 15 & 16) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Next Recommended Learning Card */}
        <div className="lg:col-span-6 card p-5 flex flex-col justify-between space-y-4 border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Next Recommended Learning
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    {nextLearning?.title || 'Explore Learning Hub Catalog'}
                  </h3>
                </div>
              </div>
              {nextLearning && (
                <StatusBadge label={nextLearning.provider} size="xs" variant="neutral" />
              )}
            </div>

            {nextLearning ? (
              <div className="space-y-2 text-xs text-gray-600 dark:text-slate-300">
                <p className="line-clamp-2">
                  Directly addresses ontology gap in <strong>{nextLearning.skill}</strong> for roadmap Stage {nextLearning.roadmap_stage}.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>Effort: {nextLearning.estimated_effort}</span>
                  <span>·</span>
                  <span>Difficulty: {nextLearning.difficulty}</span>
                  <span>·</span>
                  <span>Type: {nextLearning.resource_type}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                No pending learning recommendations. Run skill evaluation to discover curated coursework.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/learning')}
            className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold w-full"
          >
            <span>Open in Learning Hub</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Recommended Project Spotlight Card */}
        <div className="lg:col-span-6 card p-5 flex flex-col justify-between space-y-4 border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <FolderGit2 size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Recommended Project Spotlight
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    {topProject?.title || 'FastAPI Microservice Backend'}
                  </h3>
                </div>
              </div>
              {topProject && (
                <StatusBadge
                  label={`Relevance: ${Math.round(topProject.relevance_score)}`}
                  size="xs"
                  variant="primary"
                />
              )}
            </div>

            {topProject ? (
              <div className="space-y-2 text-xs text-gray-600 dark:text-slate-300">
                <p className="line-clamp-2">{topProject.description}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-semibold text-gray-400">Demonstrates:</span>
                  {topProject.skills_demonstrated.slice(0, 3).map((sk) => (
                    <span
                      key={sk}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Curated portfolio projects provide tangible evidence for your roadmap milestones.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/portfolio/projects')}
            className="btn-outline text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold w-full"
          >
            <span>View Project & Evidence Checklist</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* SECTION D & E: Skill Snapshot & Real Ontology Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SECTION D: Skill Snapshot */}
        <div className="lg:col-span-6 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                Skill Snapshot
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Competencies verified in your active profile ({skills.length})
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Skills</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {skills.slice(0, 5).map((s) => (
              <SkillBar
                key={s.id}
                name={s.name}
                proficiency={s.currentProficiency}
                category={s.category}
                target={s.targetRoleScore || 75}
                verified={s.verified}
                status={s.status}
              />
            ))}
          </div>
        </div>

        {/* SECTION E: Real Ontology Missing Skills (Step 15) */}
        <div className="lg:col-span-6 card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                  Top Missing Competencies
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Target Track: {targetCareer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/skills/gap')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Full Gap Analysis</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {topMissingSkills.length > 0 ? (
              <div className="space-y-2 pt-1">
                {topMissingSkills.map((gap: any) => (
                  <div
                    key={gap.skill}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-slate-100">
                          {gap.skill}
                        </span>
                        <StatusBadge
                          label={gap.priority || gap.importance || 'core'}
                          size="xs"
                          variant={
                            (gap.priority || gap.importance) === 'core'
                              ? 'danger'
                              : (gap.priority || gap.importance) === 'supporting'
                              ? 'warning'
                              : 'primary'
                          }
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {gap.reason || gap.description || 'Target track competency gap'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/learning')}
                      className="btn-outline text-[11px] py-1 px-2.5 rounded-lg shrink-0"
                    >
                      Learn
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-slate-400">
                {hasIntelligence
                  ? 'All core required competencies for this target are currently satisfied!'
                  : 'Evaluate your skills to identify track-specific gaps.'}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              Closing core gaps increases required skill coverage.
            </span>
            <button
              type="button"
              onClick={() => navigate('/learning')}
              className="text-primary font-semibold hover:underline shrink-0"
            >
              Curated Courses →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION F & I: Current Roadmap Stage & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SECTION F: Current Roadmap Stage */}
        <div className="lg:col-span-6 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Map size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                  Current Roadmap Stage
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Phase {activePhase?.phaseNumber || 1}: {activePhase?.phaseTitle || 'Foundational Competencies'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/roadmap')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Timeline</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-slate-300 font-medium">
                Overall Roadmap Milestone Completion
              </span>
              <span className="font-bold text-primary">{roadmapCompletionPercent}%</span>
            </div>
            <ProgressBar value={roadmapCompletionPercent} size="sm" variant="primary" />
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              Stage Milestones
            </p>
            {activePhase?.items?.slice(0, 3).map((item: any) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-slate-100 truncate">
                      {item.title}
                    </span>
                    <StatusBadge
                      label={item.status}
                      size="xs"
                      variant={item.status === 'Completed' ? 'success' : 'primary'}
                      dot={item.status === 'In Progress'}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                    {item.resource}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/roadmap')}
                  className="btn-outline text-[11px] py-1 px-2.5 rounded-lg shrink-0"
                >
                  Continue
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION I: Recent Activity */}
        <div className="lg:col-span-6 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                  Recent Activity
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Activity log across evaluations, projects, and evidence
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Activity History</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-slate-700/60 transition flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 mt-0.5">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1">
                    {act.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

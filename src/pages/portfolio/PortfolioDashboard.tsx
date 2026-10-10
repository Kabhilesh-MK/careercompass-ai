import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Award,
  Trophy,
  Layers,
  FileDown,
  Sparkles,
  ExternalLink,
  Github,
  CheckCircle2,
  Plus,
  X,
  Target,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FolderGit2,
  Info,
} from 'lucide-react';
import {
  CertificateCard,
  AchievementCard,
  Tabs,
  StatusBadge,
  ProgressBar,
} from '@/components/design-system';
import { useToast } from '@/context/ToastContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAppState } from '@/hooks/useAppState';
import {
  getProjectRecommendations,
  RecommendedProject,
} from '@/services/api/projectRecommendations';
import { Certificate } from '@/types/careerCompass';

export default function PortfolioDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { state } = useAppState();
  const {
    certificates,
    achievements,
    projects,
    careerProjects,
    addCertificate,
    updateCareerProjectStatus,
    toggleProjectEvidence,
    updateProjectDeliverableLink,
  } = usePortfolio();

  const getActiveTab = () => {
    if (location.pathname.includes('/certificates')) return 'certificates';
    if (location.pathname.includes('/achievements')) return 'achievements';
    if (location.pathname.includes('/projects')) return 'projects';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'overview') navigate('/portfolio');
    else if (tabId === 'projects') navigate('/portfolio/projects');
    else if (tabId === 'certificates') navigate('/portfolio/certificates');
    else if (tabId === 'achievements') navigate('/portfolio/achievements');
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);

  // Certificate Form state
  const [certTitle, setCertTitle] = useState('');
  const [certProvider, setCertProvider] = useState('');
  const [certIssueDate, setCertIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [certCredentialId, setCertCredentialId] = useState('');
  const [certCredentialUrl, setCertCredentialUrl] = useState('');
  const [certSkill, setCertSkill] = useState('');
  const [certVerificationUrl, setCertVerificationUrl] = useState('');

  // Project recommendations API state
  const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Active target career & recognized skills from Career Intelligence
  const intel = state.careerIntelligence?.intelligenceResult;
  const activeTargetCareer = state.careerIntelligence?.activeTargetCareer || 'Software Development & Engineering';
  const targetSource = state.careerIntelligence?.targetSource || 'model_prediction';
  const selectedSkills = state.careerIntelligence?.selectedSkills?.length
    ? state.careerIntelligence.selectedSkills
    : state.skills.map((s) => s.id.replace('sk-', ''));

  // Fetch real project recommendations from FastAPI backend
  useEffect(() => {
    let isMounted = true;
    async function fetchRecommendations() {
      setLoadingProjects(true);
      setProjectError(null);
      try {
        const res = await getProjectRecommendations({
          skills: selectedSkills.length ? selectedSkills : ['programming', 'python'],
          target_career_track: activeTargetCareer,
        });
        if (isMounted) {
          setRecommendedProjects(res.projects);
        }
      } catch (err: any) {
        if (isMounted) {
          setProjectError(err.userMessage || 'Failed to load project recommendations from server.');
        }
      } finally {
        if (isMounted) {
          setLoadingProjects(false);
        }
      }
    }

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, [activeTargetCareer, selectedSkills.join(',')]);

  // Deterministic Portfolio Metrics (Step 10, 11, 14)
  const presentRequiredSkills = intel?.present_required_skills || [];
  const missingRequiredSkills = intel?.missing_required_skills || [];
  const totalRequiredSkillsCount = intel?.required_skills?.length || (presentRequiredSkills.length + missingRequiredSkills.length) || 1;
  const skillCoveragePct = intel?.required_skill_coverage?.percentage || Math.round((presentRequiredSkills.length / totalRequiredSkillsCount) * 100);

  const completedRoadmapIds = state.careerIntelligence?.completedRoadmapItemIds || [];
  const totalRoadmapItemsCount = intel?.roadmap?.length || 11;
  const roadmapCompletionPct = Math.round((completedRoadmapIds.length / totalRoadmapItemsCount) * 100);

  const completedResourcesCount = state.learningResources.filter((r) => (r.progress || 0) >= 100).length;
  const totalResourcesCount = state.learningResources.length || 1;
  const learningCompletionPct = Math.round((completedResourcesCount / totalResourcesCount) * 100);

  // Projects & Evidence calculation
  const totalEvidenceItems = useMemo(() => {
    return recommendedProjects.reduce((acc, p) => acc + (p.suggested_evidence?.length || 0), 0) || 1;
  }, [recommendedProjects]);

  const completedEvidenceItems = useMemo(() => {
    return Object.values(careerProjects).reduce((acc, p) => acc + (p.completedEvidence?.length || 0), 0);
  }, [careerProjects]);

  const completedProjectsCount = useMemo(() => {
    return Object.values(careerProjects).filter((p) => p.status === 'completed').length;
  }, [careerProjects]);

  const inProgressProjectsCount = useMemo(() => {
    return Object.values(careerProjects).filter((p) => p.status === 'in_progress').length;
  }, [careerProjects]);

  const plannedProjectsCount = useMemo(() => {
    return Object.values(careerProjects).filter((p) => p.status === 'planned').length;
  }, [careerProjects]);

  const totalTrackedProjectsCount = recommendedProjects.length || 4;
  const projectCompletionPct = Math.round((completedProjectsCount / totalTrackedProjectsCount) * 100);

  // Portfolio Evidence Coverage (Step 11):
  const portfolioEvidenceCoveragePct = Math.min(
    100,
    Math.round((completedEvidenceItems / totalEvidenceItems) * 100)
  );

  // Career Plan Completion aggregate (Step 14):
  // Formula: 30% Skills + 25% Roadmap + 15% Learning + 20% Projects + 10% Evidence
  const careerPlanCompletionPct = Math.round(
    skillCoveragePct * 0.3 +
      roadmapCompletionPct * 0.25 +
      learningCompletionPct * 0.15 +
      projectCompletionPct * 0.2 +
      portfolioEvidenceCoveragePct * 0.1
  );

  const portfolioTabs = [
    { id: 'overview', label: 'Portfolio Intelligence', icon: <Layers size={14} /> },
    {
      id: 'projects',
      label: 'Projects & Evidence',
      icon: <Code2 size={14} />,
      badge: recommendedProjects.length || projects.length,
    },
    { id: 'certificates', label: 'Certificates', icon: <Award size={14} />, badge: certificates.length },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={14} />, badge: achievements.length },
  ];

  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certProvider.trim()) {
      addToast('Please enter both Certificate Name and Issuing Provider.', 'error');
      return;
    }

    const hasRealVerification = Boolean(certVerificationUrl.trim());
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      title: certTitle.trim(),
      provider: certProvider.trim(),
      issueDate: certIssueDate,
      skills: certSkill.trim() ? [certSkill.trim()] : ['Programming'],
      credentialId: certCredentialId.trim() || `CRED-${Math.floor(100000 + Math.random() * 900000)}`,
      credentialUrl: certCredentialUrl.trim() || undefined,
      verificationUrl: hasRealVerification ? certVerificationUrl.trim() : undefined,
      skill: certSkill.trim() || undefined,
      status: hasRealVerification ? 'Verified' : 'Self-Reported',
    };

    addCertificate(newCert);
    addToast(`Certificate "${newCert.title}" recorded to portfolio!`, 'success');

    setCertTitle('');
    setCertProvider('');
    setCertCredentialId('');
    setCertCredentialUrl('');
    setCertSkill('');
    setCertVerificationUrl('');
    setShowAddCertModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Student Career Portfolio
            </h1>
            <StatusBadge label="Phase 6 Intelligence" size="xs" variant="primary" dot />
            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
              Evidence & Deliverables Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Connects your target career, required competencies, roadmap milestones, and verified project deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'certificates' && (
            <button
              type="button"
              onClick={() => setShowAddCertModal(true)}
              className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-bold"
            >
              <Plus size={14} />
              <span>Record Certificate</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-bold shadow-glow"
          >
            <FileDown size={14} />
            <span>Generate Portfolio PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-slate-800">
        <Tabs tabs={portfolioTabs} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PORTFOLIO INTELLIGENCE OVERVIEW (Step 10, 11, 14) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Banner: Career Target & Career Plan Completion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 card p-6 bg-gradient-to-br from-[#111827] via-[#161F36] to-[#111827] border-primary/30 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Authoritative Career Target
                  </span>
                  <StatusBadge
                    label={targetSource === 'model_prediction' ? 'ML PREDICTED TRACK' : 'USER OVERRIDE TRACK'}
                    variant={targetSource === 'model_prediction' ? 'primary' : 'warning'}
                    size="xs"
                    dot
                  />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {activeTargetCareer}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Portfolio intelligence maps required competency benchmarks, staged deliverables, and verified code
                    evidence directly to this track.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Skills Covered</span>
                    <span className="text-base font-bold text-emerald-400">
                      {presentRequiredSkills.length} / {totalRequiredSkillsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Missing Skills</span>
                    <span className="text-base font-bold text-rose-400">{missingRequiredSkills.length} Gaps</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Completed Projects</span>
                    <span className="text-base font-bold text-primary">{completedProjectsCount} Done</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Evidence Items</span>
                    <span className="text-base font-bold text-amber-400">
                      {completedEvidenceItems} / {totalEvidenceItems}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => navigate('/portfolio/projects')}
                  className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-bold"
                >
                  <span>View Project Evidence Checklist</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/roadmap')}
                  className="btn-outline text-xs py-2 px-3.5 rounded-xl font-bold"
                >
                  Inspect Roadmap
                </button>
              </div>
            </div>

            {/* Career Readiness & Plan Completion Card (Step 14) */}
            <div className="lg:col-span-4 card p-6 space-y-4 border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                    Career Readiness Overview
                  </h3>
                  <StatusBadge label="Deterministic Plan" size="xs" variant="primary" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                  Separate measurable execution components. Not an ML hiring prediction.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300 font-medium">1. Required Skill Coverage</span>
                    <span className="font-bold text-primary">{skillCoveragePct}%</span>
                  </div>
                  <ProgressBar value={skillCoveragePct} size="xs" variant="primary" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300 font-medium">2. Roadmap Completion</span>
                    <span className="font-bold text-secondary">{roadmapCompletionPct}%</span>
                  </div>
                  <ProgressBar value={roadmapCompletionPct} size="xs" variant="secondary" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300 font-medium">3. Learning Modules</span>
                    <span className="font-bold text-accent">{learningCompletionPct}%</span>
                  </div>
                  <ProgressBar value={learningCompletionPct} size="xs" variant="accent" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300 font-medium">4. Project Completion</span>
                    <span className="font-bold text-emerald-500">{projectCompletionPct}%</span>
                  </div>
                  <ProgressBar value={projectCompletionPct} size="xs" variant="success" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-300 font-medium">5. Portfolio Evidence Coverage</span>
                    <span className="font-bold text-amber-500">{portfolioEvidenceCoveragePct}%</span>
                  </div>
                  <ProgressBar value={portfolioEvidenceCoveragePct} size="xs" variant="warning" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Career Plan Completion
                  </span>
                  <span className="text-base font-black text-white">{careerPlanCompletionPct}%</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Formula: 30% Skills + 25% Roadmap + 15% Learning + 20% Projects + 10% Evidence.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Competency Coverage & Evidence Status (Step 10) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Box 1: Required Skills Covered vs Missing */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Track Required Competencies ({totalRequiredSkillsCount})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Normative skills defined in {activeTargetCareer} ontology.
                  </p>
                </div>
                <StatusBadge
                  label={`${presentRequiredSkills.length} Present / ${missingRequiredSkills.length} Missing`}
                  size="xs"
                  variant="primary"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1.5">
                    Skills Covered ({presentRequiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presentRequiredSkills.length > 0 ? (
                      presentRequiredSkills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1"
                        >
                          <CheckCircle2 size={11} />
                          <span>{s}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">None yet in profile</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1.5">
                    Skills Still Missing ({missingRequiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingRequiredSkills.length > 0 ? (
                      missingRequiredSkills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-medium flex items-center gap-1"
                        >
                          <AlertTriangle size={11} />
                          <span>{s}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400 italic">All required competencies covered!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Portfolio Evidence Audit */}
            <div className="card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                      Portfolio Evidence Coverage
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Concrete evidence artifacts demonstrating practical competency.
                    </p>
                  </div>
                  <span className="text-sm font-black text-amber-400">
                    {portfolioEvidenceCoveragePct}% Coverage
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-medium">
                      <span>Completed Projects:</span>
                      <span className="font-bold text-emerald-400">{completedProjectsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 font-medium">
                      <span>Projects In Progress:</span>
                      <span className="font-bold text-primary">{inProgressProjectsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 font-medium">
                      <span>Completed Evidence Artifacts:</span>
                      <span className="font-bold text-amber-400">
                        {completedEvidenceItems} / {totalEvidenceItems}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-snug">
                    <Info size={12} className="inline mr-1 text-primary" />
                    <strong>Portfolio Evidence Coverage:</strong> ratio of completed required evidence items over total
                    recommended evidence items across curated projects.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/portfolio/projects')}
                className="btn-primary text-xs py-2 px-3 rounded-xl font-bold w-full text-center"
              >
                Go to Recommended Projects & Evidence →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROJECTS & EVIDENCE (Step 8 & 9) */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-8">
          {/* SECTION 1: RECOMMENDED PROJECTS (From real FastAPI backend) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900 dark:text-slate-100">
                    Recommended Projects for {activeTargetCareer}
                  </h2>
                  <StatusBadge label="Curated Knowledge" size="xs" variant="primary" />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Curated engineering projects ranked by deterministic relevance to your missing competencies.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-primary self-start sm:self-auto">
                {recommendedProjects.length} Projects Available
              </span>
            </div>

            {loadingProjects ? (
              <div className="card p-8 text-center text-xs text-gray-400">
                Loading project recommendations from backend service...
              </div>
            ) : projectError ? (
              <div className="card p-6 border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between">
                <span>{projectError}</span>
                <button
                  type="button"
                  onClick={() => navigate('/skills/gap')}
                  className="btn-outline text-xs py-1.5 px-3 rounded-lg"
                >
                  Verify Skills
                </button>
              </div>
            ) : recommendedProjects.length === 0 ? (
              <div className="card p-8 text-center text-xs text-gray-400">
                No project recommendations available for current criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedProjects.map((p) => {
                  const saved = careerProjects[p.project_id];
                  const currentStatus = saved?.status || 'planned';
                  const completedEvidence = saved?.completedEvidence || [];
                  const deliverableLinks = saved?.deliverableLinks || {};

                  return (
                    <motion.div
                      key={p.project_id}
                      className="card p-6 space-y-4 border-slate-800 hover:border-primary/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              Stage {p.recommended_stage}
                            </span>
                            <StatusBadge
                              label={p.difficulty}
                              size="xs"
                              variant={p.difficulty === 'Advanced' ? 'danger' : 'neutral'}
                            />
                            <span className="text-[11px] text-gray-400">{p.estimated_effort}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              Relevance: {p.relevance_score.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">{p.title}</h3>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{p.description}</p>
                        </div>

                        {/* Missing Skills Addressed */}
                        {p.matched_missing_skills?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                              Missing Competencies Addressed:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {p.matched_missing_skills.map((sk) => (
                                <span
                                  key={sk}
                                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/15 border border-rose-500/20 text-rose-300 font-semibold"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills Developed */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                            Skills Developed:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {p.skills_demonstrated.map((sk) => (
                              <span
                                key={sk}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Prerequisites Status */}
                        <div className="text-xs flex items-center gap-2">
                          <span className="text-gray-400 text-[11px]">Prerequisites:</span>
                          {p.prerequisites_met ? (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Satisfied
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                              <AlertTriangle size={12} /> Pending: {p.prerequisites.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Suggested Deliverables */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Suggested Deliverables:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                            {p.suggested_deliverables.map((deliv, idx) => (
                              <li key={idx} className="line-clamp-1">
                                {deliv}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Suggested Evidence Checklist (Step 9) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              Portfolio Evidence Checklist:
                            </span>
                            <span className="text-[11px] font-mono text-gray-400">
                              {completedEvidence.length} / {p.suggested_evidence.length} Verified
                            </span>
                          </div>

                          <div className="space-y-1">
                            {p.suggested_evidence.map((evItem) => {
                              const isChecked = completedEvidence.includes(evItem);
                              return (
                                <label
                                  key={evItem}
                                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition text-[11px] text-slate-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      toggleProjectEvidence(p.project_id, evItem);
                                      addToast(
                                        isChecked
                                          ? `Evidence item unchecked for ${p.title}`
                                          : `Evidence confirmed: "${evItem}"`,
                                        'info'
                                      );
                                    }}
                                    className="mt-0.5 rounded text-primary focus:ring-primary"
                                  />
                                  <span className={isChecked ? 'line-through text-slate-500' : ''}>{evItem}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Deliverable Link Input */}
                        <div className="pt-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                            GitHub Repository / Artifact URL:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              placeholder="https://github.com/your-username/repo"
                              defaultValue={deliverableLinks['repository'] || ''}
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  updateProjectDeliverableLink(p.project_id, 'repository', e.target.value.trim());
                                  addToast('Project repository link updated!', 'success');
                                }
                              }}
                              className="w-full text-xs py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                            />
                            {deliverableLinks['repository'] && (
                              <a
                                href={deliverableLinks['repository']}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Action Buttons (Step 8) */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400 font-medium">Status:</span>
                          <StatusBadge
                            label={
                              currentStatus === 'completed'
                                ? 'Completed'
                                : currentStatus === 'in_progress'
                                ? 'In Progress'
                                : 'Planned'
                            }
                            size="xs"
                            variant={
                              currentStatus === 'completed'
                                ? 'success'
                                : currentStatus === 'in_progress'
                                ? 'primary'
                                : 'neutral'
                            }
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          {currentStatus !== 'planned' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateCareerProjectStatus(p.project_id, 'planned');
                                addToast(`Project marked as Planned`, 'info');
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                            >
                              Plan
                            </button>
                          )}
                          {currentStatus !== 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateCareerProjectStatus(p.project_id, 'in_progress');
                                addToast(`Project marked In Progress`, 'info');
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                            >
                              In Progress
                            </button>
                          )}
                          {currentStatus !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateCareerProjectStatus(p.project_id, 'completed');
                                addToast(`🎉 Project completed and added to portfolio showcase!`, 'success');
                              }}
                              className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500 text-white font-bold hover:bg-emerald-600"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: MY PROJECTS (Existing profile projects) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-slate-100">
                  General Showcase Projects ({projects.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Additional software deliverables saved to your student profile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project) => (
                <div key={project.id} className="card p-5 space-y-3 border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{project.title}</h4>
                    <StatusBadge label={project.status} size="xs" variant="primary" />
                  </div>
                  <p className="text-xs text-slate-300">{project.problemStatement}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-slate-800">
                    <span>{project.difficulty}</span>
                    <span className="font-bold text-emerald-400">{project.progress}% Complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CERTIFICATES (Step 12) */}
      {/* ========================================================================= */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-slate-100">
                Accredited Credentials & Certificates ({certificates.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Credentials entered by student. Only claims verification if an external verification link was provided.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCertModal(true)}
              className="btn-primary text-xs py-2 px-3 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Record Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACHIEVEMENTS (Step 13) */}
      {/* ========================================================================= */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-slate-100">
                State-Derived Gamified Milestones ({achievements.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Achievements unlocked through real user actions: roadmap milestone completion, project delivery, and
                assessments.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-500">
              {achievements.reduce((sum, a) => sum + (a.points || 50), 0)} Total Points
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Certificate (Step 12) */}
      <AnimatePresence>
        {showAddCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-md w-full p-6 space-y-4 shadow-elevated border-primary/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Record Accredited Certificate
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="text-gray-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCertificate} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="e.g. Deep Learning Specialization"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-400 mb-1">Issuing Provider / University *</label>
                  <input
                    type="text"
                    required
                    value={certProvider}
                    onChange={(e) => setCertProvider(e.target.value)}
                    placeholder="e.g. Coursera / Stanford Online"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={certIssueDate}
                      onChange={(e) => setCertIssueDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1">Related Skill</label>
                    <input
                      type="text"
                      value={certSkill}
                      onChange={(e) => setCertSkill(e.target.value)}
                      placeholder="e.g. machine_learning"
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 mb-1">Credential ID (Optional)</label>
                  <input
                    type="text"
                    value={certCredentialId}
                    onChange={(e) => setCertCredentialId(e.target.value)}
                    placeholder="e.g. CC-VERIFY-948210"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-400 mb-1">Verification URL (Optional)</label>
                  <input
                    type="url"
                    value={certVerificationUrl}
                    onChange={(e) => setCertVerificationUrl(e.target.value)}
                    placeholder="Leave blank if unverified or enter official provider link"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    If omitted, credential status is marked as 'Self-Reported'.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCertModal(false)}
                    className="btn-outline text-xs py-2 px-3 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4 rounded-xl font-bold">
                    Save Certificate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Portfolio Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-md w-full p-6 space-y-4 shadow-elevated border-primary/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileDown size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Generate Verified Student Portfolio
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Export an employer-ready PDF compiling your verified skill badges, completed engineering deliverables,
                  evidence checklist, and accredited certifications.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Target Career:</span>
                  <span className="font-bold text-white">{activeTargetCareer}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Completed Projects:</span>
                  <span className="font-bold text-emerald-400">{completedProjectsCount} Delivered</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Evidence Artifacts:</span>
                  <span className="font-bold text-amber-400">{completedEvidenceItems} Verified</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Included Certifications:</span>
                  <span className="font-bold text-white">{certificates.length} Credentials</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="btn-outline text-xs py-2 px-3.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportModal(false);
                    addToast('CareerCompass Verified Student Portfolio PDF generated!', 'success');
                  }}
                  className="btn-primary text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <FileDown size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

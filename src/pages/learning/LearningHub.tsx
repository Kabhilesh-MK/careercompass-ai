import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  FolderGit2,
  Building2,
  Search,
  Filter,
  ArrowRight,
  Target,
  CheckCircle2,
  Clock,
  Compass,
  Info,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  ResourceCard,
  LearningPathCard,
  ProjectCard,
  SimulationCard,
  SearchInput,
  FilterBar,
  Tabs,
  StatusBadge,
} from '@/components/design-system';
import { useLearning } from '@/hooks/useLearning';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/context/ToastContext';
import { CareerIntelligenceResponse } from '@/services/api/careerIntelligence';
import {
  getProjectRecommendations,
  RecommendedProject,
} from '@/services/api/projectRecommendations';

export default function LearningHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { state } = useAppState();
  const {
    resources,
    learningPaths,
    projects,
    simulations,
    startResource,
    updateResourceProgress,
    startProject,
  } = useLearning();

  const intel = state.careerIntelligence?.intelligenceResult as CareerIntelligenceResponse | null;
  const targetCareer = state.careerIntelligence?.activeTargetCareer || 'AI & Machine Learning Engineering';
  const targetSource = state.careerIntelligence?.targetSource || 'model_prediction';

  // Project recommendations for Step 16 transition bridge
  const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProject[]>([]);
  const activeSkills = state.careerIntelligence?.selectedSkills?.length
    ? state.careerIntelligence.selectedSkills
    : state.skills.map((s) => s.id.replace('sk-', ''));

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      if (!activeSkills.length) return;
      try {
        const res = await getProjectRecommendations({
          skills: activeSkills,
          target_career_track: targetCareer,
        });
        if (isMounted) {
          setRecommendedProjects(res.projects || []);
        }
      } catch {
        // Non-blocking for learning hub
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [targetCareer, activeSkills.length]);

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/courses')) return 'courses';
    if (location.pathname.includes('/paths')) return 'paths';
    if (location.pathname.includes('/projects')) return 'projects';
    if (location.pathname.includes('/experience')) return 'experience';
    return 'recommended';
  };

  const activeTab = getActiveTabFromPath();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'recommended') navigate('/learning');
    else if (tabId === 'courses') navigate('/learning/courses');
    else if (tabId === 'paths') navigate('/learning/paths');
    else if (tabId === 'projects') navigate('/learning/projects');
    else if (tabId === 'experience') navigate('/learning/experience');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const hubTabs = [
    { id: 'recommended', label: 'Recommended', icon: <Sparkles size={14} /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={14} />, badge: resources.length },
    { id: 'paths', label: 'Learning Paths', icon: <GraduationCap size={14} />, badge: learningPaths.length },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={14} />, badge: projects.length },
    { id: 'experience', label: 'Experience Lab', icon: <Building2 size={14} />, badge: 'Labs' },
  ];

  const platformOptions = [
    { id: 'all', label: 'All Platforms' },
    { id: 'Coursera', label: 'Coursera' },
    { id: 'DataCamp', label: 'DataCamp' },
    { id: 'Pluralsight', label: 'Pluralsight' },
    { id: 'Forage', label: 'Forage' },
  ];

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        searchQuery === '' ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform =
        selectedPlatform === 'all' || res.platform === selectedPlatform;

      return matchesSearch && matchesPlatform;
    });
  }, [resources, searchQuery, selectedPlatform]);

  const handleResourceAction = (res: any) => {
    if (!res.enrolled || (res.progress || 0) === 0) {
      startResource(res.id);
      addToast(`Enrolled in "${res.title}"! Progress started at 15%.`, 'success');
    } else if ((res.progress || 0) < 100) {
      const nextProgress = Math.min(100, (res.progress || 0) + 25);
      updateResourceProgress(res.id, nextProgress);
      addToast(`Progress updated for "${res.title}" (${nextProgress}%)!`, 'info');
    } else {
      addToast(`"${res.title}" already completed (100%)!`, 'info');
    }
  };

  // Top prioritized missing skill from ontology intelligence
  const topPrioritizedGap = intel?.prioritized_gaps?.[0];
  const intelligenceRecommendations = intel?.learning_recommendations || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Learning Hub
            </h1>
            <StatusBadge label="Intelligence V2" size="xs" variant="primary" dot />
            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
              Curated Educational Catalog
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Curated marketplace of industry coursework, structured roadmaps, portfolio projects, and job simulations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto font-semibold shadow-glow"
        >
          <span>View My Roadmap</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Hub Tabs Navigation */}
      <Tabs
        tabs={hubTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="pills"
      />

      {/* TAB 1: RECOMMENDED */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          {/* Spotlight banner connected to Career Intelligence */}
          {topPrioritizedGap ? (
            <div className="card p-6 bg-gradient-to-r from-primary/15 via-secondary/15 to-transparent border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Ontology-Driven Priority Recommendation
                  </span>
                  <StatusBadge
                    label={`${topPrioritizedGap.priority.toUpperCase()} GAP`}
                    size="xs"
                    variant={topPrioritizedGap.priority === 'core' ? 'danger' : 'warning'}
                  />
                  <span className="text-[11px] font-mono text-gray-400">
                    Target: {targetCareer}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Recommended Next Competency: {topPrioritizedGap.skill.toUpperCase()}
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  {topPrioritizedGap.reason} Prerequisite status:{' '}
                  <strong>{topPrioritizedGap.prerequisites_met ? 'Satisfied (Ready to Learn)' : 'Prerequisites Pending'}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/skills/gap')}
                  className="btn-outline text-xs py-2 px-3 rounded-xl font-semibold"
                >
                  View Gap Analysis
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/roadmap')}
                  className="btn-primary text-xs py-2 px-4 rounded-xl font-semibold shadow-glow"
                >
                  Open in Roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Generate Career Intelligence Plan</h3>
                <p className="text-xs text-gray-400">
                  Evaluate your current skills to receive curated courseware recommendations mapped directly to your
                  priority career gaps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/skills/gap')}
                className="btn-primary text-xs py-2 px-3.5 rounded-xl font-semibold shrink-0"
              >
                <span>Evaluate Skills</span>
                <ArrowRight size={13} className="ml-1 inline" />
              </button>
            </div>
          )}

          {/* Curated Career Intelligence Recommendations */}
          {intelligenceRecommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                    Curated Resources for Missing Competencies ({intelligenceRecommendations.length})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Directly mapped from verified courseware to your ontology skill gaps.
                  </p>
                </div>
                <StatusBadge label="Catalog-Matched" size="xs" variant="primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intelligenceRecommendations.map((rec) => (
                  <div
                    key={rec.resource_id}
                    className="card p-5 space-y-3 border-slate-800 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                          Stage {rec.roadmap_stage} · {rec.skill}
                        </span>
                        <StatusBadge label={rec.provider} size="xs" variant="neutral" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span>Effort: {rec.estimated_effort}</span>
                        <span>·</span>
                        <span className="font-semibold text-gray-300">{rec.difficulty}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToast(`Enrolled in "${rec.title}"! Added to active learning tasks.`, 'success');
                      }}
                      className="btn-primary text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-semibold w-full mt-2"
                    >
                      <BookOpen size={12} />
                      <span>Enroll in Module</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 16: LEARNING → PROJECT → EVIDENCE TRANSITION */}
          {intel && (intel.prioritized_gaps?.length > 0 || intelligenceRecommendations.length > 0) && (
            <div className="card p-6 border-primary/30 bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Evidence-Building Pipeline
                    </span>
                    <StatusBadge label="Step 16 Pipeline" size="xs" variant="primary" />
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Learning → Project → Evidence → Portfolio Progression
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Bridge missing skill coursework to hands-on project deliverables and verified portfolio artifacts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/portfolio/projects')}
                  className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <FolderGit2 size={13} />
                  <span>View All Projects</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Steps progression flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(intel.prioritized_gaps?.slice(0, 2) || []).map((gap) => {
                  const matchingLearning = intelligenceRecommendations.find((r) => r.skill === gap.skill);
                  const matchingProject = recommendedProjects.find(
                    (p) => p.skills_targeted.includes(gap.skill) || p.skills_demonstrated.includes(gap.skill)
                  ) || recommendedProjects[0];

                  return (
                    <div
                      key={gap.skill}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                            Competency: {gap.skill}
                          </span>
                          <StatusBadge
                            label={`${gap.priority.toUpperCase()} GAP`}
                            size="xs"
                            variant={gap.priority === 'core' ? 'danger' : 'warning'}
                          />
                        </div>

                        {/* Visual Pipeline */}
                        <div className="space-y-2.5 text-xs">
                          {/* 1. Learn */}
                          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                            <div className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                              1
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                Learn Skill
                              </span>
                              <p className="font-semibold text-white truncate">
                                {matchingLearning?.title || `Structured ${gap.skill} Coursework`}
                              </p>
                              <span className="text-[11px] text-gray-400">
                                Provider: {matchingLearning?.provider || 'Catalog Partner'} · Stage {matchingLearning?.roadmap_stage || 1}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-center text-gray-500">
                            <ArrowRight size={12} className="rotate-90 md:rotate-0" />
                          </div>

                          {/* 2. Build Project */}
                          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                            <div className="w-5 h-5 rounded bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                              2
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                Build Project
                              </span>
                              <p className="font-semibold text-white truncate">
                                {matchingProject?.title || 'Applied Implementation Project'}
                              </p>
                              <span className="text-[11px] text-gray-400">
                                Difficulty: {matchingProject?.difficulty || 'Intermediate'} · Relevance: {matchingProject ? Math.round(matchingProject.relevance_score) : 85}/100
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-center text-gray-500">
                            <ArrowRight size={12} className="rotate-90 md:rotate-0" />
                          </div>

                          {/* 3. Portfolio Evidence */}
                          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                            <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                              3
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                Collect Evidence
                              </span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {(matchingProject?.suggested_evidence || [
                                  'GitHub Repository',
                                  'README Documentation',
                                  'Working Demo',
                                ]).slice(0, 3).map((ev) => (
                                  <span
                                    key={ev}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400 border border-emerald-500/20"
                                  >
                                    ✓ {ev}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        {matchingLearning && (
                          <button
                            type="button"
                            onClick={() => {
                              addToast(`Enrolled in "${matchingLearning.title}"!`, 'success');
                            }}
                            className="btn-outline text-[11px] py-1.5 px-3 rounded-lg flex-1 flex items-center justify-center gap-1.5"
                          >
                            <BookOpen size={12} />
                            <span>Enroll Course</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate('/portfolio/projects')}
                          className="btn-primary text-[11px] py-1.5 px-3 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-semibold"
                        >
                          <FolderGit2 size={12} />
                          <span>View Project & Evidence</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalog Resources */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider text-xs">
              General Catalog Offerings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.slice(0, 3).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onAction={handleResourceAction}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search courses, skills, tools..."
              className="max-w-md w-full"
            />
            <FilterBar
              options={platformOptions}
              selectedId={selectedPlatform}
              onSelect={setSelectedPlatform}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onAction={handleResourceAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEARNING PATHS */}
      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <LearningPathCard
              key={path.id}
              path={path}
              onSelect={() => navigate('/roadmap')}
            />
          ))}
        </div>
      )}

      {/* TAB 4: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenDetails={(proj) => {
                startProject(proj.id);
                addToast(`Started project "${proj.title}"! Added to portfolio tasks.`, 'success');
              }}
            />
          ))}
        </div>
      )}

      {/* TAB 5: EXPERIENCE LAB */}
      {activeTab === 'experience' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulations.map((simulation) => (
            <SimulationCard
              key={simulation.id}
              simulation={simulation}
              onOpen={() => {
                navigate('/learning/experience');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

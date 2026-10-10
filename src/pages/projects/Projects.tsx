import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2, Clock, Star, ArrowRight, Filter, Search, CheckCircle2,
  Play, RotateCcw, Heart, Sparkles, Map, AlertCircle, Layers, Check
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { Badge, Chip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/Progress';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { listProjects, getRecommendedProjects } from '@/services/resourceService';
import { updateProjectProgress, addFavorite, removeFavorite } from '@/services/engagementService';

const CANONICAL_CAREERS = [
  'All Careers',
  'AI Engineer',
  'Backend Developer',
  'Business Analyst',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Frontend Developer',
  'Full Stack Developer',
  'ML Engineer',
  'Mobile App Developer',
  'QA Engineer',
  'Software Engineer',
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUS_TABS = ['All Projects', 'Recommended', 'In Progress', 'Completed'];

const difficultyColors: Record<string, 'success' | 'warning' | 'danger'> = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
};

interface ProjectItem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  career: string;
  career_slug: string;
  category: string;
  skills: string[];
  difficulty: string;
  duration: string;
  learning_outcomes?: string[];
  status?: string;
  progress_pct?: number;
  completed?: boolean;
  is_favorite?: boolean;
  relevance_score?: number;
  recommendation_reason?: string;
  matched_gaps?: string[];
}

export default function ProjectsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [careerFilter, setCareerFilter] = useState<string>(searchParams.get('career') || 'All Careers');
  const [skillFilter, setSkillFilter] = useState<string>(searchParams.get('skill') || 'All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusTab, setStatusTab] = useState<string>('All Projects');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [recommendedData, setRecommendedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sync with searchParams
  useEffect(() => {
    const c = searchParams.get('career');
    if (c && c !== careerFilter) {
      setCareerFilter(c);
    }
    const s = searchParams.get('skill');
    if (s && s !== skillFilter) {
      setSkillFilter(s);
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeCareer = careerFilter !== 'All Careers' ? careerFilter : undefined;
      const [allProjects, recs] = await Promise.all([
        listProjects({
          career: activeCareer,
          skill: skillFilter !== 'All' ? skillFilter : undefined,
          difficulty: difficultyFilter,
          search: searchQuery.trim() || undefined,
        }),
        getRecommendedProjects(activeCareer).catch(() => null),
      ]);

      setProjects(Array.isArray(allProjects) ? allProjects : []);
      if (recs) {
        setRecommendedData(recs);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      addToast('Could not load projects catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [careerFilter, skillFilter, difficultyFilter, searchQuery]);

  const handleCareerChange = (career: string) => {
    setCareerFilter(career);
    const p: Record<string, string> = {};
    if (career !== 'All Careers') p.career = career;
    if (skillFilter !== 'All') p.skill = skillFilter;
    setSearchParams(p);
  };

  const handleSkillChange = (skill: string) => {
    setSkillFilter(skill);
    const p: Record<string, string> = {};
    if (careerFilter !== 'All Careers') p.career = careerFilter;
    if (skill !== 'All') p.skill = skill;
    setSearchParams(p);
  };

  // Progress actions
  const handleUpdateProgress = async (project: ProjectItem, newPct: number, newStatus?: string) => {
    setUpdatingId(project.id);
    const isCompleted = newPct >= 100 || newStatus === 'completed';
    const status = newStatus || (isCompleted ? 'completed' : newPct > 0 ? 'in-progress' : 'not_started');

    try {
      await updateProjectProgress(project.id, newPct, isCompleted, status);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? { ...p, progress_pct: newPct, completed: isCompleted, status }
            : p
        )
      );
      addToast(
        isCompleted
          ? `🎉 "${project.title}" completed!`
          : `Progress updated to ${newPct}%`,
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Failed to update progress', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async (project: ProjectItem) => {
    const isFav = project.is_favorite;
    try {
      if (isFav) {
        await removeFavorite('project', project.id);
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, is_favorite: false } : p))
        );
        addToast(`Removed "${project.title}" from favorites`, 'info');
      } else {
        await addFavorite({
          item_type: 'project',
          item_id: project.id,
          item_title: project.title,
          item_meta: {
            career: project.career,
            difficulty: project.difficulty,
            skills: project.skills,
          },
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, is_favorite: true } : p))
        );
        addToast(`Saved "${project.title}" to favorites ❤️`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update favorites', 'error');
    }
  };

  // Extract all unique skills across loaded projects for filter chips
  const allSkills = Array.from(
    new Set(projects.flatMap((p) => p.skills || []))
  ).slice(0, 15);

  // Filter projects by status tab
  const filteredProjects = projects.filter((p) => {
    if (statusTab === 'Recommended') {
      return (p.relevance_score || 0) >= 40 && !p.completed;
    }
    if (statusTab === 'In Progress') {
      return p.status === 'in-progress' && !p.completed;
    }
    if (statusTab === 'Completed') {
      return p.completed;
    }
    return true;
  });

  const completedCount = projects.filter((p) => p.completed).length;
  const inProgressCount = projects.filter((p) => p.status === 'in-progress').length;

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Practical Capstone Projects"
        subtitle="Hands-on portfolio projects directly connected to your career goals and prioritized skill gaps."
      >
        <div className="flex items-center gap-2">
          <Badge color="primary">
            <FolderGit2 size={13} /> {projects.length} Available
          </Badge>
          {completedCount > 0 && (
            <Badge color="success">
              <CheckCircle2 size={13} /> {completedCount} Completed
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* Hero & Career Switcher Banner */}
      <div className="card p-5 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Career-Aware Projects
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              {careerFilter !== 'All Careers' ? `${careerFilter} Projects` : 'All Technical Tracks'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Completing projects creates verified portfolio proof and practices your priority skill gaps.
            </p>
          </div>

          {/* Career context dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <label htmlFor="project-career-select" className="sr-only">Select Career Track</label>
            <select
              id="project-career-select"
              value={careerFilter}
              onChange={(e) => handleCareerChange(e.target.value)}
              className="input text-xs py-2 px-3 font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl"
            >
              {CANONICAL_CAREERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {careerFilter !== 'All Careers' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => navigate(`/roadmap?career=${encodeURIComponent(careerFilter)}`)}
              >
                <Map size={13} /> View Roadmap
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Section Callout (if available and matching) */}
      {recommendedData && recommendedData.recommended?.length > 0 && statusTab === 'All Projects' && !searchQuery && (
        <Card delay={0.05} className="border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <Star size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                  Recommended for {recommendedData.target_role}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Prioritized by career alignment and your current skill gap requirements.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusTab('Recommended')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              View Top Picks &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendedData.recommended.slice(0, 2).map((rp: ProjectItem) => (
              <div
                key={rp.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-primary/20 hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-gray-900 dark:text-slate-100 line-clamp-1">
                    {rp.title}
                  </span>
                  <Badge color="success" className="text-[10px] shrink-0 font-bold">
                    {rp.relevance_score}% Match
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-2">
                  {rp.recommendation_reason || rp.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Skills: {rp.skills.slice(0, 3).join(', ')}
                  </span>
                  <button
                    onClick={() => handleUpdateProgress(rp, 25, 'in-progress')}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Start Project <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, description, or skill (e.g. SQL, React, Docker)..."
              className="input pl-9 text-xs w-full py-2.5 rounded-xl border-gray-200 dark:border-slate-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 shrink-0">Difficulty:</span>
            <div className="flex gap-1">
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  active={difficultyFilter === d}
                  onClick={() => setDifficultyFilter(d)}
                  className="text-xs"
                >
                  {d}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* Status Tabs & Skill Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
          {/* Status Tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusTab === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
                {tab === 'In Progress' && inProgressCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white">
                    {inProgressCount}
                  </span>
                )}
                {tab === 'Completed' && completedCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white">
                    {completedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Skill Filter Chips */}
          {allSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400 mr-1">Skills:</span>
              <Chip
                active={skillFilter === 'All'}
                onClick={() => handleSkillChange('All')}
                className="text-[11px]"
              >
                All Skills
              </Chip>
              {allSkills.slice(0, 6).map((s) => (
                <Chip
                  key={s}
                  active={skillFilter === s}
                  onClick={() => handleSkillChange(s)}
                  className="text-[11px]"
                >
                  {s}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-64 skeleton animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <FolderGit2 size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
            No projects found
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {statusTab === 'Completed'
              ? 'You have not completed any projects in this view yet. Start one from the available tracks!'
              : statusTab === 'In Progress'
              ? 'No projects currently in progress. Select a project to start learning.'
              : 'Try adjusting your search query, career track, or skill filters.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCareerFilter('All Careers');
                setSkillFilter('All');
                setDifficultyFilter('All');
                setStatusTab('All Projects');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
            {careerFilter !== 'All Careers' && (
              <Button
                size="sm"
                onClick={() => navigate(`/skill-gap?career=${encodeURIComponent(careerFilter)}`)}
              >
                Inspect Skill Gaps
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((p, i) => {
              const isCompleted = p.completed || p.status === 'completed';
              const isInProgress = p.status === 'in-progress';
              const progressPct = p.progress_pct || 0;

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    hover
                    className={`flex flex-col h-full relative transition ${
                      isCompleted
                        ? 'border-success/30 bg-success/5 dark:bg-success/5'
                        : isInProgress
                        ? 'border-primary/40 ring-1 ring-primary/20'
                        : ''
                    }`}
                  >
                    {/* Card Top: Icon, Career & Favorite */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-success text-white'
                              : isInProgress
                              ? 'bg-primary text-white'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {isCompleted ? <Check size={18} /> : <FolderGit2 size={18} />}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {p.career}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge
                              color={difficultyColors[p.difficulty] || 'gray'}
                              className="text-[10px]"
                            >
                              {p.difficulty}
                            </Badge>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> {p.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => handleToggleFavorite(p)}
                        className={`p-2 rounded-lg transition ${
                          p.is_favorite
                            ? 'text-danger bg-danger/10'
                            : 'text-gray-400 hover:text-danger hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                        title={p.is_favorite ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart size={16} fill={p.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">
                      {p.description}
                    </p>

                    {/* Educational Rationale (if present) */}
                    {p.recommendation_reason && (
                      <div className="mt-2.5 p-2 rounded-lg bg-primary/5 border border-primary/10 text-[11px] text-primary leading-tight">
                        <span className="font-semibold">Why this project:</span> {p.recommendation_reason}
                      </div>
                    )}

                    {/* Skills Chips (Linked to Skill Gap) */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Skills Practiced
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.map((s) => (
                          <span
                            key={s}
                            onClick={() => navigate(`/skill-gap?career=${encodeURIComponent(p.career)}`)}
                            className="chip bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] hover:bg-primary/10 hover:text-primary cursor-pointer transition font-medium"
                            title="Inspect gap in Skill Gap page"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-gray-400">
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                        </span>
                        <span className={isCompleted ? 'text-success' : 'text-primary'}>
                          {progressPct}%
                        </span>
                      </div>
                      <ProgressBar
                        value={progressPct}
                        color={isCompleted ? 'success' : 'primary'}
                        height="h-1.5"
                      />

                      {/* Action Buttons */}
                      <div className="mt-3 flex items-center gap-2">
                        {isCompleted ? (
                          <>
                            <div className="flex-1 text-xs font-bold text-success flex items-center gap-1.5">
                              <CheckCircle2 size={15} /> Completed ✓
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              disabled={updatingId === p.id}
                              onClick={() => handleUpdateProgress(p, 50, 'in-progress')}
                              title="Reopen project to continue practice"
                            >
                              <RotateCcw size={12} /> Reopen
                            </Button>
                          </>
                        ) : isInProgress ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              disabled={updatingId === p.id}
                              onClick={() => handleUpdateProgress(p, Math.min(90, progressPct + 25))}
                            >
                              +25% Progress
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              disabled={updatingId === p.id}
                              onClick={() => handleUpdateProgress(p, 100, 'completed')}
                            >
                              <Check size={13} /> Complete
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs font-semibold"
                            disabled={updatingId === p.id}
                            onClick={() => handleUpdateProgress(p, 25, 'in-progress')}
                          >
                            <Play size={12} /> Start Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </PageContainer>
  );
}

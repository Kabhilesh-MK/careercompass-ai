import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Clock, Star, ArrowRight, Filter, Search, CheckCircle2,
  ExternalLink, RotateCcw, Heart, Sparkles, Map, GraduationCap, Check
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { Badge, Chip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useToast } from '@/context/ToastContext';
import { listCertifications, getRecommendedCertifications } from '@/services/resourceService';
import { updateCertificationProgress, addFavorite, removeFavorite } from '@/services/engagementService';

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

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUS_TABS = ['All Certifications', 'Recommended', 'In Progress', 'Earned'];

const levelColors: Record<string, 'success' | 'warning' | 'danger'> = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
};

interface CertificationItem {
  id: string;
  _id?: string;
  title: string;
  provider: string;
  career: string;
  career_slug: string;
  category: string;
  skills: string[];
  level: string;
  duration: string;
  official_url?: string;
  description: string;
  status?: string;
  completed?: boolean;
  is_favorite?: boolean;
  relevance_score?: number;
  recommendation_reason?: string;
  matched_gaps?: string[];
}

export default function CertificationsPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [careerFilter, setCareerFilter] = useState<string>(searchParams.get('career') || 'All Careers');
  const [skillFilter, setSkillFilter] = useState<string>(searchParams.get('skill') || 'All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [statusTab, setStatusTab] = useState<string>('All Certifications');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [recommendedData, setRecommendedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const c = searchParams.get('career');
    if (c && c !== careerFilter) setCareerFilter(c);
    const s = searchParams.get('skill');
    if (s && s !== skillFilter) setSkillFilter(s);
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeCareer = careerFilter !== 'All Careers' ? careerFilter : undefined;
      const [allCerts, recs] = await Promise.all([
        listCertifications({
          career: activeCareer,
          skill: skillFilter !== 'All' ? skillFilter : undefined,
          level: levelFilter,
          search: searchQuery.trim() || undefined,
        }),
        getRecommendedCertifications(activeCareer).catch(() => null),
      ]);

      setCertifications(Array.isArray(allCerts) ? allCerts : []);
      if (recs) setRecommendedData(recs);
    } catch (err) {
      console.error('Failed to load certifications:', err);
      addToast('Could not load certifications catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [careerFilter, skillFilter, levelFilter, searchQuery]);

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

  const handleUpdateStatus = async (cert: CertificationItem, completed: boolean, newStatus?: string) => {
    setUpdatingId(cert.id);
    const status = newStatus || (completed ? 'completed' : 'in-progress');

    try {
      await updateCertificationProgress(cert.id, completed, status);
      setCertifications((prev) =>
        prev.map((c) => (c.id === cert.id ? { ...c, completed, status } : c))
      );
      addToast(
        completed
          ? `🎉 Earned "${cert.title}"!`
          : `Added "${cert.title}" to in-progress certifications`,
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Failed to update certification progress', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFavorite = async (cert: CertificationItem) => {
    const isFav = cert.is_favorite;
    try {
      if (isFav) {
        await removeFavorite('certification', cert.id);
        setCertifications((prev) =>
          prev.map((c) => (c.id === cert.id ? { ...c, is_favorite: false } : c))
        );
        addToast(`Removed "${cert.title}" from favorites`, 'info');
      } else {
        await addFavorite({
          item_type: 'certification',
          item_id: cert.id,
          item_title: cert.title,
          item_meta: {
            provider: cert.provider,
            level: cert.level,
            career: cert.career,
          },
        });
        setCertifications((prev) =>
          prev.map((c) => (c.id === cert.id ? { ...c, is_favorite: true } : c))
        );
        addToast(`Saved "${cert.title}" to favorites ❤️`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update favorites', 'error');
    }
  };

  const allSkills = Array.from(
    new Set(certifications.flatMap((c) => c.skills || []))
  ).slice(0, 15);

  const filteredCerts = certifications.filter((c) => {
    if (statusTab === 'Recommended') return (c.relevance_score || 0) >= 40 && !c.completed;
    if (statusTab === 'In Progress') return c.status === 'in-progress' && !c.completed;
    if (statusTab === 'Earned') return c.completed;
    return true;
  });

  const earnedCount = certifications.filter((c) => c.completed).length;
  const inProgressCount = certifications.filter((c) => c.status === 'in-progress').length;

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Industry Certifications"
        subtitle="Recognized credentials from authorized vendors validating your domain expertise and career readiness."
      >
        <div className="flex items-center gap-2">
          <Badge color="primary">
            <Award size={13} /> {certifications.length} Credentials
          </Badge>
          {earnedCount > 0 && (
            <Badge color="success">
              <CheckCircle2 size={13} /> {earnedCount} Earned
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* Hero & Career Switcher Banner */}
      <div className="card p-5 bg-gradient-to-br from-primary/5 via-amber-500/5 to-transparent border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Authorized Credentials
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              {careerFilter !== 'All Careers' ? `${careerFilter} Certifications` : 'All Industry Credentials'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Verified certifications from Google, AWS, Microsoft, Meta, IBM, CompTIA, and Linux Foundation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <label htmlFor="cert-career-select" className="sr-only">Select Career Track</label>
            <select
              id="cert-career-select"
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

      {/* Recommended Section Callout */}
      {recommendedData && recommendedData.recommended?.length > 0 && statusTab === 'All Certifications' && !searchQuery && (
        <Card delay={0.05} className="border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Star size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                  Recommended for {recommendedData.target_role}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Targeted credentials addressing foundational knowledge and priority competencies.
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
            {recommendedData.recommended.slice(0, 2).map((rc: CertificationItem) => (
              <div
                key={rc.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-primary/20 hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="font-bold text-sm text-gray-900 dark:text-slate-100 line-clamp-1">
                      {rc.title}
                    </span>
                    <span className="text-xs text-gray-400">{rc.provider}</span>
                  </div>
                  <Badge color="success" className="text-[10px] shrink-0 font-bold">
                    {rc.relevance_score}% Match
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-2">
                  {rc.recommendation_reason || rc.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400">
                    Skills: {rc.skills.slice(0, 3).join(', ')}
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(rc, false, 'in-progress')}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Start Certification <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search certifications by title, provider, or skill (e.g. AWS, PL-300, Security+)..."
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 shrink-0">Level:</span>
            <div className="flex gap-1">
              {LEVELS.map((lvl) => (
                <Chip
                  key={lvl}
                  active={levelFilter === lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className="text-xs"
                >
                  {lvl}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
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
                {tab === 'Earned' && earnedCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white">
                    {earnedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

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

      {/* Certifications Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-60 skeleton animate-pulse" />
          ))}
        </div>
      ) : filteredCerts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Award size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
            No certifications found
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {statusTab === 'Earned'
              ? 'You have not marked any certifications as completed yet.'
              : statusTab === 'In Progress'
              ? 'No certifications currently in progress.'
              : 'Try adjusting your search query, career track, or level filter.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCareerFilter('All Careers');
                setSkillFilter('All');
                setLevelFilter('All');
                setStatusTab('All Certifications');
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
            {filteredCerts.map((c, i) => {
              const isEarned = c.completed || c.status === 'completed';
              const isInProgress = c.status === 'in-progress';

              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    hover
                    className={`flex flex-col h-full relative transition ${
                      isEarned
                        ? 'border-success/30 bg-success/5 dark:bg-success/5'
                        : isInProgress
                        ? 'border-primary/40 ring-1 ring-primary/20'
                        : ''
                    }`}
                  >
                    {/* Card Top: Icon, Provider & Favorite */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isEarned
                              ? 'bg-success text-white'
                              : isInProgress
                              ? 'bg-primary text-white'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isEarned ? <Check size={18} /> : <Award size={18} />}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            {c.provider}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge
                              color={levelColors[c.level] || 'gray'}
                              className="text-[10px]"
                            >
                              {c.level}
                            </Badge>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> {c.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFavorite(c)}
                        className={`p-2 rounded-lg transition ${
                          c.is_favorite
                            ? 'text-danger bg-danger/10'
                            : 'text-gray-400 hover:text-danger hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                        title={c.is_favorite ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart size={16} fill={c.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">
                      {c.description}
                    </p>

                    {/* Rationale */}
                    {c.recommendation_reason && (
                      <div className="mt-2.5 p-2 rounded-lg bg-primary/5 border border-primary/10 text-[11px] text-primary leading-tight">
                        <span className="font-semibold">Relevance:</span> {c.recommendation_reason}
                      </div>
                    )}

                    {/* Skills Chips */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Verified Competencies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.map((s) => (
                          <span
                            key={s}
                            onClick={() => navigate(`/skill-gap?career=${encodeURIComponent(c.career)}`)}
                            className="chip bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] hover:bg-primary/10 hover:text-primary cursor-pointer transition font-medium"
                            title="Inspect gap in Skill Gap page"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-gray-400">
                          Status: {isEarned ? 'Earned' : isInProgress ? 'In Progress' : 'Not Started'}
                        </span>
                        {c.official_url && (
                          <a
                            href={c.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            Syllabus <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isEarned ? (
                          <>
                            <div className="flex-1 text-xs font-bold text-success flex items-center gap-1.5">
                              <CheckCircle2 size={15} /> Earned ✓
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              disabled={updatingId === c.id}
                              onClick={() => handleUpdateStatus(c, false, 'in-progress')}
                              title="Reopen certification"
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
                              onClick={() => navigate(`/roadmap?career=${encodeURIComponent(c.career)}`)}
                            >
                              <GraduationCap size={13} /> In Roadmap
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              disabled={updatingId === c.id}
                              onClick={() => handleUpdateStatus(c, true, 'completed')}
                            >
                              <Check size={13} /> Mark Earned
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1 text-xs font-semibold"
                              disabled={updatingId === c.id}
                              onClick={() => handleUpdateStatus(c, false, 'in-progress')}
                            >
                              Start Track
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs font-semibold"
                              disabled={updatingId === c.id}
                              onClick={() => handleUpdateStatus(c, true, 'completed')}
                            >
                              Mark Earned
                            </Button>
                          </>
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

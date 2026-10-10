import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Hammer,
  Award,
  Map,
  GitCompare,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Briefcase,
  TrendingUp,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ProgressBar, ProgressCircle } from '@/components/Progress';
import { useToast } from '@/context/ToastContext';
import { getCareerDetail, getCareerFit } from '@/services/resourceService';
import { addFavorite, removeFavorite, checkFavorite } from '@/services/engagementService';

export default function CareerDetailPage() {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [career, setCareer] = useState<any>(null);
  const [fitData, setFitData] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!careerId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getCareerDetail(careerId),
      getCareerFit(careerId).catch((err) => {
        console.warn('Could not fetch user career fit:', err);
        return null;
      }),
      checkFavorite('career', careerId).catch(() => ({ is_favorite: false })),
    ])
      .then(([careerRes, fitRes, favRes]) => {
        if (!isMounted) return;
        setCareer(careerRes);
        setFitData(fitRes);
        setIsSaved(Boolean(favRes?.is_favorite));
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load career detail:', err);
        setError(err.message || 'Unable to load career details from the knowledge base.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [careerId]);

  const handleToggleFavorite = async () => {
    if (!career) return;
    const slug = career.slug || careerId;
    try {
      if (isSaved) {
        await removeFavorite('career', slug);
        setIsSaved(false);
        addToast(`Removed ${career.title} from saved careers`, 'info');
      } else {
        await addFavorite({
          item_type: 'career',
          item_id: slug,
          item_title: career.title,
          item_meta: {
            category: career.category,
            demand: career.demand,
            match: fitData?.skill_fit?.match_percentage || 0,
          },
        });
        setIsSaved(true);
        addToast(`Saved ${career.title} to your favorites`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update saved career state', 'error');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="skeleton h-12 w-48 rounded-xl" />
          <div className="skeleton h-56 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !career) {
    return (
      <PageContainer>
        <Card className="py-16 text-center">
          <Compass size={40} className="mx-auto text-danger/60 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Unable to load career information</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {error || 'The requested career track is not available in the current knowledge base.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate('/career')}>
              <ArrowLeft size={14} /> Back to Career Explorer
            </Button>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const modelProbability = fitData?.model_probability;
  const matchPercentage = fitData?.skill_fit?.match_percentage ?? 0;
  const currentSkills = fitData?.skill_fit?.current_skills || [];
  const criticalGaps = fitData?.skill_fit?.critical_gaps || [];
  const importantGaps = fitData?.skill_fit?.important_gaps || [];
  const developingGaps = fitData?.skill_fit?.developing_gaps || [];
  const recommendedProjects = fitData?.recommended_projects || [];
  const recommendedCerts = fitData?.recommended_certifications || [];
  const roadmapPreview = fitData?.roadmap_preview;

  return (
    <PageContainer>
      {/* Top Nav & Action Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <button
          onClick={() => navigate('/career')}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-primary transition font-medium"
        >
          <ArrowLeft size={14} /> Back to Career Explorer
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? 'primary' : 'outline'}
            className="text-xs"
            onClick={handleToggleFavorite}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {isSaved ? 'Saved to Favorites' : 'Save Career'}
          </Button>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => navigate('/career-comparison')}
          >
            <GitCompare size={14} /> Compare Track
          </Button>
        </div>
      </div>

      {/* HEADER HERO */}
      <Card className="bg-gradient-to-br from-primary via-primary-700 to-indigo-900 text-white border-0 overflow-hidden relative" delay={0.05}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="chip bg-white/20 text-white text-xs font-semibold">
                <Briefcase size={12} /> {career.category}
              </span>
              <span className="chip bg-white/15 text-white text-[11px]">
                {career.demand} Demand
              </span>
              <span className="chip bg-white/15 text-white text-[11px]">
                {career.growth} Growth Outlook
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white">{career.title}</h1>
            <p className="text-white/85 text-sm mt-2 max-w-2xl leading-relaxed">
              {career.description}
            </p>

            {/* Model Probability Badge & Methodology Note */}
            <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-6">
              {modelProbability !== null && modelProbability !== undefined ? (
                <div>
                  <p className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Current Model Probability</p>
                  <p className="text-2xl font-black text-white mt-0.5">{modelProbability}%</p>
                  <p className="text-white/60 text-[10px] mt-0.5">Statistical profile similarity from frozen Random Forest</p>
                </div>
              ) : (
                <div>
                  <p className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Current Model Probability</p>
                  <p className="text-sm font-medium text-white/80 mt-0.5">Complete onboarding profile for prediction</p>
                </div>
              )}

              <div className="w-px h-10 bg-white/15 hidden sm:block" />

              <div>
                <p className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Competency Fit</p>
                <p className="text-2xl font-black text-white mt-0.5">{matchPercentage}%</p>
                <p className="text-white/60 text-[10px] mt-0.5">Weighted domain requirements met</p>
              </div>

              <div className="w-px h-10 bg-white/15 hidden sm:block" />

              <div>
                <p className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Standard Band</p>
                <p className="text-sm font-semibold text-white mt-0.5">{career.salary_range}</p>
                <p className="text-white/60 text-[10px] mt-0.5">Industry reference from knowledge base</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 self-center">
            <ProgressCircle
              value={matchPercentage}
              color="#ffffff"
              stroke={8}
              size={110}
              label={`${matchPercentage}%`}
              sublabel="Competency"
            />
            <span className="text-white/75 text-[11px] tracking-wider uppercase font-semibold mt-2">
              Curriculum Match
            </span>
          </div>
        </div>
      </Card>

      {/* SECTION 1 — ABOUT THIS CAREER */}
      <Card delay={0.08}>
        <CardHeader
          title="About This Career"
          subtitle="Role scope, core responsibilities, and industry requirements"
          icon={<Info size={16} />}
        />
        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300">
          <p className="leading-relaxed">
            As a <strong>{career.title}</strong>, you operate within the <strong>{career.category}</strong> domain,
            focusing on high-impact technical responsibilities that maintain reliability, quality, and architectural integrity.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
              <p className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Layers size={14} className="text-primary" /> Core Skill Areas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(career.core_skills || []).map((s: string) => (
                  <span key={s} className="chip bg-primary/10 text-primary font-medium text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
              <p className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-secondary" /> Supporting Competencies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(career.supporting_skills || []).map((s: string) => (
                  <span key={s} className="chip bg-gray-200/80 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                    {s}
                  </span>
                ))}
                {(career.soft_skills || []).map((s: string) => (
                  <span key={s} className="chip bg-secondary/10 text-secondary text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {career.interview_topics?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Industry Interview Focus Areas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {career.interview_topics.map((topic: string) => (
                  <span key={topic} className="chip bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[11px]">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 2 & 3 — CORE SKILLS & YOUR CURRENT FIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECTION 2 — CORE SKILLS */}
        <Card delay={0.1}>
          <CardHeader
            title="Core Technical Requirements"
            subtitle="Tiered knowledge base specifications for this career"
            icon={<Layers size={16} />}
          />
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Core Tier (Target: 75%+)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(career.core_skills || []).map((sk: string) => (
                  <Badge key={sk} color="primary">{sk}</Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Important Tier (Target: 60%+)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(career.important_skills || []).map((sk: string) => (
                  <Badge key={sk} color="secondary">{sk}</Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Supporting & Domain Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(career.supporting_skills || []).map((sk: string) => (
                  <Badge key={sk} color="gray">{sk}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 3 — YOUR CURRENT FIT */}
        <Card delay={0.12}>
          <CardHeader
            title="Your Current Profile Fit"
            subtitle="Direct evaluation of your actual recorded skill levels"
            icon={<CheckCircle2 size={16} />}
          />
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {currentSkills.length === 0 ? (
              <p className="text-xs text-gray-400 p-4 text-center">
                No skill profile recorded yet. Update your skills to see your comparative fit.
              </p>
            ) : (
              currentSkills.map((sk: any) => {
                const isMet = sk.status === 'met' || sk.level >= sk.required;
                return (
                  <div key={sk.name} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                        {isMet ? (
                          <CheckCircle2 size={14} className="text-success" />
                        ) : (
                          <AlertTriangle size={14} className="text-warning" />
                        )}
                        {sk.name}
                        <span className="text-[10px] text-gray-400 font-normal">({sk.tier})</span>
                      </span>
                      <span className={`font-bold ${isMet ? 'text-success' : 'text-warning'}`}>
                        {sk.level}% / {sk.required}%
                      </span>
                    </div>
                    <ProgressBar
                      value={sk.level}
                      color={isMet ? 'success' : 'warning'}
                      height="h-1.5"
                    />
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* SECTION 4 — YOUR SKILL GAPS */}
      <Card delay={0.14}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle size={17} className="text-warning" />
              Prioritized Skill Gaps
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Identified through the canonical single-source-of-truth skill gap engine
            </p>
          </div>
          <Button variant="outline" className="text-xs" onClick={() => navigate('/skill-gap')}>
            View Full Skill Gap <ArrowRight size={13} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Critical */}
          <div className="p-3.5 rounded-2xl bg-danger/5 border border-danger/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-danger uppercase tracking-wide">Critical Gaps</span>
              <span className="chip bg-danger/10 text-danger text-[10px] font-bold">{criticalGaps.length}</span>
            </div>
            {criticalGaps.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No critical gaps remaining!</p>
            ) : (
              criticalGaps.map((g: any) => (
                <div key={g.name} className="bg-white dark:bg-slate-800 p-2 rounded-xl text-xs shadow-xs">
                  <div className="flex justify-between font-medium text-gray-900 dark:text-slate-100">
                    <span>{g.name}</span>
                    <span className="text-danger font-bold">-{g.gap}%</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Current: {g.current}% · Target: {g.required}%</span>
                </div>
              ))
            )}
          </div>

          {/* Important */}
          <div className="p-3.5 rounded-2xl bg-warning/5 border border-warning/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-warning uppercase tracking-wide">Important Gaps</span>
              <span className="chip bg-warning/10 text-warning text-[10px] font-bold">{importantGaps.length}</span>
            </div>
            {importantGaps.length === 0 ? (
              <p className="text-xs text-gray-400 italic">All important thresholds met.</p>
            ) : (
              importantGaps.map((g: any) => (
                <div key={g.name} className="bg-white dark:bg-slate-800 p-2 rounded-xl text-xs shadow-xs">
                  <div className="flex justify-between font-medium text-gray-900 dark:text-slate-100">
                    <span>{g.name}</span>
                    <span className="text-warning font-bold">-{g.gap}%</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Current: {g.current}% · Target: {g.required}%</span>
                </div>
              ))
            )}
          </div>

          {/* Developing */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Developing Gaps</span>
              <span className="chip bg-primary/10 text-primary text-[10px] font-bold">{developingGaps.length}</span>
            </div>
            {developingGaps.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No secondary gaps detected.</p>
            ) : (
              developingGaps.map((g: any) => (
                <div key={g.name} className="bg-white dark:bg-slate-800 p-2 rounded-xl text-xs shadow-xs">
                  <div className="flex justify-between font-medium text-gray-900 dark:text-slate-100">
                    <span>{g.name}</span>
                    <span className="text-primary font-bold">-{g.gap}%</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Current: {g.current}% · Target: {g.required}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 5 — RECOMMENDED PROJECTS */}
      <Card delay={0.16}>
        <div className="flex items-center justify-between mb-3">
          <CardHeader
            title="Recommended Projects"
            subtitle="Verified portfolio projects prioritized to close your current skill gaps"
            icon={<Hammer size={16} />}
          />
          <Button variant="outline" className="text-xs" onClick={() => navigate('/projects')}>
            Explore Projects Catalogue <ArrowRight size={13} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedProjects.length === 0 ? (
            <p className="text-xs text-gray-400">No project catalogue records linked.</p>
          ) : (
            recommendedProjects.map((p: any) => (
              <div key={p.id || p.title} className="card p-4 flex flex-col justify-between border border-gray-100 dark:border-slate-800 hover:border-primary/40 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge color="primary">{p.difficulty || 'Intermediate'}</Badge>
                    <span className="text-[10px] text-gray-400 font-medium">{career.title}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100 leading-snug">{p.title}</h4>
                  <div className="mt-2.5 p-2 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[11px] text-gray-600 dark:text-slate-300">
                      <strong>Reason Recommended:</strong> {p.reason}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                  <Button variant="outline" className="text-xs" onClick={() => navigate('/projects')}>
                    View in Projects <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* SECTION 6 — CERTIFICATIONS */}
      <Card delay={0.18}>
        <div className="flex items-center justify-between mb-3">
          <CardHeader
            title="Industry Certifications"
            subtitle="Recognized credentials aligned with this career track"
            icon={<Award size={16} />}
          />
          <Button variant="outline" className="text-xs" onClick={() => navigate('/certifications')}>
            Explore Certifications <ArrowRight size={13} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendedCerts.length === 0 ? (
            <p className="text-xs text-gray-400">No certification records linked.</p>
          ) : (
            recommendedCerts.map((c: any) => (
              <div key={c.id || c.title} className="card p-3.5 flex flex-col justify-between border border-gray-100 dark:border-slate-800">
                <div>
                  <Badge color="success" className="mb-2">{c.provider || 'Accredited'}</Badge>
                  <h4 className="font-semibold text-xs text-gray-900 dark:text-slate-100 leading-snug">{c.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2">{c.reason}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => navigate('/certifications')}
                    className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Details <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* SECTION 7 — ROADMAP PREVIEW */}
      <Card delay={0.2}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="chip bg-warning/10 text-warning text-xs font-semibold mb-1 inline-flex items-center gap-1">
              <Map size={13} /> Roadmap Recommendation
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">
              {roadmapPreview?.track || 'Adaptive Career Roadmap'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-xl">
              {roadmapPreview?.description || 'Your learning journey adapts milestone pacing to your current critical skill gaps.'}
            </p>
          </div>
          <Button variant="primary" className="shrink-0 text-xs" onClick={() => navigate('/roadmap')}>
            View My Roadmap <ArrowRight size={13} />
          </Button>
        </div>
      </Card>

      {/* SECTION 8 — ACTIONS FOOTER */}
      <Card delay={0.22} className="bg-gray-50 dark:bg-slate-900/60 p-4 border border-gray-200 dark:border-slate-800">
        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Direct Actions For This Career Track
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="primary" className="text-xs" onClick={() => navigate('/skill-gap')}>
            <AlertTriangle size={13} /> View Skill Gap
          </Button>
          <Button variant="outline" className="text-xs" onClick={() => navigate('/roadmap')}>
            <Map size={13} /> View Roadmap
          </Button>
          <Button variant="outline" className="text-xs" onClick={() => navigate('/projects')}>
            <Hammer size={13} /> Explore Projects
          </Button>
          <Button variant="outline" className="text-xs" onClick={() => navigate('/certifications')}>
            <Award size={13} /> Explore Certifications
          </Button>
          <Button variant="outline" className="text-xs" onClick={() => navigate('/career-comparison')}>
            <GitCompare size={13} /> Compare Career
          </Button>
          <Button variant={isSaved ? 'primary' : 'outline'} className="text-xs" onClick={handleToggleFavorite}>
            {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {isSaved ? 'Saved in Favorites' : 'Save Career'}
          </Button>
        </div>
      </Card>

      {/* Methodology & Validation Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <ShieldCheck className="shrink-0 mt-0.5 text-primary" size={18} />
        <p className="text-[11px] leading-relaxed">
          <strong>Scientific Methodology Notice:</strong> Model probability reflects empirical class likelihood generated by the frozen 33-feature Random Forest model. Competency match calculates percentage of required domain technical skills currently mastered. Recommendations are drawn strictly from the CareerCompass verified knowledge base without artificial estimations.
        </p>
      </div>
    </PageContainer>
  );
}

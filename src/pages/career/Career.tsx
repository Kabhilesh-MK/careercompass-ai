import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Compass,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  GitCompare,
  Search,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { ProgressCircle, ProgressBar } from '@/components/Progress';
import { Button } from '@/components/Button';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { getLatestPrediction, listCareers } from '@/services/resourceService';
import { addFavorite, removeFavorite, getFavorites } from '@/services/engagementService';

interface CareerItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  required_skills: string[];
  core_skills?: string[];
  important_skills?: string[];
  supporting_skills?: string[];
  demand: string;
  growth: string;
  salary_range: string;
}

export default function CareerPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [predictionReport, setPredictionReport] = useState<any>(null);
  const [allCareers, setAllCareers] = useState<CareerItem[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<Set<string>>(new Set());
  const [selectedTopIndex, setSelectedTopIndex] = useState(0);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getLatestPrediction().catch(() => null),
      listCareers().catch(() => []),
      getFavorites('career').catch(() => []),
    ])
      .then(([predData, careersList, favsList]) => {
        if (!isMounted) return;
        if (predData && predData.prediction) {
          setPredictionReport(predData);
        }
        if (Array.isArray(careersList) && careersList.length > 0) {
          setAllCareers(careersList);
        }
        if (Array.isArray(favsList)) {
          setFavoriteSlugs(new Set(favsList.map((f: any) => f.item_id)));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load career explorer data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = async (career: CareerItem) => {
    const slug = career.slug || career.id;
    const isFav = favoriteSlugs.has(slug);
    try {
      if (isFav) {
        await removeFavorite('career', slug);
        setFavoriteSlugs((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
        addToast(`Removed ${career.title} from favorites`, 'info');
      } else {
        await addFavorite({
          item_type: 'career',
          item_id: slug,
          item_title: career.title,
          item_meta: {
            category: career.category,
            demand: career.demand,
          },
        });
        setFavoriteSlugs((prev) => new Set(prev).add(slug));
        addToast(`Saved ${career.title} to favorites`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update favorite', 'error');
    }
  };

  // Extract top predictions from predictionReport
  const topPredictions = useMemo(() => {
    return predictionReport?.prediction?.top_5_careers || [];
  }, [predictionReport]);

  const topCareer = topPredictions[0] || null;
  const activeTopPrediction = topPredictions[selectedTopIndex] || topCareer;

  // Probability chart data from genuine model probabilities
  const probabilityChartData = useMemo(() => {
    if (!topPredictions || topPredictions.length === 0) return [];
    return topPredictions.map((p: any) => ({
      name: p.career.length > 14 ? p.career.split(' ')[0] : p.career,
      full_name: p.career,
      probability: p.probability,
    }));
  }, [topPredictions]);

  // Derive categories from canonical careers
  const categories = useMemo(() => {
    const set = new Set<string>();
    allCareers.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [allCareers]);

  // Filtered careers for Section B
  const filteredCareers = useMemo(() => {
    return allCareers.filter((c) => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCat;

      const matchTitle = c.title.toLowerCase().includes(query);
      const matchDesc = c.description.toLowerCase().includes(query);
      const matchSkill = (c.required_skills || []).some((s) => s.toLowerCase().includes(query));
      return matchCat && (matchTitle || matchDesc || matchSkill);
    });
  }, [allCareers, selectedCategory, searchQuery]);

  // Compute "Why This Career?" explanation for active top prediction
  const activeWhyData = useMemo(() => {
    if (!activeTopPrediction) return null;
    const careerName = activeTopPrediction.career;
    const userSkillsMap: Record<string, number> = {};

    (user?.skills || []).forEach((cat: any) => {
      (cat.skills || []).forEach((sk: any) => {
        userSkillsMap[sk.name] = Number(sk.level || 0);
      });
    });

    const matchedCareer = allCareers.find((c) => c.title.toLowerCase() === careerName.toLowerCase());
    const coreSkills = matchedCareer?.core_skills || matchedCareer?.required_skills?.slice(0, 4) || [];
    const importantSkills = matchedCareer?.important_skills || matchedCareer?.required_skills?.slice(4, 7) || [];

    const strongAlignment: Array<{ name: string; level: number }> = [];
    const areasToStrengthen: Array<{ name: string; current: number }> = [];

    coreSkills.concat(importantSkills).forEach((skName) => {
      const lvl = userSkillsMap[skName] ?? 0;
      if (lvl >= 60) {
        strongAlignment.push({ name: skName, level: lvl });
      } else {
        areasToStrengthen.push({ name: skName, current: lvl });
      }
    });

    const supportingFactors: string[] = [];
    if (user?.cgpa && Number(user.cgpa) >= 7.5) {
      supportingFactors.push(`Strong academic background (${user.cgpa} CGPA)`);
    }
    if (user?.projects_completed && Number(user.projects_completed) > 0) {
      supportingFactors.push(`${user.projects_completed} practical project(s) completed`);
    }
    if (user?.preferred_domain && matchedCareer?.category && matchedCareer.category.toLowerCase().includes(user.preferred_domain.toLowerCase())) {
      supportingFactors.push(`Matches your interest in ${user.preferred_domain}`);
    }

    return {
      careerName,
      probability: activeTopPrediction.probability,
      strongAlignment,
      supportingFactors,
      areasToStrengthen,
    };
  }, [activeTopPrediction, user, allCareers]);

  // Format prediction date
  const lastUpdated = useMemo(() => {
    if (!predictionReport?.updated_at && !predictionReport?.created_at) return null;
    const dateStr = predictionReport.updated_at || predictionReport.created_at;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [predictionReport]);

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Explore Your Career Paths"
        subtitle="Understand your current career matches and explore other paths based on your skills and interests."
      >
        <Button onClick={() => navigate('/career-comparison')} variant="outline" className="text-xs">
          <GitCompare size={14} /> Compare Careers
        </Button>
        <Badge color="primary"><Sparkles size={13} /> ML Prediction Engine</Badge>
      </PageHeader>

      {/* SECTION A — YOUR CURRENT CAREER PROFILE */}
      {predictionReport && topCareer ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Section A — Your Current Career Profile
              </h2>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} /> Last evaluated: {lastUpdated}
              </span>
            )}
          </div>

          {/* Top predicted career card */}
          <Card className="bg-gradient-to-br from-primary via-primary-700 to-indigo-900 text-white border-0 overflow-hidden" delay={0.05}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="chip bg-white/20 text-white text-xs font-semibold">
                    <Compass size={13} /> Top Career Path
                  </span>
                  <span className="chip bg-white/20 text-white text-[11px] font-semibold">
                    {topCareer.probability}% Model Probability
                  </span>
                  <span className="chip bg-white/15 text-white text-[11px]">
                    Based on your current profile
                  </span>
                </div>

                <h3 className="text-3xl font-extrabold text-white tracking-tight">{topCareer.career}</h3>
                <p className="text-white/80 text-sm mt-2 max-w-2xl leading-relaxed">
                  Relative prediction from your current profile features evaluated against the validated Random Forest model.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/15">
                  <Button
                    variant="secondary"
                    className="text-xs font-semibold"
                    onClick={() => {
                      const matched = allCareers.find((c) => c.title.toLowerCase() === topCareer.career.toLowerCase());
                      const slug = matched?.slug || topCareer.career.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      navigate(`/career/${slug}`);
                    }}
                  >
                    View Career Details <ArrowUpRight size={13} />
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs text-white border-white/30 hover:bg-white/10"
                    onClick={() => navigate('/skill-gap')}
                  >
                    Check Skill Gap
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center shrink-0 self-center">
                <ProgressCircle
                  value={topCareer.probability}
                  color="#ffffff"
                  stroke={8}
                  size={105}
                  label={`${topCareer.probability}%`}
                  sublabel="Model Prob."
                />
                <span className="text-white/70 text-[10px] tracking-wider uppercase font-semibold mt-1.5">
                  Model Probability
                </span>
              </div>
            </div>
          </Card>

          {/* Top 5 Predictions + "Why This Career?" Explainability */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Top 5 List */}
            <Card className="lg:col-span-5" delay={0.08}>
              <CardHeader
                title="Top Career Paths From Your Current Profile"
                subtitle="Ranked display of genuine model prediction probabilities"
                icon={<Briefcase size={16} />}
              />
              <div className="space-y-2 mt-2">
                {topPredictions.map((item: any, idx: number) => {
                  const isSelected = selectedTopIndex === idx;
                  const matched = allCareers.find((c) => c.title.toLowerCase() === item.career.toLowerCase());
                  const slug = matched?.slug || item.career.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                  return (
                    <div
                      key={item.career}
                      onClick={() => setSelectedTopIndex(idx)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-primary/5 border-primary/40 shadow-xs'
                          : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            idx === 0
                              ? 'bg-primary text-white shadow-soft'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                            {item.career}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {matched?.category || 'Technology'} · Model match
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-primary block leading-none">
                            {item.probability}%
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium uppercase">
                            Model Prob.
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/career/${slug}`);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                          title="View Details"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* "Why This Career?" Explainability Panel */}
            <Card className="lg:col-span-7" delay={0.1}>
              <div className="flex items-center justify-between mb-3">
                <CardHeader
                  title={`Why ${activeWhyData?.careerName || 'This Career'}?`}
                  subtitle="Explainable alignment based on your actual profile and verified knowledge base"
                  icon={<Sparkles size={16} />}
                />
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    const matched = allCareers.find((c) => c.title.toLowerCase() === activeWhyData?.careerName.toLowerCase());
                    const slug = matched?.slug || activeWhyData?.careerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    navigate(`/career/${slug}`);
                  }}
                >
                  View Details <ArrowRight size={12} />
                </Button>
              </div>

              {activeWhyData ? (
                <div className="space-y-4">
                  {/* Strong alignment */}
                  <div className="p-3.5 rounded-2xl bg-success/5 border border-success/15">
                    <p className="text-xs font-bold text-success uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Strong Profile Alignment
                    </p>
                    {activeWhyData.strongAlignment.length === 0 ? (
                      <p className="text-xs text-gray-500">Developing profile baseline for this career.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {activeWhyData.strongAlignment.map((sk) => (
                          <span key={sk.name} className="chip bg-success/10 text-success text-xs font-semibold">
                            ✓ {sk.name} — {sk.level}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Supporting factors */}
                  <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} /> Supporting Factors
                    </p>
                    <div className="space-y-1 text-xs text-gray-700 dark:text-slate-300">
                      {activeWhyData.supportingFactors.map((f, i) => (
                        <p key={i} className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">✓</span> {f}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Areas to strengthen */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Areas To Strengthen
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeWhyData.areasToStrengthen.map((sk) => (
                        <span key={sk.name} className="chip bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium">
                          ⚠ {sk.name} — {sk.current}%
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-slate-400 italic">
                    Note: Your profile contains several skills associated with this career. Model probability reflects statistical profile similarity rather than direct causal attribution.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Select a career on the left to see profile alignment.</p>
              )}
            </Card>
          </div>

          {/* Model Probability Distribution Chart */}
          <Card delay={0.12}>
            <CardHeader
              title="Career Probability Distribution"
              subtitle="Model prediction scores across top career tracks (sum across all 14 canonical classes equals 100%)"
              icon={<TrendingUp size={16} />}
            />
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={probabilityChartData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 'dataMax + 5']} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(value: any) => [`${value}%`, 'Model Probability']}
                />
                <Bar dataKey="probability" radius={[6, 6, 0, 0]} fill="#6D4CFF" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : (
        /* Empty prediction state */
        <Card className="py-12 text-center" delay={0.05}>
          <Compass size={36} className="mx-auto text-primary/60 mb-2.5" />
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">No career predictions available yet</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Complete your onboarding skills and academic profile to unlock personalized AI career predictions.
          </p>
          <div className="mt-4">
            <Button variant="primary" className="text-xs" onClick={() => navigate('/onboarding')}>
              Complete Your Profile <ArrowRight size={13} />
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION B & C — EXPLORE ALL CAREERS & SEARCH */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Layers size={17} className="text-primary" />
              Explore All 14 Canonical Career Paths
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Browse comprehensive role expectations, required skills, and learning paths across all technology domains.
            </p>
          </div>
        </div>

        {/* SECTION C — SEARCH & CATEGORY FILTER */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers by title, description, or key skills (e.g. data, python, cloud)..."
              className="input pl-10 text-xs w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  selectedCategory === cat
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-primary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Career cards grid */}
        {filteredCareers.length === 0 ? (
          <Card className="py-16 text-center">
            <Search size={32} className="mx-auto text-gray-300 mb-2.5" />
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">No careers found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No career tracks match your search &quot;{searchQuery}&quot;. Try searching for skills like SQL, Docker, React, or Python.
            </p>
            <Button
              variant="outline"
              className="text-xs mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCareers.map((c) => {
              const isFav = favoriteSlugs.has(c.slug || c.id);
              const topSkills = c.core_skills?.length ? c.core_skills : (c.required_skills || []).slice(0, 4);

              return (
                <motion.div
                  key={c.id || c.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col justify-between hover:border-primary/40 hover:shadow-soft transition p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge color="primary" className="text-[10px]">
                          {c.category}
                        </Badge>
                        <button
                          onClick={() => handleToggleFavorite(c)}
                          className={`p-1.5 rounded-lg transition ${
                            isFav
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                        >
                          {isFav ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 dark:text-slate-100 mt-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Key Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {topSkills.map((sk) => (
                            <span key={sk} className="chip bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px]">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {c.demand} Demand
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          className="text-xs py-1 px-2.5"
                          onClick={() => navigate(`/career/${c.slug || c.id}`)}
                        >
                          View Details <ArrowRight size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scientific Disclaimer */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <ShieldCheck className="shrink-0 mt-0.5 text-primary" size={18} />
        <p className="text-[11px] leading-relaxed">
          <strong>Methodology Note:</strong> Model probabilities reflect statistical class similarity evaluated by the frozen Random Forest ML engine. They do not constitute employment guarantees or placement warranties. Career exploration allows comprehensive self-directed evaluation across all 14 canonical industry tracks.
        </p>
      </div>
    </PageContainer>
  );
}

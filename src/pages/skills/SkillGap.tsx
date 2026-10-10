import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  GitBranch, CheckCircle2, AlertTriangle, Target, Sparkles, ArrowRight,
  TrendingUp, Map, ShieldAlert, Award, Compass, RefreshCw
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ProgressCircle, ProgressBar } from '@/components/Progress';
import { getSkillGap, listCareers, getRoadmap } from '@/services/resourceService';
import { useToast } from '@/context/ToastContext';

export default function SkillGapPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [careerList, setCareerList] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>(searchParams.get('career') || '');
  const [data, setData] = useState<any>(null);
  const [roadmapSkills, setRoadmapSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load career catalogue for career switcher
  useEffect(() => {
    listCareers()
      .then((res) => {
        if (Array.isArray(res)) setCareerList(res);
      })
      .catch((err) => console.warn('Could not load career catalogue:', err));
  }, []);

  // Load user's active roadmap target skills
  useEffect(() => {
    getRoadmap()
      .then((res) => {
        if (res && res.milestones) {
          const skills = res.milestones.flatMap((m: any) => m.target_skills || []);
          setRoadmapSkills(Array.from(new Set(skills)));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch skill gap report for selected career or default
  const fetchSkillGap = (careerTarget?: string) => {
    setLoading(true);
    setError(null);
    getSkillGap(careerTarget || undefined)
      .then((res) => {
        if (res) {
          setData(res);
          const currentRole = res.career || res.target_role || res.targetRole || '';
          if (currentRole && !selectedCareer) {
            setSelectedCareer(currentRole);
          }
        } else {
          setError('No skill gap data returned from server.');
        }
      })
      .catch((err) => {
        console.error('Failed to load skill gap:', err);
        setError(err.message || 'Unable to load your skill gap report.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const careerParam = searchParams.get('career');
    if (careerParam && careerParam !== selectedCareer) {
      setSelectedCareer(careerParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSkillGap(selectedCareer);
  }, [selectedCareer]);

  const handleCareerChange = (newCareer: string) => {
    setSelectedCareer(newCareer);
    setSearchParams(newCareer ? { career: newCareer } : {});
  };

  const isSkillInRoadmap = (skillName: string) => {
    return roadmapSkills.some((s) => s.toLowerCase() === skillName.toLowerCase());
  };

  // Loading skeleton
  if (loading && !data) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="skeleton h-12 w-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="skeleton h-36 rounded-2xl" />
            <div className="skeleton h-36 rounded-2xl" />
            <div className="skeleton h-36 rounded-2xl" />
            <div className="skeleton h-36 rounded-2xl" />
            <div className="skeleton h-36 rounded-2xl" />
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <PageContainer>
        <Card className="py-16 text-center">
          <AlertTriangle size={40} className="mx-auto text-danger/60 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Unable to load your skill gap</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate('/career')}>
              Go to Career Explorer
            </Button>
            <Button variant="primary" onClick={() => fetchSkillGap(selectedCareer)}>
              <RefreshCw size={14} className="mr-1" /> Try Again
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const targetRole = data?.career || data?.target_role || data?.targetRole || 'Target Career';
  const matchPercentage = data?.match_percentage ?? data?.matchPercentage ?? 0;
  const currentSkills = data?.current_skills || data?.currentSkills || [];
  const missingSkills = data?.missing_skills || data?.missingSkills || [];
  const criticalGaps = data?.critical || missingSkills.filter((s: any) => s.priority === 'Critical');
  const importantGaps = data?.important || missingSkills.filter((s: any) => s.priority === 'Important');
  const developingGaps = data?.developing || missingSkills.filter((s: any) => s.priority === 'Developing');
  const metSkills = data?.met || currentSkills.filter((s: any) => s.status === 'met');
  const recommendations = data?.recommendations || [];

  const summary = data?.summary || {
    total_skills: currentSkills.length,
    skills_met: metSkills.length,
    critical_gaps: criticalGaps.length,
    important_gaps: importantGaps.length,
    developing_gaps: developingGaps.length,
  };

  // Recharts horizontal comparison data
  const chartData = missingSkills.slice(0, 8).map((s: any) => ({
    name: s.name,
    Current: s.current,
    Required: s.required,
    gap: s.gap,
  }));

  const isZeroGap = missingSkills.length === 0 && currentSkills.length > 0;

  return (
    <PageContainer>
      {/* HEADER & CAREER SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="text-primary" size={24} /> Your Skill Gap
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Understand which skills are already aligned with your selected career and which areas need development.
          </p>
        </div>

        {/* Career Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="career-select" className="text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">
            Selected Career:
          </label>
          <select
            id="career-select"
            value={selectedCareer}
            onChange={(e) => handleCareerChange(e.target.value)}
            className="input-field text-xs py-1.5 px-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-primary"
          >
            {careerList.length > 0 ? (
              careerList.map((c) => (
                <option key={c.id || c.title} value={c.title}>
                  {c.title}
                </option>
              ))
            ) : (
              <option value={targetRole}>{targetRole}</option>
            )}
          </select>
          <Button
            variant="outline"
            className="text-xs px-2.5 py-1.5"
            onClick={() => fetchSkillGap(selectedCareer)}
            title="Refresh Analysis"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* ZERO GAP BANNER */}
      {isZeroGap && (
        <Card className="bg-success/10 border-success/30 p-5 mb-6" delay={0.05}>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-success">
                Your profile currently meets all defined skill requirements for {targetRole}!
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                You possess the required competencies across Core and Important tiers. We recommend portfolio strengthening, advanced capstone implementations, and technical mock interviews.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" className="text-xs" onClick={() => navigate(`/roadmap?career=${encodeURIComponent(targetRole)}`)}>
                  View Advanced Mastery Roadmap <ArrowRight size={13} />
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => navigate(`/career/${data?.slug || ''}`)}>
                  Explore Career Details
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        <SummaryCard
          label="Overall Match"
          value={`${matchPercentage}%`}
          sublabel={`Proficiency in ${targetRole}`}
          color="primary"
          icon={<Compass size={18} />}
          delay={0.05}
        />
        <SummaryCard
          label="Skills Met"
          value={summary.skills_met}
          sublabel="At or above target"
          color="success"
          icon={<CheckCircle2 size={18} />}
          delay={0.1}
        />
        <SummaryCard
          label="Critical Gaps"
          value={summary.critical_gaps}
          sublabel="Core foundational deficit"
          color="danger"
          icon={<ShieldAlert size={18} />}
          delay={0.15}
        />
        <SummaryCard
          label="Important Gaps"
          value={summary.important_gaps}
          sublabel="Key domain requirements"
          color="warning"
          icon={<AlertTriangle size={18} />}
          delay={0.2}
        />
        <SummaryCard
          label="Developing Gaps"
          value={summary.developing_gaps}
          sublabel="Supporting skill breadth"
          color="gray"
          icon={<GitBranch size={18} />}
          delay={0.25}
        />
      </div>

      {/* SKILL GAP COMPARISON VISUALIZATION */}
      {chartData.length > 0 && (
        <Card delay={0.1} className="mb-6">
          <CardHeader
            title="Skill Proficiency Comparison"
            subtitle="Comparing your current self-assessed level against career required benchmarks"
            icon={<TrendingUp size={16} />}
          />
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={Math.max(260, chartData.length * 36)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, String(name) === 'Current' ? 'Your Level' : 'Required Level']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="Current" name="Your Level" radius={[0, 4, 4, 0]} fill="#6366F1" barSize={12} />
                <Bar dataKey="Required" name="Required Level" radius={[0, 4, 4, 0]} fill="#CBD5E1" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#6366F1]" /> Current self-assessed level
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#CBD5E1]" /> Career required benchmark
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* GAP SECTIONS: CRITICAL, IMPORTANT, DEVELOPING */}
      <div className="space-y-6">
        {/* CRITICAL GAPS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert size={18} className="text-danger" />
              Critical Gaps
              <Badge color="danger">{criticalGaps.length}</Badge>
            </h2>
            <span className="text-xs text-gray-400">Core foundational skills requiring immediate priority</span>
          </div>

          {criticalGaps.length === 0 ? (
            <Card className="py-6 text-center text-xs text-gray-400 italic">
              No critical foundational gaps remaining for {targetRole}.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {criticalGaps.map((gap: any) => (
                <GapCard
                  key={gap.name}
                  gap={gap}
                  priority="Critical"
                  isInRoadmap={isSkillInRoadmap(gap.name)}
                  targetRole={targetRole}
                  onNavigateRoadmap={() => navigate(`/roadmap?career=${encodeURIComponent(targetRole)}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* IMPORTANT GAPS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" />
              Important Gaps
              <Badge color="warning">{importantGaps.length}</Badge>
            </h2>
            <span className="text-xs text-gray-400">Key domain skills that strengthen your hiring profile</span>
          </div>

          {importantGaps.length === 0 ? (
            <Card className="py-6 text-center text-xs text-gray-400 italic">
              All important domain skill requirements are met.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {importantGaps.map((gap: any) => (
                <GapCard
                  key={gap.name}
                  gap={gap}
                  priority="Important"
                  isInRoadmap={isSkillInRoadmap(gap.name)}
                  targetRole={targetRole}
                  onNavigateRoadmap={() => navigate(`/roadmap?career=${encodeURIComponent(targetRole)}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* DEVELOPING GAPS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <GitBranch size={18} className="text-gray-500" />
              Developing Gaps
              <Badge color="gray">{developingGaps.length}</Badge>
            </h2>
            <span className="text-xs text-gray-400">Supporting tools and secondary technical proficiencies</span>
          </div>

          {developingGaps.length === 0 ? (
            <Card className="py-6 text-center text-xs text-gray-400 italic">
              All supporting competencies are met.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {developingGaps.map((gap: any) => (
                <GapCard
                  key={gap.name}
                  gap={gap}
                  priority="Developing"
                  isInRoadmap={isSkillInRoadmap(gap.name)}
                  targetRole={targetRole}
                  onNavigateRoadmap={() => navigate(`/roadmap?career=${encodeURIComponent(targetRole)}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* SKILLS ALREADY MET */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              Skills Already Met
              <Badge color="success">{metSkills.length}</Badge>
            </h2>
            <span className="text-xs text-gray-400">Competencies at or above the required benchmark</span>
          </div>

          {metSkills.length === 0 ? (
            <Card className="py-6 text-center text-xs text-gray-400 italic">
              No skills meet the benchmark yet. Update your skills assessment to record your proficiency.
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {metSkills.map((sk: any) => (
                <div
                  key={sk.name}
                  className="p-3 rounded-xl bg-success/5 border border-success/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{sk.name}</span>
                      <CheckCircle2 size={13} className="text-success shrink-0" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Tier: {sk.tier}</span>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs font-black text-success">{sk.level}%</span>
                    <span className="text-[10px] text-gray-400"> / {sk.required}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ROADMAP INTEGRATION CTA BANNER */}
        <Card className="bg-gradient-to-r from-primary to-indigo-700 text-white border-0 p-6" delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="chip bg-white/20 text-white text-[11px] font-semibold mb-2">
                <Map size={12} /> Adaptive Roadmap Integration
              </span>
              <h3 className="text-xl font-bold">Ready to close your skill gaps?</h3>
              <p className="text-white/80 text-xs mt-1 max-w-lg">
                Your adaptive roadmap automatically organizes these prioritized gaps into actionable milestones with practical projects and industry certifications.
              </p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90 shrink-0 font-bold"
              onClick={() => navigate(`/roadmap?career=${encodeURIComponent(targetRole)}`)}
            >
              Open Adaptive Roadmap <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

// ── SUBCOMPONENTS ──────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sublabel,
  icon,
  color,
  delay,
}: {
  label: string;
  value: any;
  sublabel: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  delay: number;
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    gray: 'bg-gray-100 dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-slate-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-4 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-slate-100">{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sublabel}</p>
      </div>
    </motion.div>
  );
}

function GapCard({
  gap,
  priority,
  isInRoadmap,
  targetRole,
  onNavigateRoadmap,
}: {
  gap: any;
  priority: 'Critical' | 'Important' | 'Developing';
  isInRoadmap: boolean;
  targetRole: string;
  onNavigateRoadmap: () => void;
}) {
  const badgeColors = {
    Critical: 'danger',
    Important: 'warning',
    Developing: 'gray',
  } as const;

  return (
    <div className="card p-4 flex flex-col justify-between hover:border-primary/40 transition group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">{gap.name}</h4>
            <span className="text-[10px] text-gray-400">Tier: {gap.tier}</span>
          </div>
          <Badge color={badgeColors[priority]} className="text-[10px] uppercase font-bold">
            {priority}
          </Badge>
        </div>

        {/* Proficiency bar */}
        <div className="space-y-1 mb-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-400">Current: {gap.current}%</span>
            <span className="font-bold text-gray-800 dark:text-slate-200">Required: {gap.required}%</span>
          </div>
          <div className="relative">
            <ProgressBar value={gap.current} color={priority === 'Critical' ? 'danger' : 'warning'} height="h-2" />
            <div
              className="absolute top-0 w-0.5 h-2 bg-gray-500 dark:bg-gray-400"
              style={{ left: `${Math.min(gap.required, 100)}%` }}
              title={`Required: ${gap.required}%`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] pt-0.5">
            <span className="text-danger font-semibold">Deficit: -{gap.gap}%</span>
            <span className="text-gray-400">Self-assessed level</span>
          </div>
        </div>

        {/* Why it matters reason */}
        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 mb-3">
          {gap.reason || `${gap.name} is a key requirement for ${targetRole}.`}
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNavigateRoadmap}
        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
          isInRoadmap
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-primary hover:text-white'
        }`}
      >
        <Map size={13} />
        {isInRoadmap ? 'View in Roadmap' : 'Add to Roadmap'}
      </button>
    </div>
  );
}

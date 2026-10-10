import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Map,
  ShieldCheck,
  Hammer,
  HelpCircle,
  Briefcase,
  XCircle,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/Progress';
import { useToast } from '@/context/ToastContext';
import { compareCareers, getLatestPrediction } from '@/services/resourceService';

const CANONICAL_CAREERS = [
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

const COLORS = ['#6D4CFF', '#0EA5E9', '#F59E0B'];

export default function CareerComparisonPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'Data Analyst',
    'Data Scientist',
    'ML Engineer',
  ]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [skillsMatrix, setSkillsMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async (roles: string[]) => {
    setLoading(true);
    try {
      const res = await compareCareers(roles);
      if (res && res.comparisons) {
        setComparisonData(res.comparisons);
        setSkillsMatrix(res.skills_matrix || []);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to compare careers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLatestPrediction()
      .then((data) => {
        if (data?.prediction?.top_5_careers?.length >= 3) {
          const top3 = data.prediction.top_5_careers.slice(0, 3).map((c: any) => c.career);
          setSelectedRoles(top3);
          fetchComparison(top3);
        } else if (data?.prediction?.top_5_careers?.length === 2) {
          const top2 = data.prediction.top_5_careers.slice(0, 2).map((c: any) => c.career);
          setSelectedRoles(top2);
          fetchComparison(top2);
        } else {
          fetchComparison(selectedRoles);
        }
      })
      .catch(() => {
        fetchComparison(selectedRoles);
      });
  }, []);

  const handleToggleRole = (role: string) => {
    let nextRoles: string[];
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length <= 2) {
        addToast('Select at least 2 roles to compare', 'warning');
        return;
      }
      nextRoles = selectedRoles.filter((r) => r !== role);
    } else {
      if (selectedRoles.length >= 3) {
        addToast('You can compare a maximum of 3 roles simultaneously. Replacing oldest selection.', 'info');
        nextRoles = [selectedRoles[1], selectedRoles[2], role];
      } else {
        nextRoles = [...selectedRoles, role];
      }
    }
    setSelectedRoles(nextRoles);
    fetchComparison(nextRoles);
  };

  // Build radar chart data
  const radarDimensions = [
    { key: 'skill_fit_percentage', subject: 'Curriculum Fit' },
    { key: 'academic_fit_percentage', subject: 'Academic Alignment' },
    { key: 'experience_fit_percentage', subject: 'Experience Fit' },
    { key: 'model_probability', subject: 'Model Probability' },
  ];

  const radarData = radarDimensions.map((dim) => {
    const point: Record<string, any> = { subject: dim.subject };
    comparisonData.forEach((comp, idx) => {
      point[`role_${idx}`] = comp[dim.key] || 0;
    });
    return point;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Career Path Comparison"
        subtitle="Compare the differences and skill requirements across 2 to 3 career tracks. You make the final decision."
      >
        <Badge color="primary"><GitCompare size={13} /> Multi-Career Evaluator</Badge>
      </PageHeader>

      {/* Role Selection Bar */}
      <Card delay={0.05} className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <p className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
            Select 2 or 3 target careers to evaluate side-by-side:
          </p>
          <span className="text-xs text-gray-400">
            {selectedRoles.length} of 3 selected
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CANONICAL_CAREERS.map((career) => {
            const isSelected = selectedRoles.includes(career);
            const idx = selectedRoles.indexOf(career);
            return (
              <button
                key={career}
                onClick={() => handleToggleRole(career)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-primary/50'
                }`}
              >
                {isSelected && (
                  <span
                    className="w-2 h-2 rounded-full ring-2 ring-white/50"
                    style={{ backgroundColor: COLORS[idx] || '#ffffff' }}
                  />
                )}
                {career}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Overview Cards (2 or 3 Columns) */}
      <div className={`grid grid-cols-1 ${selectedRoles.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        {comparisonData.map((item, idx) => (
          <motion.div
            key={item.career}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
          >
            <Card className="h-full flex flex-col justify-between border-t-4" style={{ borderTopColor: COLORS[idx] }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      Track {idx + 1}
                    </span>
                  </div>
                  <Badge color="gray">{item.demand} Demand</Badge>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{item.career}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Key Metrics */}
                <div className="space-y-3 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600 dark:text-slate-300">Model Probability</span>
                      <span className="font-bold text-primary">{item.model_probability}%</span>
                    </div>
                    <ProgressBar value={item.model_probability} color="primary" height="h-2" />
                    <span className="text-[10px] text-gray-400 block mt-0.5">Empirical model score</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600 dark:text-slate-300">Curriculum Skill Fit</span>
                      <span className="font-bold text-secondary">{item.skill_fit_percentage}%</span>
                    </div>
                    <ProgressBar value={item.skill_fit_percentage} color="secondary" height="h-2" />
                    <span className="text-[10px] text-gray-400 block mt-0.5">Domain requirements met</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600 dark:text-slate-300">Academic Alignment</span>
                      <span className="font-bold text-success">{item.academic_fit_percentage}%</span>
                    </div>
                    <ProgressBar value={item.academic_fit_percentage} color="success" height="h-2" />
                  </div>
                </div>

                {/* Gap Breakdown & Adaptive Track */}
                <div className="mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50 space-y-2 text-xs border border-gray-100 dark:border-slate-700/50">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Critical Gaps:</span>
                    <span className={`font-bold ${item.critical_gaps_count > 0 ? 'text-danger' : 'text-success'}`}>
                      {item.critical_gaps_count} Skills
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Total Gaps:</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">
                      {item.total_gaps_count} Skills
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Adaptive Track:</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{item.roadmap_track}</span>
                  </div>

                  {item.top_gaps?.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                      <span className="text-gray-500 dark:text-slate-400 block mb-1 font-medium">Priority Focus:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.top_gaps.map((g: string) => (
                          <span key={g} className="chip bg-danger/10 text-danger text-[10px] font-semibold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => navigate(`/career/${item.slug || item.career}`)}
                >
                  View Details <ArrowRight size={13} />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CORE SKILLS COMPARISON MATRIX */}
      <Card delay={0.12}>
        <CardHeader
          title="Core Skills Comparison Matrix"
          subtitle="Side-by-side proficiency comparison against target career requirements"
          icon={<Layers size={16} />}
        />
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="py-3 px-3 font-bold uppercase tracking-wider">Skill</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-center">Your Level</th>
                {comparisonData.map((comp, idx) => (
                  <th key={comp.career} className="py-3 px-3 font-bold uppercase tracking-wider text-center" style={{ color: COLORS[idx] }}>
                    {comp.career}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {skillsMatrix.map((row) => (
                <tr key={row.skill} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-slate-100">
                    {row.skill}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold text-gray-800 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {row.user_level}%
                    </span>
                  </td>
                  {comparisonData.map((comp) => {
                    const req = row.career_requirements?.[comp.career];
                    if (!req) {
                      return (
                        <td key={comp.career} className="py-2.5 px-3 text-center text-gray-400 italic text-[11px]">
                          Optional
                        </td>
                      );
                    }
                    const isMet = req.status === 'met';
                    const isPartial = req.status === 'partial';

                    return (
                      <td key={comp.career} className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                            isMet
                              ? 'bg-success/10 text-success'
                              : isPartial
                              ? 'bg-warning/10 text-warning'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {isMet ? (
                            <CheckCircle2 size={12} />
                          ) : isPartial ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          Req: {req.required}% ({req.tier})
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECOMMENDED PROJECTS & CERTIFICATIONS SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Projects comparison */}
        <Card delay={0.14}>
          <CardHeader
            title="Relevant Projects by Career Track"
            subtitle="Verified portfolio projects aligned with each role's requirements"
            icon={<Hammer size={16} />}
          />
          <div className="space-y-4">
            {comparisonData.map((comp, idx) => (
              <div key={comp.career} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 uppercase tracking-wide">
                    {comp.career}
                  </h4>
                </div>
                <div className="space-y-2">
                  {(comp.recommended_projects || []).slice(0, 2).map((p: any) => (
                    <div key={p.id || p.title} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 text-xs">
                      <p className="font-semibold text-gray-800 dark:text-slate-200">{p.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Certifications comparison */}
        <Card delay={0.16}>
          <CardHeader
            title="Relevant Certifications by Career Track"
            subtitle="Recognized credentials for each target track"
            icon={<Award size={16} />}
          />
          <div className="space-y-4">
            {comparisonData.map((comp, idx) => (
              <div key={comp.career} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 uppercase tracking-wide">
                    {comp.career}
                  </h4>
                </div>
                <div className="space-y-2">
                  {(comp.recommended_certifications || []).slice(0, 2).map((c: any) => (
                    <div key={c.id || c.title} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">{c.title}</span>
                        <Badge color="success" className="text-[10px]">{c.provider}</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Multi-Dimensional Competency Radar Overlay */}
      <Card delay={0.18}>
        <CardHeader
          title="Multi-Dimensional Competency Overlay"
          subtitle="Comparative visualization across curriculum fit, ML model probability, academic fit, and experience fit"
          icon={<TrendingUp size={16} />}
        />
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: '#cbd5e1' }} angle={90} domain={[0, 100]} />
            {comparisonData.map((comp, idx) => (
              <Radar
                key={comp.career}
                name={comp.career}
                dataKey={`role_${idx}`}
                stroke={COLORS[idx]}
                fill={COLORS[idx]}
                fillOpacity={0.25}
              />
            ))}
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Neutral Decision Guidance Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <ShieldCheck className="shrink-0 mt-0.5 text-primary" size={18} />
        <p className="text-[11px] leading-relaxed">
          <strong>Decision-Making Guidance:</strong> The profiles above show different skill requirements, learning tracks, and model probabilities. CareerCompass does not declare a &quot;winning&quot; career track; the choice rests with your personal professional goals, interests, and preferred work environments.
        </p>
      </div>
    </PageContainer>
  );
}

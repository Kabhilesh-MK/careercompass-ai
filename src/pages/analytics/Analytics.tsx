import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Users, Target, Award, BarChart2, PieChart as PieIcon,
  Activity, Zap,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Chip } from '@/components/Badge';

// ---- Mock analytics data ----
const careerTrends = [
  { month: 'Aug', 'ML Engineer': 42, 'Data Scientist': 35, 'Software Engineer': 58, 'Cloud Engineer': 28 },
  { month: 'Sep', 'ML Engineer': 48, 'Data Scientist': 40, 'Software Engineer': 61, 'Cloud Engineer': 30 },
  { month: 'Oct', 'ML Engineer': 55, 'Data Scientist': 44, 'Software Engineer': 65, 'Cloud Engineer': 35 },
  { month: 'Nov', 'ML Engineer': 62, 'Data Scientist': 50, 'Software Engineer': 70, 'Cloud Engineer': 38 },
  { month: 'Dec', 'ML Engineer': 58, 'Data Scientist': 48, 'Software Engineer': 68, 'Cloud Engineer': 36 },
  { month: 'Jan', 'ML Engineer': 70, 'Data Scientist': 55, 'Software Engineer': 72, 'Cloud Engineer': 42 },
];

const skillDistribution = [
  { skill: 'Python',      level: 85 },
  { skill: 'SQL',         level: 78 },
  { skill: 'ML',          level: 72 },
  { skill: 'React',       level: 65 },
  { skill: 'Docker',      level: 55 },
  { skill: 'AWS',         level: 48 },
  { skill: 'Statistics',  level: 70 },
  { skill: 'Git',         level: 88 },
];

const placementTrend = [
  { month: 'Aug', score: 52 }, { month: 'Sep', score: 58 }, { month: 'Oct', score: 62 },
  { month: 'Nov', score: 67 }, { month: 'Dec', score: 70 }, { month: 'Jan', score: 74 },
];

const certCompletionData = [
  { name: 'AWS', value: 35, color: '#F59E0B' },
  { name: 'Google', value: 28, color: '#6D4CFF' },
  { name: 'Microsoft', value: 18, color: '#8B5CF6' },
  { name: 'Other', value: 19, color: '#22C55E' },
];

const learningProgressTrend = [
  { month: 'Aug', courses: 2, projects: 1, certs: 0 },
  { month: 'Sep', courses: 3, projects: 2, certs: 1 },
  { month: 'Oct', courses: 4, projects: 2, certs: 1 },
  { month: 'Nov', courses: 3, projects: 3, certs: 1 },
  { month: 'Dec', courses: 5, projects: 2, certs: 2 },
  { month: 'Jan', courses: 4, projects: 3, certs: 1 },
];

const radarSkills = [
  { subject: 'Programming', A: 88 },
  { subject: 'Web Dev', A: 76 },
  { subject: 'Database', A: 70 },
  { subject: 'AI/ML', A: 72 },
  { subject: 'Cloud', A: 48 },
  { subject: 'Soft Skills', A: 80 },
];

const CAREER_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#8B5CF6'];
const TIME_FILTERS = ['Last 3 months', 'Last 6 months', 'Last year', 'All time'];

import { useAppState } from '@/context/AppStateContext';

export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState('Last 6 months');
  const { state } = useAppState();

  const intel = state.careerIntelligence?.intelligenceResult;
  const recentPred = state.predictionHistory?.[0];

  const careerMatchValue = intel?.prediction?.probability
    ? `${Math.round(intel.prediction.probability * 100)}%`
    : intel?.coverage?.percentage
    ? `${Math.round(intel.coverage.percentage)}%`
    : recentPred?.confidenceEstimate
    ? `${Math.round(recentPred.confidenceEstimate)}%`
    : '—';

  const skillsCount = state.skills?.length ? `${state.skills.length}` : '29';
  const certsCount = state.certificates ? `${state.certificates.length}` : '0';

  return (
    <PageContainer>
      <PageHeader title="Analytics" subtitle="Deep insights into your career growth, skills, and learning progress.">
        <Badge color="primary"><TrendingUp size={13} /> Live Data</Badge>
      </PageHeader>

      {/* Time filter */}
      <div className="flex gap-2 flex-wrap">
        {TIME_FILTERS.map(f => (
          <Chip key={f} active={timeFilter === f} onClick={() => setTimeFilter(f)}>{f}</Chip>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Career Match',    value: careerMatchValue,  delta: intel ? 'ML-Verified' : 'Pending',  icon: <Target size={16} />,   color: 'primary'   },
          { label: 'Skills Tracked',  value: skillsCount,        delta: 'Active',                         icon: <Zap size={16} />,      color: 'secondary' },
          { label: 'Placement Score', value: '74%',              delta: '+4%',                            icon: <Activity size={16} />, color: 'success'   },
          { label: 'Certs Earned',    value: certsCount,          delta: `${certsCount} Verified`,         icon: <Award size={16} />,    color: 'warning'   },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${s.color}/10 text-${s.color} flex items-center justify-center`}>{s.icon}</div>
              <span className="chip bg-success/10 text-success text-[10px]"><TrendingUp size={9} /> {s.delta}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Career Prediction Trends */}
      <Card delay={0.1}>
        <CardHeader title="Career Prediction Trends" subtitle="Interest shifts over time" icon={<TrendingUp size={16} />} action={<Badge color="primary">Top 4 Careers</Badge>} />
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={careerTrends} margin={{ left: -10, right: 10 }}>
            <defs>
              {CAREER_COLORS.map((c, i) => (
                <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {['ML Engineer', 'Data Scientist', 'Software Engineer', 'Cloud Engineer'].map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={CAREER_COLORS[i]}
                fill={`url(#grad${i})`} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Skill Distribution + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card delay={0.12}>
          <CardHeader title="Skill Distribution" subtitle="Current levels across tracked skills" icon={<BarChart2 size={16} />} />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skillDistribution} layout="vertical" margin={{ left: 20, right: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={75} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="level" fill="#6D4CFF" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card delay={0.14}>
          <CardHeader title="Skill Radar" subtitle="Category-level overview" icon={<PieIcon size={16} />} />
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarSkills}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Radar dataKey="A" stroke="#6D4CFF" fill="#6D4CFF" fillOpacity={0.35} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Placement Trend + Cert Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" delay={0.15}>
          <CardHeader title="Placement Readiness Over Time" subtitle="Monthly score progression" icon={<Activity size={16} />} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={placementTrend} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={2} fill="url(#plGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card delay={0.17}>
          <CardHeader title="Certification Breakdown" icon={<Award size={16} />} />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={certCompletionData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                dataKey="value" paddingAngle={3}>
                {certCompletionData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {certCompletionData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-gray-600 dark:text-slate-400 flex-1">{d.name}</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Learning Progress Trend */}
      <Card delay={0.18}>
        <CardHeader title="Learning Progress" subtitle="Courses, projects, and certifications completed per month" icon={<Users size={16} />} />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={learningProgressTrend} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="courses"  fill="#6D4CFF" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="projects" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="certs"    fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </PageContainer>
  );
}

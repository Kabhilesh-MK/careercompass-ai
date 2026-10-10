import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Target, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, Award } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { ProgressCircle, ProgressBar } from '@/components/Progress';
import { useState, useEffect } from 'react';
import { placementReadiness } from '@/data/pageData';
import { getPlacement } from '@/services/resourceService';

export default function PlacementPage() {
  const [data, setData] = useState(placementReadiness);

  useEffect(() => {
    getPlacement().then((res) => {
      if (res && res.overallScore !== undefined) {
        setData((prev) => ({
          ...prev,
          overallScore: res.overallScore,
          status: res.status || (res.overallScore >= 75 ? 'Placement Ready' : res.overallScore >= 50 ? 'On Track' : 'Needs Preparation'),
          strengths: res.strengths?.length ? res.strengths : prev.strengths,
          weaknesses: res.weaknesses?.length ? res.weaknesses : prev.weaknesses,
          recommendations: res.recommendations?.length ? res.recommendations : prev.recommendations,
          companyReadiness: res.companyReadiness?.length ? res.companyReadiness : prev.companyReadiness,
          interviewReadiness: res.breakdown?.length
            ? res.breakdown.reduce((acc: any, curr: any) => ({ ...acc, [curr.subject]: curr.score }), {})
            : prev.interviewReadiness,
        }));
      }
    }).catch(console.error);
  }, []);

  const { overallScore, status, strengths, weaknesses, recommendations, interviewReadiness, companyReadiness } = data;
  const radarData = Object.entries(interviewReadiness).map(([k, v]) => ({ subject: k, score: v }));

  return (
    <PageContainer>
      <PageHeader title="Placement Readiness" subtitle="Your readiness for placement season, analyzed across dimensions.">
        <Badge color="success"><Target size={13} /> {status}</Badge>
      </PageHeader>

      {/* Overall score + readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary to-primary-700 text-white border-0" delay={0.05}>
          <div className="flex flex-col items-center text-center py-4">
            <ProgressCircle value={overallScore} color="#ffffff" stroke={9} size={140} label={`${overallScore}%`} sublabel="Ready" />
            <p className="text-white/80 text-sm mt-4">Overall Placement Readiness</p>
            <span className="chip bg-white/20 text-white mt-2">{status}</span>
          </div>
        </Card>

        <Card className="lg:col-span-2" delay={0.1}>
          <CardHeader title="Interview Readiness" subtitle="By interview type" icon={<Target size={16} />} />
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#cbd5e1' }} angle={90} domain={[0, 100]} />
              <Radar dataKey="score" stroke="#6D4CFF" fill="#6D4CFF" fillOpacity={0.35} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card delay={0.1}>
          <CardHeader title="Your Strengths" subtitle="Areas where you excel" icon={<CheckCircle2 size={16} />} action={<Badge color="success">{strengths.length}</Badge>} />
          <div className="space-y-3">
            {strengths.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{s.name}</span>
                  <span className="text-xs font-semibold text-success">{s.score}%</span>
                </div>
                <ProgressBar value={s.score} color="success" height="h-2" />
              </motion.div>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <CardHeader title="Areas to Improve" subtitle="Focus on these weaknesses" icon={<AlertTriangle size={16} />} action={<Badge color="danger">{weaknesses.length}</Badge>} />
          <div className="space-y-3">
            {weaknesses.map((w, i) => (
              <motion.div key={w.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{w.name}</span>
                  <span className="text-xs font-semibold text-danger">{w.score}%</span>
                </div>
                <ProgressBar value={w.score} color="danger" height="h-2" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Company readiness chart */}
      <Card delay={0.1}>
        <CardHeader title="Company-Type Readiness" subtitle="How ready you are for different employer types" icon={<TrendingUp size={16} />} />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={companyReadiness} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="company" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#8B5CF6" barSize={40}>
              {companyReadiness.map((entry, idx) => (
                <Cell key={idx} fill={entry.score >= 80 ? '#22C55E' : entry.score >= 65 ? '#6D4CFF' : '#F59E0B'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recommendations */}
      <Card delay={0.15}>
        <CardHeader title="Recommendations" subtitle="Actionable steps to boost placement readiness" icon={<Sparkles size={16} />} />
        <div className="space-y-2">
          {recommendations.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
              <p className="text-sm text-gray-700 dark:text-slate-200">{r}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}

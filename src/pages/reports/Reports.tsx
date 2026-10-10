import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { BarChart3, Download, FileBarChart, FileCheck, TrendingUp, Clock, Award, BookOpen, FolderGit2, Sparkles } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/Progress';
import { useState, useEffect } from 'react';
import { reportData } from '@/data/pageData';
import { getReport } from '@/services/resourceService';
import { useToast } from '@/context/ToastContext';
import PDFReportPanel from '@/components/PDFReportPanel';

const pieData = [
  { name: 'Courses', value: 8, color: '#6D4CFF' },
  { name: 'Projects', value: 6, color: '#8B5CF6' },
  { name: 'Certs', value: 3, color: '#22C55E' },
  { name: 'Skills', value: 42, color: '#F59E0B' },
];

export default function ReportsPage() {
  const { addToast } = useToast();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    getReport().then((res) => {
      if (res) setReport(res);
    }).catch(console.error);
  }, []);

  return (
    <PageContainer>
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive analytics of your career progress.">
        <Button variant="outline" onClick={() => addToast('Report exported as CSV', 'success')}><Download size={15} /> Export CSV</Button>
        <Button onClick={() => addToast('PDF report generated', 'success')}><FileBarChart size={15} /> Generate PDF</Button>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Courses" value={8} icon={<BookOpen size={18} />} color="primary" delay={0.05} />
        <StatBox label="Projects Built" value={6} icon={<FolderGit2 size={18} />} color="secondary" delay={0.1} />
        <StatBox label="Certifications" value={3} icon={<Award size={18} />} color="success" delay={0.15} />
        <StatBox label="Learning Hours" value="208h" icon={<Clock size={18} />} color="warning" delay={0.2} />
      </div>

      {/* Skill progress over time */}
      <Card delay={0.1}>
        <CardHeader title="Skill Progress Over Time" subtitle="6-month growth across categories" icon={<TrendingUp size={16} />} action={<Badge color="primary">+42% avg</Badge>} />
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={reportData.skillProgress} margin={{ left: -10 }}>
            <defs>
              {['programming', 'web', 'ai', 'cloud'].map((k, i) => {
                const colors = ['#6D4CFF', '#8B5CF6', '#22C55E', '#F59E0B'];
                return (
                  <linearGradient key={k} id={k} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors[i]} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="programming" stroke="#6D4CFF" strokeWidth={2} fill="url(#programming)" name="Programming" />
            <Area type="monotone" dataKey="web" stroke="#8B5CF6" strokeWidth={2} fill="url(#web)" name="Web Dev" />
            <Area type="monotone" dataKey="ai" stroke="#22C55E" strokeWidth={2} fill="url(#ai)" name="AI/ML" />
            <Area type="monotone" dataKey="cloud" stroke="#F59E0B" strokeWidth={2} fill="url(#cloud)" name="Cloud" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Learning hours */}
        <Card delay={0.1}>
          <CardHeader title="Learning Hours" subtitle="Monthly study time" icon={<Clock size={16} />} />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={reportData.learningHours} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="#6D4CFF" barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Assessment scores */}
        <Card delay={0.15}>
          <CardHeader title="Assessment Scores" subtitle="Latest test results" icon={<FileCheck size={16} />} />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={reportData.assessmentScores} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="#8B5CF6" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Milestones pie */}
        <Card delay={0.2}>
          <CardHeader title="Achievements" subtitle="Distribution of milestones" icon={<Award size={16} />} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed milestone breakdown */}
      <Card delay={0.1}>
        <CardHeader title="Milestone Breakdown" subtitle="Progress by category" icon={<BarChart3 size={16} />} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportData.milestones.map((m, i) => {
            const max = Math.max(...reportData.milestones.map((x) => x.value));
            const pct = Math.round((m.value / max) * 100);
            return (
              <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{m.value}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{m.label}</p>
                <ProgressBar value={pct} color="primary" className="mt-3" />
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* AI insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20" delay={0.15}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">AI-Generated Insights</h3>
        </div>
        <div className="space-y-2">
          {[
            'Your programming and web skills grew fastest this quarter (+28% and +27%).',
            'AI/ML is your fastest-growing category — keep the momentum to reach 80% by August.',
            'Cloud remains your weakest area. Dedicating 4 hours/week would close the gap in 6 weeks.',
            'You are on track to exceed your placement readiness target (80%) by next month.',
          ].map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              {insight}
            </motion.div>
          ))}
        </div>
      </Card>

      <PDFReportPanel />
    </PageContainer>
  );
}

function StatBox({ label, value, icon, color, delay }: { label: string; value: number | string; icon: React.ReactNode; color: 'primary' | 'secondary' | 'success' | 'warning'; delay: number }) {
  const colors = { primary: 'bg-primary/10 text-primary', secondary: 'bg-secondary/10 text-secondary', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning' };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card p-4">
      <div className={`w-9 h-9 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

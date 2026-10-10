import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, UserPlus, Activity, TrendingUp, Award, Server, Cpu, HardDrive, Wifi } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/Progress';
import { adminStats, adminUsers, adminRegistrations, adminPlatformUsage } from '@/data/pageData';

const systemHealth = [
  { label: 'API Latency', value: '142ms', status: 'healthy', icon: Activity, pct: 92 },
  { label: 'CPU Usage', value: '38%', status: 'healthy', icon: Cpu, pct: 38 },
  { label: 'Memory', value: '64%', status: 'healthy', icon: HardDrive, pct: 64 },
  { label: 'Uptime', value: '99.98%', status: 'healthy', icon: Server, pct: 99 },
];

const pieColors = ['#6D4CFF', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'];

export default function AdminPage() {
  return (
    <PageContainer>
      <PageHeader title="Admin Dashboard" subtitle="System overview and platform statistics.">
        <Badge color="success"><Activity size={13} /> All systems operational</Badge>
      </PageHeader>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStat label="Total Users" value={adminStats.totalUsers.toLocaleString()} icon={<Users size={18} />} trend="+412" color="primary" delay={0.05} />
        <AdminStat label="Active Users" value={adminStats.activeUsers.toLocaleString()} icon={<Activity size={18} />} trend="+8.2%" color="success" delay={0.1} />
        <AdminStat label="New This Week" value={adminStats.newThisWeek} icon={<UserPlus size={18} />} trend="+15%" color="secondary" delay={0.15} />
        <AdminStat label="Premium Users" value={adminStats.premiumUsers.toLocaleString()} icon={<Award size={18} />} trend="+62" color="warning" delay={0.2} />
      </div>

      {/* Registrations + platform usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" delay={0.1}>
          <CardHeader title="User Registrations" subtitle="Monthly new signups" icon={<UserPlus size={16} />} action={<Badge color="success"><TrendingUp size={11} /> +15%</Badge>} />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={adminRegistrations} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#6D4CFF" strokeWidth={2} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card delay={0.15}>
          <CardHeader title="Platform Usage" subtitle="Feature adoption" icon={<Activity size={16} />} />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={adminPlatformUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {adminPlatformUsage.map((_, idx) => (
                  <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* System health */}
      <Card delay={0.1}>
        <CardHeader title="System Overview" subtitle="Real-time platform health" icon={<Server size={16} />} action={<Badge color="success">Operational</Badge>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.div key={h.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center"><Icon size={16} /></div>
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{h.value}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{h.label}</p>
                <ProgressBar value={h.pct} color="success" className="mt-2" height="h-1.5" />
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Users table */}
      <Card delay={0.15}>
        <CardHeader title="Recent Registrations" subtitle="Latest users to join the platform" icon={<Users size={16} />} action={<Badge color="primary">{adminUsers.length} users</Badge>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100 dark:border-slate-800">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {u.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3"><Badge color={u.role === 'Mentor' ? 'secondary' : 'gray'}>{u.role}</Badge></td>
                  <td className="py-3">
                    <Badge color={u.status === 'Active' ? 'success' : u.status === 'Inactive' ? 'gray' : 'danger'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-slate-400">{u.joined}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={u.readiness} color={u.readiness >= 80 ? 'success' : 'primary'} height="h-1.5" className="w-16" />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{u.readiness}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Avg metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card delay={0.1}>
          <CardHeader title="Avg Placement Readiness" subtitle="Across all users" icon={<TrendingUp size={16} />} />
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="70" cy="70" r="60" fill="none" stroke="#22C55E" strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={2 * Math.PI * 60 * (1 - adminStats.avgPlacementReadiness / 100)} style={{ transition: 'stroke-dashoffset 1s' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-slate-100">{adminStats.avgPlacementReadiness}%</span>
                <span className="text-xs text-gray-400">Average</span>
              </div>
            </div>
          </div>
        </Card>

        <Card delay={0.15}>
          <CardHeader title="Assessments Taken" subtitle="Total this month" icon={<Award size={16} />} />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[{ m: 'Week 1', v: 420 }, { m: 'Week 2', v: 580 }, { m: 'Week 3', v: 510 }, { m: 'Week 4', v: 690 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#8B5CF6" barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card delay={0.2}>
          <CardHeader title="Retention Rate" subtitle="30-day user retention" icon={<Activity size={16} />} />
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-5xl font-bold text-primary">{adminStats.retentionRate}%</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">of users return within 30 days</p>
            <Badge color="success" className="mt-3"><TrendingUp size={11} /> +3.4% vs last month</Badge>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function AdminStat({ label, value, icon, trend, color, delay }: { label: string; value: string | number; icon: React.ReactNode; trend: string; color: 'primary' | 'success' | 'secondary' | 'warning'; delay: number }) {
  const colors = { primary: 'bg-primary/10 text-primary', success: 'bg-success/10 text-success', secondary: 'bg-secondary/10 text-secondary', warning: 'bg-warning/10 text-warning' };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${colors[color]} flex items-center justify-center`}>{icon}</div>
        <span className="chip bg-success/10 text-success text-[10px]"><TrendingUp size={10} /> {trend}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

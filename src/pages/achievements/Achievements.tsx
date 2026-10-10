import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Code, Database, Brain, Cloud, Layers, Target, Trophy,
  BookOpen, GraduationCap, Hammer, Star, FileText, UserCheck,
  Briefcase, Zap, Lock,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { getAchievements } from '@/services/engagementService';
import { Chip } from '@/components/Badge';

const ICON_MAP: Record<string, React.ElementType> = {
  Award, Code, Code2: Code, Database, Brain, Cloud, Layers, Target, Trophy,
  BookOpen, GraduationCap, Hammer, Star, FileText, UserCheck, Briefcase, Zap,
};

interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  earned: boolean;
  earned_at?: string;
  points: number;
}

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
};

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All', skills: 'Skills', career: 'Career', learning: 'Learning', profile: 'Profile',
};

function formatDate(ts?: string): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAchievements()
      .then(data => setAchievements(data?.length ? data : DEFAULT_ACHIEVEMENTS))
      .catch(() => setAchievements(DEFAULT_ACHIEVEMENTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);
  const earned = achievements.filter(a => a.earned);
  const totalPoints = earned.reduce((s, a) => s + (a.points || 0), 0);

  return (
    <PageContainer>
      <PageHeader title="Achievements" subtitle="Earn badges as you grow your skills and complete your career journey.">
        <Badge color="warning"><Trophy size={13} /> {earned.length} / {achievements.length} Earned</Badge>
        <Badge color="primary"><Zap size={13} /> {totalPoints} XP</Badge>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Badges Earned', value: earned.length, total: achievements.length, color: 'primary' },
          { label: 'Total XP', value: totalPoints, total: null, color: 'warning' },
          { label: 'Skills Badges', value: earned.filter(a => a.category === 'skills').length, total: achievements.filter(a => a.category === 'skills').length, color: 'secondary' },
          { label: 'Learning Badges', value: earned.filter(a => a.category === 'learning').length, total: achievements.filter(a => a.category === 'learning').length, color: 'success' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{s.value}{s.total !== null ? <span className="text-base font-normal text-gray-400"> / {s.total}</span> : ''}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
            {label}
          </Chip>
        ))}
      </div>

      {/* Badge grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 h-36 animate-pulse bg-gray-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {filtered.map((b, i) => {
            const IconComp = ICON_MAP[b.icon] || Award;
            const colorClass = COLOR_MAP[b.color] || COLOR_MAP.primary;
            return (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`card p-4 flex flex-col items-center text-center relative border transition ${
                  b.earned ? 'hover:shadow-card' : 'opacity-40 grayscale'
                }`}
              >
                {!b.earned && (
                  <div className="absolute top-2 right-2 text-gray-400">
                    <Lock size={12} />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border ${colorClass}`}>
                  <IconComp size={22} />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 line-clamp-1">{b.title}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 line-clamp-2">{b.description}</p>
                <div className="mt-auto pt-2 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-primary">+{b.points} XP</span>
                  {b.earned && (
                    <span className="text-[9px] text-success font-medium">✓</span>
                  )}
                </div>
                {b.earned && b.earned_at && (
                  <p className="text-[9px] text-gray-300 dark:text-slate-600 mt-0.5">{formatDate(b.earned_at)}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { key: 'python_beginner',  title: 'Python Beginner',      description: 'Python skill ≥ 40',       icon: 'Code',         color: 'primary',   category: 'skills',   earned: false, points: 10 },
  { key: 'python_expert',    title: 'Python Expert',         description: 'Python skill ≥ 80',       icon: 'Code',         color: 'secondary', category: 'skills',   earned: false, points: 50 },
  { key: 'sql_expert',       title: 'SQL Expert',            description: 'SQL skill ≥ 80',          icon: 'Database',     color: 'success',   category: 'skills',   earned: false, points: 50 },
  { key: 'ml_ready',         title: 'ML Ready',              description: 'ML skill ≥ 70',           icon: 'Brain',        color: 'warning',   category: 'skills',   earned: false, points: 40 },
  { key: 'cloud_certified',  title: 'Cloud Ready',           description: 'AWS or Azure ≥ 60',       icon: 'Cloud',        color: 'primary',   category: 'skills',   earned: false, points: 40 },
  { key: 'full_stack',       title: 'Full Stack Ready',      description: 'Frontend + Backend ≥ 60', icon: 'Layers',       color: 'secondary', category: 'skills',   earned: false, points: 60 },
  { key: 'career_predicted', title: 'Career Predicted',      description: 'Run ML career prediction',icon: 'Target',       color: 'primary',   category: 'career',   earned: false, points: 20 },
  { key: 'top_match',        title: 'Top Career Match',      description: 'Career confidence ≥ 80%', icon: 'Trophy',       color: 'warning',   category: 'career',   earned: false, points: 70 },
  { key: 'first_course',     title: 'First Course',          description: 'Complete first course',   icon: 'BookOpen',     color: 'success',   category: 'learning', earned: false, points: 15 },
  { key: 'five_courses',     title: 'Course Champion',       description: 'Complete 5 courses',      icon: 'GraduationCap',color: 'primary',   category: 'learning', earned: false, points: 60 },
  { key: 'first_project',    title: 'Builder',               description: 'Complete first project',  icon: 'Hammer',       color: 'warning',   category: 'learning', earned: false, points: 15 },
  { key: 'five_projects',    title: 'Project Master',        description: 'Complete 5 projects',     icon: 'Star',         color: 'secondary', category: 'learning', earned: false, points: 60 },
  { key: 'first_cert',       title: 'Certified',             description: 'Earn first certification',icon: 'Award',        color: 'success',   category: 'learning', earned: false, points: 25 },
  { key: 'roadmap_complete', title: 'Roadmap Completed',     description: 'Finish 6-week roadmap',   icon: 'Award',        color: 'primary',   category: 'learning', earned: false, points: 100 },
  { key: 'resume_uploaded',  title: 'Resume Uploaded',       description: 'Upload your resume',      icon: 'FileText',     color: 'success',   category: 'profile',  earned: false, points: 10 },
  { key: 'profile_complete', title: 'Profile Complete',      description: 'Fill out full profile',   icon: 'UserCheck',    color: 'primary',   category: 'profile',  earned: false, points: 20 },
  { key: 'placement_ready',  title: 'Placement Ready',       description: 'Placement score ≥ 75',    icon: 'Briefcase',    color: 'success',   category: 'career',   earned: false, points: 100 },
  { key: 'streak_7',         title: 'Week Streak',           description: '7-day activity streak',   icon: 'Zap',          color: 'warning',   category: 'learning', earned: false, points: 30 },
];

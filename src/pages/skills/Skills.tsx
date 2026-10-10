import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, CheckCircle2, Star, TrendingUp, Sparkles, Award } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge, Chip } from '@/components/Badge';
import { ProgressBar } from '@/components/Progress';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Icon } from '@/components/Icon';
import { skillCategories as defaultSkillCategories } from '@/data/skillsData';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { updateSkills } from '@/services/profileService';

export default function SkillsPage() {
  const { addToast } = useToast();
  const { user, checkAuth } = useAuth();
  const [categories, setCategories] = useState(() => {
    return user?.skills && user.skills.length > 0 ? user.skills : defaultSkillCategories;
  });
  const [activeCat, setActiveCat] = useState(categories[0]?.id || 'cat-1');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const cat = categories.find((c: any) => c.id === activeCat) || categories[0];
  const radarData = categories.map((c: any) => ({
    name: c.name,
    level: Math.round(c.skills.reduce((s: number, sk: any) => s + (sk.level || 0), 0) / Math.max(c.skills.length, 1)),
  }));

  // Real top proficiencies derived from user's current assessed skills
  const allUserSkills: { name: string; level: number; category: string }[] = [];
  categories.forEach((c: any) => {
    c.skills.forEach((sk: any) => {
      allUserSkills.push({ name: sk.name, level: sk.level || 0, category: c.name });
    });
  });
  allUserSkills.sort((a, b) => b.level - a.level);
  const topProficiencies = allUserSkills.slice(0, 6);

  const handleUpdateLevel = async (skillName: string, newLevel: number) => {
    const updated = categories.map((c: any) => ({
      ...c,
      skills: c.skills.map((sk: any) => (sk.name === skillName ? { ...sk, level: newLevel } : sk)),
    }));
    setCategories(updated);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateSkills(categories);
      await checkAuth();
      addToast('Skills successfully updated in your profile!', 'success');
      setEditOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to update skills', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalTracked = categories.reduce((s: number, c: any) => s + c.skills.length, 0);

  return (
    <PageContainer>
      <PageHeader title="Skills Assessment" subtitle="Track, update, and assess your competencies across technical and soft skill domains.">
        <Badge color="primary"><Star size={13} /> {totalTracked} skills tracked</Badge>
        <Button onClick={() => setEditOpen(true)} className="text-xs"><Plus size={15} /> Update Skill Levels</Button>
      </PageHeader>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c: any) => (
          <Chip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            <Icon name={c.icon || 'Code2'} size={13} /> {c.name}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Skill list */}
        <Card className="lg:col-span-2" delay={0.1}>
          <CardHeader
            title={`${cat.name} Skills`}
            subtitle={`${cat.skills.length} competencies evaluated in this domain`}
            icon={<Icon name={cat.icon || 'Code2'} size={16} />}
            action={
              <Badge color="primary">
                Avg {Math.round(cat.skills.reduce((s: number, sk: any) => s + (sk.level || 0), 0) / Math.max(cat.skills.length, 1))}%
              </Badge>
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {cat.skills.map((s: any, i: number) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:shadow-soft transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-slate-100">{s.name}</span>
                    {s.verified && <CheckCircle2 size={14} className="text-success" />}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{s.level || 0}%</span>
                </div>
                <ProgressBar
                  value={s.level || 0}
                  color={s.level >= 80 ? 'success' : s.level >= 60 ? 'primary' : s.level >= 40 ? 'warning' : 'danger'}
                />
                {s.level >= 75 ? (
                  <p className="text-[10px] text-success mt-1.5 flex items-center gap-1 font-medium">
                    <Sparkles size={10} /> Core competency target met
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Target requirement: 75% for Core roles
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Radar + Top Proficiencies */}
        <div className="space-y-4">
          <Card delay={0.15}>
            <CardHeader title="Skill Radar" subtitle="Category averages across domains" icon={<TrendingUp size={16} />} />
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: '#cbd5e1' }} angle={90} domain={[0, 100]} />
                <Radar dataKey="level" stroke="#6D4CFF" fill="#6D4CFF" fillOpacity={0.35} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card delay={0.2}>
            <CardHeader title="Top Proficiencies" subtitle="Highest mastered skills" icon={<Award size={16} />} />
            <div className="space-y-2.5">
              {topProficiencies.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-800 dark:text-slate-200 w-24 truncate">{t.name}</span>
                  <ProgressBar value={t.level} color="primary" height="h-2" className="flex-1" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-slate-200 w-8 text-right">{t.level}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Skills Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit ${cat.name} Skills`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAll} disabled={saving}>{saving ? 'Saving...' : 'Save to Profile'}</Button>
          </>
        }
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Adjust your proficiency scores (0–100) for {cat.name}. These update your verified profile in MongoDB and feed directly into the ML prediction and skill gap engines.
          </p>
          {cat.skills.map((s: any) => (
            <div key={s.name} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{s.name}</span>
                <span className="text-xs font-bold text-primary">{s.level || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={s.level || 0}
                onChange={(e) => handleUpdateLevel(s.name, parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          ))}
        </div>
      </Modal>
    </PageContainer>
  );
}

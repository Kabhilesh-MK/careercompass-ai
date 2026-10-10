import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ClipboardCheck,
  GitBranch,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import {
  StatCard,
  StatusBadge,
  ProgressBar,
  FilterBar,
  SearchInput,
} from '@/components/design-system';
import { useSkills } from '@/hooks/useSkills';

export default function SkillOverviewPage() {
  const navigate = useNavigate();
  const { skills, strongSkills, developingSkills, attentionSkills } = useSkills();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const strongCount = strongSkills.length;
  const developingCount = developingSkills.length;
  const attentionCount = attentionSkills.length;

  const categoryOptions = [
    { id: 'all', label: 'All Categories', count: skills.length },
    { id: 'Programming', label: 'Programming', count: skills.filter((s) => s.category === 'Programming').length },
    { id: 'AI/ML', label: 'AI / ML', count: skills.filter((s) => s.category === 'AI/ML').length },
    { id: 'Data', label: 'Data', count: skills.filter((s) => s.category === 'Data').length },
    { id: 'Database', label: 'Database', count: skills.filter((s) => s.category === 'Database').length },
    { id: 'Cloud', label: 'Cloud & DevOps', count: skills.filter((s) => s.category === 'Cloud').length },
    { id: 'Tools', label: 'Tools', count: skills.filter((s) => s.category === 'Tools').length },
    { id: 'Soft Skills', label: 'Soft Skills', count: skills.filter((s) => s.category === 'Soft Skills').length },
  ];

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory =
        selectedCategory === 'all' || skill.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.evidence.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Skill Overview
            </h1>
            <StatusBadge label="Profile Intelligence" size="xs" variant="primary" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Verified technical competencies, proficiency assessments, and evidentiary portfolio links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/skills/assessment')}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold"
          >
            <ClipboardCheck size={14} />
            <span>Take Skill Assessment</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/skills/gap')}
            className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
          >
            <GitBranch size={14} className="text-primary" />
            <span>View Skill Gap</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Skills"
          value={skills.length}
          subtitle="Across 7 core domains"
          icon={<Layers size={18} className="text-primary" />}
        />
        <StatCard
          label="Strong Skills"
          value={strongCount}
          subtitle="≥75% proficiency"
          icon={<ShieldCheck size={18} className="text-emerald-500" />}
          variant="success"
        />
        <StatCard
          label="Developing"
          value={developingCount}
          subtitle="50% - 74% proficiency"
          icon={<TrendingUp size={18} className="text-primary" />}
          variant="primary"
        />
        <StatCard
          label="Needs Attention"
          value={attentionCount}
          subtitle="<50% proficiency"
          icon={<Sparkles size={18} className="text-amber-500" />}
          variant="accent"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search skills by name, domain, or evidence..."
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            Showing {filteredSkills.length} of {skills.length} competencies
          </span>
        </div>

        <FilterBar
          options={categoryOptions}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Skills Table / Cards */}
      <div className="card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 w-44">Proficiency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Last Assessed</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {filteredSkills.map((skill) => {
                const isStrong = skill.currentProficiency >= 75;
                const isDeveloping =
                  skill.currentProficiency >= 50 && skill.currentProficiency < 75;

                return (
                  <tr
                    key={skill.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{skill.name}</span>
                        {skill.verified && (
                          <span
                            title="Verified"
                            className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-gray-500 dark:text-slate-400">
                        {skill.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 dark:text-slate-100">
                            {skill.currentProficiency}%
                          </span>
                          {skill.targetRoleScore && (
                            <span className="text-[10px] text-gray-400">
                              Target: {skill.targetRoleScore}%
                            </span>
                          )}
                        </div>
                        <ProgressBar
                          value={skill.currentProficiency}
                          size="xs"
                          variant={isStrong ? 'success' : isDeveloping ? 'primary' : 'warning'}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge
                        label={skill.status}
                        size="xs"
                        variant={
                          isStrong ? 'success' : isDeveloping ? 'primary' : 'warning'
                        }
                      />
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300 max-w-xs truncate">
                      {skill.evidence}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 dark:text-slate-500 text-[11px]">
                      {skill.lastAssessed}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-bold ${
                          skill.trend === 'up'
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        }`}
                      >
                        {skill.trend === 'up' ? '↑ Rising' : '→ Steady'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

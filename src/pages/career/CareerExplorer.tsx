import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Briefcase,
  X,
  Compass,
  ArrowRight,
  GitCompare,
  GitBranch,
  BookOpen,
  DollarSign,
  TrendingUp,
  Layers,
  Wrench,
  CheckCircle2,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Career } from '@/types/careerCompass';
import { DEMO_CAREERS } from '@/data/careers';
import {
  CareerCard,
  SearchInput,
  FilterBar,
  StatusBadge,
  SkillTag,
  EmptyState,
} from '@/components/design-system';

export default function CareerExplorerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  // Track filter chips
  const trackOptions = [
    { id: 'all', label: 'All Tracks', count: DEMO_CAREERS.length },
    { id: 'AI & Machine Learning', label: 'AI & ML', count: DEMO_CAREERS.filter((c) => c.careerTrack === 'AI & Machine Learning').length },
    { id: 'Data Science & Analytics', label: 'Data Science', count: DEMO_CAREERS.filter((c) => c.careerTrack === 'Data Science & Analytics').length },
    { id: 'Cloud & DevOps', label: 'Cloud & DevOps', count: DEMO_CAREERS.filter((c) => c.careerTrack === 'Cloud & DevOps').length },
    { id: 'Full-Stack Software Engineering', label: 'Full-Stack', count: DEMO_CAREERS.filter((c) => c.careerTrack === 'Full-Stack Software Engineering').length },
  ];

  const difficultyOptions = [
    { id: 'all', label: 'All Levels' },
    { id: 'Beginner', label: 'Beginner' },
    { id: 'Intermediate', label: 'Intermediate' },
    { id: 'Advanced', label: 'Advanced' },
  ];

  const filteredCareers = useMemo(() => {
    return DEMO_CAREERS.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.coreSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.typicalTools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTrack =
        selectedTrack === 'all' || c.careerTrack === selectedTrack;

      const matchesDifficulty =
        selectedDifficulty === 'all' || c.learningDifficulty === selectedDifficulty;

      return matchesSearch && matchesTrack && matchesDifficulty;
    });
  }, [searchQuery, selectedTrack, selectedDifficulty]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Career Explorer
            </h1>
            <StatusBadge label="Catalog V2" size="xs" variant="primary" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Browse, filter, and dissect role competencies, toolsets, and structured learning roadmaps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/career/compare')}
          className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
        >
          <GitCompare size={14} className="text-primary" />
          <span>Compare Careers</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by career, skill (Python, SQL), or tool..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter size={12} />
              Level:
            </span>
            <div className="flex items-center gap-1">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(opt.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedDifficulty === opt.id
                      ? 'bg-primary text-white'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Track Chips */}
        <FilterBar
          options={trackOptions}
          selectedId={selectedTrack}
          onSelect={setSelectedTrack}
        />
      </div>

      {/* Grid of Career Cards */}
      {filteredCareers.length === 0 ? (
        <EmptyState
          title="No career tracks found"
          description="Try broadening your search query or selecting 'All Tracks' above."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setSelectedTrack('all');
              setSelectedDifficulty('all');
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCareers.map((career) => (
            <CareerCard
              key={career.id}
              career={career}
              onExplore={() => setSelectedCareer(career)}
              onCompare={() => navigate(`/career/compare?c1=${career.id}`)}
            />
          ))}
        </div>
      )}

      {/* Detailed Career Modal / Drawer View */}
      <AnimatePresence>
        {selectedCareer && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white dark:bg-[#111827] shadow-2xl space-y-6 relative border border-gray-100 dark:border-slate-800"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCareer(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Title & Track Header */}
              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge
                    label={selectedCareer.careerTrack}
                    size="xs"
                    variant="primary"
                  />
                  <StatusBadge
                    label={`Difficulty: ${selectedCareer.learningDifficulty}`}
                    size="xs"
                    variant="neutral"
                  />
                  <span className="text-xs font-bold text-emerald-500">
                    {selectedCareer.salaryRange}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                  {selectedCareer.title}
                </h2>
              </div>

              {/* Overview */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Role Overview
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  {selectedCareer.overview}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Key Responsibilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedCareer.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-600 dark:text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills & Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Core Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCareer.coreSkills.map((s, i) => (
                      <SkillTag key={i} name={s} size="sm" variant="default" />
                    ))}
                    {selectedCareer.technicalSkills.map((s, i) => (
                      <SkillTag key={i} name={s} size="sm" variant="accent" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Typical Tools & Frameworks
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCareer.typicalTools.map((tool, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs rounded-lg font-mono bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Staged Learning Path */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Staged Learning Path
                </h4>
                <div className="space-y-1.5">
                  {selectedCareer.learningPathOverview.map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-medium text-gray-700 dark:text-slate-300 flex items-center justify-between"
                    >
                      <span>{stage}</span>
                      <span className="text-[10px] text-primary uppercase font-bold">
                        Stage {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCareer(null);
                    navigate(`/career/compare?c1=${selectedCareer.id}`);
                  }}
                  className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
                >
                  <GitCompare size={14} />
                  <span>Compare with Another Track</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCareer(null);
                      navigate('/skills/gap');
                    }}
                    className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
                  >
                    <GitBranch size={14} />
                    <span>View Skill Gap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCareer(null);
                      navigate('/roadmap');
                    }}
                    className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-semibold"
                  >
                    <span>Adopt Roadmap</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GitCompare, Plus, ArrowLeft, Layers, Compass } from 'lucide-react';
import { DEMO_CAREERS } from '@/data/careers';
import { ComparisonTable, StatusBadge } from '@/components/design-system';

export default function CareerComparisonView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const c1 = searchParams.get('c1') || 'career-ai-ml';
  const c2 = searchParams.get('c2') || 'career-data-scientist';
  const c3 = searchParams.get('c3') || 'career-mlops';

  const [selectedIds, setSelectedIds] = useState<string[]>([
    c1,
    c2,
    ...(c3 && c3 !== c1 && c3 !== c2 ? [c3] : []),
  ]);

  const selectedCareers = DEMO_CAREERS.filter((c) => selectedIds.includes(c.id));
  const availableCareers = DEMO_CAREERS.filter((c) => !selectedIds.includes(c.id));

  const handleAddCareer = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveCareer = (id: string) => {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter((cid) => cid !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Career Comparison
            </h1>
            <StatusBadge label="Multi-Track Dissection" size="xs" variant="primary" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Compare 2 to 3 career tracks side-by-side across technical intensity, skills, tools, and learning paths.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/career/explorer')}
          className="btn-outline text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft size={14} />
          <span>Back to Explorer</span>
        </button>
      </div>

      {/* Selector Bar */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Comparing ({selectedCareers.length}/3 tracks):
          </span>
          {selectedCareers.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              <Compass size={13} />
              <span>{c.title}</span>
            </span>
          ))}
        </div>

        {selectedIds.length < 3 && availableCareers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-slate-500">Add track:</span>
            <select
              className="text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 font-medium"
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCareer(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Select career to add...
              </option>
              {availableCareers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.careerTrack})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <ComparisonTable
        careers={selectedCareers}
        onRemoveCareer={selectedIds.length > 2 ? handleRemoveCareer : undefined}
      />
    </div>
  );
}

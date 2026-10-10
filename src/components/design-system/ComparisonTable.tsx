import React from 'react';
import { Career } from '@/types/careerCompass';
import { SkillTag } from './SkillTag';
import { StatusBadge } from './StatusBadge';

interface ComparisonTableProps {
  careers: Career[];
  onRemoveCareer?: (careerId: string) => void;
  className?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  careers,
  onRemoveCareer,
  className = '',
}) => {
  if (careers.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-gray-500 dark:text-slate-400">
        Please select at least 2 career tracks to compare.
      </div>
    );
  }

  const rows = [
    {
      category: 'Overview',
      render: (c: Career) => (
        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
          {c.overview}
        </p>
      ),
    },
    {
      category: 'Core Skills',
      render: (c: Career) => (
        <div className="flex flex-wrap gap-1">
          {c.coreSkills.map((s, idx) => (
            <SkillTag key={idx} name={s} size="xs" />
          ))}
        </div>
      ),
    },
    {
      category: 'Technical Stack',
      render: (c: Career) => (
        <p className="text-xs font-mono text-gray-700 dark:text-slate-300">
          {c.technicalSkills.slice(0, 5).join(', ')}
        </p>
      ),
    },
    {
      category: 'Programming Intensity',
      render: (c: Career) => (
        <StatusBadge
          label={c.programmingIntensity}
          size="xs"
          variant={c.programmingIntensity === 'Very High' ? 'danger' : 'primary'}
        />
      ),
    },
    {
      category: 'Data Intensity',
      render: (c: Career) => (
        <StatusBadge
          label={c.dataIntensity}
          size="xs"
          variant={c.dataIntensity === 'Very High' ? 'accent' : 'neutral'}
        />
      ),
    },
    {
      category: 'Cloud Exposure',
      render: (c: Career) => (
        <StatusBadge
          label={c.cloudExposure}
          size="xs"
          variant={c.cloudExposure === 'Very High' ? 'warning' : 'neutral'}
        />
      ),
    },
    {
      category: 'Typical Tools',
      render: (c: Career) => (
        <p className="text-xs text-gray-600 dark:text-slate-400">
          {c.typicalTools.join(', ')}
        </p>
      ),
    },
    {
      category: 'Compensation Band',
      render: (c: Career) => (
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {c.salaryRange}
        </span>
      ),
    },
    {
      category: 'Learning Difficulty',
      render: (c: Career) => (
        <StatusBadge label={c.learningDifficulty} size="xs" variant="neutral" />
      ),
    },
    {
      category: 'Current Skill Match (Demo)',
      render: (c: Career) => (
        <div>
          <span className="text-sm font-extrabold text-primary">
            {c.demoMatchScore || 65}% Match
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 block">
            Demo estimate
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className={`card overflow-hidden shadow-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
              <th className="p-4 w-44 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                Dimension
              </th>
              {careers.map((career) => (
                <th key={career.id} className="p-4 font-bold text-gray-900 dark:text-slate-100 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-primary uppercase tracking-wider block font-semibold">
                        {career.careerTrack}
                      </span>
                      <span>{career.title}</span>
                    </div>
                    {onRemoveCareer && careers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onRemoveCareer(career.id)}
                        className="text-gray-400 hover:text-rose-500 p-1 text-sm rounded"
                        title="Remove from comparison"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/40 dark:bg-slate-900/40'}
              >
                <td className="p-4 font-semibold text-gray-500 dark:text-slate-400 align-top">
                  {row.category}
                </td>
                {careers.map((career) => (
                  <td key={career.id} className="p-4 align-top">
                    {row.render(career)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 dark:text-slate-500 text-center">
        Note: Career comparison is provided for transparent side-by-side analysis without ranking or declaring a single winner.
      </div>
    </div>
  );
};

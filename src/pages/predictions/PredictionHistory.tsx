import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  GitBranch,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge, ProgressBar } from '@/components/design-system';
import { useAppState } from '@/hooks/useAppState';

export default function PredictionHistoryPage() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const history = state.predictionHistory;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Prediction History
            </h1>
            <StatusBadge label="Audit Trail V2" size="xs" variant="primary" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Historical audit log of career track predictions and underlying skill profile evolution over time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/career/prediction')}
          className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto font-semibold"
        >
          <span>Latest Prediction</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Timeline of Past Predictions */}
      <div className="space-y-6 relative pl-6 sm:pl-8">
        <div className="absolute left-3 sm:left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-slate-800 -ml-[1px]" />

        {history.map((record, idx) => (
          <div key={record.id} className="relative">
            {/* Timeline Node */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-primary bg-white dark:bg-[#111827] flex items-center justify-center text-primary shadow-sm">
              <Compass size={14} />
            </div>

            <div className="card p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                    {record.date}
                  </span>
                  {record.isRealMl ? (
                    <StatusBadge label="REAL ML INFERENCE" size="xs" variant="primary" dot />
                  ) : (
                    <StatusBadge label="LEGACY DEMO" size="xs" variant="demo" />
                  )}
                  <StatusBadge
                    label={`Model: ${record.assessmentVersion}`}
                    size="xs"
                    variant="neutral"
                  />
                  {idx === 0 && (
                    <StatusBadge label="Latest" size="xs" variant="accent" />
                  )}
                </div>

                <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
                  {record.isRealMl ? 'FastAPI Candidate H' : `Profile: ${record.skillProfileVersion}`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                    {record.isRealMl ? 'Primary Predicted Career Track' : 'Inferred Career Track (Demo)'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {record.predictedCareer}
                  </h3>
                  {record.isRealMl && record.recognizedSkills && (
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Features: {record.recognizedSkills.length} recognized skills evaluated (
                      <span className="font-mono text-primary">{record.recognizedSkills.slice(0, 4).join(', ')}{record.recognizedSkills.length > 4 ? '...' : ''}</span>)
                    </p>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    {record.isRealMl ? 'Model-predicted probability' : 'Confidence Estimate (Demo)'}
                  </span>
                  <div className="flex items-baseline sm:justify-end gap-1">
                    <span className="text-xl font-black text-primary">
                      {record.confidenceEstimate}%
                    </span>
                    {record.isRealMl && (
                      <span className="text-[10px] text-gray-400">uncalibrated</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted & Recognized Skills (for Real ML) */}
              {record.isRealMl && record.submittedSkills && record.submittedSkills.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Submitted Skill Tokens ({record.submittedSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {record.submittedSkills.map((sk) => {
                      const isRec = record.recognizedSkills?.includes(sk);
                      return (
                        <span
                          key={sk}
                          className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                            isRec
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {sk} {!isRec && '(unknown)'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What Changed? */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-slate-200">
                  <Sparkles size={13} className="text-secondary" />
                  <span>{record.isRealMl ? 'Inference Execution Notes' : 'What Changed Since Previous Assessment?'}</span>
                </div>
                <div className="space-y-1">
                  {record.whatChanged.map((change, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-300"
                    >
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-gray-400">
                  {record.isRealMl ? 'Alternative Track Probabilities:' : 'Alternative Candidates:'}
                </span>
                {record.alternativeTracks.map((alt) => (
                  <span
                    key={alt.name}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-medium"
                  >
                    {alt.name} ({alt.probability}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

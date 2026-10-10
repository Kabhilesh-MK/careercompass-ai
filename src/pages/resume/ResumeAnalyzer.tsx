import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Zap,
  Target, Search, Eye, BarChart2, Download, ArrowRight, Info,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { ProgressBar } from '@/components/Progress';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { analyzeResume } from '@/services/engagementService';
import { getResume, uploadResume } from '@/services/resourceService';
import { useToast } from '@/context/ToastContext';

interface Analysis {
  extracted_skills: string[];
  extracted_projects: string[];
  extracted_certifications: string[];
  extracted_education: string[];
  extracted_achievements: string[];
  resume_score: number;
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missing_keywords: string[];
  predicted_career_match: string;
}

const MOCK_ANALYSIS: Analysis = {
  extracted_skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Git', 'Docker', 'AWS', 'pandas', 'NumPy'],
  extracted_projects: ['Sentiment Analysis API', 'Image Classification CNN', 'Customer Churn Predictor'],
  extracted_certifications: ['AWS Cloud Practitioner', 'Google Data Analytics'],
  extracted_education: ['B.Tech Computer Science — IIT Delhi (2021–2025, CGPA 8.7)'],
  extracted_achievements: ['Published research paper on NLP', 'Won Smart India Hackathon 2024'],
  resume_score: 78,
  ats_score: 72,
  strengths: ['Strong skill coverage (9 skills identified)', '3 projects detected — demonstrates hands-on experience', '2 certifications found'],
  weaknesses: ['Missing keywords for ML Engineer: Deep Learning, Docker, Linux', 'No leadership examples mentioned'],
  suggestions: [
    'Add Deep Learning and MLOps keywords to your resume',
    'Quantify achievements: "Reduced inference time by 40%" is more impactful',
    'Include a Summary section with your career objective',
    'Add a link to your GitHub portfolio',
    'Use stronger action verbs: Developed, Implemented, Optimized',
  ],
  missing_keywords: ['Deep Learning', 'Docker', 'Linux', 'MLOps'],
  predicted_career_match: 'ML Engineer',
};

function ScoreGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const c = value >= 75 ? 'success' : value >= 55 ? 'warning' : 'danger';
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${value} ${100 - value}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</span>
          <span className="text-[9px] text-gray-400">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{label}</p>
      <Badge color={c as any}>{value >= 75 ? 'Excellent' : value >= 55 ? 'Good' : 'Needs Work'}</Badge>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resumeId, setResumeId] = useState('');
  const [career, setCareer] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    getResume().then((r) => {
      if (r && r._id) {
        setResumeId(r._id);
      }
    }).catch(console.error);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    try {
      let rid = resumeId;
      if (!rid) {
        const res = await uploadResume(file);
        rid = res?._id || res?.id || 'mock-id';
        setResumeId(rid);
      }
      setUploading(false);
      setAnalyzing(true);
      const result = await analyzeResume(rid, career);
      if (result?.resume_score !== undefined) {
        setAnalysis(result);
        addToast('Resume analyzed successfully!', 'success');
      } else {
        addToast('Could not extract sufficient text from the resume.', 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to analyze resume. Please try again.', 'error');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const loading = uploading || analyzing;

  return (
    <PageContainer>
      <PageHeader title="Resume Analyzer" subtitle="Upload your resume for AI-powered analysis, ATS scoring, and career-fit feedback.">
        {analysis && <Badge color="success"><CheckCircle2 size={13} /> Analysis Complete</Badge>}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card delay={0.05}>
            <CardHeader title="Upload Resume" icon={<Upload size={16} />} />

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'}`}
              onClick={() => document.getElementById('resume-input')?.click()}
            >
              <input id="resume-input" type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <FileText size={22} />
              </div>
              {file ? (
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                  <button onClick={e => { e.stopPropagation(); setFile(null); setAnalysis(null); setResumeId(''); }}
                    className="text-xs text-danger hover:underline mt-2">Remove</button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Drop your resume here</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX or TXT · Max 5 MB</p>
                </>
              )}
            </div>

            {/* Career target */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Target Career (optional)</label>
              <input
                value={career}
                onChange={e => setCareer(e.target.value)}
                placeholder="e.g. ML Engineer"
                className="input text-sm"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleUploadAndAnalyze}
              disabled={!file || loading}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> {uploading ? 'Uploading…' : 'Analyzing…'}</>
              ) : (
                <><Zap size={15} /> Analyze Resume</>
              )}
            </Button>
          </Card>

          {/* Tips */}
          <Card delay={0.1} className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
            <CardHeader title="Analysis Includes" icon={<Info size={16} />} />
            <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              {['Skill extraction', 'ATS keyword scoring', 'Resume structure score', 'Missing keyword detection', 'Career fit analysis', 'Improvement suggestions'].map(t => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 size={13} className="text-success" />{t}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="py-20">
                  <div className="text-center">
                    <Search size={36} className="mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-gray-400">Upload a resume to see the analysis</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="py-20">
                  <div className="text-center space-y-3">
                    <Loader2 size={36} className="animate-spin mx-auto text-primary" />
                    <p className="font-medium text-gray-600 dark:text-slate-300">
                      {uploading ? 'Uploading resume…' : 'AI is analyzing your resume…'}
                    </p>
                    <p className="text-xs text-gray-400">Extracting skills, scoring ATS compatibility…</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Score gauges */}
                <Card>
                  <CardHeader title="Scores" icon={<BarChart2 size={16} />} subtitle={analysis.predicted_career_match ? `Analyzed for: ${analysis.predicted_career_match}` : undefined} />
                  <div className="grid grid-cols-2 gap-4">
                    <ScoreGauge value={analysis.resume_score} label="Resume Score" color="#6D4CFF" />
                    <ScoreGauge value={analysis.ats_score} label="ATS Score" color="#22C55E" />
                  </div>
                </Card>

                {/* Extracted data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Skills Detected', items: analysis.extracted_skills, color: 'primary' },
                    { title: 'Missing Keywords', items: analysis.missing_keywords, color: 'danger' },
                  ].map(section => (
                    <Card key={section.title}>
                      <CardHeader title={section.title} icon={<Eye size={15} />} />
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.length ? section.items.map(s => (
                          <span key={s} className={`chip bg-${section.color}/10 text-${section.color}`}>{s}</span>
                        )) : <span className="text-xs text-gray-400">{section.color === 'danger' ? '✓ No missing keywords!' : 'None detected'}</span>}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Projects + Certs + Education */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: 'Projects', items: analysis.extracted_projects },
                    { title: 'Certifications', items: analysis.extracted_certifications },
                    { title: 'Education', items: analysis.extracted_education },
                  ].map(s => (
                    <Card key={s.title} className="p-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">{s.title}</p>
                      {s.items.length ? (
                        <ul className="space-y-1">
                          {s.items.map((it, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-slate-400 flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>{it}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-xs text-gray-400">Not detected</p>}
                    </Card>
                  ))}
                </div>

                {/* Strengths / Weaknesses / Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: 'Strengths', items: analysis.strengths, color: 'success', icon: <CheckCircle2 size={13} className="text-success shrink-0" /> },
                    { title: 'Weaknesses', items: analysis.weaknesses, color: 'danger', icon: <AlertCircle size={13} className="text-danger shrink-0" /> },
                    { title: 'Suggestions', items: analysis.suggestions, color: 'primary', icon: <ArrowRight size={13} className="text-primary shrink-0" /> },
                  ].map(s => (
                    <Card key={s.title} className={`border-${s.color}/20`}>
                      <p className={`text-sm font-semibold text-${s.color} mb-3`}>{s.title}</p>
                      <ul className="space-y-2">
                        {s.items.map((it, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                            {s.icon}{it}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}

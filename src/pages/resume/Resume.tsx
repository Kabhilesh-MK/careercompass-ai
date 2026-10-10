import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, FileCheck, Sparkles, CheckCircle2, Loader2, X } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/Progress';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const extractedSkills = [
  { name: 'Python', confidence: 96 },
  { name: 'React', confidence: 92 },
  { name: 'Node.js', confidence: 88 },
  { name: 'PostgreSQL', confidence: 84 },
  { name: 'TensorFlow', confidence: 71 },
  { name: 'Docker', confidence: 78 },
  { name: 'AWS', confidence: 64 },
  { name: 'TypeScript', confidence: 90 },
];

export default function ResumePage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile({ name: f.name, size: f.size });
    setAnalyzed(false);
  };

  const analyze = () => {
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      addToast('Resume analysis complete', 'success');
    }, 1800);
  };

  return (
    <PageContainer>
      <PageHeader title="Resume Analyzer" subtitle="Upload your resume to extract skills and get AI-powered insights.">
        <Badge color="primary"><Sparkles size={13} /> AI-Powered</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload area */}
        <Card delay={0.1}>
          <CardHeader title="Upload Resume" subtitle="PDF, DOC, or DOCX up to 5MB" icon={<UploadCloud size={16} />} />
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <motion.div animate={dragging ? { scale: 1.1 } : { scale: 1 }} className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={28} />
            </motion.div>
            <p className="font-medium text-gray-900 dark:text-slate-100 text-sm">{dragging ? 'Drop your file here' : 'Drag & drop your resume'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">or click to browse</p>
          </div>

          <AnimatePresence>
            {file && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={() => { setFile(null); setAnalyzed(false); }} className="text-gray-400 hover:text-danger"><X size={16} /></button>
                </div>
                <Button onClick={analyze} disabled={analyzing} className="w-full mt-3">
                  {analyzing ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</> : <><Sparkles size={15} /> Analyze Resume</>}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Resume preview */}
        <Card delay={0.15}>
          <CardHeader title="Resume Preview" subtitle={file ? file.name : 'No file uploaded'} icon={<FileText size={16} />} />
          {file ? (
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 min-h-[280px] border border-gray-100 dark:border-slate-800">
              <div className="text-center mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-bold text-gray-900 dark:text-slate-100">{user?.full_name || 'Student'}</h3>
                <p className="text-xs text-gray-500 mt-1">{(user?.email || '') + (user?.location ? ` · ${user.location}` : '')}</p>
              </div>
              <div className="space-y-3 text-xs text-gray-600 dark:text-slate-300">
                <Section title="Experience">
                  <p>Software Engineering Intern (Projects Completed: {user?.projects_completed || 0})</p>
                  <p>Internships Done: {user?.internships || 0}</p>
                </Section>
                <Section title="Education">
                  <p>{(user?.degree || '') + ' ' + (user?.department || '') + ', ' + (user?.college || '') + (user?.cgpa ? ` · CGPA ${user.cgpa}` : '')}</p>
                </Section>
                <Section title="Certifications">
                  <p>Earned Certifications: {user?.certifications_count || 0}</p>
                </Section>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Upload a resume to see preview</p>
            </div>
          )}
        </Card>
      </div>

      {/* Extracted skills + analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card delay={0.1}>
          <CardHeader title="Extracted Skills" subtitle="AI-detected from your resume" icon={<Sparkles size={16} />} action={analyzed ? <Badge color="success"><CheckCircle2 size={12} /> {extractedSkills.length} found</Badge> : <Badge color="gray">Pending</Badge>} />
          {analyzed ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {extractedSkills.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.confidence}%</span>
                  </div>
                  <ProgressBar value={s.confidence} color={s.confidence >= 85 ? 'success' : 'primary'} height="h-1.5" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-gray-400">
              {file ? 'Click "Analyze Resume" to extract skills' : 'Upload and analyze your resume to see extracted skills'}
            </div>
          )}
        </Card>

        <Card delay={0.15}>
          <CardHeader title="Analysis Summary" subtitle="AI insights & recommendations" icon={<FileCheck size={16} />} />
          {analyzed ? (
            <div className="space-y-3">
              <InsightRow label="Overall Score" value="78 / 100" color="primary" />
              <InsightRow label="Skills Matched" value="8 / 12 required" color="success" />
              <InsightRow label="Experience Relevance" value="High" color="success" />
              <InsightRow label="Formatting" value="Good" color="success" />
              <InsightRow label="Keyword Coverage" value="Medium" color="warning" />
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mt-3">
                <p className="text-xs text-warning font-medium mb-1">Recommendation</p>
                <p className="text-xs text-gray-600 dark:text-slate-300">Add more cloud and MLOps keywords to improve ATS match rate for ML Engineer roles.</p>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-gray-400">Analysis will appear here after scanning your resume.</div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-900 dark:text-slate-100 uppercase text-[10px] tracking-wide mb-1">{title}</p>
      {children}
    </div>
  );
}

function InsightRow({ label, value, color }: { label: string; value: string; color: 'primary' | 'success' | 'warning' }) {
  const colors = { primary: 'text-primary', success: 'text-success', warning: 'text-warning' };
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50">
      <span className="text-sm text-gray-600 dark:text-slate-300">{label}</span>
      <span className={`text-sm font-semibold ${colors[color]}`}>{value}</span>
    </div>
  );
}

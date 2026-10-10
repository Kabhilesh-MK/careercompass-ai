import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Mail, Printer, FileText, Loader2, CheckCircle2,
  Share2, Eye, X, Send,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { getHtmlReport, sendEmailReport } from '@/services/engagementService';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { reportData } from '@/data/pageData';

interface Props {
  reportPayload?: Record<string, unknown>;
}

export default function PDFReportPanel({ reportPayload }: Props) {
  const { user } = useAuth();
  const [htmlContent, setHtmlContent] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { addToast } = useToast();

  const payload = reportPayload || {
    prediction: { predicted_career: 'ML Engineer', confidence: 86, top_5_careers: [
      { career: 'ML Engineer', probability: 86 },
      { career: 'Data Scientist', probability: 74 },
      { career: 'Software Engineer', probability: 62 },
      { career: 'AI Engineer', probability: 55 },
      { career: 'Cloud Engineer', probability: 40 },
    ], model_name: 'RandomForest', model_accuracy: 0.989 },
    skill_gap: { target_career: 'ML Engineer', match_percentage: 73, current_skills: [], missing_skills: [
      { name: 'Docker', current: 30, required: 60, gap: 30, priority: 'High' },
      { name: 'MLOps', current: 20, required: 60, gap: 40, priority: 'Critical' },
    ], strengths: [{ name: 'Python', level: 85 }, { name: 'ML', level: 78 }], weaknesses: [] },
    placement: { overall_score: 74, readiness_level: 'Ready', components: { programming: 82, soft_skills: 78, projects: 70, cgpa: 87, internship: 67, certifications: 50, communication: 80 }, suggestions: ['Build more projects', 'Earn ML certifications'], strengths: [], weaknesses: [] },
    recommendations: { courses: ['Machine Learning Specialization (Coursera)', 'MLOps Fundamentals (Google)'], certifications: ['AWS ML Specialty', 'TensorFlow Developer'], projects: ['End-to-end ML pipeline', 'Recommendation engine'], books: ['Hands-On ML', 'Designing ML Systems'], practice_sites: ['Kaggle'], interview_topics: [] },
    roadmap: [
      { week: 'Week 1', title: 'Foundation & Assessment', description: 'Review your baseline skills and set up your dev environment.', tasks: [], status: 'upcoming', progress: 0 },
      { week: 'Week 2', title: 'Core Skill Building', description: 'Deep dive into priority missing skills.', tasks: [], status: 'upcoming', progress: 0 },
      { week: 'Week 3', title: 'Intermediate Development', description: 'Build and practise with projects.', tasks: [], status: 'upcoming', progress: 0 },
      { week: 'Week 4', title: 'Hands-On Projects', description: 'Apply skills in real portfolio project.', tasks: [], status: 'upcoming', progress: 0 },
      { week: 'Week 5', title: 'Advanced Skills', description: 'Close remaining gaps and start certification prep.', tasks: [], status: 'upcoming', progress: 0 },
      { week: 'Week 6', title: 'Placement Prep', description: 'Mock interviews, polish portfolio, start applying.', tasks: [], status: 'upcoming', progress: 0 },
    ],
  };

  const userInfo = {
    full_name: user?.full_name || 'Student',
    email: user?.email || '',
    college: user?.college || '',
    cgpa: user?.cgpa?.toString() || '0.00',
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const html = await getHtmlReport(payload, userInfo);
      if (typeof html === 'string' && html.trim().startsWith('<!DOCTYPE')) {
        setHtmlContent(html);
      } else {
        setHtmlContent(FALLBACK_HTML);
      }
      setPreviewing(true);
    } catch {
      setHtmlContent(FALLBACK_HTML);
      setPreviewing(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.print();
  };

  const handleEmail = async () => {
    if (!emailInput) return;
    setEmailLoading(true);
    try {
      const res = await sendEmailReport(payload, emailInput);
      if (res.status === 'sent') {
        addToast(`Report sent to ${emailInput} ✓`, 'success');
      } else {
        addToast(res.message || 'Email not configured on server', 'warning');
      }
      setShowEmailForm(false);
    } catch {
      addToast('Email send failed', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Export Report" subtitle="Download a professional PDF or email your career report" icon={<FileText size={16} />} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={handlePreview} disabled={loading} className="flex-1">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Eye size={15} /> Preview & Download PDF</>}
        </Button>
        <Button variant="outline" onClick={() => setShowEmailForm(s => !s)} className="flex-1">
          <Mail size={15} /> Email Report
        </Button>
      </div>

      {/* Email form */}
      <AnimatePresence>
        {showEmailForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <input
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="input text-sm flex-1"
                type="email"
              />
              <Button variant="primary" onClick={handleEmail} disabled={emailLoading || !emailInput}>
                {emailLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
              <Button variant="ghost" onClick={() => setShowEmailForm(false)}><X size={14} /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {previewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span className="font-semibold text-gray-900 dark:text-slate-100">Career Report Preview</span>
                  <span className="chip bg-success/10 text-success text-[10px]"><CheckCircle2 size={9} /> Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handlePrint} className="text-xs">
                    <Printer size={14} /> Print / Save PDF
                  </Button>
                  <button onClick={() => setPreviewing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
                    <X size={16} />
                  </button>
                </div>
              </div>
              {/* iframe */}
              <iframe
                ref={iframeRef}
                srcDoc={htmlContent}
                className="flex-1 w-full"
                style={{ minHeight: '70vh' }}
                title="Career Report"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

const FALLBACK_HTML = `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;padding:40px;color:#111}</style></head>
<body><h1 style="color:#6D4CFF">CareerCompass AI — Career Report</h1>
<p>Your career report preview is ready. Click <strong>Print / Save PDF</strong> to download.</p>
<p style="color:#6B7280;font-size:13px;">Connect the backend to generate a full report with live data.</p>
</body></html>`;

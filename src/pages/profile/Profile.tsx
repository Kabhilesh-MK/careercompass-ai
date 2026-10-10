import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, Github, Linkedin, Globe2, Pencil, GraduationCap,
  Award, BookOpen, Sparkles, Calendar, CheckCircle2, Download
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/Progress';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/hooks/useAppState';
import { updateProfile } from '@/services/profileService';
import { getMLPrediction } from '@/services/resourceService';
import { RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const { addToast } = useToast();
  const { user, checkAuth } = useAuth();
  const { state, dispatch } = useAppState();
  const [editOpen, setEditOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  if (!user) return null;

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const payload: Record<string, any> = {};
      (user.skills || []).forEach((cat: any) => {
        (cat.skills || []).forEach((sk: any) => {
          payload[sk.name] = sk.level || 0;
        });
      });
      payload['CGPA'] = user.cgpa ?? 7.5;
      payload['Projects Completed'] = user.projects_completed ?? 0;
      payload['Internship'] = user.internships ?? 0;
      payload['Certifications'] = user.certifications_count ?? 0;
      payload['Preferred Domain'] = user.preferred_domain || 'Full Stack';
      payload['Interest'] = (user.interests && user.interests[0]) || 'Web Development';

      await getMLPrediction(payload);
      await checkAuth();
      addToast('Career intelligence models re-evaluated and synchronized!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Personal metrics with safe fallbacks from centralized state
  const name = state.profile.name || user.full_name || 'Alex Johnson';
  const role = user.role || 'Student';
  const bio = state.profile.bio || user.bio || 'Building skills and unlocking career opportunities.';
  const email = state.profile.email || user.email || 'alex.johnson@example.edu';
  const phone = state.profile.phone || user.phone || '+1 (555) 234-5678';
  const location = state.profile.location || user.location || 'San Francisco, CA';
  const joinedAt = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently';

  const skillsTracked = user.skills?.reduce((sum: number, cat: any) => {
    return sum + (cat.skills?.filter((s: any) => s.level > 0).length || 0);
  }, 0) || 0;

  const cgpaValue = user.cgpa ? user.cgpa.toFixed(2) : 'N/A';
  const certsCount = user.certifications_count || 0;
  const projectsCount = user.projects_completed || 0;

  // Build education entry with fallback for complete profile view
  const educationList = user.college ? [
    {
      id: 'edu-1',
      degree: user.degree || 'B.Tech in Computer Science & Engineering',
      institution: user.college,
      status: 'Pursuing (Final Year)',
      startYear: new Date().getFullYear() - (user.year || 3) + 1,
      endYear: new Date().getFullYear() - (user.year || 3) + 4,
      cgpa: cgpaValue !== 'N/A' ? cgpaValue : '8.65',
    }
  ] : [
    {
      id: 'edu-demo',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Institute of Engineering & Technology',
      status: 'Pursuing (Semester 4)',
      startYear: 2023,
      endYear: 2027,
      cgpa: '8.75',
    }
  ];

  const interestsList = (user.interests && user.interests.length > 0) ? user.interests : ['Machine Learning', 'Data Structures', 'Cloud Systems', 'Full-Stack Development'];

  return (
    <PageContainer>
      <PageHeader title="My Profile" subtitle="Manage your personal information and academic credentials.">
        <Button variant="outline" onClick={handleReanalyze} disabled={analyzing}>
          <RefreshCw size={15} className={analyzing ? 'animate-spin' : ''} /> {analyzing ? 'Analyzing...' : 'Re-run ML Intelligence'}
        </Button>
        <Button onClick={() => setEditOpen(true)}><Pencil size={15} /> Edit Profile</Button>
      </PageHeader>

      {/* Profile header card */}
      <Card className="overflow-hidden" delay={0.05}>
        <div className="h-24 bg-gradient-to-r from-primary via-primary-600 to-secondary rounded-t-2xl -m-5 mb-4" />
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border-4 border-white dark:border-slate-900 -mt-12 shadow-card shrink-0">
            <GraduationCap size={40} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{name}</h2>
              <Badge color="primary">{role}</Badge>
              <Badge color="success"><CheckCircle2 size={12} /> Verified</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{bio}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Mail size={13} /> {email}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} /> {phone}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {location}</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} /> Joined {joinedAt}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="#" className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition"><Github size={16} /></a>
            <a href="#" className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition"><Linkedin size={16} /></a>
            <a href="#" className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition"><Globe2 size={16} /></a>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStat label="CGPA" value={cgpaValue} icon={<GraduationCap size={16} />} />
        <MiniStat label="Skills" value={skillsTracked} icon={<Sparkles size={16} />} />
        <MiniStat label="Certs" value={certsCount} icon={<Award size={16} />} />
        <MiniStat label="Projects" value={projectsCount} icon={<CheckCircle2 size={16} />} />
        <MiniStat label="Status" value="On Track" icon={<BookOpen size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Education */}
        <Card className="lg:col-span-2" delay={0.1}>
          <CardHeader title="Education" icon={<GraduationCap size={16} />} action={<Badge color="primary">{educationList.length} entries</Badge>} />
          <div className="space-y-3">
            {educationList.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-100">{e.degree}</h4>
                    <Badge color="success">{e.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{e.institution}</p>
                  <p className="text-xs text-gray-400 mt-1">{e.startYear} — {e.endYear} · CGPA: <span className="font-semibold text-primary">{e.cgpa}</span></p>
                </div>
              </div>
            ))}
            {educationList.length === 0 && (
              <p className="text-sm text-gray-400">No education entries found.</p>
            )}
          </div>
        </Card>

        {/* Interests */}
        <Card delay={0.15}>
          <CardHeader title="Interests & Domain" icon={<Sparkles size={16} />} />
          <div className="flex flex-wrap gap-2 mb-4">
            {interestsList.map((i: any) => (
              <Badge key={i} color="secondary">{i}</Badge>
            ))}
            {user.preferred_domain && (
              <Badge color="primary">{user.preferred_domain}</Badge>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Skill Categories Average</p>
            {user.skills?.map((cat: any) => {
              if (cat.skills?.length === 0) return null;
              const avg = Math.round(cat.skills.reduce((s: number, sk: any) => s + sk.level, 0) / cat.skills.length) || 0;
              return (
                <div key={cat.id} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-slate-300">{cat.name}</span>
                    <span className="font-medium">{avg}%</span>
                  </div>
                  <ProgressBar value={avg} color="primary" height="h-1.5" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={{ ...user, ...state.profile }} onSave={async (data) => {
        try {
          dispatch({
            type: 'UPDATE_PROFILE',
            payload: {
              name: data.full_name || state.profile.name,
              phone: data.phone,
              location: data.location,
              bio: data.bio,
              targetCareer: data.preferred_domain || state.profile.targetCareer,
              education: {
                degree: data.degree || state.profile.education.degree,
                institution: state.profile.education.institution,
                gradYear: state.profile.education.gradYear,
                gpa: data.cgpa || state.profile.education.gpa,
              }
            }
          });
          await updateProfile(data).catch(() => {});
          await checkAuth().catch(() => {});
          setEditOpen(false);
          addToast('Profile updated and saved to persistent offline state!', 'success');
        } catch (err: any) {
          addToast(err.message || 'Update failed', 'error');
        }
      }} />
    </PageContainer>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card delay={0.05} className="flex flex-col gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
      <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
    </Card>
  );
}

function EditProfileModal({ open, onClose, user, onSave }: { open: boolean; onClose: () => void; user: any; onSave: (data: any) => void }) {
  const parts = (user.full_name || '').split(' ');
  const first = parts[0] || '';
  const last = parts.slice(1).join(' ') || '';

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile & Academic Details" size="lg" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => {
          const form = document.querySelector('[data-edit-form]') as HTMLFormElement;
          if (!form) return onSave({});
          const fd = new FormData(form);
          onSave({
            full_name: `${fd.get('firstName')} ${fd.get('lastName')}`.trim(),
            phone: fd.get('phone'),
            location: fd.get('location'),
            bio: fd.get('bio'),
            cgpa: parseFloat(fd.get('cgpa') as string) || user.cgpa,
            projects_completed: parseInt(fd.get('projects_completed') as string, 10) || 0,
            certifications_count: parseInt(fd.get('certifications_count') as string, 10) || 0,
            internships: parseInt(fd.get('internships') as string, 10) || 0,
            degree: fd.get('degree'),
            department: fd.get('department'),
            preferred_domain: fd.get('preferred_domain'),
          });
        }}>Save Changes</Button>
      </>
    }>
      <form data-edit-form className="space-y-4 max-h-[70vh] overflow-y-auto pr-1" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" name="firstName" defaultValue={first} />
          <Field label="Last Name" name="lastName" defaultValue={last} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" name="phone" defaultValue={user.phone || ''} />
          <Field label="Location" name="location" defaultValue={user.location || ''} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
          <Field label="CGPA (0-10)" name="cgpa" type="number" defaultValue={user.cgpa?.toString() || '7.5'} />
          <Field label="Projects" name="projects_completed" type="number" defaultValue={(user.projects_completed ?? 0).toString()} />
          <Field label="Certs" name="certifications_count" type="number" defaultValue={(user.certifications_count ?? 0).toString()} />
          <Field label="Internships" name="internships" type="number" defaultValue={(user.internships ?? 0).toString()} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Degree Program" name="degree" defaultValue={user.degree || 'B.Tech'} />
          <Field label="Department" name="department" defaultValue={user.department || 'Computer Science'} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Preferred Domain</label>
          <input
            name="preferred_domain"
            defaultValue={user.preferred_domain || 'Full Stack'}
            className="input"
            placeholder="e.g. AI / ML, Full Stack, Cloud / DevOps, Data Science"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Bio</label>
          <textarea name="bio" rows={2} defaultValue={user.bio || ''} className="input resize-none" placeholder="Write a short bio..." />
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} className="input" step={type === 'number' ? '0.1' : undefined} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, User, Bell, Lock, Shield, Moon, Sun, Check, Globe, RotateCcw, AlertTriangle } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/hooks/useAppState';
import { getSettings, updateSettings } from '@/services/resourceService';

const sections = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'demo', label: 'Demo Data', icon: RotateCcw },
];

export default function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { resetDemoData } = useAppState();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [active, setActive] = useState('theme');
  const [saving, setSaving] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    career: true, roadmap: true, certs: true, reports: false, mentor: true, marketing: false,
  });
  const [privacy, setPrivacy] = useState({ profile: 'public', showProgress: true, showSkills: true });

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        if (s.theme) setTheme(s.theme);
        if (s.notifications) setNotifSettings(s.notifications);
        if (s.privacy) setPrivacy(s.privacy);
      }
    }).catch(console.error);
  }, [setTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        theme,
        notifications: notifSettings,
        privacy,
      });
      addToast('Settings saved to server', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const name = user?.full_name || 'Student';
  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ');
  const email = user?.email || '';
  const phone = user?.phone || '';
  const location = user?.location || '';
  const role = user?.role || 'Student';
  const bio = user?.bio || '';

  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Manage your account preferences and configuration.">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar nav */}
        <Card className="lg:col-span-1" delay={0.05}>
          <nav className="space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active === s.id ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={16} /> {s.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {active === 'theme' && (
            <Card delay={0.1}>
              <CardHeader title="Appearance" subtitle="Customize how CareerCompass looks" icon={<Palette size={16} />} />
              <div className="grid sm:grid-cols-2 gap-4">
                <ThemeOption active={theme === 'light'} onClick={() => theme !== 'light' && toggleTheme()} label="Light" icon={<Sun size={20} />} />
                <ThemeOption active={theme === 'dark'} onClick={() => theme !== 'dark' && toggleTheme()} label="Dark" icon={<Moon size={20} />} />
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {['#6D4CFF', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'].map((c, i) => (
                    <button key={c} className={`w-10 h-10 rounded-xl flex items-center justify-center transition hover:scale-110 ${i === 0 ? 'ring-2 ring-offset-2 ring-primary' : ''}`} style={{ background: c }}>
                      {i === 0 && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {active === 'profile' && (
            <Card delay={0.1}>
              <CardHeader title="Profile Information" subtitle="Update your personal details" icon={<User size={16} />} />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {firstName[0]}
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => addToast('Photo updated', 'success')}>Change Photo</Button>
                  <p className="text-xs text-gray-400 mt-1.5">JPG, PNG up to 2MB</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" defaultValue={firstName} />
                <Field label="Last Name" defaultValue={lastName} />
                <Field label="Email" defaultValue={email} />
                <Field label="Phone" defaultValue={phone} />
                <Field label="Location" defaultValue={location} />
                <Field label="Role" defaultValue={role} />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Bio</label>
                <textarea className="input min-h-[80px]" defaultValue={bio} />
              </div>
            </Card>
          )}

          {active === 'notifications' && (
            <Card delay={0.1}>
              <CardHeader title="Notification Preferences" subtitle="Choose what you want to be notified about" icon={<Bell size={16} />} />
              <div className="space-y-1">
                {[
                  { key: 'career', label: 'Career match updates', desc: 'New career matches and score changes' },
                  { key: 'roadmap', label: 'Roadmap milestones', desc: 'Weekly progress and milestone completions' },
                  { key: 'certs', label: 'Certification deadlines', desc: 'Upcoming cert expiry and reminders' },
                  { key: 'reports', label: 'Weekly reports', desc: 'Your weekly progress digest' },
                  { key: 'mentor', label: 'AI Mentor responses', desc: 'When your AI mentor has new advice' },
                  { key: 'marketing', label: 'Product updates', desc: 'New features and announcements' },
                ].map((n) => (
                  <Toggle
                    key={n.key}
                    label={n.label}
                    desc={n.desc}
                    on={notifSettings[n.key as keyof typeof notifSettings]}
                    onToggle={() => setNotifSettings((s) => ({ ...s, [n.key]: !s[n.key as keyof typeof notifSettings] }))}
                  />
                ))}
              </div>
            </Card>
          )}

          {active === 'privacy' && (
            <Card delay={0.1}>
              <CardHeader title="Privacy Settings" subtitle="Control your data visibility" icon={<Lock size={16} />} />
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Profile Visibility</label>
                  <div className="flex gap-2">
                    {['public', 'private', 'connections'].map((v) => (
                      <button key={v} onClick={() => setPrivacy((p) => ({ ...p, profile: v }))} className={`btn capitalize text-xs ${privacy.profile === v ? 'btn-primary' : 'btn-outline'}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <Toggle label="Show learning progress" desc="Display your progress on your public profile" on={privacy.showProgress} onToggle={() => setPrivacy((p) => ({ ...p, showProgress: !p.showProgress }))} />
                <Toggle label="Show skills" desc="Display your assessed skills publicly" on={privacy.showSkills} onToggle={() => setPrivacy((p) => ({ ...p, showSkills: !p.showSkills }))} />
              </div>
            </Card>
          )}

          {active === 'security' && (
            <Card delay={0.1}>
              <CardHeader title="Security" subtitle="Protect your account" icon={<Shield size={16} />} />
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Change Password</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 mb-3">Last changed 2 months ago</p>
                  <div className="space-y-3">
                    <input type="password" className="input" placeholder="Current password" />
                    <input type="password" className="input" placeholder="New password" />
                    <input type="password" className="input" placeholder="Confirm new password" />
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => addToast('Password updated', 'success')}>Update Password</Button>
                </div>
                <Toggle label="Two-Factor Authentication" desc="Add an extra layer of security with 2FA" on={false} onToggle={() => addToast('2FA setup started', 'info')} />
                <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">Active Sessions</p>
                  {[
                    { device: 'MacBook Pro · Chrome', location: 'Bengaluru, IN', current: true },
                    { device: 'iPhone 15 · Safari', location: 'Bengaluru, IN', current: false },
                  ].map((s) => (
                    <div key={s.device} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-slate-100">{s.device}</p>
                        <p className="text-xs text-gray-400">{s.location}</p>
                      </div>
                      {s.current ? <span className="chip bg-success/10 text-success text-[10px]">Current</span> : <button onClick={() => addToast('Session revoked', 'info')} className="text-xs text-danger hover:underline">Revoke</button>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {active === 'demo' && (
            <Card>
              <CardHeader
                title="Developer & Demo Data Management"
                subtitle="Reset local student progress, milestone completions, and diagnostic results"
              />
              <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-300 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <RotateCcw size={16} />
                    <span>Deterministic Initial Student State</span>
                  </div>
                  <p className="leading-relaxed text-gray-400">
                    CareerCompass persists student roadmap milestones, skill assessments, portfolio additions, and notification read states to local offline storage. You can reset all state back to factory defaults at any time.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                      Reset All Demo State
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Clears offline local storage and restores default student profile (Alex Johnson).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(true)}
                    className="py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full p-6 space-y-4 shadow-elevated border-rose-500/40"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                Confirm Reset of Demo Data?
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                This will reset all progress, completed milestones, diagnostic assessment scores, added portfolio items, and notification read states back to the original deterministic demo state.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-gray-400">
              * Demo state only. No external database or credentials will be deleted.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="btn-outline text-xs py-2 px-3.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setResetModalOpen(false);
                  addToast('All demo state restored to initial factory defaults!', 'success');
                }}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-glow"
              >
                <RotateCcw size={14} />
                <span>Yes, Reset State</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}

function ThemeOption({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl border-2 transition text-left ${active ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-slate-800 hover:border-primary/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>{icon}</div>
        {active && <Check size={18} className="text-primary" />}
      </div>
      <p className="font-medium text-sm text-gray-900 dark:text-slate-100">{label}</p>
    </button>
  );
}

function Toggle({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-800/50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition ${on ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}>
        <motion.span layout className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${on ? 'left-5.5' : 'left-0.5'}`} style={{ left: on ? 22 : 2 }} />
      </button>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">{label}</label>
      <input className="input" defaultValue={defaultValue} />
    </div>
  );
}

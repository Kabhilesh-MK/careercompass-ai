import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { useToast } from '@/context/ToastContext';
import { login } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { loginUser, startDemoSession } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setLoading(true);
    try {
      const res = await login(email, password);
      loginUser(res.access_token, res.refresh_token, res);
      addToast(`Welcome back, ${res.full_name || 'User'}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your career journey.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="email" name="email" required className="input pl-9" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type={showPwd ? 'text' : 'password'} name="password" required className="input pl-9 pr-9" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/40" defaultChecked />
          Remember me for 30 days
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-[#111827] px-3 text-xs text-gray-500 uppercase tracking-wider">
            Or Preview Platform
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            startDemoSession();
            addToast('Welcome to CareerCompass (Demo Mode)!', 'info');
            navigate('/dashboard');
          }}
          className="btn-outline w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2 border-primary/40 text-primary hover:bg-primary/10"
        >
          Explore Demo Mode (Alex Johnson)
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

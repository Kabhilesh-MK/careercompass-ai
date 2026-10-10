import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { useToast } from '@/context/ToastContext';
import { register } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const data = {
      full_name: `${fd.get('firstName')} ${fd.get('lastName')}`.trim(),
      email: ((fd.get('email') as string) || '').trim(),
      password: (fd.get('password') as string) || '',
    };
    setLoading(true);
    try {
      const res = await register(data);
      loginUser(res.access_token, res.refresh_token, res);
      addToast('Account created! Welcome to CareerCompass AI.', 'success');
      navigate('/onboarding');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }

  };

  return (
    <AuthLayout title="Create your account" subtitle="Start your personalized career journey today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">First name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input name="firstName" required className="input pl-9" placeholder="Alex" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Last name</label>
            <input name="lastName" required className="input" placeholder="Morgan" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="email" name="email" required className="input pl-9" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type={showPwd ? 'text' : 'password'} name="password" required className="input pl-9 pr-9" placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Must include uppercase, number, and special character.</p>
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
          <input type="checkbox" required className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary/40" />
          <span>I agree to the <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { useToast } from '@/context/ToastContext';
import { forgotPassword } from '@/services/authService';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    setLoading(true);
    try {
      await forgotPassword(email);
      addToast('Reset link sent to your email', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="email" name="email" required className="input pl-9" placeholder="you@example.com" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-primary transition mt-4">
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}

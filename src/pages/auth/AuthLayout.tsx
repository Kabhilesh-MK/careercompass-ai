import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-600 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Compass size={22} />
            </div>
            <span className="font-bold text-lg">CareerCompass AI</span>
          </Link>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold leading-tight mb-4"
            >
              Navigate your career with AI-powered precision.
            </motion.h2>
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Skill gap analysis, career predictions, and personalized learning roadmaps — all in one intelligent platform.
            </p>
            <div className="space-y-4">
              <Feature icon={<Sparkles size={18} />} text="AI-driven career match scoring" />
              <Feature icon={<Target size={18} />} text="Personalized skill gap analysis" />
              <Feature icon={<TrendingUp size={18} />} text="Adaptive learning roadmaps" />
            </div>
          </div>
          <p className="text-white/60 text-sm">© 2026 CareerCompass AI. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-glow">
              <Compass size={22} />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-slate-100">CareerCompass AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">{icon}</div>
      <span className="text-white/90 text-sm">{text}</span>
    </div>
  );
}

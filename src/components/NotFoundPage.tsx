import { AnimatePresence, motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-white shadow-glow mb-6">
            <Compass size={36} />
          </div>
          <h1 className="text-7xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Page not found</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            The page you are looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

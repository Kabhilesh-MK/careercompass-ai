import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const config = {
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  error: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-80">
      <AnimatePresence>
        {toasts.map((t) => {
          const c = config[t.type];
          const Icon = c.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="card p-4 flex items-start gap-3 shadow-elevated"
            >
              <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon size={16} />
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-200 flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

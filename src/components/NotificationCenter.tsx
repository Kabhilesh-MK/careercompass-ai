import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X, Sparkles, Target, FileText, Map, Award, Info, AlertTriangle } from 'lucide-react';
import { getNotifications, markNotificationsRead, deleteNotification } from '@/services/engagementService';

interface Notification {
  _id?: string;
  id?: string;
  type: string;
  title: string;
  message?: string;
  desc?: string;
  time?: string;
  created_at?: string;
  read: boolean;
  icon?: string;
  action_url?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Target, FileText, Map, Award, Bell, Info, AlertTriangle,
};

function NotifIcon({ type, icon }: { type: string; icon?: string }) {
  const colors: Record<string, string> = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-primary/10 text-primary',
    reminder: 'bg-secondary/10 text-secondary',
    career: 'bg-primary/10 text-primary',
    roadmap: 'bg-success/10 text-success',
    cert: 'bg-warning/10 text-warning',
    report: 'bg-secondary/10 text-secondary',
  };
  const Ic = (icon && ICON_MAP[icon]) || Bell;
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[type] || 'bg-gray-100 text-gray-500'}`}>
      <Ic size={16} />
    </div>
  );
}

function timeAgo(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

import { useAppStateContext } from '@/context/AppStateContext';

export default function NotificationCenter({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useAppStateContext();
  const items = state.notifications;

  useEffect(() => {
    const unread = items.filter(n => !n.read).length;
    onCountChange?.(unread);
  }, [items, onCountChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = items.filter(n => !n.read).length;

  const markAll = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const markOne = (n: any) => {
    const id = n._id || n.id || '';
    if (id) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId: id } });
    }
  };

  const remove = (n: any) => {
    const id = n._id || n.id || '';
    if (id) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId: id } });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] px-1 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-elevated z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-primary" />
                <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">Notifications</span>
                {unread > 0 && (
                  <span className="chip bg-primary/10 text-primary text-[10px] font-bold">{unread} new</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAll} title="Mark all read" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-primary transition">
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No notifications yet</div>
              ) : items.map((n: any) => {
                const id = n.id || n._id || '';
                const ts = n.timestamp || n.created_at || n.time;
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition group cursor-pointer ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                    onClick={() => markOne(n)}
                  >
                    <NotifIcon type={n.type} icon={n.icon} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm truncate ${n.read ? 'text-gray-600 dark:text-slate-400' : 'font-semibold text-gray-900 dark:text-slate-100'}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-2">
                        {n.message || n.desc}
                      </p>
                      <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-1">{timeAgo(ts) || ts}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-danger/10 text-gray-300 hover:text-danger transition shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 text-center">
              <button className="text-xs text-primary hover:underline font-medium">View all notifications</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

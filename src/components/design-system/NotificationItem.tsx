import React from 'react';
import { Bell, Map, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { NotificationItemData } from '@/types/careerCompass';

interface NotificationItemProps {
  notification: NotificationItemData;
  onRead?: (id: string) => void;
  onClick?: (actionUrl?: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onClick,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'assessment':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'roadmap':
        return <Map size={16} className="text-primary" />;
      case 'learning':
        return <BookOpen size={16} className="text-accent" />;
      case 'skill':
        return <Sparkles size={16} className="text-secondary" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <div
      onClick={() => {
        if (onRead && !notification.read) onRead(notification.id);
        if (onClick) onClick(notification.actionUrl);
      }}
      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
        notification.read
          ? 'bg-transparent border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-gray-500 dark:text-slate-400'
          : 'bg-primary/5 dark:bg-primary/10 border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/15 text-gray-900 dark:text-slate-100'
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold truncate">
            {notification.title}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">
            {notification.timestamp}
          </span>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
          {notification.message}
        </p>
      </div>

      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </div>
  );
};

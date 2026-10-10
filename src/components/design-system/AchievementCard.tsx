import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { Achievement } from '@/types/careerCompass';

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className = '',
}) => {
  const getBadgeIcon = () => {
    switch (achievement.badgeIcon) {
      case 'Flame':
        return <Flame size={20} className="text-amber-500" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'Award':
        return <Award size={20} className="text-secondary" />;
      case 'Sparkles':
        return <Sparkles size={20} className="text-accent" />;
      default:
        return <Trophy size={20} className="text-primary" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-elevated transition-all ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700/60 flex items-center justify-center shrink-0">
        {getBadgeIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
            {achievement.title}
          </h3>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
            +{achievement.points} XP
          </span>
        </div>

        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">
          {achievement.reason}
        </p>

        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
          <span className="capitalize">{achievement.category} Milestone</span>
          <span>Earned {achievement.date}</span>
        </div>
      </div>
    </motion.div>
  );
};

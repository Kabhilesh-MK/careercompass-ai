import React from 'react';

interface SkillRingProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  className?: string;
}

export const SkillRing: React.FC<SkillRingProps> = ({
  value,
  size = 110,
  strokeWidth = 9,
  label,
  sublabel,
  color = '#6366F1',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800/80"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
          <span className="text-xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight leading-none">
            {clampedValue}%
          </span>
          {sublabel && (
            <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-2 text-center">
          {label}
        </span>
      )}
    </div>
  );
};

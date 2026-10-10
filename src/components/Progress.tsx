export function ProgressBar({
  value,
  max = 100,
  className = '',
  color = 'primary',
  height = 'h-2',
}: {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  height?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };
  return (
    <div className={`w-full ${height} bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <div
        className={`${colors[color]} ${height} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressCircle({
  value,
  size = 120,
  stroke = 10,
  color = '#6D4CFF',
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">{label ?? `${value}%`}</span>
        {sublabel && <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

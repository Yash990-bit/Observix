import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'terra' | 'forest' | 'rose' | 'amber' | 'sand';
}

const colorConfig = {
  terra: {
    glow: 'rgba(194, 98, 42, 0.12)',
    iconBg: 'rgba(194, 98, 42, 0.15)',
    iconBorder: 'rgba(194, 98, 42, 0.35)',
    iconColor: '#e8a87c',
    dotColor: '#c2622a',
  },
  forest: {
    glow: 'rgba(61, 107, 79, 0.12)',
    iconBg: 'rgba(61, 107, 79, 0.15)',
    iconBorder: 'rgba(61, 107, 79, 0.35)',
    iconColor: '#8abf9e',
    dotColor: '#3d6b4f',
  },
  rose: {
    glow: 'rgba(192, 57, 43, 0.12)',
    iconBg: 'rgba(192, 57, 43, 0.15)',
    iconBorder: 'rgba(192, 57, 43, 0.35)',
    iconColor: '#e87461',
    dotColor: '#c0392b',
  },
  amber: {
    glow: 'rgba(184, 134, 11, 0.12)',
    iconBg: 'rgba(184, 134, 11, 0.15)',
    iconBorder: 'rgba(184, 134, 11, 0.35)',
    iconColor: '#d4b866',
    dotColor: '#b8860b',
  },
  sand: {
    glow: 'rgba(212, 146, 90, 0.12)',
    iconBg: 'rgba(212, 146, 90, 0.15)',
    iconBorder: 'rgba(212, 146, 90, 0.35)',
    iconColor: '#d4925a',
    dotColor: '#b87840',
  },
};

export function MetricCard({ title, value, unit, change, isPositive = true, icon: Icon, color = 'terra' }: MetricCardProps) {
  const cfg = colorConfig[color];

  return (
    <div
      className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden"
      style={{ minHeight: '120px' }}
    >
      {/* Corner glow accent */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-bl-full pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${cfg.glow}, transparent 70%)` }}
      />

      <div className="flex items-center justify-between mb-4">
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: '#6b5040' }}
        >
          {title}
        </span>
        <div
          className="p-2 rounded-xl"
          style={{ background: cfg.iconBg, border: `1px solid ${cfg.iconBorder}` }}
        >
          <Icon className="h-4 w-4" style={{ color: cfg.iconColor }} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight" style={{ color: '#f0e0d0' }}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium" style={{ color: '#7a6050' }}>{unit}</span>}
      </div>

      {change && (
        <div className="mt-2 flex items-center gap-1 text-[11px]">
          <span
            className="font-semibold"
            style={{ color: isPositive ? '#8abf9e' : '#e87461' }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span style={{ color: '#4a3828' }}>vs last 5m</span>
        </div>
      )}
    </div>
  );
}

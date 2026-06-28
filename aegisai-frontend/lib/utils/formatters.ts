export function formatTimestamp(ts: number | string): string {
  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return String(ts);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function formatTimeAgo(ts: number | string): string {
  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return String(ts);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getSeverityColor(severity: string): string {
  switch ((severity || '').toLowerCase()) {
    case 'critical':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'high':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

export function getLogLevelColor(level: string): string {
  switch ((level || '').toLowerCase()) {
    case 'error':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    case 'warn':
    case 'warning':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'info':
    default:
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  }
}

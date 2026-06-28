import Link from 'next/link';
import { IncidentReport } from '../../lib/api/client';
import { formatTimestamp } from '../../lib/utils/formatters';
import { AlertTriangle, ChevronRight, Server, Clock, Flame } from 'lucide-react';

interface IncidentListProps {
  incidents: IncidentReport[];
}

const severityConfig: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: 'rgba(192, 57, 43, 0.15)', color: '#e87461', border: 'rgba(192, 57, 43, 0.4)' },
  high:     { bg: 'rgba(194, 98, 42, 0.15)',  color: '#e8a87c', border: 'rgba(194, 98, 42, 0.4)' },
  medium:   { bg: 'rgba(184, 134, 11, 0.15)', color: '#d4b866', border: 'rgba(184, 134, 11, 0.4)' },
  low:      { bg: 'rgba(61, 107, 79, 0.15)',  color: '#8abf9e', border: 'rgba(61, 107, 79, 0.4)' },
};

export function IncidentList({ incidents }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{ background: 'rgba(30, 22, 14, 0.6)', border: '1px solid rgba(194, 98, 42, 0.15)' }}
      >
        <AlertTriangle className="h-10 w-10 mx-auto mb-3" style={{ color: '#4a3828' }} />
        <p className="font-semibold" style={{ color: '#8a7060' }}>No AI-classified incidents recorded yet.</p>
        <p className="text-xs mt-1" style={{ color: '#4a3828' }}>Telemetry streams are operating within normal operational variance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const sev = severityConfig[incident.severity?.toLowerCase()] || severityConfig.medium;

        return (
          <Link
            key={incident.incident_id}
            href={`/incidents/${incident.incident_id}`}
            className="glass-panel glass-panel-hover rounded-2xl p-5 block group"
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
                >
                  {incident.severity}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#7a6050' }}>
                  <Server className="h-3.5 w-3.5" style={{ color: '#c2622a' }} />
                  <span>{incident.service}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#4a3828' }}>
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTimestamp(incident.timestamp)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base transition-colors" style={{ color: '#f0e0d0' }}>
                  {incident.title}
                </h4>
                <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: '#6b5040' }}>
                  {incident.summary}
                </p>
              </div>
              <div
                className="p-2 rounded-xl shrink-0 transition-all"
                style={{ background: 'rgba(194, 98, 42, 0.1)', border: '1px solid rgba(194, 98, 42, 0.2)' }}
              >
                <ChevronRight className="h-5 w-5" style={{ color: '#c2622a' }} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

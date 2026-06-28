import { IncidentReport } from '../../lib/api/client';
import { formatTimeAgo } from '../../lib/utils/formatters';
import { Shield, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import Link from 'next/link';

interface AiInsightsPanelProps {
  incidents: IncidentReport[];
}

const severityConfig: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: 'rgba(192, 57, 43, 0.15)', color: '#e87461', border: 'rgba(192, 57, 43, 0.4)' },
  high:     { bg: 'rgba(194, 98, 42, 0.15)',  color: '#e8a87c', border: 'rgba(194, 98, 42, 0.4)' },
  medium:   { bg: 'rgba(184, 134, 11, 0.15)', color: '#d4b866', border: 'rgba(184, 134, 11, 0.4)' },
  low:      { bg: 'rgba(61, 107, 79, 0.15)',  color: '#8abf9e', border: 'rgba(61, 107, 79, 0.4)' },
};

export function AiInsightsPanel({ incidents }: AiInsightsPanelProps) {
  const latestIncident = incidents.length > 0 ? incidents[0] : null;

  if (!latestIncident) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{ background: 'rgba(61, 107, 79, 0.08)', border: '1px solid rgba(61, 107, 79, 0.25)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl"
            style={{ background: 'rgba(61, 107, 79, 0.15)', border: '1px solid rgba(61, 107, 79, 0.3)' }}
          >
            <CheckCircle2 className="h-6 w-6" style={{ color: '#8abf9e' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: '#c0d4c8' }}>System Operating Normally</h3>
            <p className="text-xs mt-0.5" style={{ color: '#5a7a65' }}>No active AI-classified incidents detected in recent telemetry stream.</p>
          </div>
        </div>
      </div>
    );
  }

  const sev = severityConfig[latestIncident.severity?.toLowerCase()] || severityConfig.medium;

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 22, 14, 0.9) 0%, rgba(40, 28, 18, 0.85) 100%)',
        border: '1px solid rgba(194, 98, 42, 0.35)',
        boxShadow: '0 8px 32px rgba(194, 98, 42, 0.1)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(194, 98, 42, 0.06)' }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #c2622a, #7a3d1a)', boxShadow: '0 4px 12px rgba(194, 98, 42, 0.3)' }}
          >
            <Shield className="h-5 w-5 text-orange-100" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#c2622a' }}>
              Latest Autonomous AI Incident Insight
            </span>
            <p className="text-xs" style={{ color: '#6b5040' }}>{formatTimeAgo(latestIncident.timestamp)}</p>
          </div>
        </div>
        <span
          className="px-3 py-1 rounded-lg text-xs font-bold uppercase"
          style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
        >
          {latestIncident.severity} SEVERITY
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold" style={{ color: '#f0e0d0' }}>{latestIncident.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: '#8a7060' }}>{latestIncident.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div
            className="p-3.5 rounded-xl space-y-1"
            style={{ background: 'rgba(192, 57, 43, 0.08)', border: '1px solid rgba(192, 57, 43, 0.2)' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#e87461' }}>Primary Root Cause</span>
            <p className="text-xs font-mono truncate" style={{ color: '#e8c0b0' }}>
              Service: {latestIncident.primary_root_cause_service}
            </p>
          </div>
          <div
            className="p-3.5 rounded-xl space-y-1"
            style={{ background: 'rgba(61, 107, 79, 0.08)', border: '1px solid rgba(61, 107, 79, 0.2)' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#8abf9e' }}>Suggested Action</span>
            <p className="text-xs truncate" style={{ color: '#c0d4c8' }}>{latestIncident.remediation_immediate}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 flex justify-end" style={{ borderTop: '1px solid rgba(194, 98, 42, 0.2)' }}>
        <Link
          href={`/incidents/${latestIncident.incident_id}`}
          className="flex items-center gap-2 text-xs font-semibold transition-all hover:gap-3"
          style={{ color: '#c2622a' }}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>View Full Postmortem & Cascading Timeline</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

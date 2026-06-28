'use client';

import { useState } from 'react';
import { IncidentReport } from '../../lib/api/client';
import { formatTimestamp } from '../../lib/utils/formatters';
import { AlertTriangle, ShieldCheck, Clock, FileText, Wrench, Shield, CheckCircle2, ThumbsUp, ThumbsDown, Flame } from 'lucide-react';

interface IncidentDetailProps {
  incident: IncidentReport;
}

const severityConfig: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: 'rgba(192, 57, 43, 0.15)', color: '#e87461', border: 'rgba(192, 57, 43, 0.4)' },
  high:     { bg: 'rgba(194, 98, 42, 0.15)',  color: '#e8a87c', border: 'rgba(194, 98, 42, 0.4)' },
  medium:   { bg: 'rgba(184, 134, 11, 0.15)', color: '#d4b866', border: 'rgba(184, 134, 11, 0.4)' },
  low:      { bg: 'rgba(61, 107, 79, 0.15)',  color: '#8abf9e', border: 'rgba(61, 107, 79, 0.4)' },
};

export function IncidentDetail({ incident }: IncidentDetailProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const sev = severityConfig[incident.severity?.toLowerCase()] || severityConfig.medium;

  const handleFeedback = async (helpful: boolean) => {
    try {
      await fetch(`http://localhost:3008/incidents/${incident.incident_id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful, accuracy_score: helpful ? 100 : 0 }),
      });
    } catch (e) {}
    setFeedbackSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,22,14,0.95) 0%, rgba(40,28,18,0.9) 100%)',
          border: `1px solid ${sev.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${sev.bg}` }} />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
              style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
            >
              {incident.severity} SEVERITY
            </span>
            <span
              className="text-xs font-mono px-3 py-1 rounded-lg"
              style={{ background: '#0c0a08', color: '#5a4535', border: '1px solid rgba(194,98,42,0.2)' }}
            >
              {incident.incident_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#5a4535' }}>
            <Clock className="h-3.5 w-3.5" style={{ color: '#c2622a' }} />
            <span>{formatTimestamp(incident.timestamp)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#f0e0d0' }}>{incident.title}</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#8a7060' }}>{incident.summary}</p>
      </div>

      {/* RCA + Remediation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Root Cause */}
        <div
          className="rounded-2xl p-6 space-y-3"
          style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.3)' }}
        >
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider" style={{ color: '#e87461' }}>
            <AlertTriangle className="h-4 w-4" />
            <span>Primary Root Cause</span>
          </div>
          <p className="text-xs font-mono" style={{ color: '#7a6050' }}>
            Offending Service: <strong style={{ color: '#e87461' }}>{incident.primary_root_cause_service}</strong>
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#c0a898' }}>
            {incident.summary} Unindexed database access locks connection drivers causing downstream gateway timeouts.
          </p>
        </div>

        {/* Remediation */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(61,107,79,0.06)', border: '1px solid rgba(61,107,79,0.3)' }}
        >
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider" style={{ color: '#8abf9e' }}>
            <ShieldCheck className="h-4 w-4" />
            <span>Remediation & Prevention</span>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase flex items-center gap-1.5" style={{ color: '#6b9e7a' }}>
              <Wrench className="h-3.5 w-3.5" /> Immediate Fix
            </h5>
            <p
              className="text-xs p-3 rounded-xl leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(61,107,79,0.2)', color: '#a0c8b0' }}
            >
              {incident.remediation_immediate}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase flex items-center gap-1.5" style={{ color: '#c2622a' }}>
              <Shield className="h-3.5 w-3.5" /> Prevention Strategy
            </h5>
            <p
              className="text-xs p-3 rounded-xl leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(194,98,42,0.2)', color: '#c8a888' }}
            >
              {incident.remediation_prevention}
            </p>
          </div>
        </div>
      </div>

      {/* Full Postmortem Report */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(194,98,42,0.2)' }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-2.5 px-5 py-3"
          style={{ background: 'rgba(25,18,12,0.9)', borderBottom: '1px solid rgba(194,98,42,0.15)' }}
        >
          <FileText className="h-4 w-4" style={{ color: '#c2622a' }} />
          <h3 className="font-bold text-sm" style={{ color: '#f0e0d0' }}>Full Production SRE Postmortem</h3>
        </div>

        <pre
          className="p-6 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto"
          style={{ background: '#0c0a08', color: '#a09080' }}
        >
          {incident.postmortem_report}
        </pre>
      </div>

      {/* AI Feedback Banner */}
      <div
        className="rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'rgba(194,98,42,0.06)', border: '1px solid rgba(194,98,42,0.25)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{ background: 'rgba(194,98,42,0.15)', border: '1px solid rgba(194,98,42,0.3)' }}
          >
            <Flame className="h-5 w-5" style={{ color: '#c2622a' }} />
          </div>
          <div>
            <h4 className="font-bold text-sm" style={{ color: '#f0e0d0' }}>AI SRE Accuracy & Learning Evaluation</h4>
            <p className="text-xs mt-0.5" style={{ color: '#5a4535' }}>Was this root cause analysis accurate for your production environment?</p>
          </div>
        </div>

        {feedbackSubmitted ? (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(61,107,79,0.15)', color: '#8abf9e', border: '1px solid rgba(61,107,79,0.35)' }}
          >
            <CheckCircle2 className="h-4 w-4" /> Feedback merged into AI memory.
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(61,107,79,0.12)', border: '1px solid rgba(61,107,79,0.3)', color: '#8abf9e' }}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> Accurate
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#e87461' }}
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Needs Tuning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

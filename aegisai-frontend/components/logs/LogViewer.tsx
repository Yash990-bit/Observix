'use client';

import { useState } from 'react';
import { LogItem, explainLog } from '../../lib/api/client';
import { formatTimestamp, getLogLevelColor } from '../../lib/utils/formatters';
import { Flame, X, Terminal, Loader2, Shield } from 'lucide-react';

interface LogViewerProps {
  logs: LogItem[];
}

const levelStyle: Record<string, { bg: string; color: string; border: string }> = {
  error:   { bg: 'rgba(192,57,43,0.15)',  color: '#e87461', border: 'rgba(192,57,43,0.4)' },
  warn:    { bg: 'rgba(184,134,11,0.15)', color: '#d4b866', border: 'rgba(184,134,11,0.4)' },
  info:    { bg: 'rgba(61,107,79,0.12)',  color: '#8abf9e', border: 'rgba(61,107,79,0.35)' },
  debug:   { bg: 'rgba(90,69,53,0.12)',   color: '#7a6050', border: 'rgba(90,69,53,0.3)' },
};

export function LogViewer({ logs }: LogViewerProps) {
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleExplain = async (log: LogItem) => {
    setSelectedLog(log);
    setIsLoadingAi(true);
    setAiExplanation(null);
    try {
      const res = await explainLog(log);
      setAiExplanation(res.analysis);
    } catch (err) {
      console.error('Failed to generate log explanation:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="relative">
      {/* Terminal Panel */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(194,98,42,0.2)' }}
      >
        {/* Terminal Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'rgba(18,13,9,0.95)', borderBottom: '1px solid rgba(194,98,42,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#c0392b' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#b8860b' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#3d6b4f' }} />
            </div>
            <Terminal className="h-3.5 w-3.5" style={{ color: '#c2622a' }} />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: '#6b5040' }}>
              Live Log Feed — {logs.length} events
            </span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#3d6b4f' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#5a8a68' }} />
          </span>
        </div>

        {/* Log Rows */}
        <div
          className="divide-y max-h-[600px] overflow-y-auto font-mono text-xs"
          style={{ background: '#0c0a08', borderColor: 'rgba(194,98,42,0.08)' }}
        >
          {logs.length === 0 ? (
            <div className="p-12 text-center font-sans text-sm" style={{ color: '#4a3828' }}>
              No telemetry events. Waiting for streaming data…
            </div>
          ) : (
            logs.map((log) => {
              const ls = levelStyle[log.level?.toLowerCase()] || levelStyle.debug;
              return (
                <div
                  key={log.id}
                  className="px-4 py-2.5 flex items-start justify-between gap-3 group transition-colors"
                  style={{ borderBottom: '1px solid rgba(194,98,42,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(194,98,42,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    <span className="text-[10px] shrink-0 select-none tabular-nums" style={{ color: '#3a2c20' }}>
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0"
                      style={{ background: ls.bg, color: ls.color, border: `1px solid ${ls.border}` }}
                    >
                      {log.level}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium shrink-0"
                      style={{ background: 'rgba(194,98,42,0.08)', color: '#7a5535', border: '1px solid rgba(194,98,42,0.2)' }}
                    >
                      {log.service}
                    </span>
                    <span className="break-all leading-relaxed" style={{ color: '#b0a090' }}>
                      {log.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {log.trace_id && (
                      <span
                        className="hidden md:inline-block text-[9px] px-1.5 py-0.5 rounded truncate max-w-[90px]"
                        style={{ background: 'rgba(194,98,42,0.06)', color: '#4a3828', border: '1px solid rgba(194,98,42,0.12)' }}
                      >
                        {log.trace_id}
                      </span>
                    )}
                    <button
                      onClick={() => handleExplain(log)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-sans font-medium transition-all"
                      style={{
                        background: 'rgba(194,98,42,0.15)',
                        border: '1px solid rgba(194,98,42,0.35)',
                        color: '#e8a87c',
                      }}
                    >
                      <Flame className="h-3 w-3" />
                      <span>AI Explain</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Explain Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(8,6,4,0.88)', backdropFilter: 'blur(16px)' }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(22,16,10,0.98)',
              border: '1px solid rgba(194,98,42,0.4)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Header */}
            <div
              className="p-5 flex items-center justify-between"
              style={{ background: 'rgba(30,20,12,0.8)', borderBottom: '1px solid rgba(194,98,42,0.2)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: 'rgba(194,98,42,0.15)', border: '1px solid rgba(194,98,42,0.3)' }}
                >
                  <Shield className="h-5 w-5" style={{ color: '#c2622a' }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: '#f0e0d0' }}>AI SRE Root Cause Reasoning</h3>
                  <p className="text-xs" style={{ color: '#5a4535' }}>
                    Analyzing log from <span className="font-mono" style={{ color: '#e8a87c' }}>{selectedLog.service}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#4a3828' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c2622a')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4a3828')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Target Log */}
              <div
                className="p-3.5 rounded-xl font-mono text-xs space-y-1"
                style={{ background: '#080604', border: '1px solid rgba(194,98,42,0.2)' }}
              >
                <div className="flex items-center gap-2" style={{ color: '#5a4535' }}>
                  <span>[{formatTimestamp(selectedLog.timestamp)}]</span>
                  <span className="font-bold uppercase" style={{ color: '#e8a87c' }}>{selectedLog.level}</span>
                </div>
                <p className="font-semibold" style={{ color: '#d0c0b0' }}>{selectedLog.message}</p>
              </div>

              {isLoadingAi ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#c2622a' }} />
                  <p className="text-sm font-medium" style={{ color: '#c0b0a0' }}>
                    Evaluating distributed failure cascade across services…
                  </p>
                  <p className="text-xs" style={{ color: '#5a4535' }}>
                    AegisAI SRE Brain generating RCA report
                  </p>
                </div>
              ) : aiExplanation ? (
                <div className="space-y-5 font-sans">
                  {/* Title + Severity */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg" style={{ color: '#f0e0d0' }}>{aiExplanation.title}</h4>
                      <p className="text-xs mt-1" style={{ color: '#7a6050' }}>{aiExplanation.summary}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase shrink-0"
                      style={
                        aiExplanation.severity === 'critical'
                          ? { background: 'rgba(192,57,43,0.15)', color: '#e87461', border: '1px solid rgba(192,57,43,0.4)' }
                          : { background: 'rgba(184,134,11,0.15)', color: '#d4b866', border: '1px solid rgba(184,134,11,0.4)' }
                      }
                    >
                      {aiExplanation.severity} SEVERITY
                    </span>
                  </div>

                  {/* Root Cause */}
                  <div
                    className="p-4 rounded-xl space-y-2"
                    style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)' }}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#e87461' }}>
                      Offending Service: {aiExplanation.root_cause.primary_service}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#c0a898' }}>
                      {aiExplanation.root_cause.root_cause_explanation}
                    </p>
                  </div>

                  {/* Remediation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="p-4 rounded-xl space-y-1.5"
                      style={{ background: 'rgba(61,107,79,0.08)', border: '1px solid rgba(61,107,79,0.25)' }}
                    >
                      <h5 className="text-xs font-bold uppercase" style={{ color: '#8abf9e' }}>Immediate Fix</h5>
                      <p className="text-xs leading-relaxed" style={{ color: '#a0c0a8' }}>{aiExplanation.remediation.immediate_fix}</p>
                    </div>
                    <div
                      className="p-4 rounded-xl space-y-1.5"
                      style={{ background: 'rgba(194,98,42,0.08)', border: '1px solid rgba(194,98,42,0.25)' }}
                    >
                      <h5 className="text-xs font-bold uppercase" style={{ color: '#e8a87c' }}>Prevention Strategy</h5>
                      <p className="text-xs leading-relaxed" style={{ color: '#b8987a' }}>{aiExplanation.remediation.prevention_strategy}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

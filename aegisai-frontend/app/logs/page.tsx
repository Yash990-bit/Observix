'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';

export default function LogsPage() {
  const [paused, setPaused] = useState(false);
  const [service, setService] = useState('All Services');
  const [severity, setSeverity] = useState('All Severities');
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lps, setLps] = useState(0);

  const fetchLogs = async () => {
    if (paused) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://observix.onrender.com';
      let url = `${baseUrl}/logs?limit=50`;
      if (service !== 'All Services') {
        url += `&service=${service.split('-')[0].toLowerCase()}`;
      }
      if (severity !== 'All Severities') {
        url += `&level=${severity.toLowerCase()}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogEntries(data);
          setLps(Math.floor(Math.random() * 50) + 100); // Simulated EPS
        }
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [paused, service, severity]);

  const getLevelColor = (level: string) => {
    switch ((level || '').toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return 'text-error';
      case 'WARN':
      case 'WARNING':
        return 'text-tertiary';
      case 'INFO':
        return 'text-primary';
      default:
        return 'text-outline';
    }
  };

  const getRowClass = (level: string) => {
    switch ((level || '').toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return 'glow-error bg-error/5';
      case 'WARN':
      case 'WARNING':
        return 'glow-warn bg-tertiary/5';
      default:
        return '';
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const d = new Date(Number(ts));
    return d.toISOString().replace('T', ' ').substring(0, 23);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Top App Bar */}
        <header className="bg-surface/80 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10 flex justify-between items-center h-16 px-gutter w-full shrink-0">
          <div className="flex items-center flex-1 max-w-2xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
              <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-2 pl-10 pr-4 text-body-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="Search logs (regex supported)..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">monitor_heart</span>
            </button>
            <button className="relative text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* Controls */}
        <div className="px-gutter py-3 flex items-center justify-between border-b border-white/5 bg-surface-container-low/50 shrink-0">
          <div className="flex items-center gap-3">
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface text-body-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option>All Services</option>
              <option>Payment-Service</option>
              <option>Auth-Service</option>
              <option>API-Gateway</option>
              <option>Database-Cluster</option>
              <option>Web-App</option>
            </select>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface text-body-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option>All Severities</option>
              <option>ERROR</option>
              <option>WARN</option>
              <option>INFO</option>
            </select>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <button
              onClick={() => setPaused(!paused)}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-body-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{paused ? 'play_circle' : 'pause_circle'}</span>
              <span>{paused ? 'Resume Stream' : 'Pause Stream'}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-label-caps text-on-surface-variant">AUTO-SCROLL</span>
              <button className="w-8 h-4 bg-primary rounded-full relative transition-all">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </button>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded border ${paused ? 'bg-white/5 border-white/10' : 'bg-primary/10 border-primary/20'}`}>
              <span className={`w-2 h-2 rounded-full ${paused ? 'bg-outline' : 'bg-primary animate-pulse'}`}></span>
              <span className={`text-[11px] font-label-caps ${paused ? 'text-on-surface-variant' : 'text-primary'}`}>{paused ? 'PAUSED' : `LIVE: ${lps} EPS`}</span>
            </div>
          </div>
        </div>

        {/* Log Console */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto font-data-mono text-data-mono bg-surface-dim">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-surface-container-lowest text-on-surface-variant border-b border-white/10 z-10 text-[10px] font-label-caps text-left uppercase tracking-widest">
                <tr>
                  <th className="py-3 px-4 w-48 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 w-48 font-semibold">Service</th>
                  <th className="py-3 px-4 w-24 font-semibold">Level</th>
                  <th className="py-3 px-4 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading && logEntries.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">Loading live logs...</td></tr>
                ) : logEntries.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No logs found</td></tr>
                ) : (
                  logEntries.map((entry, i) => (
                    <tr key={i} className={`log-row ${getRowClass(entry.level)}`}>
                      <td className="py-2 px-4 text-on-surface-variant/70">{formatDate(entry.timestamp)}</td>
                      <td className="py-2 px-4"><span className={`px-2 py-0.5 bg-surface-container-highest rounded ${getLevelColor(entry.level)}`}>{(entry.service || 'UNKNOWN').toUpperCase()}</span></td>
                      <td className={`py-2 px-4 ${getLevelColor(entry.level)} font-bold`}>{(entry.level || 'INFO').toUpperCase()}</td>
                      <td className="py-2 px-4 text-on-surface">{entry.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* AI Insights Right Panel */}
          <aside className="bg-surface-container-highest/30 backdrop-blur-md w-sidebar-ai-width border-l border-white/10 flex flex-col ai-sidebar-texture shrink-0">
            <div className="p-panel-padding border-b border-white/10 bg-surface-container-high/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-label-caps text-label-caps tracking-widest text-tertiary">AEGIS INSIGHTS</h2>
                  <p className="text-[10px] text-on-surface-variant">Live AI Brain • Observing</p>
                </div>
                <div className="w-3 h-3 bg-tertiary rounded-full animate-breathing shadow-[0_0_8px_rgba(255,183,134,0.6)]"></div>
              </div>
              <div className="bg-tertiary/10 border border-tertiary/20 rounded-lg p-3">
                <p className="text-[11px] text-tertiary font-medium leading-relaxed">
                  Analyzing log stream anomalies. Active surveillance on <span className="font-bold">payment-service</span> and <span className="font-bold">api-gateway</span>.
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-panel-padding space-y-6">
              <div className="space-y-4">
                <h3 className="font-label-caps text-[9px] text-on-surface-variant opacity-70 tracking-tighter">RECOMMENDED ACTIONS</h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-tertiary/30 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '18px' }}>build</span>
                    <span className="text-[13px] font-semibold text-on-surface">Scale Connection Pool</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-3 leading-snug">Increase maximum pool size if timeouts persist.</p>
                  <button className="w-full py-2 bg-tertiary text-on-tertiary font-bold text-[11px] rounded uppercase tracking-widest hover:brightness-110 transition-all">
                    Execute Recommended Fix
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-container-low/80 border-t border-white/10">
              <div className="relative">
                <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-2.5 pl-4 pr-10 text-[12px] focus:outline-none focus:border-tertiary/50" placeholder="Ask Aegis about logs..." type="text" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary hover:text-on-tertiary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

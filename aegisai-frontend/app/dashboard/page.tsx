'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';

const heatmapData = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  opacity: Math.random() * 0.8 + 0.1,
  color: Math.random() > 0.9 ? 'bg-error' : Math.random() > 0.7 ? 'bg-primary' : 'bg-white/20',
}));

export default function DashboardPage() {
  const [lps, setLps] = useState('12.4k/s');
  const [sysHealth, setSysHealth] = useState(99.2);
  const [errorRate, setErrorRate] = useState(0.02);
  const [latency, setLatency] = useState(42);
  const [activeView, setActiveView] = useState<'LIVE' | '24H'>('LIVE');
  const [waveOffset, setWaveOffset] = useState(0);
  const [aiPanel, setAiPanel] = useState('Incident Detect');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState('');

  // Fetch real incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://observix.onrender.com';
        const res = await fetch(`${baseUrl}/incidents`);
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        }
      } catch (e) {
        console.error('Failed to fetch incidents', e);
      }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live Metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // LPS
      const lpsVal = (12.4 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      setLps(`${lpsVal}k/s`);
      
      // Health
      setSysHealth(prev => {
        const val = prev + (Math.random() * 0.4 - 0.2);
        return Math.min(Math.max(val, 98.5), 99.9);
      });
      
      // Error Rate
      setErrorRate(prev => {
        const val = prev + (Math.random() * 0.01 - 0.005);
        return Math.min(Math.max(val, 0.01), 0.05);
      });
      
      // Latency
      setLatency(prev => {
        const val = prev + (Math.floor(Math.random() * 5) - 2);
        return Math.min(Math.max(val, 38), 50);
      });

      // Wave Offset for graph animation
      setWaveOffset(prev => (prev + 10) % 200);
      
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LEFT NAV */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">

        {/* Top App Bar */}
        <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
              <input
                className="w-full bg-surface-container-lowest border-none ring-1 ring-white/10 focus:ring-primary/50 focus:outline-none text-body-sm py-2 pl-10 pr-4 rounded-lg placeholder:text-on-surface-variant/50"
                placeholder="Query cluster logs or metrics..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">monitor_heart</span>
            </button>
            <button className="relative text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">notifications</span>
              {incidents.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              )}
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-container-margin space-y-6">

          {/* KPI Header */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

            {/* Logs/s */}
            <div className="glass-panel p-4 rounded-xl flex flex-col">
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Logs per Second</span>
              <div className="flex items-end justify-between mt-1">
                <span className="font-data-mono text-xl text-primary transition-all duration-500">{lps}</span>
                <span className="text-primary text-[10px] font-bold">+2.4%</span>
              </div>
              <div className="h-8 mt-2 w-full bg-primary/5 rounded relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-4 bg-primary/20 blur-sm"></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 32">
                  <path className="text-primary" d="M0 25 Q20 15 40 28 T80 18 T120 25 T160 12 T200 22" fill="none" stroke="#adc6ff" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Incidents */}
            <div className="glass-panel p-4 rounded-xl flex flex-col border-l-4 border-l-error">
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Active Incidents</span>
              <div className="flex items-end justify-between mt-1">
                <span className="font-data-mono text-xl text-error">{incidents.length}</span>
                {incidents.length > 0 && <span className="material-symbols-outlined text-error animate-pulse" style={{ fontSize: '18px' }}>warning</span>}
              </div>
              <div className="flex gap-1 mt-3">
                <div className="h-1 flex-1 bg-error rounded-full"></div>
                <div className="h-1 flex-1 bg-error rounded-full"></div>
                <div className="h-1 flex-1 bg-error rounded-full"></div>
                <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
              </div>
            </div>

            {/* System Health */}
            <div className="glass-panel p-4 rounded-xl flex flex-col">
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">System Health</span>
              <div className="flex items-end justify-between mt-1">
                <span className="font-data-mono text-xl text-secondary transition-all duration-500">{incidents.length > 0 ? '82.4%' : `${sysHealth.toFixed(1)}%`}</span>
                <span className="text-on-surface-variant text-[10px]">{incidents.length > 0 ? 'Degraded' : 'Optimal'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${incidents.length > 0 ? 'bg-error' : 'bg-secondary'}`} style={{ width: incidents.length > 0 ? '82.4%' : `${sysHealth}%` }}></div>
                </div>
              </div>
            </div>

            {/* Error Rate */}
            <div className="glass-panel p-4 rounded-xl flex flex-col">
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Error Rate</span>
              <div className="flex items-end justify-between mt-1">
                <span className="font-data-mono text-xl text-on-surface transition-all duration-500">{incidents.length > 0 ? '1.43%' : `${errorRate.toFixed(2)}%`}</span>
                <span className="text-tertiary text-[10px]">{incidents.length > 0 ? 'Spiking' : 'Stable'}</span>
              </div>
              <div className="h-8 mt-2 w-full flex items-end gap-0.5">
                {[20, 25, 15, 40, 10, incidents.length > 0 ? 80 : 22].map((h, i) => (
                  <div key={i} className="w-full bg-white/10 rounded-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            {/* AI Alert */}
            <div className="glass-panel p-4 rounded-xl flex flex-col ai-glow">
              <span className="text-tertiary font-label-caps text-label-caps uppercase flex items-center gap-1">
                AI Alert <span className="w-1.5 h-1.5 bg-tertiary rounded-full breathing-status inline-block"></span>
              </span>
              <div className="flex items-end justify-between mt-1">
                <span className="font-data-mono text-xl text-tertiary">{incidents.length > 0 ? '1' : '0'}</span>
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>psychology</span>
              </div>
              <div className="mt-2 text-[10px] text-on-surface-variant leading-tight">
                {incidents.length > 0 ? `Analysis ready for ${incidents[0]?.service || 'system'}` : 'All systems operating nominally.'}
              </div>
            </div>

            {/* Latency */}
            <div className="glass-panel p-4 rounded-xl flex flex-col">
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">P99 Latency</span>
              <div className="flex items-end justify-between mt-1">
                <span className="font-data-mono text-xl text-on-surface transition-all duration-500">{incidents.length > 0 ? '240ms' : `${latency}ms`}</span>
                <span className="text-error text-[10px] font-bold">{incidents.length > 0 ? '↑198ms' : '↓12ms'}</span>
              </div>
              <div className="h-8 mt-2 w-full flex items-center justify-center">
                <div className="w-full h-1 bg-white/5 rounded-full relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-surface ${incidents.length > 0 ? 'left-[80%] bg-error' : 'left-1/4 bg-primary'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">

            {/* Central Health Visualization */}
            <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 z-10">
                <div>
                  <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">System Health Anomaly Map</h3>
                  <p className="text-on-surface-variant text-body-sm mt-1">Real-time cluster behavior tracking &amp; outlier detection</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveView('LIVE')}
                    className={`px-3 py-1.5 border rounded-lg text-label-caps transition-colors ${activeView === 'LIVE' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-on-surface hover:bg-white/10'}`}
                  >LIVE</button>
                  <button
                    onClick={() => setActiveView('24H')}
                    className={`px-3 py-1.5 border rounded-lg text-label-caps transition-colors ${activeView === '24H' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10'}`}
                  >24H</button>
                </div>
              </div>

              {/* Visualization */}
              <div className="flex-1 w-full relative flex items-center justify-center min-h-[240px]">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="w-full h-full relative">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={incidents.length > 0 ? '#ffb4ab' : '#adc6ff'} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={incidents.length > 0 ? '#ffb4ab' : '#adc6ff'} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d={activeView === '24H' 
                        ? "M0,180 C150,150 250,160 400,100 S600,120 800,90 L800,200 L0,200 Z" 
                        : incidents.length > 0 
                        ? `M0,150 C${100 + waveOffset/4},${120 - waveOffset/5} ${200 - waveOffset/4},60 300,20 S${450 + waveOffset/5},140 ${550 - waveOffset/5},100 S700,40 800,60 L800,200 L0,200 Z`
                        : `M0,150 C${100 + Math.sin(waveOffset)*10},${120 + Math.cos(waveOffset)*10} 200,140 300,${80 + Math.sin(waveOffset)*15} S450,60 550,100 S700,${80 - Math.cos(waveOffset)*10} 800,60 L800,200 L0,200 Z`
                      } 
                      fill="url(#lineGrad)" 
                      className="transition-all duration-1000 ease-in-out"
                    />
                    <path 
                      d={activeView === '24H'
                        ? "M0,180 C150,150 250,160 400,100 S600,120 800,90"
                        : incidents.length > 0 
                        ? `M0,150 C${100 + waveOffset/4},${120 - waveOffset/5} ${200 - waveOffset/4},60 300,20 S${450 + waveOffset/5},140 ${550 - waveOffset/5},100 S700,40 800,60`
                        : `M0,150 C${100 + Math.sin(waveOffset)*10},${120 + Math.cos(waveOffset)*10} 200,140 300,${80 + Math.sin(waveOffset)*15} S450,60 550,100 S700,${80 - Math.cos(waveOffset)*10} 800,60`
                      } 
                      fill="none" 
                      stroke={incidents.length > 0 ? '#ffb4ab' : '#adc6ff'} 
                      strokeWidth="2" 
                      className="transition-all duration-1000 ease-in-out"
                    />
                    <path d="M0,170 C100,160 200,165 300,155 S450,145 550,150 S700,140 800,135" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                    
                    {incidents.length > 0 && (
                      <circle cx="300" cy="20" r="8" fill="#ffb4ab" fillOpacity="0.4" stroke="#ffb4ab" strokeWidth="1.5">
                        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="fillOpacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </svg>

                  {incidents.length > 0 && (
                    <div className="absolute top-2 left-[30%] bg-error/20 border border-error/40 p-2 rounded backdrop-blur-md animate-pulse">
                      <div className="text-[10px] text-error font-bold uppercase">Critical Deviation</div>
                      <div className="text-[12px] font-mono text-on-surface">Service: {incidents[0]?.service || 'unknown'}</div>
                    </div>
                  )}
                  <div className="absolute bottom-6 right-[20%] bg-primary/20 border border-primary/40 p-2 rounded backdrop-blur-md">
                    <div className="text-[10px] text-primary font-bold uppercase">Normal Baseline</div>
                    <div className="text-[12px] font-mono text-on-surface">Sync latency: 4ms</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 z-10">
                <div className="space-y-1">
                  <div className="text-on-surface-variant text-[10px] uppercase font-bold">Cluster Node-A</div>
                  <div className="text-primary font-data-mono">82% Load</div>
                </div>
                <div className="space-y-1">
                  <div className="text-on-surface-variant text-[10px] uppercase font-bold">Memory Flow</div>
                  <div className="text-secondary font-data-mono">1.2 TB/s</div>
                </div>
                <div className="space-y-1">
                  <div className="text-on-surface-variant text-[10px] uppercase font-bold">Active Threads</div>
                  <div className="text-on-surface font-data-mono">14,204</div>
                </div>
                <div className="space-y-1">
                  <div className="text-on-surface-variant text-[10px] uppercase font-bold">Network I/O</div>
                  <div className="text-tertiary font-data-mono">14.2 GBps</div>
                </div>
              </div>
            </div>

            {/* Right Bento */}
            <div className="col-span-12 lg:col-span-4 space-y-6">

              {/* Critical Feed */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col">
                <h4 className="font-headline-md text-headline-md font-semibold text-on-surface mb-4">Critical Feed</h4>
                <div className="space-y-4">
                  {incidents.length === 0 ? (
                    <div className="text-on-surface-variant text-sm py-4 text-center">No active incidents</div>
                  ) : (
                    incidents.slice(0, 3).map((inc, i) => (
                      <Link key={inc.incident_id || i} href="/incidents" className={`flex gap-4 p-3 border rounded-xl transition-colors cursor-pointer ${inc.severity === 'critical' ? 'bg-error/10 border-error/20 hover:bg-error/15' : 'bg-tertiary/10 border-tertiary/20 hover:bg-tertiary/15'}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${inc.severity === 'critical' ? 'bg-error/20 text-error' : 'bg-tertiary/20 text-tertiary'}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {inc.severity === 'critical' ? 'dns' : 'warning'}
                          </span>
                        </div>
                        <div>
                          <div className="text-body-sm font-semibold text-on-surface">{inc.title}</div>
                          <div className={`text-[10px] font-mono mt-1 ${inc.severity === 'critical' ? 'text-error/80' : 'text-tertiary/80'}`}>
                            {inc.service} • {new Date(inc.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <Link href="/incidents" className="mt-6 w-full py-2 text-body-sm font-semibold border border-white/10 hover:bg-white/5 rounded-lg transition-colors text-center text-on-surface-variant block">
                  View All Incidents
                </Link>
              </div>

              {/* Cluster Topology */}
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-body-sm font-bold uppercase tracking-widest text-on-surface-variant">Cluster Topology</h4>
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>open_in_full</span>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {heatmapData.map((cell) => (
                    <div
                      key={cell.id}
                      className={`aspect-square rounded-sm ${cell.color} transition-opacity duration-1000`}
                      style={{ opacity: cell.opacity }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-[10px] text-on-surface-variant">Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-error"></div>
                    <span className="text-[10px] text-on-surface-variant">Congested</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI INTELLIGENCE SIDEBAR (RIGHT) */}
      <aside className="h-screen w-sidebar-ai-width sticky right-0 top-0 bg-surface-container-highest/30 backdrop-blur-md border-l border-white/10 flex shrink-0 ai-sidebar-texture flex-col overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="p-panel-padding flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-label-caps text-label-caps tracking-widest text-tertiary">AEGIS INSIGHTS</div>
                <div className="text-[10px] text-on-surface-variant mt-0.5">Live AI Brain • v4.2</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary animate-pulse-subtle" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
            </div>

            {/* AI Insight Card */}
            {incidents.length > 0 && (
              <div className="bg-surface-container-lowest border border-tertiary/20 p-4 rounded-xl ai-glow mb-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontSize: '18px' }}>analytics</span>
                  <div className="flex-1">
                    <div className="text-body-sm font-semibold text-tertiary">AI RCA Generated</div>
                    <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed font-data-mono">
                      Detected cascading failure pattern in <span className="text-on-surface">{incidents[0].service}</span>. Root cause identified as: {incidents[0].primary_root_cause_service || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <Link href="/incidents" className="w-full block text-center py-1.5 bg-tertiary text-on-tertiary text-label-caps rounded-md hover:brightness-110 transition-all">
                    View Full Analysis
                  </Link>
                </div>
              </div>
            )}

            {/* AI Panel Nav */}
            <nav className="space-y-1">
              {[
                { icon: 'priority_high', label: 'Incident Detect' },
                { icon: 'psychology', label: 'RCA' },
                { icon: 'account_tree', label: 'Dependency' },
                { icon: 'build', label: 'Fix Rec' },
                { icon: 'warning', label: 'Failure Predict' },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => setAiPanel(label)}
                  className={`w-full flex items-center gap-3 px-3 py-2 font-data-mono text-data-mono transition-colors text-left rounded-lg ${
                    aiPanel === label
                      ? 'text-tertiary border-l-2 border-tertiary bg-tertiary/5'
                      : 'text-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Action Queue */}
          <div className="p-4 bg-surface-container-low border-t border-white/10">
            <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-3 tracking-tighter">Autonomous Action Queue</div>
            <div className="space-y-2 mb-4">
              <div className="flex gap-2 items-center text-[11px] bg-white/5 p-2 rounded">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                <span className="text-on-surface">Scaling up <span className="font-mono">svc-billing</span>...</span>
              </div>
              <div className="flex gap-2 items-center text-[11px] bg-white/5 p-2 rounded">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                <span className="text-on-surface-variant">Purging cache: <span className="font-mono">edge-node-4</span></span>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3 text-body-sm focus:ring-1 focus:ring-tertiary/50 focus:border-tertiary focus:outline-none resize-none h-20 placeholder:text-on-surface-variant/40"
                placeholder="Ask Aegis to perform an action..."
              />
              <button 
                onClick={() => {
                  if (isSending || !inputText.trim()) return;
                  setIsSending(true);
                  setTimeout(() => {
                    setIsSending(false);
                    setInputText('');
                  }, 1000);
                }}
                disabled={isSending || !inputText.trim()}
                className={`absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-transform shadow-lg ${
                  isSending ? 'bg-tertiary/50 text-white cursor-wait' : 
                  !inputText.trim() ? 'bg-white/10 text-white/30' : 
                  'bg-tertiary text-on-tertiary hover:scale-95 active:scale-90'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>
                  {isSending ? 'hourglass_empty' : 'send'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

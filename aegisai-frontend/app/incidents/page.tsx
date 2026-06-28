'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('http://localhost:3000/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        if (data.length > 0 && !activeIncident) {
          setActiveIncident(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch incidents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-error/10 text-error border-error/20';
      case 'high': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-error';
      case 'high': return 'text-tertiary';
      default: return 'text-primary';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-error';
      case 'high': return 'bg-tertiary';
      default: return 'bg-primary';
    }
  };

  const timeAgo = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000 / 60);
    return diff < 1 ? 'Just now' : `${diff}m ago`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
          
          {/* TOP APP BAR */}
          <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input className="w-full bg-surface-container-lowest border border-white/5 rounded-lg pl-10 pr-4 py-1.5 font-body-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="Search incidents, services, or root causes..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">monitor_heart</span>
              </button>
              <div className="relative">
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                {incidents.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>}
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </header>

          {/* 3-PANEL INNER SCENE */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* PANEL 1: INCIDENT LIST */}
            <section className="w-[400px] border-r border-white/10 flex flex-col overflow-hidden bg-surface-container-lowest/50 shrink-0">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h2 className="font-headline-md text-headline-md font-semibold flex items-center gap-2">
                  Active Incidents
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${incidents.length > 0 ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {incidents.length} ACTIVE
                  </span>
                </h2>
                <button className="p-1 text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {loading && incidents.length === 0 ? (
                  <div className="text-center text-on-surface-variant py-8">Loading incidents...</div>
                ) : incidents.length === 0 ? (
                  <div className="text-center text-on-surface-variant py-8">No active incidents!</div>
                ) : (
                  incidents.map((inc) => (
                    <div 
                      key={inc.incident_id}
                      onClick={() => setActiveIncident(inc)}
                      className={`p-4 bg-surface-container-highest/20 border rounded-xl relative group cursor-pointer transition-all ${activeIncident?.incident_id === inc.incident_id ? 'border-primary/50 bg-surface-container-highest/60' : 'border-white/5 hover:bg-surface-container-highest/40'} ${inc.severity === 'critical' ? 'critical-glow' : ''}`}
                    >
                      <div className={`absolute top-0 right-0 w-1 h-full rounded-r-xl ${getSeverityBgColor(inc.severity)}`}></div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-data-mono text-[11px] font-bold uppercase tracking-widest ${getSeverityTextColor(inc.severity)}`}>{inc.severity}</span>
                        <span className="text-[10px] text-on-surface-variant font-data-mono">{timeAgo(inc.timestamp)}</span>
                      </div>
                      <h3 className="font-headline-md text-base font-bold mb-1 truncate">{inc.service}</h3>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3">{inc.title}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>auto_awesome</span>
                          <span className="font-data-mono text-[11px] text-primary">98% Confidence</span>
                        </div>
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">ID: {inc.incident_id.substring(0,8)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* PANEL 2: INCIDENT DETAIL VIEW */}
            <section className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-surface/50 p-6">
              {activeIncident ? (
                <>
                  {/* HEADER SECTION */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`material-symbols-outlined text-[24px] ${getSeverityTextColor(activeIncident.severity)}`}>report_problem</span>
                      <nav className="flex text-on-surface-variant text-[12px] font-data-mono">
                        <span>INCIDENTS</span>
                        <span className="mx-2">/</span>
                        <span className="text-on-surface uppercase">{activeIncident.incident_id.substring(0,8)}</span>
                      </nav>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-bold mb-2">{activeIncident.title}</h2>
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-bold border uppercase ${getSeverityStyle(activeIncident.severity)}`}>
                        {activeIncident.severity}
                      </span>
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-[12px] text-on-surface-variant border border-white/5">US-EAST-1</span>
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-[12px] text-on-surface-variant border border-white/5">OWNER: FinTech-SRE</span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-bold border border-primary/20">AI ANALYZED</span>
                    </div>
                  </div>

                  {/* BENTO GRID DETAILS */}
                  <div className="grid grid-cols-12 gap-6 mb-8">
                    {/* AI ROOT CAUSE ANALYSIS */}
                    <div className="col-span-12 lg:col-span-8 p-6 bg-surface-container rounded-xl border border-white/5 active-ai-glow relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-[64px]">psychology</span>
                      </div>
                      <h4 className="font-headline-md text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                        AI Root Cause Analysis
                      </h4>
                      <div className="space-y-4 font-body-md text-on-surface-variant relative z-10">
                        <p>{activeIncident.summary || activeIncident.postmortem_report}</p>
                        <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                          <h5 className="text-on-surface font-bold text-sm mb-2">Dependency Failure Chain</h5>
                          <div className="flex items-center gap-2 font-data-mono text-[11px] overflow-x-auto">
                            <span className="text-primary">LoadBalancer</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            <span className="text-error">{activeIncident.service}</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            <span className="text-error font-bold underline">{activeIncident.primary_root_cause_service} (ROOT)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RECENT TIMELINE SLICE */}
                    <div className="col-span-12 lg:col-span-4 p-6 bg-surface-container rounded-xl border border-white/5">
                      <h4 className="font-headline-md text-lg font-semibold mb-4">Event Timeline</h4>
                      <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-error rounded-full flex items-center justify-center border-4 border-surface-container">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <p className="text-[12px] font-bold text-on-surface">{new Date(activeIncident.timestamp).toLocaleTimeString()}</p>
                          <p className="text-[11px] text-on-surface-variant">Incident detected. PagerDuty Alert fired.</p>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-primary rounded-full flex items-center justify-center border-4 border-surface-container">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <p className="text-[12px] font-bold text-on-surface">{new Date(activeIncident.timestamp + 12000).toLocaleTimeString()}</p>
                          <p className="text-[11px] text-on-surface-variant">AegisAI initialized log ingestion & RCA.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AFFECTED SERVICES LIST */}
                  <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                      <h4 className="font-headline-md text-lg font-semibold">Affected Infrastructure</h4>
                    </div>
                    <table className="w-full text-left font-data-mono text-sm">
                      <thead>
                        <tr className="text-on-surface-variant text-[11px] border-b border-white/5">
                          <th className="px-6 py-3 font-medium">Service Node</th>
                          <th className="px-6 py-3 font-medium">Region</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/5">
                          <td className="px-6 py-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
                            {activeIncident.service}
                          </td>
                          <td className="px-6 py-4 opacity-60">US-EAST-1A</td>
                          <td className="px-6 py-4"><span className="text-error">Timed Out</span></td>
                          <td className="px-6 py-4 text-right text-error font-bold uppercase">{activeIncident.severity}</td>
                        </tr>
                        <tr className="hover:bg-white/5">
                          <td className="px-6 py-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-tertiary rounded-full"></span>
                            {activeIncident.primary_root_cause_service}
                          </td>
                          <td className="px-6 py-4 opacity-60">GLOBAL-DNS</td>
                          <td className="px-6 py-4"><span className="text-tertiary">Degraded</span></td>
                          <td className="px-6 py-4 text-right text-tertiary">HIGH</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant">
                  Select an incident to view details
                </div>
              )}
            </section>

            {/* PANEL 3: AI INSIGHTS SIDEBAR (RIGHT) */}
            <aside className="w-sidebar-ai-width h-full flex flex-col bg-surface-container-highest/30 backdrop-blur-md border-l border-white/10 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]"></div>
              <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="mb-8">
                  <p className="font-label-caps text-label-caps tracking-widest text-tertiary mb-1">AEGIS INSIGHTS</p>
                  <h3 className="font-headline-md text-xl font-bold flex items-center gap-2">
                    Live AI Brain
                    <span className="w-2 h-2 bg-tertiary rounded-full animate-breathing"></span>
                  </h3>
                </div>
                {activeIncident ? (
                  <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    <div className="p-4 bg-white/5 border-l-2 border-tertiary rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">build</span>
                        <h4 className="font-bold text-on-surface text-sm">Immediate Remediation</h4>
                      </div>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        {activeIncident.remediation_immediate || 'Scaling resources to handle pending load.'}
                      </p>
                      <button 
                        onClick={() => {
                          if (isExecuting) return;
                          setIsExecuting(true);
                          setTimeout(() => setIsExecuting(false), 2000);
                        }}
                        disabled={isExecuting}
                        className={`mt-4 w-full py-2 font-bold text-[11px] rounded uppercase tracking-widest transition-all ${
                          isExecuting 
                            ? 'bg-tertiary/50 text-white cursor-wait' 
                            : 'bg-tertiary text-on-tertiary hover:brightness-110'
                        }`}
                      >
                        {isExecuting ? 'EXECUTING FIX...' : 'Execute Autonomous Fix'}
                      </button>
                    </div>
                    <div className="p-4 bg-white/5 border-l-2 border-primary rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
                        <h4 className="font-bold text-on-surface text-sm">Prevention Policy</h4>
                      </div>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        {activeIncident.remediation_prevention || 'Applying new rate limits via Istio.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm text-center">
                    Awaiting incident selection for analysis
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 mt-auto">
                  <div className="relative">
                    <textarea className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-[12px] focus:outline-none focus:border-tertiary/50 resize-none h-20 placeholder:text-on-surface-variant/50" placeholder="Ask Aegis about this incident..." />
                    <button className="absolute bottom-3 right-3 w-7 h-7 bg-tertiary text-on-tertiary rounded-md flex items-center justify-center hover:scale-95 transition-transform">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </main>
      </div>
    </div>
  );
}

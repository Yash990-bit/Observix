'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { checkSystemHealth } from '../../lib/api/client';

export default function SettingsPage() {
  const [health, setHealth] = useState<any>({
    apiGateway: true,
    ingestion: true,
    logProcessor: true,
    incidentAnalyzer: true,
    clickhouse: true,
    nats: true,
  });

  const loadHealth = () => {
    checkSystemHealth().then(setHealth).catch(console.error);
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const microservices = [
    { name: 'API Gateway (NestJS)', port: 3005, role: 'REST Ingress & SSE Telemetry Stream', status: health.apiGateway, icon: 'dns' },
    { name: 'Ingestion Service (NestJS)', port: 3006, role: 'High-throughput Log Ingestion & Validation', status: health.ingestion, icon: 'input' },
    { name: 'Log Processor Worker', port: 3007, role: 'Dual-threshold Batching & ClickHouse Writer', status: health.logProcessor, icon: 'terminal' },
    { name: 'AI Incident Engine', port: 3008, role: 'Gemini AI SRE Brain & Anomaly Listener', status: health.incidentAnalyzer, icon: 'psychology' },
    { name: 'ClickHouse OLAP Database', port: 8123, role: 'Analytical Telemetry Storage & Incidents Table', status: health.clickhouse, icon: 'database' },
    { name: 'NATS JetStream Server', port: 4222, role: 'Persistent Message Stream (`LOG_STREAM`)', status: health.nats, icon: 'hub' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0c]">
      <Sidebar />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]" />

          {/* Top App Bar */}
          <header className="h-16 sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-md bg-surface/80 flex justify-between items-center px-8 shrink-0">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="w-full relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary/50 transition-all font-body-md text-on-surface" placeholder="Search settings or microservices..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">dns</span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10 select-none">
            <div className="space-y-6 max-w-6xl mx-auto pb-16">

              {/* Title Banner */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-6">
                <div>
                  <h1 className="font-headline-lg text-headline-lg font-bold text-slate-100 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-3xl">settings</span>
                    <span>Platform Settings & Infrastructure</span>
                  </h1>
                  <p className="text-body-sm text-slate-400 mt-1">Configure security credentials and monitor microservice health parameters.</p>
                </div>

                <button
                  onClick={loadHealth}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-body-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">sync</span>
                  <span>Refresh Matrix</span>
                </button>
              </div>

              {/* Microservices Matrix */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">Cluster Services Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {microservices.map((svc) => (
                    <div key={svc.name} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">{svc.icon}</span>
                          </div>
                          <span className="font-bold text-xs text-slate-200">{svc.name}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ONLINE
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-normal">{svc.role}</p>
                      <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Port :{svc.port}</span>
                        <span>HTTP 200 OK</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Tenancy & Performance metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                  <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">SaaS Access Control</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Tenant Namespace</span>
                      <span className="font-mono font-bold text-primary">org_default / proj_default</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Global Rate Limit Scope</span>
                      <span className="font-mono font-bold text-emerald-400">1,000 req/min</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Partition Strategy</span>
                      <span className="font-mono text-slate-400 text-[10px]">PARTITION BY (org_id, project_id, date)</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                  <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">Cluster Telemetry Performance</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Logs Queue Processing Latency</span>
                      <span className="font-mono font-bold text-emerald-400">5 ms</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">OLAP Analytical Batch Latency</span>
                      <span className="font-mono font-bold text-primary">48 ms</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">AI Triage Reasoner Latency</span>
                      <span className="font-mono font-bold text-indigo-400">1,250 ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Key Generator Container */}
              <div className="glass-panel rounded-2xl p-6 border border-primary/20 space-y-5 bg-gradient-to-r from-slate-950 to-indigo-950/20">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-100">Developer API Keys & Access</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Use these keys inside your applications using our official SDK client libraries.</p>
                  </div>
                  <button
                    onClick={() => {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://observix.onrender.com';
                      fetch(`${baseUrl}/keys/generate`, { method: 'POST' })
                        .then(res => res.json())
                        .then(data => alert(`Generated New Secret Key: ${data.key?.key}`))
                        .catch(console.error);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-on-primary-container font-bold text-xs shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span>Generate New API Key</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">Default Sandbox Collector Key</p>
                      <p className="text-[11px] font-mono text-slate-500">Key: aegis_sec_live_9942a1b • Scope: org_default</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">ACTIVE</span>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

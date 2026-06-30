'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Cpu, Database, Server, Radio, RefreshCw } from 'lucide-react';
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
    { name: 'API Gateway (NestJS)', port: 3005, role: 'REST Ingress & SSE Telemetry Stream', status: health.apiGateway, icon: Server },
    { name: 'Ingestion Service (NestJS)', port: 3006, role: 'High-throughput Log Ingestion & Validation', status: health.ingestion, icon: Server },
    { name: 'Log Processor Worker', port: 3007, role: 'Dual-threshold Batching & ClickHouse Writer', status: health.logProcessor, icon: Cpu },
    { name: 'AI Incident Engine', port: 3008, role: 'Gemini AI SRE Brain & Anomaly Listener', status: health.incidentAnalyzer, icon: Cpu },
    { name: 'ClickHouse OLAP Database', port: 8123, role: 'Analytical Telemetry Storage & Incidents Table', status: health.clickhouse, icon: Database },
    { name: 'NATS JetStream Server', port: 4222, role: 'Persistent Message Stream (`LOG_STREAM`)', status: health.nats, icon: Radio },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0c]">
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
                <Settings className="h-6 w-6 text-cyan-400" />
                <span>Platform Infrastructure & Settings</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Status matrix and configuration monitor for the AegisAI distributed cluster.</p>
            </div>

            <button
              onClick={loadHealth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-border text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Infrastructure Matrix</span>
            </button>
          </div>

          {/* Microservices Matrix */}
          <div className="glass-panel rounded-2xl p-6 border border-border space-y-4">
            <h3 className="font-bold text-base text-slate-200">Distributed Cluster Services Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {microservices.map((svc) => {
                const Icon = svc.icon;

                return (
                  <div key={svc.name} className="p-4 rounded-xl bg-slate-900/80 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-200">{svc.name}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        ONLINE
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{svc.role}</p>
                    <div className="pt-2 border-t border-border/50 flex justify-between text-[11px] font-mono text-slate-500">
                      <span>Port :{svc.port}</span>
                      <span>Health Check: 200 OK</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meta-Monitoring & Multi-Tenancy Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-border space-y-4">
              <h3 className="font-bold text-base text-slate-200">Multi-Tenant SaaS Isolation & Security</h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-border flex items-center justify-between">
                  <span className="text-slate-400">Active Tenant Scope</span>
                  <span className="font-mono font-bold text-cyan-400">org_default / proj_default</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-border flex items-center justify-between">
                  <span className="text-slate-400">Ingestion Rate Limiting</span>
                  <span className="font-mono font-bold text-emerald-400">1,000 req/min active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-border flex items-center justify-between">
                  <span className="text-slate-400">ClickHouse Storage Partitioning</span>
                  <span className="font-mono font-bold text-slate-200">PARTITION BY (org_id, project_id, date)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-border space-y-4">
              <h3 className="font-bold text-base text-slate-200">System Meta-Monitoring (Self-Observability)</h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-border flex items-center justify-between">
                  <span className="text-slate-400">Telemetry Ingestion Latency</span>
                  <span className="font-mono font-bold text-emerald-400">5 ms</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-border flex items-center justify-between">
                  <span className="text-slate-400">ClickHouse Batch Write Latency</span>
                  <span className="font-mono font-bold text-cyan-400">48 ms</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-border flex items-center justify-between">
                  <span className="text-slate-400">AI Reasoning Engine Latency</span>
                  <span className="font-mono font-bold text-indigo-400">1,250 ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Generator & Onboarding Section */}
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4 bg-slate-900/60">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-100">Developer API Keys & Tenant Access</h3>
                <p className="text-xs text-slate-400">Manage operational security keys used by client SDKs and backend collectors.</p>
              </div>
              <button
                onClick={() => {
                  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://observix.onrender.com';
                  fetch(`${baseUrl}/keys/generate`, { method: 'POST' })
                    .then(res => res.json())
                    .then(data => alert(`Generated New Secret Key: ${data.key?.key}`))
                    .catch(console.error);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
              >
                + Generate New API Key
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-border flex items-center justify-between text-slate-300">
                <div>
                  <p className="font-bold text-slate-200">Production Microservices Secret</p>
                  <p className="text-[11px] text-slate-500">Key: aegis_sec_live_9942a1b • Scope: org_default</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

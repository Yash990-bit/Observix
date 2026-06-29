'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'postmortem' | 'activity' | 'insights'>('activity');
  const [logs, setLogs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://observix.onrender.com';
        const res = await fetch(`${baseUrl}/logs?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error('Failed to fetch logs', e);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        
        {/*  Main Content Area  */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-y-auto">
          {/*  TopAppBar  */}
          <header className="h-16 sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-md flex justify-between items-center px-gutter shrink-0">
            <div className="flex items-center bg-surface-container-lowest border border-white/10 rounded-sm px-3 py-1.5 w-96 focus-within:border-primary/50 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md w-full p-0 text-on-surface" placeholder="Search architecture, nodes, or AI logs..." type="text" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-data-mono text-data-mono text-primary uppercase">System Nominal</span>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">notifications</span></button>
                <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">dns</span></button>
                <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
              </div>
            </div>
          </header>

          {/*  Documentation Canvas  */}
          <div className="p-container-margin">
            <div className="max-w-6xl mx-auto">
              <header className="mb-12">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-2">The Autonomous SRE Pipeline</h2>
                <p className="text-on-surface-variant font-body-md max-w-2xl">
                  AegisAI employs a distributed, high-throughput pipeline designed to ingest, process, and react to infrastructure events in sub-second latency.
                </p>
              </header>

              {/*  Flowchart Section  */}
              <div className="relative glass-panel rounded-xl p-12 mb-12 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">architecture</span>
                </div>
                
                {/*  The SVG Connectors  */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 hidden lg:block" preserveAspectRatio="none">
                  <path className="text-primary flow-line" d="M 120 200 L 280 200 M 420 200 L 580 200 M 720 200 L 880 200 M 1020 200 L 1150 200" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>

                {/*  Bento-ish Grid for Nodes  */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
                  <div className="flex flex-col items-center gap-6 group">
                    <div className="w-20 h-20 bg-surface-container-highest border border-white/20 rounded-full flex items-center justify-center node-glow group-hover:border-primary transition-colors duration-500">
                      <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                    </div>
                    <div className="text-center">
                      <h4 className="font-data-mono text-data-mono text-primary font-bold mb-2">SDK / OTEL</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Client-side instrumentation.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 group">
                    <div className="w-20 h-20 bg-surface-container-highest border border-white/20 rounded-full flex items-center justify-center node-glow group-hover:border-primary transition-colors duration-500">
                      <span className="material-symbols-outlined text-primary text-3xl">input</span>
                    </div>
                    <div className="text-center">
                      <h4 className="font-data-mono text-data-mono text-primary font-bold mb-2">Ingestion</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">GRPC Load Balanced.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 group">
                    <div className="w-20 h-20 bg-surface-container-highest border border-white/20 rounded-full flex items-center justify-center node-glow group-hover:border-primary transition-colors duration-500">
                      <span className="material-symbols-outlined text-primary text-3xl">cyclone</span>
                    </div>
                    <div className="text-center">
                      <h4 className="font-data-mono text-data-mono text-primary font-bold mb-2">NATS JetStream</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time Pub/Sub.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 group">
                    <div className="w-20 h-20 bg-surface-container-highest border border-white/20 rounded-full flex items-center justify-center node-glow group-hover:border-primary transition-colors duration-500">
                      <span className="material-symbols-outlined text-primary text-3xl">storage</span>
                    </div>
                    <div className="text-center">
                      <h4 className="font-data-mono text-data-mono text-primary font-bold mb-2">ClickHouse</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">OLAP Persistence.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 group">
                    <div className="w-20 h-20 bg-primary/20 border border-primary rounded-full flex items-center justify-center node-glow animate-pulse">
                      <span className="material-symbols-outlined text-primary text-4xl" style={{"fontVariationSettings":"'FILL' 1"}}>psychology</span>
                    </div>
                    <div className="text-center">
                      <h4 className="font-data-mono text-data-mono text-primary font-bold mb-2">Aegis Brain</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Autonomous Analysis.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/*  Detailed Stage Cards  */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <div className="glass-panel p-6 rounded-lg group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">data_object</span>
                      <h3 className="font-headline-md text-headline-md">Smart SDK Core</h3>
                    </div>
                    <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">v2.4.0</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-6">
                    The Aegis SDK uses lightweight eBPF probes to capture system calls without overhead. It pre-aggregates metrics to reduce network chatter.
                  </p>
                  <div className="bg-surface-container-lowest p-4 rounded-sm border border-white/5">
                    <code className="font-data-mono text-data-mono text-tertiary">
                      latency_overhead: &lt; 0.05ms<br />
                      protocol: GRPC/Protobuf<br />
                      auto_retry: exponential_backoff
                    </code>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-lg group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">database</span>
                      <h3 className="font-headline-md text-headline-md">ClickHouse OLAP</h3>
                    </div>
                    <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">1.2 PB Cap</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-6">
                    Massive parallel processing for trace and log analysis. Batching strategy ensures data consistency and extreme query speed.
                  </p>
                  <div className="bg-surface-container-lowest p-4 rounded-sm border border-white/5">
                    <code className="font-data-mono text-data-mono text-tertiary">
                      ingest_rate: 5k logs/sec<br />
                      query_latency: &lt; 200ms<br />
                      compression: LZ4_High
                    </code>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-lg group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">dynamic_feed</span>
                      <h3 className="font-headline-md text-headline-md">NATS JetStream</h3>
                    </div>
                    <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">High-Avail</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-6">
                    The central nervous system. Guarantees "at-least-once" delivery for all critical alerts and system signals.
                  </p>
                  <div className="bg-surface-container-lowest p-4 rounded-sm border border-white/5">
                    <code className="font-data-mono text-data-mono text-tertiary">
                      topology: RAFT Consensus<br />
                      throughput: 12GB/s<br />
                      retention: 24h Hot Storage
                    </code>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-lg group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">auto_awesome</span>
                      <h3 className="font-headline-md text-headline-md">AI Decisioning</h3>
                    </div>
                    <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-2 py-0.5 rounded">LLM-SRE-1</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-6">
                    Autonomous Root Cause Analysis (RCA). Maps signals to infrastructure graphs to identify pinpointed failure origins.
                  </p>
                  <div className="bg-surface-container-lowest p-4 rounded-sm border border-white/5">
                    <code className="font-data-mono text-data-mono text-tertiary">
                      context_window: 128k signals<br />
                      inference_time: 1.2s<br />
                      accuracy: 99.4% RCA
                    </code>
                  </div>
                </div>
              </div>

              {/*  3-STEP QUICKSTART INTEGRATION GUIDE FOR REAL USERS  */}
              <section className="mt-12 mb-20 glass-panel p-8 rounded-2xl border border-tertiary/30 bg-tertiary/5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center border border-tertiary/40">
                    <span className="material-symbols-outlined text-tertiary text-2xl">rocket_launch</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-bold text-on-surface">How to Connect Your Real Project</h3>
                    <p className="text-body-sm text-on-surface-variant">Follow these 3 simple steps to stream live telemetry from your app into Aegis AI</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary font-bold text-xs flex items-center justify-center">1</span>
                        <h4 className="font-bold text-sm text-on-surface">Install the SDK</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-4">Install the lightweight Aegis telemetry agent in your Node.js/Express app.</p>
                    </div>
                    <div className="bg-[#070708] p-3 rounded border border-white/10 font-data-mono text-[11px] text-tertiary">
                      npm install @aegisai/sdk
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary font-bold text-xs flex items-center justify-center">2</span>
                        <h4 className="font-bold text-sm text-on-surface">Initialize in Backend</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-4">Add 4 lines of code to your entry file (index.js or server.js).</p>
                    </div>
                    <div className="bg-[#070708] p-3 rounded border border-white/10 font-data-mono text-[10px] text-on-surface/80 overflow-x-auto whitespace-pre">
{`const Aegis = require('@aegisai/sdk');
const aegis = new Aegis({
  apiKey: "YOUR_API_KEY",
  endpoint: "https://api.aegis.ai" // BACKEND API Gateway URL (Not Frontend!)
});
aegis.start();`}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary font-bold text-xs flex items-center justify-center">3</span>
                        <h4 className="font-bold text-sm text-on-surface">View Live AI Triage</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-4">Your live app errors & metrics immediately stream to this Aegis dashboard!</p>
                    </div>
                    <div className="bg-tertiary/10 p-3 rounded border border-tertiary/20 text-[11px] text-tertiary font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">sync</span>
                      Auto-detects spikes & runs RCA
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/*  Right Sidebar: AI Intelligence Sidebar  */}
        <aside className="w-sidebar-ai-width h-screen sticky right-0 top-0 ai-sidebar-glass border-l border-white/10 flex flex-col z-50 shrink-0">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase">Aegis Insights</span>
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            </div>
            <h2 className="font-headline-md text-headline-md text-tertiary">Brain Activity</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Live AI Analysis Engine</p>
          </div>
          
          {/*  Navigation for AI Sidebar  */}
          <div className="flex border-b border-white/10 px-6 shrink-0">
            <button 
              onClick={() => setActiveTab('postmortem')}
              className={`flex-1 py-3 font-data-mono text-[11px] transition-colors ${activeTab === 'postmortem' ? 'text-tertiary border-b-2 border-tertiary' : 'text-on-surface-variant hover:text-tertiary'}`}
            >
              POSTMORTEM
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 font-data-mono text-[11px] transition-colors ${activeTab === 'activity' ? 'text-tertiary border-b-2 border-tertiary' : 'text-on-surface-variant hover:text-tertiary'}`}
            >
              ACTIVITY
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-3 font-data-mono text-[11px] transition-colors ${activeTab === 'insights' ? 'text-tertiary border-b-2 border-tertiary' : 'text-on-surface-variant hover:text-tertiary'}`}
            >
              INSIGHTS
            </button>
          </div>
          
          {/*  AI Stream  */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-mono text-tertiary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] animate-spin">monitoring</span>
                    Processing Context
                  </div>
                  <button 
                    onClick={() => setIsProcessing(!isProcessing)}
                    className={`text-[9px] font-bold px-2 py-1 rounded border transition-colors ${isProcessing ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                  >
                    {isProcessing ? 'PAUSE' : 'RESUME'}
                  </button>
                </div>
                
                {/* Live Logs Simulation from actual Backend */}
                {logs.length === 0 ? (
                  <div className="text-on-surface-variant text-xs text-center py-4">Waiting for telemetry...</div>
                ) : (
                  logs.map((log: any, index: number) => (
                    <div key={log.id || index} className="space-y-2 group">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-tertiary' : 'text-primary'}`}>
                          {log.level === 'error' ? 'report' : log.level === 'warn' ? 'warning' : 'info'}
                        </span>
                        <span className={`font-data-mono text-[11px] opacity-80 uppercase ${log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-tertiary' : 'text-primary'}`}>
                          {log.service}
                        </span>
                      </div>
                      <div className={`p-3 bg-white/5 rounded-sm border-l-2 ${log.level === 'error' ? 'border-error/40' : log.level === 'warn' ? 'border-tertiary/40' : 'border-primary/40'}`}>
                        <p className="font-data-mono text-[11px] leading-relaxed text-on-surface/90">
                          &gt; {log.message}
                        </p>
                      </div>
                      <p className="text-right font-data-mono text-[10px] opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'postmortem' && (
              <div className="text-on-surface-variant text-sm">
                No active critical incidents requiring a postmortem. System is nominal.
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                <div className="p-3 border border-tertiary/20 bg-tertiary/5 rounded text-sm text-on-surface-variant">
                  <strong className="text-tertiary block mb-1">Architecture Insight</strong>
                  The system is currently observing a 2% increase in traffic to the API Gateway. Auto-scaling thresholds are set at 80% CPU utilization.
                </div>
                <div className="p-3 border border-white/10 bg-white/5 rounded text-sm text-on-surface-variant">
                  <strong className="text-primary block mb-1">Cost Optimization</strong>
                  Recommending down-scaling of non-critical analytics workers during off-peak hours to save ~12% computing costs.
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

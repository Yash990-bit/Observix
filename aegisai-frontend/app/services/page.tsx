'use client';

import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';

interface NodeData {
  name: string;
  role: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptime: string;
  latency: string;
  throughput: string;
  errorRate: string;
  recommendation: string;
  actionText: string;
  upstreams: { name: string; latency: string }[];
  downstreams: { name: string; status: string }[];
  icon: string;
  color: string;
}

const NODES_DATA: Record<string, NodeData> = {
  'auth-service': {
    name: 'auth-service',
    role: 'Core identity & access provider',
    status: 'HEALTHY',
    uptime: '99.99%',
    latency: '12ms',
    throughput: '4.2k/s',
    errorRate: '0.02%',
    recommendation: 'Detected increasing read-latency on postgres-replica. Aegis recommends scaling the replica set by 2 nodes to handle the current auth-service load spikes.',
    actionText: 'Scale replica set',
    icon: 'lock',
    color: '#3b82f6',
    upstreams: [
      { name: 'edge-gateway', latency: '820ms avg' },
      { name: 'admin-panel', latency: '12ms avg' }
    ],
    downstreams: [
      { name: 'payment-v2', status: 'Healthy' },
      { name: 'postgres-replica', status: 'Degraded' },
      { name: 'analytics-worker', status: 'Failing' }
    ]
  },
  'payment-v2': {
    name: 'payment-v2',
    role: 'Stripe & PayPal API Integrator',
    status: 'HEALTHY',
    uptime: '99.95%',
    latency: '45ms',
    throughput: '1.8k/s',
    errorRate: '0.00%',
    recommendation: 'Connection pools are healthy. Enable aggressive caching for static catalog payloads to reduce DB roundtrips.',
    actionText: 'Enable Redis Caching',
    icon: 'payments',
    color: '#10b981',
    upstreams: [
      { name: 'auth-service', latency: '12ms avg' }
    ],
    downstreams: [
      { name: 'stripe-gateway', status: 'Healthy' }
    ]
  },
  'edge-gateway': {
    name: 'edge-gateway',
    role: 'Envoy Ingress Proxy',
    status: 'HEALTHY',
    uptime: '100.0%',
    latency: '5ms',
    throughput: '12.4k/s',
    errorRate: '0.01%',
    recommendation: 'High SSL handshake volume observed. Aegis recommends enabling HTTP/3 QUIC protocol on edge routes.',
    actionText: 'Deploy HTTP/3 Policy',
    icon: 'cloud',
    color: '#3b82f6',
    upstreams: [
      { name: 'cloudflare-cdn', latency: '2ms avg' }
    ],
    downstreams: [
      { name: 'auth-service', status: 'Healthy' },
      { name: 'static-cdn', status: 'Healthy' }
    ]
  },
  'postgres-replica': {
    name: 'postgres-replica',
    role: 'Read-Replica DB Cluster',
    status: 'DEGRADED',
    uptime: '98.40%',
    latency: '240ms',
    throughput: '850/s',
    errorRate: '1.20%',
    recommendation: 'High CPU utilization and lock contention on index `idx_users_token`. Scale connection pool size or spin up replica #4.',
    actionText: 'Scale Connection Pool',
    icon: 'database',
    color: '#f59e0b',
    upstreams: [
      { name: 'auth-service', latency: '240ms avg' }
    ],
    downstreams: [
      { name: 'pg-storage-ebs', status: 'Healthy' }
    ]
  },
  'analytics-worker': {
    name: 'analytics-worker',
    role: 'Kafka clickhouse Ingestion',
    status: 'CRITICAL',
    uptime: '91.20%',
    latency: '1200ms',
    throughput: '120/s',
    errorRate: '14.5%',
    recommendation: 'Kafka consumer lag exceeds 50,000 messages. Worker thread deadlocked on unhandled JSON payload.',
    actionText: 'Restart & Flush Queue',
    icon: 'warning',
    color: '#ef4444',
    upstreams: [
      { name: 'auth-service', latency: '1200ms avg' }
    ],
    downstreams: [
      { name: 'clickhouse-cluster', status: 'Failing' }
    ]
  }
};

export default function ServicesPage() {
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('auth-service');
  const [activeTab, setActiveTab] = useState<'insights' | 'postmortem' | 'brain'>('insights');
  const [fixStatus, setFixStatus] = useState<'idle' | 'applying' | 'applied'>('idle');
  const [showDetails, setShowDetails] = useState(false);

  const currentNode = NODES_DATA[selectedNodeKey] || NODES_DATA['auth-service'];

  const handleApplyFix = () => {
    if (fixStatus !== 'idle') return;
    setFixStatus('applying');
    setTimeout(() => {
      setFixStatus('applied');
    }, 2000);
  };

  const selectNode = (key: string) => {
    setSelectedNodeKey(key);
    setFixStatus('idle');
    setShowDetails(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top App Bar */}
          <header className="h-16 sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-md bg-surface/80 flex justify-between items-center px-gutter shrink-0">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="w-full relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary/50 transition-all font-body-md text-on-surface" placeholder="Search services, traces, or nodes..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-label-caps text-label-caps text-green-500">Global System Healthy</span>
              </div>
            </div>
          </header>

          {/* Main Content (Interactive Graph) */}
          <main className="flex-1 relative bg-[#0a0a0c] overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]" />
            
            <div className="absolute top-4 left-6 z-10 bg-surface-container-low/80 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
              <span className="text-xs font-mono text-on-surface-variant">Active Service: </span>
              <span className="text-xs font-mono font-bold text-primary uppercase">{currentNode.name}</span>
            </div>

            {/* SVG Visual Graph */}
            <svg className="w-full h-full max-h-[600px]" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1000 800">
              <defs>
                <style>{`
                  @keyframes flow {
                    to { stroke-dashoffset: -20; }
                  }
                  .flow-path {
                    stroke-dasharray: 6, 6;
                    animation: flow 1.2s linear infinite;
                  }
                `}</style>
              </defs>
              
              {/* Animated Connection Paths */}
              <g className="connections fill-none stroke-[2]">
                <path d="M 500 400 L 300 200" stroke={NODES_DATA['payment-v2'].status === 'CRITICAL' ? '#ef4444' : '#10b981'} className="flow-path opacity-40" />
                <path d="M 500 400 L 700 200" stroke="#3b82f6" className="flow-path opacity-40" />
                <path d="M 500 400 L 300 600" stroke="#f59e0b" className="flow-path opacity-40" />
                <path d="M 500 400 L 700 600" stroke="#ef4444" className="flow-path opacity-40" />
              </g>
              
              <g className="nodes cursor-pointer select-none">
                {/* auth-service */}
                <g onClick={() => selectNode('auth-service')} className="transition-all hover:opacity-90" transform="translate(500,400)">
                  <circle className={`fill-slate-900 stroke-2 transition-all ${selectedNodeKey === 'auth-service' ? 'stroke-primary fill-primary/10' : 'stroke-primary/50'}`} r={selectedNodeKey === 'auth-service' ? 44 : 38} />
                  <circle className="fill-none stroke-primary/30 stroke-1 animate-ping" r="46" />
                  <text className="fill-slate-300 font-mono text-[11px] uppercase tracking-wider font-bold" textAnchor="middle" y="58">auth-service</text>
                  <text className="material-symbols-outlined fill-primary text-2xl text-primary" dy=".3em" style={{ fontFamily: "'Material Symbols Outlined'" }} textAnchor="middle" y="0">lock</text>
                </g>

                {/* payment-v2 */}
                <g onClick={() => selectNode('payment-v2')} className="transition-all hover:opacity-90" transform="translate(300,200)">
                  <circle className={`fill-slate-900 stroke-2 transition-all ${selectedNodeKey === 'payment-v2' ? 'stroke-green-500 fill-green-500/10' : 'stroke-green-500/50'}`} r={selectedNodeKey === 'payment-v2' ? 38 : 32} />
                  <text className="fill-slate-300 font-mono text-[11px]" textAnchor="middle" y="52">payment-v2</text>
                  <text className="material-symbols-outlined fill-green-500 text-xl text-green-500" dy=".3em" style={{ fontFamily: "'Material Symbols Outlined'" }} textAnchor="middle" y="0">payments</text>
                </g>

                {/* edge-gateway */}
                <g onClick={() => selectNode('edge-gateway')} className="transition-all hover:opacity-90" transform="translate(700,200)">
                  <circle className={`fill-slate-900 stroke-2 transition-all ${selectedNodeKey === 'edge-gateway' ? 'stroke-blue-500 fill-blue-500/10' : 'stroke-blue-500/50'}`} r={selectedNodeKey === 'edge-gateway' ? 38 : 32} />
                  <text className="fill-slate-300 font-mono text-[11px]" textAnchor="middle" y="52">edge-gateway</text>
                  <text className="material-symbols-outlined fill-blue-500 text-xl text-blue-500" dy=".3em" style={{ fontFamily: "'Material Symbols Outlined'" }} textAnchor="middle" y="0">cloud</text>
                </g>

                {/* postgres-replica */}
                <g onClick={() => selectNode('postgres-replica')} className="transition-all hover:opacity-90" transform="translate(300,600)">
                  <circle className={`fill-slate-900 stroke-2 transition-all ${selectedNodeKey === 'postgres-replica' ? 'stroke-yellow-500 fill-yellow-500/10' : 'stroke-yellow-500/50'}`} r={selectedNodeKey === 'postgres-replica' ? 38 : 32} />
                  <text className="fill-slate-300 font-mono text-[11px]" textAnchor="middle" y="52">postgres-replica</text>
                  <text className="material-symbols-outlined fill-yellow-500 text-xl text-yellow-500" dy=".3em" style={{ fontFamily: "'Material Symbols Outlined'" }} textAnchor="middle" y="0">database</text>
                </g>

                {/* analytics-worker */}
                <g onClick={() => selectNode('analytics-worker')} className="transition-all hover:opacity-90" transform="translate(700,600)">
                  <circle className={`fill-slate-900 stroke-2 transition-all ${selectedNodeKey === 'analytics-worker' ? 'stroke-red-500 fill-red-500/10' : 'stroke-red-500/50'}`} r={selectedNodeKey === 'analytics-worker' ? 38 : 32} />
                  <text className="fill-slate-300 font-mono text-[11px]" textAnchor="middle" y="52">analytics-worker</text>
                  <text className="material-symbols-outlined fill-red-500 text-xl text-red-500" dy=".3em" style={{ fontFamily: "'Material Symbols Outlined'" }} textAnchor="middle" y="0">warning</text>
                </g>
              </g>
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 left-6 px-3 py-2 bg-surface-container-low/80 backdrop-blur border border-white/10 rounded-lg flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] font-label-caps uppercase text-on-surface-variant">Healthy</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-[10px] font-label-caps uppercase text-on-surface-variant">Degraded</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><span className="text-[10px] font-label-caps uppercase text-on-surface-variant">Critical</span></div>
            </div>
          </main>
        </div>

        {/* Right Side AI Sidebar */}
        <aside className="w-sidebar-ai-width h-screen sticky right-0 top-0 border-l border-white/10 bg-surface-container-high/40 backdrop-blur-2xl flex flex-col z-50 shrink-0 overflow-y-auto">
          {/* Selected Node Summary */}
          <div className="p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase">Aegis Insights</h3>
              <span className="material-symbols-outlined text-tertiary animate-pulse-subtle">psychology</span>
            </div>
            
            <div className="bg-surface-container-lowest/50 p-4 rounded border border-white/5 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-data-mono text-primary text-[10px] uppercase">Selected Service</span>
                <span className={`px-2 py-0.5 rounded font-data-mono text-[9px] font-bold ${
                  currentNode.status === 'HEALTHY' ? 'bg-green-500/10 text-green-500' :
                  currentNode.status === 'DEGRADED' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>{currentNode.status}</span>
              </div>
              <h2 className="font-bold text-lg text-slate-100 mb-0.5">{currentNode.name}</h2>
              <p className="text-xs text-slate-400">{currentNode.role}</p>
            </div>
          </div>

          {/* Action Recommendation Box (Moved Up for Visibility!) */}
          <div className="px-5 py-3 shrink-0">
            <div className="p-4 bg-tertiary/10 rounded-xl border border-tertiary/20 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-tertiary">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="font-bold text-xs uppercase tracking-wide">Aegis Recommendation</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {currentNode.recommendation}
              </p>

              {showDetails && (
                <div className="mb-3 p-3 bg-black/40 rounded border border-white/10 text-[10px] font-mono text-cyan-400 leading-normal">
                  <p>&gt; executing remediation for {currentNode.name}...</p>
                  <p className="mt-1 text-emerald-400">Estimated completion: 30s</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleApplyFix}
                  disabled={fixStatus !== 'idle'}
                  className={`w-full font-bold py-2 px-3 rounded text-[10px] uppercase transition-all ${
                    fixStatus === 'idle' ? 'bg-tertiary text-on-tertiary hover:brightness-110' : 
                    fixStatus === 'applying' ? 'bg-tertiary/50 text-white cursor-wait' : 
                    'bg-green-500 text-white'
                  }`}
                >
                  {fixStatus === 'idle' ? `Execute Recommended Fix` : fixStatus === 'applying' ? 'Executing Fix...' : 'Fix Successfully Executed!'}
                </button>
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full bg-white/5 border border-white/10 py-1.5 px-3 rounded text-[10px] uppercase font-bold text-on-surface hover:bg-white/10"
                >
                  {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-4 border-b border-white/10 px-5 pt-3 shrink-0">
            <button 
              onClick={() => setActiveTab('insights')}
              className={`pb-2 font-data-mono text-[11px] ${activeTab === 'insights' ? 'text-tertiary border-b-2 border-tertiary font-bold' : 'text-on-surface-variant hover:text-white'}`}
            >
              Insights
            </button>
            <button 
              onClick={() => setActiveTab('postmortem')}
              className={`pb-2 font-data-mono text-[11px] ${activeTab === 'postmortem' ? 'text-tertiary border-b-2 border-tertiary font-bold' : 'text-on-surface-variant hover:text-white'}`}
            >
              Postmortem
            </button>
            <button 
              onClick={() => setActiveTab('brain')}
              className={`pb-2 font-data-mono text-[11px] ${activeTab === 'brain' ? 'text-tertiary border-b-2 border-tertiary font-bold' : 'text-on-surface-variant hover:text-white'}`}
            >
              Brain Activity
            </button>
          </div>
          
          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
            {activeTab === 'insights' && (
              <div className="space-y-4">
                <section>
                  <h4 className="font-bold text-slate-400 text-xs uppercase mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">arrow_downward</span> Upstream Dependencies
                  </h4>
                  <div className="space-y-1.5">
                    {currentNode.upstreams.map((up, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-[11px] font-mono border border-white/5">
                        <span>{up.name}</span>
                        <span className="text-primary">{up.latency}</span>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section>
                  <h4 className="font-bold text-slate-400 text-xs uppercase mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">arrow_upward</span> Downstream Dependencies
                  </h4>
                  <div className="space-y-1.5">
                    {currentNode.downstreams.map((down, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-[11px] font-mono border border-white/5">
                        <span>{down.name}</span>
                        <span className={down.status === 'Healthy' ? 'text-green-500' : down.status === 'Degraded' ? 'text-yellow-500' : 'text-red-500'}>{down.status}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            
            {activeTab === 'postmortem' && (
              <div className="text-on-surface-variant text-xs flex flex-col gap-3">
                <p>Postmortem log for <span className="text-white font-mono">{currentNode.name}</span>.</p>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-bold text-on-surface mb-1">Reliability Metrics</p>
                  <ul className="list-disc pl-4 space-y-1 font-mono text-[10px]">
                    <li>Uptime target: {currentNode.uptime}</li>
                    <li>P99 Baseline: {currentNode.latency}</li>
                    <li>Current Error Rate: {currentNode.errorRate}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'brain' && (
              <div className="text-on-surface-variant text-[10px] flex flex-col gap-2 font-mono">
                <div className="flex gap-2"><span className="text-primary">[12:44]</span> Analyzing {currentNode.name} telemetry...</div>
                <div className="flex gap-2"><span className="text-primary">[12:45]</span> Status confirmed: {currentNode.status}</div>
                <div className="flex gap-2"><span className="text-primary">[12:45]</span> Scanning dependency topology...</div>
                <div className="flex gap-2"><span className={currentNode.status === 'HEALTHY' ? 'text-primary' : 'text-yellow-500'}>[12:45]</span> Recommendation: {currentNode.actionText}</div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Network, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceNode {
  id: string;
  name: string;
  type: 'gateway' | 'service' | 'processor' | 'storage' | 'ai';
  port: number;
  status: 'healthy' | 'degraded' | 'failing';
  latency: number;
  dependencies: string[];
}

const initialNodes: ServiceNode[] = [
  { id: 'api-gateway', name: 'API Gateway', type: 'gateway', port: 3005, status: 'healthy', latency: 12, dependencies: ['ingestion-service', 'auth-service'] },
  { id: 'ingestion-service', name: 'Ingestion Service', type: 'service', port: 3006, status: 'healthy', latency: 18, dependencies: ['nats'] },
  { id: 'auth-service', name: 'Auth Service', type: 'service', port: 3001, status: 'healthy', latency: 25, dependencies: ['db-service'] },
  { id: 'db-service', name: 'PostgreSQL DB', type: 'storage', port: 5432, status: 'healthy', latency: 8, dependencies: [] },
  { id: 'nats', name: 'NATS JetStream', type: 'storage', port: 4222, status: 'healthy', latency: 4, dependencies: ['log-processor', 'incident-analyzer'] },
  { id: 'log-processor', name: 'Log Processor', type: 'processor', port: 3007, status: 'healthy', latency: 22, dependencies: ['clickhouse'] },
  { id: 'incident-analyzer', name: 'AI Incident Engine', type: 'ai', port: 3008, status: 'healthy', latency: 120, dependencies: ['clickhouse'] },
  { id: 'clickhouse', name: 'ClickHouse OLAP', type: 'storage', port: 8123, status: 'healthy', latency: 14, dependencies: [] },
];

const coordinates: Record<string, { x: number; y: number }> = {
  'api-gateway': { x: 30, y: 220 },
  'ingestion-service': { x: 250, y: 90 },
  'auth-service': { x: 250, y: 350 },
  'nats': { x: 470, y: 90 },
  'db-service': { x: 470, y: 350 },
  'log-processor': { x: 690, y: 50 },
  'incident-analyzer': { x: 690, y: 210 },
  'clickhouse': { x: 690, y: 370 },
};

const connections = [
  { from: 'api-gateway', to: 'ingestion-service' },
  { from: 'api-gateway', to: 'auth-service' },
  { from: 'ingestion-service', to: 'nats' },
  { from: 'auth-service', to: 'db-service' },
  { from: 'nats', to: 'log-processor' },
  { from: 'nats', to: 'incident-analyzer' },
  { from: 'log-processor', to: 'clickhouse' },
  { from: 'incident-analyzer', to: 'clickhouse' },
];

export function DependencyGraph() {
  const [nodes, setNodes] = useState<ServiceNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(initialNodes[0]);
  const [simulatingFailure, setSimulatingFailure] = useState(false);

  const toggleSimulateFailure = () => {
    if (simulatingFailure) {
      setNodes(initialNodes);
      setSimulatingFailure(false);
    } else {
      setNodes(prev => prev.map(n => {
        if (n.id === 'db-service' || n.id === 'auth-service') {
          return { ...n, status: 'failing', latency: 1450 };
        }
        if (n.id === 'api-gateway') {
          return { ...n, status: 'degraded', latency: 850 };
        }
        return n;
      }));
      setSimulatingFailure(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Distributed Systems Topology</h3>
            <p className="text-xs text-slate-400">8 Nodes • Inter-service RPC & Telemetry Pipelines</p>
          </div>
        </div>

        <button
          onClick={toggleSimulateFailure}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium text-xs transition flex items-center gap-2 border shadow-md',
            simulatingFailure
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{simulatingFailure ? 'Clear Simulated Cascade' : 'Simulate Cascading Failure'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Visual Canvas */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-border min-h-[520px] relative bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 overflow-x-auto overflow-y-hidden">
          <div className="min-w-[900px] h-[480px] relative">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

            {/* SVG Connecting Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="grad-line" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
                </linearGradient>
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
              {connections.map((conn, idx) => {
                const fromCoord = coordinates[conn.from];
                const toCoord = coordinates[conn.to];
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                
                const isFailing = fromNode?.status === 'failing' || toNode?.status === 'failing';
                const isDegraded = fromNode?.status === 'degraded' || toNode?.status === 'degraded';
                
                const strokeColor = isFailing ? '#ef4444' : isDegraded ? '#f59e0b' : 'url(#grad-line)';
                
                // Adjust coords to draw from center-right of source to center-left of target
                const startX = fromCoord.x + 160;
                const startY = fromCoord.y + 36;
                const endX = toCoord.x;
                const endY = toCoord.y + 36;
                
                // Smooth bezier curve
                const controlX = startX + (endX - startX) / 2;
                const pathD = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;

                return (
                  <path
                    key={idx}
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isFailing ? 2.5 : 1.5}
                    className={clsx('transition-all duration-300', !isFailing && 'flow-path')}
                  />
                );
              })}
            </svg>

            {/* Interactive Node Cards */}
            {nodes.map(node => {
              const coord = coordinates[node.id];
              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${coord.x}px`,
                    top: `${coord.y}px`,
                    width: '160px',
                    zIndex: 10,
                  }}
                >
                  {renderNodeCard(node)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-border space-y-5">
          {selectedNode ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h4 className="font-bold text-slate-100 text-base">{selectedNode.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">Port :{selectedNode.port}</p>
                </div>
                <span className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-bold uppercase border',
                  selectedNode.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  selectedNode.status === 'degraded' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                )}>
                  {selectedNode.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-border">
                  <span className="text-slate-400">Response Latency</span>
                  <span className="font-mono font-bold text-slate-200">{selectedNode.latency} ms</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-border">
                  <span className="text-slate-400">Component Type</span>
                  <span className="font-mono font-semibold uppercase text-cyan-400">{selectedNode.type}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold uppercase text-slate-400">Outbound Dependencies</h5>
                {selectedNode.dependencies.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No outbound dependencies (Terminal Node)</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedNode.dependencies.map(depId => {
                      const dep = nodes.find(n => n.id === depId);
                      return (
                        <div key={depId} className="p-2.5 rounded-lg bg-slate-900/90 border border-border flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200">{dep?.name || depId}</span>
                          <span className={clsx('h-2 w-2 rounded-full', dep?.status === 'failing' ? 'bg-rose-500' : 'bg-emerald-500')} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">Select any node on the graph to inspect status.</div>
          )}
        </div>
      </div>
    </div>
  );

  function renderNodeCard(node: ServiceNode) {
    const isSelected = selectedNode?.id === node.id;
    const isFailing = node.status === 'failing';
    const isDegraded = node.status === 'degraded';

    return (
      <div
        onClick={() => setSelectedNode(node)}
        className={clsx(
          'p-3 rounded-xl border transition-all cursor-pointer relative group select-none',
          isFailing ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse' :
          isDegraded ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/10' :
          'bg-slate-900/80 border-border/80 hover:border-cyan-500/40 hover:bg-slate-800/80',
          isSelected && 'ring-2 ring-cyan-400 shadow-cyan-500/20'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">{node.name}</span>
          <span className={clsx('h-2 w-2 rounded-full shrink-0', isFailing ? 'bg-rose-500 animate-ping' : isDegraded ? 'bg-amber-500' : 'bg-emerald-500')} />
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>:{node.port}</span>
          <span>{node.latency}ms</span>
        </div>
      </div>
    );
  }
}

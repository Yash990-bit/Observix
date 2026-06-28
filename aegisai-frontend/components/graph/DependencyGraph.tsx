'use client';

import { useState } from 'react';
import { Network, Server, Database, Activity, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-border min-h-[480px] flex flex-col justify-between relative bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

          <div className="grid grid-cols-3 gap-8 relative z-10 my-auto">
            {/* Column 1: Gateways & Entry */}
            <div className="space-y-6 flex flex-col justify-center">
              {nodes.filter(n => n.type === 'gateway').map(node => renderNodeCard(node))}
            </div>

            {/* Column 2: Core Services & Processors */}
            <div className="space-y-6 flex flex-col justify-center">
              {nodes.filter(n => n.type === 'service' || n.type === 'processor').map(node => renderNodeCard(node))}
            </div>

            {/* Column 3: Storage & AI Brain */}
            <div className="space-y-6 flex flex-col justify-center">
              {nodes.filter(n => n.type === 'storage' || n.type === 'ai').map(node => renderNodeCard(node))}
            </div>
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
        key={node.id}
        onClick={() => setSelectedNode(node)}
        className={clsx(
          'p-3.5 rounded-xl border transition-all cursor-pointer relative group',
          isFailing ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse' :
          isDegraded ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/10' :
          'bg-slate-900/80 border-border/80 hover:border-cyan-500/40 hover:bg-slate-800/80',
          isSelected && 'ring-2 ring-cyan-400 shadow-cyan-500/20'
        )}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">{node.name}</span>
          <span className={clsx('h-2 w-2 rounded-full shrink-0', isFailing ? 'bg-rose-500' : isDegraded ? 'bg-amber-500' : 'bg-emerald-500')} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>:{node.port}</span>
          <span>{node.latency}ms</span>
        </div>
      </div>
    );
  }
}

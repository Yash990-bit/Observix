'use client';

import { Search, Filter, RefreshCw } from 'lucide-react';

interface LogFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedService: string;
  onServiceChange: (s: string) => void;
  selectedLevel: string;
  onLevelChange: (l: string) => void;
  onRefresh?: () => void;
}

const services = ['all', 'api-gateway', 'payment-service', 'auth-service', 'db-service', 'web-app', 'log-processor', 'ingestion-service'];
const levels = ['all', 'info', 'warn', 'error'];

export function LogFilter({
  searchQuery,
  onSearchChange,
  selectedService,
  onServiceChange,
  selectedLevel,
  onLevelChange,
  onRefresh,
}: LogFilterProps) {
  return (
    <div className="glass-panel rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3 min-w-[280px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search log messages, trace IDs, endpoints..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900/90 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-border rounded-lg px-3 py-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedService}
            onChange={(e) => onServiceChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            {services.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-slate-200">
                Service: {s === 'all' ? 'All Services' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-border rounded-lg px-3 py-1.5">
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            {levels.map((l) => (
              <option key={l} value={l} className="bg-slate-900 text-slate-200">
                Level: {l === 'all' ? 'All Levels' : l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-900/80 border border-border hover:bg-slate-800/80 text-slate-300 transition"
            title="Refresh logs from ClickHouse"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

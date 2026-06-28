'use client';

import { useState, useEffect } from 'react';
import { Radio, ShieldCheck, Wifi } from 'lucide-react';
import { subscribeToMetrics } from '../../lib/websocket/sse';

export function Header() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastPing, setLastPing] = useState<string>('Just now');

  useEffect(() => {
    const unsubscribe = subscribeToMetrics(() => {
      setIsConnected(true);
      setLastPing(new Date().toLocaleTimeString());
    });
    return unsubscribe;
  }, []);

  return (
    <header
      className="h-14 px-6 flex items-center justify-between sticky top-0 z-30"
      style={{
        background: 'rgba(15, 13, 11, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(194, 98, 42, 0.15)',
      }}
    >
      {/* Left: Stream Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: '#3d6b4f' }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: isConnected ? '#5a8a68' : '#c0392b' }}
            />
          </span>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest" style={{ color: isConnected ? '#8abf9e' : '#e87461' }}>
            {isConnected ? 'Live Stream Active' : 'Stream Disconnected'}
          </span>
        </div>
      </div>

      {/* Right: Status Pills */}
      <div className="flex items-center gap-2 text-[11px]">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(61, 107, 79, 0.1)',
            border: '1px solid rgba(61, 107, 79, 0.3)',
            color: '#8abf9e',
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-medium">ClickHouse · NATS Verified</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(194, 98, 42, 0.08)',
            border: '1px solid rgba(194, 98, 42, 0.25)',
            color: '#c8845a',
          }}
        >
          <Wifi className="h-3.5 w-3.5 animate-pulse" />
          <span className="font-medium font-mono">SSE {lastPing}</span>
        </div>
      </div>
    </header>
  );
}

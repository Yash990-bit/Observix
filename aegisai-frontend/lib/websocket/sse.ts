import { LogItem } from '../api/client';

const SSE_LOGS_URL = 'http://localhost:3005/stream/logs';
const SSE_METRICS_URL = 'http://localhost:3005/stream/metrics';

export function subscribeToLogs(onLog: (log: LogItem) => void): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource(SSE_LOGS_URL);

      eventSource.onmessage = (event) => {
        try {
          const parsed: LogItem = JSON.parse(event.data);
          onLog(parsed);
        } catch (err) {
          console.error('Failed to parse SSE log message:', err);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Auto-reconnect after 3 seconds if not explicitly closed
        if (!isClosed) {
          setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.warn('EventSource connection error:', err);
      if (!isClosed) {
        setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
  };
}

export function subscribeToMetrics(onMetrics: (metrics: any) => void): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource(SSE_METRICS_URL);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMetrics(parsed);
        } catch (err) {
          console.error('Failed to parse SSE metrics message:', err);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.warn('EventSource metrics connection error:', err);
      if (!isClosed) {
        setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
  };
}

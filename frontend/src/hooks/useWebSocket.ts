import { useEffect, useRef } from 'react';
import { useArohanStore } from '../stores/arohanStore';

function getWsUrl(): string {
  const envWsUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WS_URL;
  if (envWsUrl) {
    return envWsUrl;
  }
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'ws://localhost:8000/ws';
    }
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }
  return 'ws://localhost:8000/ws';
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const { setConnected, applyWsUpdate, fetchState, scenario_status } = useArohanStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsActiveRef = useRef<boolean>(false);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    // Initial fetch of state on mount
    fetchState().catch(() => {});

    // Polling fallback mechanism for serverless environments (e.g. Vercel)
    const startPollingFallback = () => {
      if (pollingRef.current) return;
      const intervalMs = scenario_status === 'RUNNING' ? 2500 : 5000;
      pollingRef.current = setInterval(async () => {
        if (!isMounted || wsActiveRef.current) return;
        try {
          await fetchState();
          setConnected(true);
        } catch {
          setConnected(false);
        }
      }, intervalMs);
    };

    const stopPollingFallback = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    const connect = () => {
      if (!isMounted) return;
      const targetUrl = getWsUrl();

      try {
        ws.current = new WebSocket(targetUrl);

        ws.current.onopen = () => {
          if (!isMounted) return;
          wsActiveRef.current = true;
          stopPollingFallback();
          setConnected(true);

          // Ping every 30s to keep alive
          const ping = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send('ping');
            }
          }, 30_000);
          ws.current!.addEventListener('close', () => clearInterval(ping));
        };

        ws.current.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.type === 'STATE_UPDATE' || data.scenario_step !== undefined) {
              applyWsUpdate(data);
              fetchState();
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.current.onclose = () => {
          wsActiveRef.current = false;
          // Fall back to HTTP polling if WebSocket is not available (e.g., on Vercel Serverless)
          startPollingFallback();
          if (isMounted) {
            reconnectTimeout = setTimeout(connect, 6000);
          }
        };

        ws.current.onerror = () => {
          wsActiveRef.current = false;
          startPollingFallback();
          ws.current?.close();
        };
      } catch {
        wsActiveRef.current = false;
        startPollingFallback();
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 6000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      stopPollingFallback();
      clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [scenario_status]);
}

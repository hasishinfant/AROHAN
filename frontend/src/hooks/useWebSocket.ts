import { useEffect, useRef } from 'react';
import { useArohanStore } from '../stores/arohanStore';

const WS_URL = 'ws://localhost:8000/ws';

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const { setConnected, applyWsUpdate, fetchState } = useArohanStore();

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
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
              // Always fetch enriched state from REST after a WS update
              fetchState();
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.current.onclose = () => {
          setConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.current.onerror = () => {
          ws.current?.close();
        };
      } catch {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      ws.current?.close();
    };
  }, []);
}

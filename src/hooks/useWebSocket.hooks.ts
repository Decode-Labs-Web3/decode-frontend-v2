"use client";

import { useEffect, useRef, useState } from "react";

type WSOptions = {
  onMessage?: (data: MessageEvent) => void;
  protocols?: string | string[];
};

export function useWebSocket(url: string, opts: WSOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let retry = 0;
    let stopped = false;

    const connect = () => {
      try {
        const ws = new WebSocket(url, opts.protocols);
        wsRef.current = ws;

        ws.onopen = () => {
          setReady(true);
          setError(null);
          retry = 0;
        };
        ws.onmessage = (e) => opts.onMessage?.(e);
        ws.onerror = () => setError("WebSocket error");
        ws.onclose = () => {
          setReady(false);
          if (stopped) return;
          const delay = Math.min(1000 * 2 ** retry, 10000);
          retry++;
          setTimeout(connect, delay);
        };
      } catch (error: unknown) {
        console.error("WebSocket connection error:", error);
        setError(
          error instanceof Error ? error.message : "Cannot open WebSocket"
        );
      }
    };

    connect();
    return () => {
      stopped = true;
      wsRef.current?.close();
    };
  }, [url, opts]);

  const send = (payload: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(typeof payload === "string" ? payload : JSON.stringify(payload));
    return true;
  };

  return { ready, error, send };
}

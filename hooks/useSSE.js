'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * React hook for Server-Sent Events (SSE) connection
 * @param {string} url - SSE endpoint URL (e.g. '/api/sse/tournament')
 * @param {Function} onMessage - Callback when data arrives: (parsedData) => void
 * @param {object} options - { enabled: true, maxRetries: 5 }
 * @returns {{ connected: boolean, lastEvent: object|null, error: string|null }}
 */
export default function useSSE(url, onMessage, options = {}) {
  const { enabled = true, maxRetries = 5 } = options;
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);
  const sourceRef = useRef(null);
  const retriesRef = useRef(0);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref fresh without re-triggering effect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    // Close existing connection
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    sourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
      retriesRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastEvent(data);
        onMessageRef.current?.(data);
      } catch {
        // Non-JSON data (heartbeat, etc.) — ignore
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      sourceRef.current = null;

      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
        setError(`Reconnecting in ${Math.round(delay / 1000)}s...`);
        // eslint-disable-next-line react-hooks/immutability
        setTimeout(connect, delay);
      } else {
        setError('Connection lost. Refresh the page to reconnect.');
      }
    };
  }, [url, enabled, maxRetries]);

  useEffect(() => {
    connect();

    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [connect]);

  return { connected, lastEvent, error };
}

import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

/**
 * Custom hook to subscribe to a WebSocket STOMP topic.
 * Automatically manages subscription lifecycle and unsubscribes on unmount.
 *
 * @param topic The STOMP topic to subscribe to (e.g. "/topic/decisions/1/votes"). If null/undefined, subscription is disabled.
 * @param onMessage Callback invoked when a message arrives on this topic.
 */
export function useWebSocketTopic<T = any>(
  topic: string | null | undefined,
  onMessage: (data: T) => void
) {
  const { subscribe, isConnected } = useWebSocket();
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topic) return;

    const unsubscribe = subscribe(topic, (data: T) => {
      onMessageRef.current(data);
    });

    return () => {
      unsubscribe();
    };
  }, [topic, subscribe, isConnected]);
}

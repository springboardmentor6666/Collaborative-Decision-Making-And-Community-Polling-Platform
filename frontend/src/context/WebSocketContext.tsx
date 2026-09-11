import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (topic: string, callback: (message: any) => void) => () => void;
  send: (destination: string, body?: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const pendingSubscriptionsRef = useRef<Map<string, Set<(message: any) => void>>>(new Map());

  // Determine WebSocket endpoint URL
  const getWsUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/ws';
    }
    return `${window.location.protocol}//${window.location.host}/ws`;
  };

  useEffect(() => {
    const token = localStorage.getItem('decisionhub_token');

    // Create new STOMP Client
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(getWsUrl()),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setIsConnected(true);
        console.log('✅ Real-time STOMP WebSocket connected successfully');

        // Re-subscribe all pending subscriptions on connect/reconnect
        pendingSubscriptionsRef.current.forEach((callbacks, topic) => {
          stompClient.subscribe(topic, (msg: IMessage) => {
            try {
              const parsed = JSON.parse(msg.body);
              callbacks.forEach((cb) => cb(parsed));
            } catch (err) {
              console.error('Error parsing STOMP message payload:', err);
            }
          });
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('🔌 STOMP WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.warn('STOMP Protocol Error:', frame.headers['message']);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  /**
   * Subscribe to a STOMP topic/destination.
   * Returns a clean unsubscribe function for cleanup on component unmount.
   */
  const subscribe = useCallback((topic: string, callback: (message: any) => void) => {
    if (!pendingSubscriptionsRef.current.has(topic)) {
      pendingSubscriptionsRef.current.set(topic, new Set());
    }
    pendingSubscriptionsRef.current.get(topic)!.add(callback);

    let stompSubscription: any = null;

    if (clientRef.current && clientRef.current.connected) {
      stompSubscription = clientRef.current.subscribe(topic, (msg: IMessage) => {
        try {
          const parsed = JSON.parse(msg.body);
          callback(parsed);
        } catch (err) {
          console.error('Error parsing incoming STOMP message:', err);
        }
      });
    }

    return () => {
      const callbacks = pendingSubscriptionsRef.current.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          pendingSubscriptionsRef.current.delete(topic);
        }
      }
      if (stompSubscription) {
        stompSubscription.unsubscribe();
      }
    };
  }, []);

  /**
   * Send a message to a destination
   */
  const send = useCallback((destination: string, body?: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      console.warn('Cannot send STOMP message: client not connected');
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

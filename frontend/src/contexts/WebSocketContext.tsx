import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Client as StompClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@clerk/clerk-react';

export type ConnectionStatus = 'Connecting' | 'Connected' | 'Reconnecting' | 'Disconnected' | 'Authentication Failed';

export interface EventEnvelope<T = any> {
  eventId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  version: number;
  actorId: string;
  targetId?: string;
  priority: string;
  payload: T;
}

interface WebSocketContextType {
  status: ConnectionStatus;
  client: Client | null;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  sendMessage: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { getToken, isSignedIn } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('Disconnected');
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setStatus('Disconnected');
      return;
    }

    let isMounted = true;

    const connect = async () => {
      try {
        setStatus('Connecting');
        const token = await getToken();

        if (!token) {
          setStatus('Authentication Failed');
          return;
        }

        const client = new StompClient({
          webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/ws`),
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            if (isMounted) setStatus('Connected');
          },
          onDisconnect: () => {
            if (isMounted) setStatus('Disconnected');
          },
          onStompError: (frame) => {
            console.error('STOMP Error:', frame);
            if (isMounted) setStatus('Authentication Failed');
          },
          onWebSocketClose: () => {
            if (isMounted) setStatus('Reconnecting');
          }
        });

        client.activate();
        clientRef.current = client;
      } catch (error) {
        console.error('Failed to connect to WebSocket', error);
        if (isMounted) setStatus('Disconnected');
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [isSignedIn, getToken]);

  const subscribe = (destination: string, callback: (message: IMessage) => void) => {
    if (clientRef.current && clientRef.current.connected) {
      return clientRef.current.subscribe(destination, callback);
    }
    return null;
  };

  const sendMessage = (destination: string, body: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  };

  return (
    <WebSocketContext.Provider value={{ status, client: clientRef.current, subscribe, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

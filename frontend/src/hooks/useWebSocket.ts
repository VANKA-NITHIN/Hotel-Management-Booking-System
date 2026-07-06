import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/api/ws';

interface UseWebSocketOptions {
  onNotification?: (notification: any) => void;
  enabled?: boolean;
  role?: string;
}

export function useWebSocket({ onNotification, enabled = true, role = 'ROLE_CUSTOMER' }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Prevent multiple connections
    if (clientRef.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // Subscribe to global notifications
        client.subscribe('/topic/notifications', (message) => {
          try {
            const notification = JSON.parse(message.body);
            onNotification?.(notification);
          } catch {
            // ignore parse errors
          }
        });

        // Subscribe to role-specific topics
        if (role === 'ROLE_ADMIN') {
          client.subscribe('/topic/admin', (message) => {
            try { onNotification?.(JSON.parse(message.body)); } catch {}
          });
        }
        
        if (role === 'ROLE_MANAGER') {
          client.subscribe('/topic/owner', (message) => {
            try { onNotification?.(JSON.parse(message.body)); } catch {}
          });
        }

        if (['ROLE_STAFF', 'ROLE_RECEPTION', 'ROLE_HOUSEKEEPING'].includes(role)) {
          client.subscribe('/topic/staff', (message) => {
            try { onNotification?.(JSON.parse(message.body)); } catch {}
          });
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [enabled, onNotification, role]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect, reconnect: connect };
}

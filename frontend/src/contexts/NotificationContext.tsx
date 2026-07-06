import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'BOOKING_NEW' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'ROOM_UPDATE' | 'SYSTEM_ALERT';
  message: string;
  read: boolean;
  timestamp: string;
  referenceId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Custom audio object for alert sounds
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio('/notification.mp3') : null);

  const handleNotification = (data: any) => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: data.type || 'SYSTEM_ALERT',
      message: data.message || 'New notification',
      read: false,
      timestamp: new Date().toISOString(),
      referenceId: data.referenceId
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound if supported
    if (audio) {
      audio.play().catch(e => console.log('Audio play failed (browser policy)', e));
    }

    // Show toast based on type
    switch (newNotification.type) {
      case 'BOOKING_NEW':
      case 'BOOKING_CONFIRMED':
        toast.success(newNotification.message, { duration: 5000, icon: '🎉' });
        break;
      case 'PAYMENT_FAILED':
      case 'BOOKING_CANCELLED':
        toast.error(newNotification.message, { duration: 5000 });
        break;
      default:
        toast(newNotification.message, { duration: 4000 });
    }
  };

  // Connect to websocket when signed in
  const { reconnect, disconnect } = useWebSocket({
    onNotification: handleNotification,
    enabled: !!isSignedIn,
    role: (user?.publicMetadata?.role as string) || 'ROLE_CUSTOMER'
  });

  useEffect(() => {
    if (isSignedIn) reconnect();
    else disconnect();
  }, [isSignedIn, reconnect, disconnect]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

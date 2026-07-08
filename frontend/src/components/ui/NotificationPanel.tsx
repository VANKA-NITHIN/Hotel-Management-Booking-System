import { useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  time: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onClose
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-bg-surface border border-border-base rounded-xl shadow-dropdown z-50 overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-border-base flex items-center justify-between bg-bg-surface-hover/30 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button 
              onClick={onMarkAllAsRead}
              className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-active rounded-md transition-colors"
              title="Mark all as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[400px] flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-bg-surface-hover flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-text-base font-medium">All caught up!</p>
            <p className="text-sm text-text-muted mt-1">You have no new notifications.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-base">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.li 
                  key={notification.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 transition-colors hover:bg-bg-surface-hover flex gap-3 ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                >
                  <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                  
                  <div className="flex-1 min-w-0">
                    {notification.link ? (
                      <Link to={notification.link} onClick={onClose} className="block group">
                        <p className="text-sm font-medium text-text-base group-hover:text-primary transition-colors line-clamp-1">{notification.title}</p>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notification.message}</p>
                      </Link>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-text-base line-clamp-1">{notification.title}</p>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notification.message}</p>
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider mt-2 block">
                      {notification.time}
                    </span>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="shrink-0 p-1 text-text-muted hover:text-text-base hover:bg-bg-surface-active rounded-md transition-colors h-fit"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      
      <div className="p-3 border-t border-border-base bg-bg-surface text-center shrink-0">
        <Link 
          to="/settings?tab=notifications" 
          onClick={onClose}
          className="text-xs font-medium text-primary hover:underline underline-offset-2"
        >
          View Notification Settings
        </Link>
      </div>
    </motion.div>
  );
}

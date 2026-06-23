import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Plane,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const typeIcon = {
  booking_confirmation: { Icon: Check, color: 'text-accent' },
  booking_cancellation: { Icon: XCircle, color: 'text-red-400' },
  flight_delay: { Icon: AlertTriangle, color: 'text-yellow-400' },
  flight_cancellation: { Icon: XCircle, color: 'text-red-400' },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent text-surface text-[10px] font-bold shadow-glow-teal">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] glass-strong border border-white/10 rounded-card shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dark transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="px-4 py-10 text-center text-muted text-sm">
                  <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  No notifications yet
                </div>
              ) : (
                recent.map((n) => {
                  const { Icon, color } = typeIcon[n.type] || {
                    Icon: Plane,
                    color: 'text-accent',
                  };
                  return (
                    <div
                      key={n._id}
                      className={`group flex gap-3 px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5 ${
                        n.isRead ? 'opacity-60' : 'bg-accent/5'
                      }`}
                    >
                      <span className={`mt-0.5 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-muted">{timeAgo(n.createdAt)}</span>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            aria-label="Mark as read"
                            className="text-muted hover:text-accent transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          aria-label="Delete notification"
                          className="text-muted hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-accent hover:text-accent-dark py-3 border-t border-white/10 transition-colors"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

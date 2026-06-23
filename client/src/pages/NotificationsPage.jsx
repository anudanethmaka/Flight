import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Plane,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

const typeMeta = {
  booking_confirmation: { Icon: Check, color: 'text-accent', label: 'Booking confirmed' },
  booking_cancellation: { Icon: XCircle, color: 'text-red-400', label: 'Booking cancelled' },
  flight_delay: { Icon: AlertTriangle, color: 'text-yellow-400', label: 'Flight delayed' },
  flight_cancellation: { Icon: XCircle, color: 'text-red-400', label: 'Flight cancelled' },
};

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-accent" />
              Notifications
            </h1>
            <p className="text-sm text-muted mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="secondary">
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <Card className="text-center py-16">
            <Bell className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
            <p className="text-foreground font-medium">No notifications yet</p>
            <p className="text-sm text-muted mt-1">
              Booking updates and flight alerts will appear here.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n, i) => {
              const meta = typeMeta[n.type] || {
                Icon: Plane,
                color: 'text-accent',
                label: 'Notification',
              };
              const { Icon, color, label } = meta;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Card
                    className={`flex items-start gap-4 ${
                      n.isRead ? 'opacity-70' : 'border border-accent/30'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 ${color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                          {label}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-accent shadow-glow-teal" />
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-xs text-muted">{formatDate(n.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          aria-label="Mark as read"
                          className="p-1.5 rounded-md text-muted hover:text-accent hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        aria-label="Delete notification"
                        className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Silently ignore - bell just shows no notifications
      console.log('[v0] notification fetch error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on login and poll every 60s while authenticated
  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.put('/notifications/read-all');
    } catch {
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    const removed = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

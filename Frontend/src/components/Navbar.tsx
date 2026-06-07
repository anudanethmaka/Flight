import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi } from '../services/api';
import { Plane, Bell, LogOut, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationApi.getMyNotifications();
      setNotifications(response.data);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        console.warn('Session expired. Logging out.');
        logout();
      } else {
        console.error('Failed to load notifications', err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll notifications every 15 seconds in background
    let interval: any;
    if (isAuthenticated) {
      interval = setInterval(fetchNotifications, 15000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Administrator') return '/dashboard/admin';
    if (user.role === 'Staff') return '/dashboard/staff';
    return '/dashboard/passenger';
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 text-airline-600 font-extrabold text-xl tracking-tight">
          <Plane className="h-6 w-6 transform rotate-45 text-airline-500 animate-pulse" />
          <span>SkyLink</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-slate-600 hover:text-airline-600 font-medium transition-colors">Home</Link>
          <Link to="/flights" className="text-slate-600 hover:text-airline-600 font-medium transition-colors">Search Flights</Link>
          
          {isAuthenticated && user && (
            <>
              <Link to={getDashboardLink()} className="text-slate-600 hover:text-airline-600 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="text-slate-600 hover:text-airline-600 font-medium transition-colors">
                Profile
              </Link>
            </>
          )}
        </div>

        {/* Right Action Panel */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:text-airline-600 rounded-full hover:bg-slate-100 transition-all duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xxs px-1.5 py-0.5 font-bold min-w-[16px] text-center scale-90">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                      <span className="text-xs text-slate-400 font-medium">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-400">No notifications yet.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                            className={`p-3 text-xs cursor-pointer transition-colors ${notif.isRead ? 'bg-white text-slate-500' : 'bg-blue-50 text-slate-700 hover:bg-blue-100/50'}`}
                          >
                            <p className="font-medium leading-relaxed mb-1">{notif.message}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User details & logout */}
              <div className="flex items-center space-x-3 bg-slate-100/80 rounded-full pl-3 pr-1 py-1 border border-slate-200/50">
                <span className="text-xs font-semibold text-slate-700">{user.fullName.split(' ')[0]}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-airline-600 bg-airline-100 px-2 py-0.5 rounded-full scale-95">{user.role}</span>
                <button 
                  onClick={logout}
                  className="p-1.5 bg-white text-slate-500 hover:text-red-500 rounded-full shadow-sm hover:shadow transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-airline-600 font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-airline-600 hover:bg-airline-700 text-white font-semibold text-sm px-4 py-2 rounded-full shadow-sm hover:shadow transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {isAuthenticated && unreadCount > 0 && (
            <span className="bg-red-500 text-white rounded-full text-xxs px-1.5 py-0.5 font-bold mr-1">
              {unreadCount}
            </span>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-airline-600 rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-t border-slate-100 mt-3 p-4 rounded-2xl shadow-xl flex flex-col space-y-3 animate-in slide-in-from-top-4 duration-300">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-semibold p-2 rounded-lg hover:bg-slate-50">Home</Link>
          <Link to="/flights" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-semibold p-2 rounded-lg hover:bg-slate-50">Search Flights</Link>
          
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-semibold p-2 rounded-lg hover:bg-slate-50">Dashboard</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-semibold p-2 rounded-lg hover:bg-slate-50">Profile</Link>
              <button 
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="w-full text-left text-red-600 font-semibold p-2 rounded-lg hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-slate-700 font-semibold p-2 rounded-lg hover:bg-slate-50">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center bg-airline-600 text-white font-semibold p-2 rounded-lg hover:bg-airline-700">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

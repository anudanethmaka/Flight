import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active ? 'text-accent' : 'text-muted hover:text-foreground'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 glass-strong border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-teal">
            <Plane className="w-5 h-5 text-white" strokeWidth={2.2} />
          </span>
          <span>
            Sky<span className="text-accent">Link</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          {navLink('/flights', 'Flights')}
          {user ? (
            <>
              {user.role === 'admin'
                ? navLink('/admin', 'Dashboard')
                : navLink('/dashboard', 'Dashboard')}
              {navLink('/profile', 'Profile')}
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-foreground px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              {navLink('/login', 'Login')}
              <Link
                to="/register"
                className="bg-accent text-surface px-4 py-1.5 rounded-lg hover:bg-accent-dark transition-colors text-sm font-semibold shadow-lg shadow-accent/30"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

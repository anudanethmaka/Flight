import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary text-white px-6 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl tracking-wide flex items-center gap-2">
          ✈️ SkyLink
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/flights" className="hover:text-accent transition-colors">Flights</Link>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="hover:text-accent transition-colors">Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
              )}
              <Link to="/profile" className="hover:text-accent transition-colors">Profile</Link>
              <button
                onClick={handleLogout}
                className="bg-accent text-white px-3 py-1 rounded-md hover:bg-amber-600 transition-colors text-sm cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent transition-colors">Login</Link>
              <Link
                to="/register"
                className="bg-accent text-white px-3 py-1 rounded-md hover:bg-amber-600 transition-colors text-sm"
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User as UserIcon, Lock, Sparkles, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const success = await login(username, password);
    if (success) {
      // Decode user details and redirect
      // Wait a moment for context to populate
      setTimeout(() => {
        // We can check local token details or just query context
        // In this case, useAuth will trigger re-render on app.tsx which redirects,
        // but let's force redirect here for a responsive user flow:
        // We'll read the profile after auth
        navigate('/');
      }, 100);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Banner Logo */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to search flights and manage bookings</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/45 bg-white/70 relative">
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
                />
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-airline-600 hover:bg-airline-700 disabled:bg-airline-400 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-airline-600 hover:text-airline-700 font-bold transition-colors">
              Create an account
            </Link>
          </div>
        </div>

        {/* Demo Helper Box */}
        <div className="p-4 bg-airline-50/50 border border-airline-100/60 rounded-2xl flex items-start space-x-3 text-xs text-airline-900 leading-relaxed shadow-sm">
          <Sparkles className="h-5 w-5 text-airline-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Evaluation Credentials Guide:</h4>
            <p>You can sign in using the seeded System Administrator account:</p>
            <div className="font-mono bg-white/80 p-2 rounded-lg border border-airline-100/50 mt-1 space-y-1 select-all">
              <div><span className="font-semibold">Username:</span> admin</div>
              <div><span className="font-semibold">Password:</span> AdminPassword123</div>
            </div>
            <p className="mt-1.5 text-xxs text-airline-600 font-medium">To test Passenger roles, click the "Create an account" link above.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

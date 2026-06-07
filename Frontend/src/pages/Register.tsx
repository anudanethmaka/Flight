
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, User as UserIcon, Mail, Lock, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!username || !email || !fullName || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const res = await register(username, email, password, fullName);
    if (res) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError('Username or Email is already registered.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Banner Logo */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500">Sign up as a passenger to book flights globally</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/45 bg-white/70">
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Account created successfully! Redirecting to Sign In...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
                />
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
                />
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Register Button */}
            <button 
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-airline-600 hover:bg-airline-700 disabled:bg-airline-400 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
            </button>
          </form>

          {/* Login Redirect */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-airline-600 hover:text-airline-700 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;

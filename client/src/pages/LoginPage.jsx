import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: 'admin@skylink.com',
        password: 'admin123',
      });
      login(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Please ensure the database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card className="p-8 border border-gray-100 shadow-xl rounded-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-accent"></div>
          
          <h1 className="text-2xl font-bold text-primary mb-2 text-center mt-2">Welcome Back</h1>
          <p className="text-sm text-muted text-center mb-6">Log in to manage your flights and bookings</p>
          
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full mt-2 py-2.5 flex justify-center items-center" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-muted font-medium uppercase">Testing Sandbox</span>
          </div>

          <button
            onClick={handleDemoAdmin}
            disabled={loading}
            className="w-full bg-amber-50 border border-amber-200 text-amber-800 rounded-lg py-2.5 px-4 text-sm font-semibold hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            🔑 Quick Demo Login (Admin)
          </button>
          
          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-light hover:underline font-semibold">Register</Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

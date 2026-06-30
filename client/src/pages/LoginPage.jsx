import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card className="p-8 rounded-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-accent"></div>
          
          <h1 className="text-2xl font-bold mb-2 text-center mt-2">Welcome Back</h1>
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

          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" state={{ from: location.state?.from }} className="text-primary-light hover:underline font-semibold">Register</Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

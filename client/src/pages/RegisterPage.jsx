import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import api from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', form);
      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
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

          <h1 className="text-2xl font-bold text-primary mb-2 text-center mt-2">Create Account</h1>
          <p className="text-sm text-muted text-center mb-6">Register to search and book flights instantly</p>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          {success && <Alert type="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 234 567 890"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
            />
            <Button type="submit" className="w-full mt-4 py-2.5 flex justify-center items-center" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:underline font-semibold">Sign In</Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Dev 2 will implement login logic with AuthContext
    console.log('Login:', { email, password });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">Welcome Back</h1>
          <Alert type="info" className="mb-4">Login functionality will be connected in Phase 2.</Alert>
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-2">
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-muted mt-4">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-light hover:underline">Register</Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

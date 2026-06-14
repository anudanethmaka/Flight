import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Dev 2 will implement register logic
    console.log('Register:', form);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">Create Account</h1>
          <Alert type="info" className="mb-4">Registration will be connected in Phase 2.</Alert>
          <form onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            <Input label="Phone (optional)" name="phone" type="tel" placeholder="+1 234 567 890" value={form.phone} onChange={handleChange} />
            <Button type="submit" className="w-full mt-2">Create Account</Button>
          </form>
          <p className="text-center text-sm text-muted mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:underline">Sign In</Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

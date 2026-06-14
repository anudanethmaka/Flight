import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function ProfilePage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">My Profile</h1>
        <Alert type="info" className="mb-6">Profile editing will be connected in Phase 2.</Alert>

        <Card className="p-8 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Personal Information</h2>
          <Input label="Full Name" placeholder="John Doe" />
          <Input label="Email" type="email" placeholder="you@example.com" disabled />
          <Input label="Phone" type="tel" placeholder="+1 234 567 890" />
          <Button className="mt-2">Update Profile</Button>
        </Card>

        <Card className="p-8">
          <h2 className="text-lg font-semibold text-primary mb-4">Change Password</h2>
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          <Button className="mt-2">Change Password</Button>
        </Card>
      </div>
    </Layout>
  );
}

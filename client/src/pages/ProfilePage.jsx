import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Personal Info state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Set initial form values when user object is available
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    try {
      const res = await api.put('/auth/profile', { name, phone });
      updateUser(res.data);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 text-center">
          <p className="text-muted">Loading profile info...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">My Profile</h1>

        {/* Personal Information */}
        <Card className="p-8 mb-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          {profileError && <Alert type="error" className="mb-4">{profileError}</Alert>}
          {profileSuccess && <Alert type="success" className="mb-4">{profileSuccess}</Alert>}
          
          <form onSubmit={handleProfileUpdate}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={profileLoading}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={user.email}
              disabled
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+1 234 567 890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={profileLoading}
            />
            <Button type="submit" disabled={profileLoading} className="mt-2">
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-8">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          {passwordError && <Alert type="error" className="mb-4">{passwordError}</Alert>}
          {passwordSuccess && <Alert type="success" className="mb-4">{passwordSuccess}</Alert>}

          <form onSubmit={handlePasswordChange}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordLoading}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordLoading}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={passwordLoading}
              required
            />
            <Button type="submit" disabled={passwordLoading} className="mt-2">
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

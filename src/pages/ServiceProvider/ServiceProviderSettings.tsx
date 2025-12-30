import React, { useState, useEffect } from 'react';
import { Save, User, Mail, MapPin, Lock, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '../../lib/api';
import { useAuth } from '../../components/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileSettings {
  name?: string;
  email?: string;
  address?: string;
}

interface NotificationSettings {
  email?: boolean;
  sms?: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ServiceProviderSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileSettings>({});
  const [notifications, setNotifications] = useState<NotificationSettings>({ email: false, sms: false });
  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, notificationsRes] = await Promise.all([
        api.get('/service-provider/profile').catch(() => ({ data: {} })),
        api.get('/service-provider/notifications').catch(() => ({ data: { email: false, sms: false } })),
      ]);
      setProfile(profileRes.data || {});
      setNotifications(notificationsRes.data || { email: false, sms: false });
    } catch (err: any) {
      console.error('Settings fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/service-provider/profile', profile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/service-provider/notifications', notifications);
      setSuccess('Notification settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update notification settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (security.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/service-provider/change-password', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSuccess('Password changed successfully!');
      setSecurity({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-8 w-8 text-purple-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your profile, notifications, and security settings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name || user?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications.email || false}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={notifications.sms || false}
              onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Notifications'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={security.currentPassword}
              onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={security.newPassword}
              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={security.confirmNewPassword}
              onChange={(e) => setSecurity({ ...security, confirmNewPassword: e.target.value })}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              <Lock className="h-4 w-4 mr-2" />
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceProviderSettings;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: '',
    phone: user?.mobileNumber || '',
  });

  const [farmInfo, setFarmInfo] = useState({
    farmName: '',
    address: '',
    farmType: '',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: false,
    sms: true,
    push: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileSettings();
  }, []);

  const fetchProfileSettings = async () => {
    try {
      setLoading(true);
      // Try to fetch profile, but handle 404 gracefully
      try {
        const response = await api.get('/farmer/profile');
        const data = response.data;
        if (data.personalInfo) {
          setPersonalInfo(prev => ({ ...prev, ...data.personalInfo }));
        }
        if (data.farmInfo) {
          setFarmInfo(prev => ({ ...prev, ...data.farmInfo }));
        }
        if (data.notificationPreferences) {
          setNotificationPreferences(prev => ({ ...prev, ...data.notificationPreferences }));
        }
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          console.error('Error fetching profile:', err);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handleFarmInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmInfo(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handleNotificationChange = (type: 'email' | 'sms' | 'push', checked: boolean) => {
    setNotificationPreferences(prev => ({ ...prev, [type]: checked }));
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/farmer/profile', {
        personalInfo,
        farmInfo,
        notificationPreferences,
      });
      setSuccess('Personal information updated successfully!');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (password.newPassword !== password.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (password.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/farmer/profile/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setSuccess('Password updated successfully!');
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Mobile Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      className="pl-10 h-12"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mobile number cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter your email address"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSavePersonalInfo}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Farm Information
              </CardTitle>
              <CardDescription>
                Additional information about your farm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmName" className="text-base font-semibold">
                    Farm Name
                  </Label>
                  <Input
                    id="farmName"
                    type="text"
                    value={farmInfo.farmName}
                    onChange={handleFarmInfoChange}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="farmType" className="text-base font-semibold">
                    Type of Farming
                  </Label>
                  <Input
                    id="farmType"
                    type="text"
                    value={farmInfo.farmType}
                    onChange={handleFarmInfoChange}
                    placeholder="e.g., Organic, Conventional"
                    className="mt-2 h-12"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-base font-semibold">
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={farmInfo.address}
                    onChange={handleFarmInfoChange}
                    placeholder="Enter your farm address"
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-base font-semibold">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={password.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-2 h-12"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-base font-semibold">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-2 h-12"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword" className="text-base font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={password.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="mt-2 h-12"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSavePassword}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="sms" className="text-base font-semibold">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive important updates via SMS
                  </p>
                </div>
                <Switch
                  id="sms"
                  checked={notificationPreferences.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={notificationPreferences.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="push" className="text-base font-semibold">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  id="push"
                  checked={notificationPreferences.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSavePersonalInfo}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;

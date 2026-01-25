import React, { useState, useEffect } from 'react';
import { Save, User, Mail, MapPin, Lock, Bell, Shield, Settings, ShieldCheck, Phone, CheckCircle, FileText, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';
import { useAuth } from '../../components/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileSettings {
  name?: string;
  email?: string;
  address?: string;
  businessName?: string;
  gstNumber?: string;
  panNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  insurerType?: string;
  serviceDescription?: string;
  state?: string;
  district?: string;
  serviceArea?: string;
  aiCertified?: boolean;
  phone?: string;
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

const InsurerSettings: React.FC = () => {
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
        api.get('/insurer/profile').catch(() => ({ data: {} })),
        api.get('/insurer/notifications').catch(() => ({ data: { email: false, sms: false } })),
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
      await api.put('/insurer/profile', profile);
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
      await api.put('/insurer/notifications', notifications);
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
      await api.put('/auth/change-password', {
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

  const DetailItem = ({ label, value, icon: Icon, fullWidth = false, theme = 'blue' }: { label: string, value: any, icon?: any, fullWidth?: boolean, theme?: string }) => {
    const bgColors: any = {
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      rose: 'bg-rose-50 text-rose-600',
      amber: 'bg-amber-50 text-amber-600',
    };

    return (
      <div className={`${fullWidth ? 'col-span-full' : ''} p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center gap-2 mb-2">
          {Icon && <div className={`p-1.5 rounded ${bgColors[theme] || bgColors.blue}`}><Icon className="h-4 w-4" /></div>}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        </div>
        <div className="text-sm font-semibold text-gray-900 break-words">
          {value || 'N/A'}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in bg-gray-50/30 min-h-screen">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-purple-100 rounded-lg text-purple-700">
                <Settings className="h-8 w-8" />
              </span>
              System Settings
            </h1>
            <p className="text-gray-500 mt-1 ml-14">Configure your corporate profile, security, and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="text-sm px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 uppercase tracking-wider font-bold">Secure Session</Badge>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <p className="text-red-800 font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <p className="text-green-800 font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {success}
            </p>
          </div>
        )}

        {/* Profile Settings */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg overflow-hidden group">
          <CardHeader className="bg-purple-50/50 border-b border-purple-100">
            <CardTitle className="flex items-center gap-2 text-purple-900 group-hover:text-purple-700 transition-colors">
              <User className="h-5 w-5" />
              Corporate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Business Name" value={profile.businessName} icon={Building2} theme="purple" />
              <DetailItem label="Insurer Type" value={profile.insurerType} icon={Shield} theme="purple" />
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Contact Person</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={profile.name || user?.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="pl-10 bg-white border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                    placeholder="Enter contact name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-10 bg-white border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                    placeholder="corporate@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10 bg-white border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Office Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="pl-10 bg-white border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                    placeholder="Complete corporate address"
                  />
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <Label htmlFor="serviceDescription" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Services Provided</Label>
                <textarea
                  id="serviceDescription"
                  value={profile.serviceDescription || ''}
                  onChange={(e) => setProfile({ ...profile, serviceDescription: e.target.value })}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium min-h-[100px]"
                  placeholder="Describe your insurance products and services..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Operating State</Label>
                <Input
                  id="state"
                  value={profile.state || ''}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="bg-white border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Operating District</Label>
                <Input
                  id="district"
                  value={profile.district || ''}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  className="bg-white border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-1 space-y-2">
                <Label htmlFor="serviceArea" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Service Area (Districts/GPs)</Label>
                <textarea
                  id="serviceArea"
                  value={profile.serviceArea || ''}
                  onChange={(e) => setProfile({ ...profile, serviceArea: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                  rows={2}
                  placeholder="List operating zones..."
                />
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Legal & Compliance Data
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailItem label="GST Number" value={profile.gstNumber} icon={FileText} theme="amber" />
                <DetailItem label="PAN Number" value={profile.panNumber} icon={FileText} theme="amber" />
                <DetailItem label="License ID" value={profile.licenseNumber} icon={Shield} theme="amber" />
                <DetailItem
                  label="License Expiry"
                  value={profile.licenseExpiryDate ? new Date(profile.licenseExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null}
                  icon={Calendar}
                  theme="amber"
                />
              </div>

              <div className="mt-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${profile.aiCertified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">AI Verification Status</p>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tight">Certified for PMFBY/IRDAI AI Guidelines</p>
                  </div>
                </div>
                <Badge className={profile.aiCertified ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                  {profile.aiCertified ? "CERTIFIED" : "NOT CERTIFIED"}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-purple-600 hover:bg-purple-700 font-bold px-8 shadow-md">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Updating...' : 'Save Profile Details'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <Card className="border-l-4 border-l-emerald-500 shadow-lg group">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-2 text-emerald-900 group-hover:text-emerald-700 transition-colors">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-bold text-gray-900">Email Alerts</Label>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tight">System & Priority updates</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email || false}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor="sms-notifications" className="text-sm font-bold text-gray-900">SMS Alerts</Label>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tight">Mobile priority notifications</p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms || false}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleSaveNotifications} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6 shadow-md">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Update Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-l-4 border-l-rose-500 shadow-lg group">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100">
              <CardTitle className="flex items-center gap-2 text-rose-900 group-hover:text-rose-700 transition-colors">
                <ShieldCheck className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" title="Enter current password" tracking-tight="true" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Current Password</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-rose-500 transition-colors" />
                    <Input
                      id="current-password"
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      className="pl-10 bg-white border-gray-200 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" title="Enter new password" tracking-tight="true" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</Label>
                  <div className="relative group/input">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-rose-500 transition-colors" />
                    <Input
                      id="new-password"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="pl-10 bg-white border-gray-200 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" title="Confirm new password" tracking-tight="true" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</Label>
                  <div className="relative group/input">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-rose-500 transition-colors" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={security.confirmNewPassword}
                      onChange={(e) => setSecurity({ ...security, confirmNewPassword: e.target.value })}
                      className="pl-10 bg-white border-gray-200 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleChangePassword} disabled={saving} className="bg-rose-600 hover:bg-rose-700 font-bold px-6 shadow-md">
                  <Lock className="h-4 w-4 mr-2" />
                  {saving ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
};

export default InsurerSettings;

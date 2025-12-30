import React, { useState, useEffect } from 'react';
import { Save, Settings, Mail, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const AdminSystemSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ClaimEasy',
    dateFormat: 'DD/MM/YYYY',
    itemsPerPage: 10,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    sendNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordPolicy: 'Strong',
    sessionTimeout: 30,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // const response = await api.get('/admin/settings');
      // setGeneralSettings(response.data.generalSettings);
      // setEmailSettings(response.data.emailSettings);
      // setSecuritySettings(response.data.securitySettings);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err?.response?.data?.message || "Failed to fetch settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, save to API
      // await api.put('/admin/settings', {
      //   generalSettings,
      //   emailSettings,
      //   securitySettings,
      // });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={generalSettings.dateFormat}
                onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Input
                id="itemsPerPage"
                type="number"
                value={generalSettings.itemsPerPage}
                onChange={(e) => setGeneralSettings({ ...generalSettings, itemsPerPage: parseInt(e.target.value) || 10 })}
                min="5"
                max="50"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) || 587 })}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendNotifications"
                checked={emailSettings.sendNotifications}
                onChange={(e) => setEmailSettings({ ...emailSettings, sendNotifications: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="sendNotifications">Send Email Notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
            </div>
            <div>
              <Label htmlFor="passwordPolicy">Password Policy</Label>
              <Select
                value={securitySettings.passwordPolicy}
                onValueChange={(value) => setSecuritySettings({ ...securitySettings, passwordPolicy: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strong">Strong</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Weak">Weak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                min="5"
                max="120"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSystemSettings;

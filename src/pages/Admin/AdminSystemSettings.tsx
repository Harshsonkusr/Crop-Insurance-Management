import React, { useState, useEffect } from 'react';
import {
  Save, Settings, Mail, Shield, Globe, Landmark, ShieldCheck,
  History, Info, AlertTriangle, Calculator, FileText, User,
  Calendar, CreditCard, Building2, Phone, Lock, Eye, EyeOff,
  CheckCircle2, Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import api from '../../lib/api';

const AdminSystemSettings = () => {
  const [activeTab, setActiveTab] = useState('pmfby');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- PMFBY Specific Settings ---
  const [pmfbySettings, setPmfbySettings] = useState({
    currentSeason: 'Kharif',
    financialYear: '2024-25',
    enrollmentStartDate: '2024-04-01',
    enrollmentEndDate: '2024-07-31',
    premiumRates: {
      kharif: 2.0,
      rabi: 1.5,
      commercial: 5.0,
      horticultural: 5.0
    },
    subsidySharing: {
      central: 50,
      state: 50,
      specialCategory: 90 // For NE States/J&K (Changed to 90:10 usually)
    },
    indemnityLevels: [70, 80, 90],
    defaultIndemnity: 80,
    sumInsuredMethod: 'scale_of_finance',
    claimSettlementTimeline: 60,
    preventedSowingLimit: 25,
    postHarvestDuration: 14,
    areaApproachUnit: 'village_panchayat',
    cscCommission: 30, // Rs per application
  });

  // --- Profile Settings (Merged) ---
  const [profileData, setProfileData] = useState({
    fullName: 'Aditya Sharma',
    email: 'aditya.sharma@pmfby.gov.in',
    phone: '+91 98765 43210',
    designation: 'Senior System Administrator',
    department: 'National Crop Insurance Division',
    employeeId: 'ADM-2024-0892',
    role: 'HQ Admin',
    location: 'New Delhi, HQ',
    joinedDate: 'January 15, 2022'
  });

  // --- General Settings ---
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'PMFBY Management Portal',
    dateFormat: 'DD/MM/YYYY',
    itemsPerPage: 10,
    language: 'English',
    timezone: 'Asia/Kolkata',
    maintenanceMode: false
  });

  // --- Notification Settings ---
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.pmfby.gov.in',
    smtpPort: 587,
    smtpUser: 'notifications@pmfby.gov.in',
    sendNotifications: true,
    alertThreshold: 100000
  });

  // --- Security Settings ---
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: 'Strong',
    sessionTimeout: 30,
    aadhaarVerificationMandatory: true,
    auditLogging: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // const response = await api.get('/admin/settings');
      // setPmfbySettings(response.data.pmfbySettings);
      // ...
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err?.response?.data?.message || "Failed to fetch settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // await api.put('/admin/settings', { ...allSettings });
      setSuccess('All settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('Both current and new passwords are required.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Settings className="h-8 w-8" />
            </span>
            Settings & Configuration
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Manage PMFBY scheme parameters, admin profile, and system preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="shadow-lg bg-blue-700 hover:bg-blue-800">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-slide-up">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-emerald-800 text-sm font-medium">{success}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 bg-gray-100 rounded-xl mb-6">
          <TabsTrigger value="pmfby" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
            <Landmark className="h-4 w-4" />
            <span className="hidden md:inline">PMFBY Scheme</span>
            <span className="md:hidden">Scheme</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">My Profile</span>
            <span className="md:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
            <span className="md:hidden">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
            <span className="md:hidden">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
            <span className="md:hidden">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* --- Tab 1: PMFBY Scheme Settings --- */}
        <TabsContent value="pmfby" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Season & Timeline Card */}
            <Card className="lg:col-span-3 border-blue-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Season & Enrollment Configuration
                </CardTitle>
                <CardDescription>Set the active season and enrollment deadlines for farmers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Financial Year</Label>
                    <Select
                      value={pmfbySettings.financialYear}
                      onValueChange={(val) => setPmfbySettings({ ...pmfbySettings, financialYear: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Active Season</Label>
                    <Select
                      value={pmfbySettings.currentSeason}
                      onValueChange={(val) => setPmfbySettings({ ...pmfbySettings, currentSeason: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">Kharif (Summer)</SelectItem>
                        <SelectItem value="Rabi">Rabi (Winter)</SelectItem>
                        <SelectItem value="Zaid">Zaid (Summer)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Enrollment Start Date</Label>
                    <Input
                      type="date"
                      value={pmfbySettings.enrollmentStartDate}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, enrollmentStartDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Enrollment Cut-off Date</Label>
                    <Input
                      type="date"
                      value={pmfbySettings.enrollmentEndDate}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, enrollmentEndDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Rates */}
            <Card className="lg:col-span-2 border-none shadow-xl bg-white border-l-4 border-l-blue-500 overflow-hidden group">
              <CardHeader className="bg-blue-50/30">
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-blue-700 transition-colors">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Premium Rates (Farmer Share Cap)
                </CardTitle>
                <CardDescription>Maximum premium % payable by farmers as per PMFBY guidelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kharif Crops</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" step="0.1"
                        value={pmfbySettings.premiumRates.kharif}
                        onChange={(e) => setPmfbySettings({
                          ...pmfbySettings,
                          premiumRates: { ...pmfbySettings.premiumRates, kharif: parseFloat(e.target.value) }
                        })}
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rabi Crops</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" step="0.1"
                        value={pmfbySettings.premiumRates.rabi}
                        onChange={(e) => setPmfbySettings({
                          ...pmfbySettings,
                          premiumRates: { ...pmfbySettings.premiumRates, rabi: parseFloat(e.target.value) }
                        })}
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Commercial</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" step="0.1"
                        value={pmfbySettings.premiumRates.commercial}
                        onChange={(e) => setPmfbySettings({
                          ...pmfbySettings,
                          premiumRates: { ...pmfbySettings.premiumRates, commercial: parseFloat(e.target.value) }
                        })}
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Horticultural</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" step="0.1"
                        value={pmfbySettings.premiumRates.horticultural}
                        onChange={(e) => setPmfbySettings({
                          ...pmfbySettings,
                          premiumRates: { ...pmfbySettings.premiumRates, horticultural: parseFloat(e.target.value) }
                        })}
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subsidy Sharing */}
            <Card className="border-none shadow-xl bg-white border-l-4 border-l-emerald-500 overflow-hidden group">
              <CardHeader className="bg-emerald-50/30">
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-emerald-700 transition-colors">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Subsidy Sharing
                </CardTitle>
                <CardDescription>Central vs State Share</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Central Share</Label>
                  <div className="flex items-center w-24">
                    <Input
                      value={pmfbySettings.subsidySharing.central}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, subsidySharing: { ...pmfbySettings.subsidySharing, central: parseInt(e.target.value) } })}
                    />
                    <span className="ml-2 text-gray-500">%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Label>State Share</Label>
                  <div className="flex items-center w-24">
                    <Input
                      value={pmfbySettings.subsidySharing.state}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, subsidySharing: { ...pmfbySettings.subsidySharing, state: parseInt(e.target.value) } })}
                    />
                    <span className="ml-2 text-gray-500">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Parameters */}
            <Card className="lg:col-span-3 border-none shadow-xl bg-white border-l-4 border-l-orange-500 overflow-hidden group">
              <CardHeader className="bg-orange-50/30">
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-orange-700 transition-colors">
                  <History className="h-5 w-5 text-orange-600" />
                  Operational Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Claim Settlement Timeline (Days)</Label>
                    <Input
                      type="number"
                      value={pmfbySettings.claimSettlementTimeline}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, claimSettlementTimeline: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CSC Commission (₹)</Label>
                    <Input
                      type="number"
                      value={pmfbySettings.cscCommission}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, cscCommission: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prevented Sowing Limit (%)</Label>
                    <Input
                      type="number"
                      value={pmfbySettings.preventedSowingLimit}
                      onChange={(e) => setPmfbySettings({ ...pmfbySettings, preventedSowingLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sum Insured Basis</Label>
                    <Select
                      value={pmfbySettings.sumInsuredMethod}
                      onValueChange={(val) => setPmfbySettings({ ...pmfbySettings, sumInsuredMethod: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scale_of_finance">Scale of Finance (SoF)</SelectItem>
                        <SelectItem value="notional_average_yield">Notional Average Yield</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Tab 2: Profile Settings --- */}
        <TabsContent value="profile" className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-6 rounded-xl border shadow-sm">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-blue-50">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">AS</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border shadow-md hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                  {profileData.role}
                </Badge>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {profileData.designation}
                </span>
              </div>
              <p className="text-sm text-gray-400">Employee ID: {profileData.employeeId}</p>
            </div>
          </div>

          <Card className="border-none shadow-xl bg-white border-l-4 border-l-blue-500 overflow-hidden group">
            <CardHeader className="bg-blue-50/30">
              <CardTitle className="group-hover:text-blue-700 transition-colors">Personal Information</CardTitle>
              <CardDescription>Update your contact details and work location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab 3: General Settings --- */}
        <TabsContent value="general" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi / हिन्दी</SelectItem>
                      <SelectItem value="Marathi">Marathi / मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Maintenance Mode</Label>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm text-gray-600">Suspend all user access</span>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(c) => setGeneralSettings({ ...generalSettings, maintenanceMode: c })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab 4: Notifications --- */}
        <TabsContent value="notifications" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Notification Gateway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) || 587 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sender Email</Label>
                <Input
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Enable System Notifications</Label>
                  <p className="text-sm text-gray-500">Send automated emails for claims and registrations</p>
                </div>
                <Switch
                  checked={emailSettings.sendNotifications}
                  onCheckedChange={(c) => setEmailSettings({ ...emailSettings, sendNotifications: c })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab 5: Security --- */}
        <TabsContent value="security" className="space-y-6 animate-fade-in">
          <Card className="border-none shadow-xl bg-white border-l-4 border-l-rose-500 overflow-hidden group">
            <CardHeader className="bg-rose-50/30">
              <CardTitle className="flex items-center gap-2 group-hover:text-rose-700 transition-colors">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
                Account Security
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={saving} variant="outline" size="sm" className="mt-2">
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">System Security Policies</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all admin logins</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(c) => setSecuritySettings({ ...securitySettings, twoFactorAuth: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mandatory Aadhaar Verification</Label>
                    <p className="text-sm text-gray-500">Require Aadhaar for farmer registration</p>
                  </div>
                  <Switch
                    checked={securitySettings.aadhaarVerificationMandatory}
                    onCheckedChange={(c) => setSecuritySettings({ ...securitySettings, aadhaarVerificationMandatory: c })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystemSettings;

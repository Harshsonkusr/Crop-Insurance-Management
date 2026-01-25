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
import FarmBoundaryMap from '@/components/FarmBoundaryMap';
import { useMemo } from 'react';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: '',
    phone: user?.mobileNumber || '',
    gender: '',
    dateOfBirth: '',
  });

  const [farmInfo, setFarmInfo] = useState({
    farmName: '',
    address: '',
    farmType: '',
    village: '',
    tehsil: '',
    district: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    farmSize: '',
    area: '',
    cropType: '',
    cropName: '',
    cropVariety: '',
    cropSeason: '',
    wildAnimalAttackCoverage: false,
    landRecordKhasra: '',
    landRecordKhatauni: '',
    surveyNumber: '',
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    insuranceLinked: 'No',
    insuranceUnit: '',
    landAreaSize: '',
    satbaraImage: '',
    patwariMapImage: '',
    sowingCertificate: '',
    bankPassbookImage: '',
    aadhaarCardImage: '',
    casteCategory: '',
    farmerType: '',
    farmerCategory: '',
    loaneeStatus: '',
    landImages: {
      image1: '',
      image1Gps: '',
      image2: '',
      image2Gps: '',
      image3: '',
      image3Gps: '',
      image4: '',
      image4Gps: '',
      image5: '',
      image5Gps: '',
      image6: '',
      image6Gps: '',
      image7: '',
      image7Gps: '',
      image8: '',
      image8Gps: '',
    }
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

  const boundaryCoordinates = useMemo(() => {
    const coords: { lat: number; lng: number }[] = [];
    const gpsKeys = ['image1Gps', 'image2Gps', 'image3Gps', 'image4Gps', 'image5Gps', 'image6Gps', 'image7Gps', 'image8Gps'] as const;
    gpsKeys.forEach((key) => {
      const val = farmInfo.landImages[key];
      if (val && val.includes(',')) {
        const [latStr, lngStr] = val.split(',');
        const lat = parseFloat(latStr.trim());
        const lng = parseFloat(lngStr.trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push({ lat, lng });
        }
      }
    });
    return coords;
  }, [farmInfo.landImages]);

  useEffect(() => {
    fetchProfileSettings();
  }, []);

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Handle absolute paths stored in DB (e.g., F:/.../uploads/image.jpg)
    let cleanPath = path;
    const uploadsIndex = path.indexOf('uploads');
    if (uploadsIndex !== -1) {
      // Extract part starting from 'uploads'
      cleanPath = path.substring(uploadsIndex);
    }

    // Ensure path starts with / if needed, but cleanPath might already contain 'uploads/...'
    // API serves static files at /uploads

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
  };

  const fetchProfileSettings = async () => {
    try {
      setLoading(true);
      try {
        const response = await api.get('/farmer/profile');
        const data = response.data;
        if (data.personalInfo) {
          setPersonalInfo(prev => ({ ...prev, ...data.personalInfo }));
        }
        if (data.farmInfo) {
          const backendLandImages = data.farmInfo.landImages || {};

          setFarmInfo(prev => ({
            ...prev,
            ...data.farmInfo,
            // Ensure boolean conversion if necessary
            wildAnimalAttackCoverage: data.farmInfo.wildAnimalAttackCoverage === true || data.farmInfo.wildAnimalAttackCoverage === 'true',
            landImages: {
              ...prev.landImages,
              ...backendLandImages,
              image1: data.farmInfo.landImage1 || backendLandImages.image1 || prev.landImages.image1,
              image1Gps: data.farmInfo.landImage1Gps || backendLandImages.image1Gps || prev.landImages.image1Gps,
              image2: data.farmInfo.landImage2 || backendLandImages.image2 || prev.landImages.image2,
              image2Gps: data.farmInfo.landImage2Gps || backendLandImages.image2Gps || prev.landImages.image2Gps,
              image3: data.farmInfo.landImage3 || backendLandImages.image3 || prev.landImages.image3,
              image3Gps: data.farmInfo.landImage3Gps || backendLandImages.image3Gps || prev.landImages.image3Gps,
              image4: data.farmInfo.landImage4 || backendLandImages.image4 || prev.landImages.image4,
              image4Gps: data.farmInfo.landImage4Gps || backendLandImages.image4Gps || prev.landImages.image4Gps,
              image5: data.farmInfo.landImage5 || backendLandImages.image5 || prev.landImages.image5,
              image5Gps: data.farmInfo.landImage5Gps || backendLandImages.image5Gps || prev.landImages.image5Gps,
              image6: data.farmInfo.landImage6 || backendLandImages.image6 || prev.landImages.image6,
              image6Gps: data.farmInfo.landImage6Gps || backendLandImages.image6Gps || prev.landImages.image6Gps,
              image7: data.farmInfo.landImage7 || backendLandImages.image7 || prev.landImages.image7,
              image7Gps: data.farmInfo.landImage7Gps || backendLandImages.image7Gps || prev.landImages.image7Gps,
              image8: data.farmInfo.landImage8 || backendLandImages.image8 || prev.landImages.image8,
              image8Gps: data.farmInfo.landImage8Gps || backendLandImages.image8Gps || prev.landImages.image8Gps,
            }
          }));
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

  const handleFarmInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id.startsWith('landImage')) {
      const [_, field] = id.split('-');
      setFarmInfo(prev => ({
        ...prev,
        landImages: {
          ...prev.landImages,
          [field]: value
        }
      }));
    } else {
      setFarmInfo(prev => ({ ...prev, [id]: value }));
    }
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
                <div>
                  <Label htmlFor="gender" className="text-base font-semibold">Gender</Label>
                  <Input
                    id="gender"
                    type="text"
                    value={personalInfo.gender}
                    onChange={handlePersonalInfoChange}
                    className="mt-2 h-12"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-base font-semibold">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="text"
                    value={personalInfo.dateOfBirth}
                    onChange={handlePersonalInfoChange}
                    className="mt-2 h-12"
                    disabled
                  />
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
                Detailed information about your farm and location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">PMFBY Registration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="casteCategory" className="text-sm font-medium">Caste Category</Label>
                    <Input
                      id="casteCategory"
                      value={farmInfo.casteCategory || ''}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.casteCategory ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.casteCategory}
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmerType" className="text-sm font-medium">Farmer Type</Label>
                    <Input
                      id="farmerType"
                      value={farmInfo.farmerType || ''}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.farmerType ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.farmerType}
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmerCategory" className="text-sm font-medium">Farmer Category</Label>
                    <Input
                      id="farmerCategory"
                      value={farmInfo.farmerCategory || ''}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.farmerCategory ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.farmerCategory}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loaneeStatus" className="text-sm font-medium">Loanee Status</Label>
                    <Input
                      id="loaneeStatus"
                      value={farmInfo.loaneeStatus || ''}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.loaneeStatus ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.loaneeStatus}
                    />
                  </div>
                </div>
              </div>
              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="village" className="text-sm font-medium">Village</Label>
                    <Input
                      id="village"
                      value={farmInfo.village}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.village ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.village}
                    />
                    {farmInfo.village && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="tehsil" className="text-sm font-medium">Tehsil</Label>
                    <Input
                      id="tehsil"
                      value={farmInfo.tehsil}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.tehsil ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.tehsil}
                    />
                    {farmInfo.tehsil && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-sm font-medium">District</Label>
                    <Input
                      id="district"
                      value={farmInfo.district}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.district ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.district}
                    />
                    {farmInfo.district && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Input
                      id="state"
                      value={farmInfo.state}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.state ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.state}
                    />
                    {farmInfo.state && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-sm font-medium">Pincode</Label>
                    <Input
                      id="pincode"
                      value={farmInfo.pincode}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.pincode ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.pincode}
                    />
                    {farmInfo.pincode && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Full Address</Label>
                    <Input
                      id="address"
                      value={farmInfo.address}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.address ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.address}
                    />
                    {farmInfo.address && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                    <Input
                      id="latitude"
                      value={farmInfo.latitude}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.latitude ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.latitude}
                    />
                    {farmInfo.latitude && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                    <Input
                      id="longitude"
                      value={farmInfo.longitude}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.longitude ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.longitude}
                    />
                    {farmInfo.longitude && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                </div>
              </div>

              {/* Crop & Land Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Crop & Land Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cropType" className="text-sm font-medium">Crop Type</Label>
                    <Input
                      id="cropType"
                      value={farmInfo.cropType}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.cropType ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.cropType}
                    />
                    {farmInfo.cropType && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="cropName" className="text-sm font-medium">Crop Name</Label>
                    <Input
                      id="cropName"
                      value={farmInfo.cropName}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.cropName ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.cropName}
                    />
                    {farmInfo.cropName && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="cropVariety" className="text-sm font-medium">Crop Variety</Label>
                    <Input
                      id="cropVariety"
                      value={farmInfo.cropVariety || ''}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.cropVariety ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.cropVariety}
                    />
                    {farmInfo.cropVariety && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="cropSeason" className="text-sm font-medium">Crop Season</Label>
                    <Input
                      id="cropSeason"
                      value={farmInfo.cropSeason}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.cropSeason ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.cropSeason}
                    />
                    {farmInfo.cropSeason && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="landRecordKhasra" className="text-sm font-medium">Land Record (Khasra)</Label>
                    <Input
                      id="landRecordKhasra"
                      value={farmInfo.landRecordKhasra}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.landRecordKhasra ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.landRecordKhasra}
                    />
                    {farmInfo.landRecordKhasra && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="landRecordKhatauni" className="text-sm font-medium">Land Record (Khatauni)</Label>
                    <Input
                      id="landRecordKhatauni"
                      value={farmInfo.landRecordKhatauni}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.landRecordKhatauni ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.landRecordKhatauni}
                    />
                    {farmInfo.landRecordKhatauni && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="surveyNumber" className="text-sm font-medium">Survey Number</Label>
                    <Input
                      id="surveyNumber"
                      value={farmInfo.surveyNumber}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.surveyNumber ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.surveyNumber}
                    />
                    {farmInfo.surveyNumber && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="insuranceUnit" className="text-sm font-medium">Insurance Unit</Label>
                    <Input
                      id="insuranceUnit"
                      value={farmInfo.insuranceUnit}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.insuranceUnit ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.insuranceUnit}
                    />
                    {farmInfo.insuranceUnit && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="landAreaSize" className="text-sm font-medium">Land Area Size</Label>
                    <Input
                      id="landAreaSize"
                      value={farmInfo.landAreaSize}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.landAreaSize ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.landAreaSize}
                    />
                    {farmInfo.landAreaSize && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="farmSize" className="text-sm font-medium">Farm Size (Acres)</Label>
                    <Input
                      id="farmSize"
                      value={farmInfo.farmSize}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.farmSize ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.farmSize}
                    />
                    {farmInfo.farmSize && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={farmInfo.bankName}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.bankName ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.bankName}
                    />
                    {farmInfo.bankName && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="bankAccountNo" className="text-sm font-medium">Account Number</Label>
                    <Input
                      id="bankAccountNo"
                      value={farmInfo.bankAccountNo}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.bankAccountNo ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.bankAccountNo}
                    />
                    {farmInfo.bankAccountNo && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="bankIfsc" className="text-sm font-medium">IFSC Code</Label>
                    <Input
                      id="bankIfsc"
                      value={farmInfo.bankIfsc}
                      onChange={handleFarmInfoChange}
                      className={`mt-1 h-11 ${farmInfo.bankIfsc ? 'bg-gray-50' : ''}`}
                      readOnly={!!farmInfo.bankIfsc}
                    />
                    {farmInfo.bankIfsc && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="insuranceLinked" className="text-sm font-medium">Insurance Linked</Label>
                    <select
                      id="insuranceLinked"
                      value={farmInfo.insuranceLinked}
                      onChange={handleFarmInfoChange}
                      disabled={farmInfo.insuranceLinked === 'Yes'}
                      className={`flex h-11 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 ${farmInfo.insuranceLinked === 'Yes' ? 'bg-gray-50' : ''}`}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {farmInfo.insuranceLinked === 'Yes' && <p className="text-[10px] text-gray-500 mt-1">Registration data - cannot be changed</p>}
                  </div>
                  <div>
                    <Label htmlFor="wildAnimalAttackCoverage" className="text-sm font-medium">Wild Animal Attack Coverage</Label>
                    <div className="flex items-center h-11 mt-1 px-3 border rounded-md bg-gray-50">
                      <span className={farmInfo.wildAnimalAttackCoverage ? "text-green-600 font-semibold" : "text-gray-500"}>
                        {farmInfo.wildAnimalAttackCoverage ? "Included In Policy" : "Not Covered"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Registration preference</p>
                  </div>
                </div>
              </div>

              {/* Farm Documents & Images Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold border-b pb-2">Registration Documents & Photos</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Satbara 7/12 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Satbara (7/12) Extract</Label>
                    {farmInfo.satbaraImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border shadow-sm group">
                        <img
                          src={getImageUrl(farmInfo.satbaraImage)}
                          alt="Satbara"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(getImageUrl(farmInfo.satbaraImage), '_blank')}
                          >
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No document uploaded</p>
                      </div>
                    )}
                    {farmInfo.satbaraImage && <p className="text-[10px] text-gray-500">Registration document - cannot be changed</p>}
                  </div>

                  {/* Patwari Map */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Patwari Map</Label>
                    {farmInfo.patwariMapImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border shadow-sm group">
                        <img
                          src={getImageUrl(farmInfo.patwariMapImage)}
                          alt="Patwari Map"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(getImageUrl(farmInfo.patwariMapImage), '_blank')}
                          >
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No document uploaded</p>
                      </div>
                    )}
                    {farmInfo.patwariMapImage && <p className="text-[10px] text-gray-500">Registration document - cannot be changed</p>}
                  </div>

                  {/* Sowing Certificate */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sowing Certificate</Label>
                    {farmInfo.sowingCertificate ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border shadow-sm group">
                        <img
                          src={getImageUrl(farmInfo.sowingCertificate)}
                          alt="Sowing Certificate"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(getImageUrl(farmInfo.sowingCertificate), '_blank')}
                          >
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No document uploaded</p>
                      </div>
                    )}
                    {farmInfo.sowingCertificate && <p className="text-[10px] text-gray-500">Registration document - cannot be changed</p>}
                  </div>
                </div>

                {/* Land Images Grid */}
                <div className="mt-6">
                  <Label className="text-sm font-medium mb-3 block">Land Corner Photos & GPS</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                      const imageKey = `image${i}` as keyof typeof farmInfo.landImages;
                      const gpsKey = `image${i}Gps` as keyof typeof farmInfo.landImages;
                      const imageUrl = farmInfo.landImages[imageKey];
                      const gpsValue = farmInfo.landImages[gpsKey];

                      if (!imageUrl && !gpsValue) return null;

                      return (
                        <div key={i} className="space-y-2">
                          <p className="text-[10px] font-semibold text-gray-500 text-center uppercase">Corner {i}</p>
                          {imageUrl ? (
                            <div className="relative w-full h-24 rounded-lg overflow-hidden border shadow-sm">
                              <img
                                src={getImageUrl(imageUrl)}
                                alt={`Land ${i}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full h-24 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                              <p className="text-[8px] text-gray-400 text-center">No photo</p>
                            </div>
                          )}
                          <div className="px-1">
                            <p className="text-[9px] text-gray-600 font-medium text-center truncate" title={gpsValue}>
                              {gpsValue || 'No GPS data'}
                            </p>
                            {gpsValue && <p className="text-[8px] text-gray-400 text-center">Registration data</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bank Passbook</Label>
                    {farmInfo.bankPassbookImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border shadow-sm group">
                        <img
                          src={getImageUrl(farmInfo.bankPassbookImage)}
                          alt="Bank Passbook"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No document uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Aadhaar Card</Label>
                    {farmInfo.aadhaarCardImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border shadow-sm group">
                        <img
                          src={getImageUrl(farmInfo.aadhaarCardImage)}
                          alt="Aadhaar Card"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farm Boundary Visualization */}
                <div className="space-y-3 pt-4">
                  <Label className="text-sm font-semibold text-gray-700">Farm Boundary Map</Label>
                  {boundaryCoordinates.length > 0 ? (
                    <>
                      <FarmBoundaryMap
                        coordinates={boundaryCoordinates}
                        center={farmInfo.latitude && farmInfo.longitude ? { lat: parseFloat(farmInfo.latitude), lng: parseFloat(farmInfo.longitude) } : undefined}
                        zoom={16}
                        interactive={true}
                      />
                      <p className="text-[10px] text-gray-500 text-center">
                        {boundaryCoordinates.length >= 3
                          ? "Boundary drawn from your corner GPS points."
                          : "Showing available corner points. Need at least 3 points for a boundary."}
                      </p>
                    </>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                      <MapPin className="h-10 w-10 mb-2 opacity-50" />
                      <p className="font-medium">No GPS Boundary Data Available</p>
                      <p className="text-xs mt-1 max-w-sm">
                        Please upload Land Corner Photos with GPS data in the "Registration Documents" section to see your farm boundary.
                      </p>
                    </div>
                  )}
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
                      Save Farm Details
                    </>
                  )}
                </Button>
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

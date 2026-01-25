import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Lock, Smartphone, Shield, MapPin, Tractor, CreditCard, ChevronRight, Upload, X, Camera, Map, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import api from '../../lib/api';
import FarmBoundaryMap from '@/components/FarmBoundaryMap';

const AdminAddEditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    // User Basic
    name: '',
    email: '',
    mobileNumber: '',
    role: 'FARMER',
    password: '',
    status: 'active',

    // Farmer Personal
    gender: '',
    dob: '',
    casteCategory: '',
    farmerType: '',
    farmerCategory: '',
    loaneeStatus: '',
    aadhaarNumber: '', // Input only, not fetched if hashed

    // Admin Specific
    designation: '',
    department: '',
    branch: '',


    // Location
    state: '',
    district: '',
    tehsil: '',
    village: '',
    pincode: '',
    address: '',

    // Farm Details
    farmName: '',
    cropType: '',
    cropName: '',
    cropSeason: '',
    landRecordKhasra: '',
    landRecordKhatauni: '',
    surveyNumber: '',
    insuranceUnit: '',
    cropVariety: '',
    landAreaSize: '',
    latitude: '',
    longitude: '',
    wildAnimalAttackCoverage: false,

    // Bank Details
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    insuranceLinked: 'No',

    // GPS Corners
    landImage1Gps: '',
    landImage2Gps: '',
    landImage3Gps: '',
    landImage4Gps: '',
    landImage5Gps: '',
    landImage6Gps: '',
    landImage7Gps: '',
    landImage8Gps: '',
  });

  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [geolocationLoading, setGeolocationLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && userId) {
      fetchUser();
    }
  }, [isEditing, userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      const user = response.data;
      const farm = user.farmDetails || {};

      setFormData(prev => ({
        ...prev,
        // User
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        role: user.role || 'FARMER',
        status: user.status || 'active',
        gender: user.gender || '',
        dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',

        // Farm Details (Merge if exists)
        casteCategory: farm.casteCategory || '',
        farmerType: farm.farmerType || '',
        farmerCategory: farm.farmerCategory || '',
        loaneeStatus: farm.loaneeStatus || '',
        // Aadhaar is hashed, so we leave empty to indicate "unchanged" unless user types new one

        state: farm.state || '',
        district: farm.district || '',
        tehsil: farm.tehsil || '',
        village: farm.village || '',
        pincode: farm.pincode || '',
        address: farm.address || '',

        farmName: farm.farmName || '',
        cropType: farm.cropType || '',
        cropName: farm.cropName || '',
        cropSeason: farm.cropSeason || '',
        landRecordKhasra: farm.landRecordKhasra || '',
        landRecordKhatauni: farm.landRecordKhatauni || '',
        surveyNumber: farm.surveyNumber || '',
        insuranceUnit: farm.insuranceUnit || '',
        cropVariety: farm.cropVariety || '',
        landAreaSize: farm.landAreaSize || '',
        latitude: farm.latitude || '',
        longitude: farm.longitude || '',
        wildAnimalAttackCoverage: farm.wildAnimalAttackCoverage || false,

        bankName: farm.bankName || '',
        bankAccountNo: farm.bankAccountNo || '',
        bankIfsc: farm.bankIfsc || '',
        insuranceLinked: farm.insuranceLinked || 'No',

        // Admin Specific
        designation: user.designation || '',
        department: user.department || '',
        branch: user.branch || '',


        // GPS Corners
        landImage1Gps: farm.landImage1Gps || '',
        landImage2Gps: farm.landImage2Gps || '',
        landImage3Gps: farm.landImage3Gps || '',
        landImage4Gps: farm.landImage4Gps || '',
        landImage5Gps: farm.landImage5Gps || '',
        landImage6Gps: farm.landImage6Gps || '',
        landImage7Gps: farm.landImage7Gps || '',
        landImage8Gps: farm.landImage8Gps || '',
      }));

      // Set previews for existing images
      const initialPreviews: Record<string, string> = {};
      const imageFields = [
        'satbaraImage', 'patwariMapImage', 'sowingCertificate',
        'bankPassbookImage', 'aadhaarCardImage',
        'landImage1', 'landImage2', 'landImage3', 'landImage4',
        'landImage5', 'landImage6', 'landImage7', 'landImage8'
      ];

      const getImageUrl = (path: string | undefined) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
      };

      imageFields.forEach(field => {
        if (farm[field]) {
          initialPreviews[field] = getImageUrl(farm[field]);
        }
      });
      setPreviews(initialPreviews);
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError(err?.response?.data?.message || "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fieldName: string) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeolocationLoading(false);
      },
      (error) => {
        setGeolocationLoading(false);
        setError(`Geolocation error: ${error.message}`);
      }
    );
  };

  const boundaryCoordinates = React.useMemo(() => {
    const coords: { lat: number, lng: number }[] = [];
    for (let i = 1; i <= 8; i++) {
      const gpsKey = `landImage${i}Gps` as keyof typeof formData;
      const gpsValue = formData[gpsKey] as string;
      if (gpsValue && gpsValue.includes(',')) {
        const [lat, lng] = gpsValue.split(',').map(v => parseFloat(v.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push({ lat, lng });
        }
      }
    }
    return coords;
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) throw new Error("Name is required");
      if (formData.role === 'FARMER' && !formData.mobileNumber.trim()) throw new Error("Mobile number is required for farmers");
      if (formData.role !== 'FARMER' && !formData.email.trim()) throw new Error("Email is required");

      const data = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, typeof value === 'boolean' ? String(value) : (value as string).toString().trim());
        }
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          data.append(key, file);
        }
      });

      if (isEditing) {
        await api.put(`/admin/users/${userId}`, data);
        setSuccess("User updated successfully!");
      } else {
        await api.post('/admin/users', data);
        setSuccess("User added successfully!");
      }

      setTimeout(() => {
        navigate("/admin-dashboard/users");
      }, 1500);
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(err?.response?.data?.message || err.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm p-4 z-10 rounded-lg">
        <Link
          to="/admin-dashboard/users"
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <User className="h-8 w-8" />
            </span>
            {isEditing ? 'User Profile' : 'Add New User'}
          </h1>
          <p className="text-gray-600 mt-1 ml-14">
            {isEditing ? 'User details and profile information' : 'Create a new user account with full profile details'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
          <Shield className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-800">
          <Shield className="h-5 w-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Role & Basic User Info */}
          <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={(v) => handleChange('role', v)} disabled={loading}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FARMER">Farmer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Mobile Number {formData.role === 'FARMER' && '*'}</Label>
                  <div className="relative mt-1">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value)}
                      placeholder="9876543210"
                      className="pl-9"
                    />
                  </div>
                </div>

                {formData.role !== 'FARMER' && (
                  <div>
                    <Label>Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>{isEditing ? 'New Password (Optional)' : 'Password *'}</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={isEditing ? "Leave blank to keep current" : "Secure password"}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label>Account Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange('status', v)} disabled={loading}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Update Account' : 'Create Account'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Profile */}
          <div className="lg:col-span-2">
            {formData.role === 'FARMER' ? (
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Personal</TabsTrigger>
                  <TabsTrigger value="location" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Location</TabsTrigger>
                  <TabsTrigger value="farm" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Farm Details</TabsTrigger>
                  <TabsTrigger value="bank" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Bank Info</TabsTrigger>
                </TabsList>

                {/* Farmer Tabs Content */}
                <TabsContent value="personal" className="animate-slide-up">
                  <Card className="border-l-4 border-l-purple-500 shadow-lg">
                    <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                      <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                        <User className="h-5 w-5" /> Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} className="mt-1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Aadhaar Number {isEditing && '(Leave blank if unchanged)'}</Label>
                        <Input
                          value={formData.aadhaarNumber}
                          onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                          placeholder="12-digit Aadhaar"
                          maxLength={12}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <Label>Aadhaar Card Copy *</Label>
                        <div className="relative group">
                          {previews.aadhaarCardImage ? (
                            <div className="relative rounded-xl overflow-hidden border-2 border-blue-100 aspect-video bg-gray-50 max-w-sm">
                              <img src={previews.aadhaarCardImage} alt="Aadhaar Card" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeFile('aadhaarCardImage')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all max-w-sm">
                              <Upload className="w-6 h-6 text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-600">Upload Aadhaar</p>
                              <input type="file" name="aadhaarCardImage" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Caste Category</Label>
                        <Select value={formData.casteCategory} onValueChange={(v) => handleChange('casteCategory', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="OBC">OBC</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Farmer Type</Label>
                        <Select value={formData.farmerType} onValueChange={(v) => handleChange('farmerType', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Small">Small (&lt; 2ha)</SelectItem>
                            <SelectItem value="Marginal">Marginal (&lt; 1ha)</SelectItem>
                            <SelectItem value="Others">Others (&gt; 2ha)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Farmer Category</Label>
                        <Select value={formData.farmerCategory} onValueChange={(v) => handleChange('farmerCategory', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Tenant">Tenant</SelectItem>
                            <SelectItem value="Sharecropper">Sharecropper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Loanee Status</Label>
                        <Select value={formData.loaneeStatus} onValueChange={(v) => handleChange('loaneeStatus', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Loanee">Loanee</SelectItem>
                            <SelectItem value="Non-Loanee">Non-Loanee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location" className="animate-slide-up">
                  <Card className="border-l-4 border-l-cyan-500 shadow-lg">
                    <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
                      <CardTitle className="text-lg flex items-center gap-2 text-cyan-900">
                        <MapPin className="h-5 w-5" /> Residential Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input value={formData.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="e.g. Maharashtra" />
                      </div>
                      <div className="space-y-2">
                        <Label>District</Label>
                        <Input value={formData.district} onChange={(e) => handleChange('district', e.target.value)} placeholder="e.g. Pune" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tehsil</Label>
                        <Input value={formData.tehsil} onChange={(e) => handleChange('tehsil', e.target.value)} placeholder="e.g. Haveli" />
                      </div>
                      <div className="space-y-2">
                        <Label>Village</Label>
                        <Input value={formData.village} onChange={(e) => handleChange('village', e.target.value)} placeholder="e.g. Wagholi" />
                      </div>
                      <div className="space-y-2">
                        <Label>PIN Code</Label>
                        <Input value={formData.pincode} onChange={(e) => handleChange('pincode', e.target.value)} placeholder="411001" maxLength={6} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Full Address</Label>
                        <Input value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="House/Build No, Street name" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="farm" className="space-y-6 animate-slide-up">
                  <Card className="border-l-4 border-l-green-500 shadow-lg">
                    <CardHeader className="bg-green-50/50 border-b border-green-100">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                        <Tractor className="h-5 w-5" /> Farm Land Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Farm Name / Identifier</Label>
                          <Input value={formData.farmName} onChange={(e) => handleChange('farmName', e.target.value)} placeholder="e.g. My North Farm" />
                        </div>
                        <div className="space-y-2">
                          <Label>Crop Type</Label>
                          <Select value={formData.cropType} onValueChange={(v) => handleChange('cropType', v)}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select Crop Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kharif">Kharif</SelectItem>
                              <SelectItem value="Rabi">Rabi</SelectItem>
                              <SelectItem value="Zaid">Zaid</SelectItem>
                              <SelectItem value="Commercial">Commercial/Horticultural</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Crop Name</Label>
                          <Input value={formData.cropName} onChange={(e) => handleChange('cropName', e.target.value)} placeholder="e.g. Rice, Wheat" />
                        </div>
                        <div className="space-y-2">
                          <Label>Crop Variety</Label>
                          <Input value={formData.cropVariety} onChange={(e) => handleChange('cropVariety', e.target.value)} placeholder="e.g. IR-64" />
                        </div>
                        <div className="space-y-2">
                          <Label>Land Survey Number</Label>
                          <Input value={formData.surveyNumber} onChange={(e) => handleChange('surveyNumber', e.target.value)} placeholder="e.g. 123/A" />
                        </div>
                        <div className="space-y-2">
                          <Label>Land Area (Acres/Hectares)</Label>
                          <Input value={formData.landAreaSize} onChange={(e) => handleChange('landAreaSize', e.target.value)} placeholder="e.g. 2.5" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="font-bold">Wild Animal Attack Coverage</Label>
                          <p className="text-xs text-gray-500">Opt-in for protection against wildlife damage</p>
                        </div>
                        <Switch checked={formData.wildAnimalAttackCoverage} onCheckedChange={(v) => handleChange('wildAnimalAttackCoverage', v)} />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <Label className="font-bold">Farm Boundary (8 Corner GPS Points)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGeolocation}
                            disabled={geolocationLoading}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            {geolocationLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                            Mark Center Location
                          </Button>
                        </div>

                        <div className="h-[300px] w-full bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-gray-200">
                          <FarmBoundaryMap coordinates={boundaryCoordinates} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase text-gray-400">Corner {i} Photo & GPS</Label>
                              <div className="relative group">
                                {previews[`landImage${i}`] ? (
                                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-100 group-hover:border-blue-500 transition-all">
                                    <img src={previews[`landImage${i}`]} alt={`Land ${i}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeFile(`landImage${i}`)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                                    <Camera className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                    <input type="file" name={`landImage${i}`} className="hidden" onChange={handleFileChange} accept="image/*" />
                                  </label>
                                )}
                              </div>
                              <Input
                                placeholder="Lat, Lng"
                                value={formData[`landImage${i}Gps` as keyof typeof formData] as string}
                                onChange={(e) => handleChange(`landImage${i}Gps`, e.target.value)}
                                className="text-[10px] h-7"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bank" className="animate-slide-up">
                  <Card className="border-l-4 border-l-amber-500 shadow-lg">
                    <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                        <CreditCard className="h-5 w-5" /> Financial Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} placeholder="e.g. SBI, HDFC" />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input value={formData.bankAccountNo} onChange={(e) => handleChange('bankAccountNo', e.target.value)} placeholder="1234567890" />
                        </div>
                        <div className="space-y-2">
                          <Label>IFSC Code</Label>
                          <Input value={formData.bankIfsc} onChange={(e) => handleChange('bankIfsc', e.target.value)} placeholder="SBIN0001234" />
                        </div>
                        <div className="space-y-2">
                          <Label>Insurance Linked?</Label>
                          <Select value={formData.insuranceLinked} onValueChange={(v) => handleChange('insuranceLinked', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-100">
                        <Label className="font-bold">Bank Passbook Copy *</Label>
                        <div className="relative group">
                          {previews.bankPassbookImage ? (
                            <div className="relative rounded-xl overflow-hidden border-2 border-blue-100 aspect-video bg-gray-50 max-w-sm">
                              <img src={previews.bankPassbookImage} alt="Bank Passbook" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeFile('bankPassbookImage')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all max-w-sm">
                              <Upload className="w-6 h-6 text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-600">Upload Passbook</p>
                              <input type="file" name="bankPassbookImage" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                            </label>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Admin Details</TabsTrigger>
                  <TabsTrigger value="permissions" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="animate-slide-up">
                  <Card className="border-l-4 border-l-blue-500 shadow-lg">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                        <Shield className="h-5 w-5" /> Administrative Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input value={formData.designation} onChange={(e) => handleChange('designation', e.target.value)} placeholder="e.g. Senior Manager" />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input value={formData.department} onChange={(e) => handleChange('department', e.target.value)} placeholder="e.g. Operations" />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch / Office</Label>
                        <Input value={formData.branch} onChange={(e) => handleChange('branch', e.target.value)} placeholder="e.g. Mumbai HQ" />
                      </div>
                      <div className="space-y-2">
                        <Label>Employee ID (Optional)</Label>
                        <Input placeholder="e.g. EMP12345" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="permissions" className="animate-slide-up">
                  <Card className="border-l-4 border-l-red-500 shadow-lg">
                    <CardHeader className="bg-red-50/50 border-b border-red-100">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                        <Lock className="h-5 w-5" /> Role & Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {[
                        { label: 'Platform Management', desc: 'Can manage platform settings and global configuration' },
                        { label: 'User Management', desc: 'Can add, edit, and delete farmers and insurers' },
                        { label: 'Claim Processing', desc: 'Can review, approve or reject insurance claims' },
                        { label: 'Reports & Analytics', desc: 'Can view and export platform performance data' }
                      ].map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900">{p.label}</p>
                            <p className="text-xs text-gray-500">{p.desc}</p>
                          </div>
                          <Switch defaultChecked={idx > 0} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminAddEditUser;

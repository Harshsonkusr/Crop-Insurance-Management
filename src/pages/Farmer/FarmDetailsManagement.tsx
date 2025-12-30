import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  User, 
  FileText, 
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Map,
  Crop,
  Ruler
} from "lucide-react";
import api from '../../lib/api';

interface FarmDetails {
  _id?: string;
  farmId: string;
  ownerName: string;
  aadhaarNumber: string;
  farmName: string;
  cropType: string;
  latitude: string;
  longitude: string;
  farmSize: string;
  area?: number;
  location?: string;
  crops?: string[];
  verificationStatus?: string;
}

const FarmDetailsManagement: React.FC = () => {
  const [formData, setFormData] = useState<FarmDetails>({
    farmId: '',
    ownerName: '',
    aadhaarNumber: '',
    farmName: '',
    cropType: '',
    latitude: '',
    longitude: '',
    farmSize: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [geolocationLoading, setGeolocationLoading] = useState(false);

  useEffect(() => {
    fetchFarmDetails();
  }, []);

  const fetchFarmDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/farm-details');
      if (response.data) {
        const data = response.data;
        setFormData({
          farmId: data.farmId || data._id || '',
          ownerName: data.ownerName || '',
          aadhaarNumber: data.aadhaarNumber || '',
          farmName: data.farmName || '',
          cropType: data.cropType || (data.crops && data.crops[0]) || '',
          latitude: data.latitude || (data.location?.split(',')[0]?.trim()) || '',
          longitude: data.longitude || (data.location?.split(',')[1]?.trim()) || '',
          farmSize: data.farmSize || data.area?.toString() || '',
          verificationStatus: data.verificationStatus || 'Pending',
        });
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // No farm details found - this is okay, user can create new one
        console.log('No farm details found - user can create new one');
      } else if (err?.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err?.response?.status === 403) {
        setError('Access denied. You do not have permission to view farm details.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(`Failed to load farm details: ${err.message}`);
      } else {
        setError('Failed to load farm details. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
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

  const validateForm = (): boolean => {
    if (!formData.ownerName.trim()) {
      setError('Owner name is required.');
      return false;
    }
    if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return false;
    }
    if (!formData.farmName.trim()) {
      setError('Farm name is required.');
      return false;
    }
    if (!formData.cropType.trim()) {
      setError('Crop type is required.');
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Farm location (latitude and longitude) is required.');
      return false;
    }
    if (!formData.farmSize || parseFloat(formData.farmSize) <= 0) {
      setError('Please enter a valid farm size.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const farmData = {
        farmId: formData.farmId || undefined,
        ownerName: formData.ownerName,
        aadhaarNumber: formData.aadhaarNumber,
        farmName: formData.farmName,
        cropType: formData.cropType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        farmSize: formData.farmSize,
        location: `${formData.latitude}, ${formData.longitude}`,
        area: parseFloat(formData.farmSize),
        crops: formData.cropType ? [formData.cropType] : [],
      };

      let response;
      if (formData._id) {
        response = await api.put(`/farm-details/${formData._id}`, farmData);
      } else {
        response = await api.post('/farm-details', farmData);
      }

      setSuccess('Farm details saved successfully!');
      if (response.data.farmDetails) {
        setFormData(prev => ({
          ...prev,
          _id: response.data.farmDetails._id,
          verificationStatus: response.data.farmDetails.verificationStatus || 'Pending',
        }));
      }
    } catch (err: any) {
      console.error('Error saving farm details:', err);
      setError(err?.response?.data?.message || 'Failed to save farm details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Farm Details Management</h1>
        <p className="text-gray-600">
          Register and manage your farm information for insurance purposes
        </p>
      </div>

      {/* Verification Status */}
      {formData.verificationStatus && (
        <Card className={formData.verificationStatus === 'Verified' ? 'border-green-500' : 'border-yellow-500'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {formData.verificationStatus === 'Verified' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="font-semibold">
                  Verification Status: <Badge variant={formData.verificationStatus === 'Verified' ? 'default' : 'secondary'}>
                    {formData.verificationStatus}
                  </Badge>
                </p>
                <p className="text-sm text-gray-600">
                  {formData.verificationStatus === 'Verified' 
                    ? 'Your farm details have been verified.'
                    : 'Your farm details are pending verification.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Success Messages */}
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Information</CardTitle>
          <CardDescription>
            Provide accurate information about your farm. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName" className="text-base font-semibold">
                    Owner Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner's full name"
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarNumber" className="text-base font-semibold">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                    className="mt-2 h-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Crop className="h-5 w-5" />
                Farm Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmId" className="text-base font-semibold">
                    Farm ID
                  </Label>
                  <Input
                    id="farmId"
                    name="farmId"
                    type="text"
                    value={formData.farmId}
                    onChange={handleChange}
                    placeholder="e.g., FARM001"
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="farmName" className="text-base font-semibold">
                    Farm Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="farmName"
                    name="farmName"
                    type="text"
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="Enter farm name"
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cropType" className="text-base font-semibold">
                    Crop Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cropType"
                    name="cropType"
                    type="text"
                    value={formData.cropType}
                    onChange={handleChange}
                    placeholder="e.g., Wheat, Rice, Cotton"
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="farmSize" className="text-base font-semibold">
                    Farm Size (acres) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="farmSize"
                    name="farmSize"
                    type="number"
                    value={formData.farmSize}
                    onChange={handleChange}
                    placeholder="Enter farm size in acres"
                    min="0"
                    step="0.01"
                    className="mt-2 h-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-base font-semibold">
                    Latitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="text"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g., 12.345678"
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-base font-semibold">
                    Longitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="text"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g., 78.901234"
                    className="mt-2 h-12"
                    required
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeolocation}
                disabled={geolocationLoading}
                className="w-full md:w-auto"
              >
                {geolocationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Map className="h-4 w-4 mr-2" />
                    Get Current Location Automatically
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Click the button above to automatically capture your current location, or enter coordinates manually.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 min-w-[150px]"
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmDetailsManagement;

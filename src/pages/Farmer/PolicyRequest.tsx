import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import api from '../../lib/api';
import logger from '../../utils/logger';

interface ServiceProvider {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  address?: string;
  licenseNumber?: string;
  kycVerified?: boolean;
  status?: string;
  createdAt?: string;
}

const PolicyRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get policy data from navigation state
  const policy = location.state?.policy;
  const selectedProvider = location.state?.selectedProvider;
  const isRenewal = location.state?.isRenewal || !!location.state?.renewPolicyId;

  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    serviceProviderId: '',
    cropType: '',
    insuredArea: '',
    requestedStartDate: '',
    requestType: 'new',
    existingPolicyId: '',
    // Crop details
    cropVariety: '',
    expectedYield: '',
    cultivationSeason: '',
    soilType: '',
    irrigationMethod: '',
    cropDescription: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [farmImages, setFarmImages] = useState<File[]>([]);

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  useEffect(() => {
    // Pre-fill form data if it's a renewal request
    if (isRenewal && policy) {
      setFormData(prev => ({
        ...prev,
        serviceProviderId: policy.serviceProvider?.id || '',
        cropType: policy.cropType || '',
        insuredArea: policy.insuredArea?.toString() || '',
        requestType: 'renewal',
        existingPolicyId: policy.id || policy._id || '',
      }));
    }
    // Pre-select provider if coming from comparison page
    else if (selectedProvider) {
      setFormData(prev => ({
        ...prev,
        serviceProviderId: selectedProvider.id || selectedProvider._id || '',
      }));
    }
  }, [isRenewal, policy, selectedProvider]);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/service-providers/approved');
      setServiceProviders(response.data || []);
      logger.farmer.policy('Fetched approved service providers', { count: response.data?.length || 0 });
    } catch (err: any) {
      logger.farmer.error('Error fetching service providers', { error: err });
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load service providers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (e.target.id === 'documents') {
        setDocuments(prev => [...prev, ...filesArray]);
      } else if (e.target.id === 'farmImages') {
        setFarmImages(prev => [...prev, ...filesArray]);
      }
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeFarmImage = (index: number) => {
    setFarmImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.serviceProviderId) {
      setError('Please select a service provider');
      return;
    }
    if (!formData.cropType.trim()) {
      setError('Please enter crop type');
      return;
    }
    if (!formData.insuredArea || parseFloat(formData.insuredArea) <= 0) {
      setError('Please enter a valid insured area (in acres/hectares)');
      return;
    }
    // Farm images are required for new/renewal policy requests
    if (farmImages.length === 0) {
      setError('Please upload at least one farm photo from different angles. This is required for policy verification.');
      return;
    }

    try {
      setSubmitting(true);
      logger.farmer.policy('Submitting policy request', { 
        serviceProviderId: formData.serviceProviderId,
        cropType: formData.cropType 
      });

      const formDataToSend = new FormData();
      formDataToSend.append('serviceProviderId', formData.serviceProviderId);
      formDataToSend.append('cropType', formData.cropType.trim());
      formDataToSend.append('insuredArea', formData.insuredArea);
      formDataToSend.append('requestType', formData.requestType);
      if (formData.existingPolicyId) {
        formDataToSend.append('existingPolicyId', formData.existingPolicyId);
      }
      if (formData.requestedStartDate) {
        formDataToSend.append('requestedStartDate', formData.requestedStartDate);
      }

      // Crop details
      if (formData.cropVariety) {
        formDataToSend.append('cropVariety', formData.cropVariety.trim());
      }
      if (formData.expectedYield) {
        formDataToSend.append('expectedYield', formData.expectedYield);
      }
      if (formData.cultivationSeason) {
        formDataToSend.append('cultivationSeason', formData.cultivationSeason.trim());
      }
      if (formData.soilType) {
        formDataToSend.append('soilType', formData.soilType.trim());
      }
      if (formData.irrigationMethod) {
        formDataToSend.append('irrigationMethod', formData.irrigationMethod.trim());
      }
      if (formData.cropDescription) {
        formDataToSend.append('cropDescription', formData.cropDescription.trim());
      }

      // Farm images (required)
      farmImages.forEach((file) => {
        formDataToSend.append('farmImages', file);
      });

      // Documents (optional)
      documents.forEach((file) => {
        formDataToSend.append('documents', file);
      });

      const response = await api.post('/policy-requests', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      logger.farmer.policy('Policy request submitted successfully', { 
        requestId: response.data?.request?.id 
      });
      setSuccess('Policy request submitted successfully! The service provider will review your request.');
      
      // Clear form (but keep pre-filled data if it was a renewal)
      if (!isRenewal) {
        setFormData({
          serviceProviderId: '',
          cropType: '',
          insuredArea: '',
          requestedStartDate: '',
          requestType: 'new',
          existingPolicyId: '',
          cropVariety: '',
          expectedYield: '',
          cultivationSeason: '',
          soilType: '',
          irrigationMethod: '',
          cropDescription: '',
        });
      }
      setDocuments([]);
      setFarmImages([]);

      // Redirect to policies page after 2 seconds
      setTimeout(() => {
        navigate('/farmer-dashboard/my-policies');
      }, 2000);
    } catch (err: any) {
      logger.farmer.error('Error submitting policy request', { error: err });
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to submit policy request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/farmer-dashboard/my-policies')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request New Policy</h1>
          <p className="text-gray-600">Submit a request for a new insurance policy</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
          {isRenewal ? 'Policy Renewal Request' : 'Policy Request Form'}
        </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="serviceProviderId">Service Provider *</Label>
              <Select
                value={formData.serviceProviderId || undefined}
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceProviderId: value }))}
                disabled={serviceProviders.length === 0 || (isRenewal && !!formData.serviceProviderId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    selectedProvider && formData.serviceProviderId
                      ? `${selectedProvider.name} (Selected)`
                      : isRenewal && formData.serviceProviderId
                        ? `${policy?.serviceProvider?.name || 'Current Provider'} (Renewal)`
                        : serviceProviders.length === 0
                          ? "No service providers available"
                          : "Select a service provider"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {serviceProviders.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No service providers available</div>
                  ) : (
                    serviceProviders.map((sp) => {
                      const spId = sp.id || sp._id;
                      if (!spId) return null;
                      return (
                        <SelectItem key={spId} value={spId}>
                          {sp.name} - {sp.serviceType}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {serviceProviders.length === 0 && (
                <p className="text-sm text-gray-500">No approved service providers are currently available.</p>
              )}
            </div>

            {/* Crop Type */}
            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type *</Label>
              <Input
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                placeholder="e.g., Wheat, Rice, Cotton"
                required
              />
            </div>

            {/* Insured Area */}
            <div className="space-y-2">
              <Label htmlFor="insuredArea">Insured Area (in acres/hectares) *</Label>
              <Input
                id="insuredArea"
                name="insuredArea"
                type="number"
                step="0.01"
                min="0"
                value={formData.insuredArea}
                onChange={handleInputChange}
                placeholder="e.g., 10.5"
                required
              />
            </div>

            {/* Crop Details Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Crop Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropVariety">Crop Variety</Label>
                  <Input
                    id="cropVariety"
                    name="cropVariety"
                    value={formData.cropVariety}
                    onChange={handleInputChange}
                    placeholder="e.g., Basmati Rice, Hybrid Wheat"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedYield">Expected Yield (kg/acre)</Label>
                  <Input
                    id="expectedYield"
                    name="expectedYield"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.expectedYield}
                    onChange={handleInputChange}
                    placeholder="e.g., 2500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cultivationSeason">Cultivation Season</Label>
                  <Input
                    id="cultivationSeason"
                    name="cultivationSeason"
                    value={formData.cultivationSeason}
                    onChange={handleInputChange}
                    placeholder="e.g., Kharif, Rabi, Summer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Input
                    id="soilType"
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    placeholder="e.g., Loamy, Clay, Sandy"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="irrigationMethod">Irrigation Method</Label>
                  <Input
                    id="irrigationMethod"
                    name="irrigationMethod"
                    value={formData.irrigationMethod}
                    onChange={handleInputChange}
                    placeholder="e.g., Drip, Sprinkler, Flood, Rain-fed"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cropDescription">Additional Crop Information</Label>
                  <textarea
                    id="cropDescription"
                    name="cropDescription"
                    value={formData.cropDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, cropDescription: e.target.value }))}
                    placeholder="Any additional details about your crop..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Farm Images Upload (Required) */}
            <div className="space-y-2">
              <Label>Farm Photos from Different Angles *</Label>
              <p className="text-sm text-gray-600 mb-2">
                Please upload photos of your farm from different angles. These images will be used for verification when processing claims.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="farmImages"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="farmImages"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload farm photos (JPG, PNG)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Maximum 10 images, 20MB each</p>
                </label>
              </div>

              {/* Display uploaded farm images */}
              {farmImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Farm Photos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {farmImages.map((file, index) => (
                      <div
                        key={index}
                        className="relative border rounded p-2 bg-gray-50"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Farm image ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFarmImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600"
                        >
                          ×
                        </Button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Requested Start Date */}
            <div className="space-y-2">
              <Label htmlFor="requestedStartDate">Requested Start Date (Optional)</Label>
              <Input
                id="requestedStartDate"
                name="requestedStartDate"
                type="date"
                value={formData.requestedStartDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Documents Upload */}
            <div className="space-y-2">
              <Label>Supporting Documents (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="documents"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="documents"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload documents (PDF, DOC, DOCX, JPG, PNG)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Maximum 10 files, 20MB each</p>
                </label>
              </div>

              {/* Display uploaded files */}
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/farmer-dashboard/my-policies')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || serviceProviders.length === 0 || farmImages.length === 0}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyRequest;


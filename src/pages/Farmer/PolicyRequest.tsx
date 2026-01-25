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

const CROP_TYPES = [
  "Cereals",
  "Pulses",
  "Oilseeds",
  "Commercial Crops",
  "Fruits",
  "Vegetables",
  "Spices",
  "Others"
];

const CROPS_BY_TYPE: Record<string, string[]> = {
  "Cereals": ["Wheat", "Rice", "Maize", "Bajra", "Jowar", "Barley", "Ragi"],
  "Pulses": ["Gram", "Tur (Arhar)", "Moong", "Urad", "Masur", "Peas"],
  "Oilseeds": ["Groundnut", "Mustard", "Soyabean", "Sunflower", "Sesame", "Castor"],
  "Commercial Crops": ["Cotton", "Sugarcane", "Jute", "Tobacco"],
  "Fruits": ["Mango", "Banana", "Citrus", "Apple", "Guava", "Grapes"],
  "Vegetables": ["Potato", "Onion", "Tomato", "Brinjal", "Cabbage", "Cauliflower"],
  "Spices": ["Chilli", "Turmeric", "Garlic", "Ginger", "Coriander"],
  "Others": ["Rubber", "Coffee", "Tea", "Other"]
};

const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Mountain", "Saline", "Peaty"];
const IRRIGATION_METHODS = ["Rain-fed", "Canal", "Tube Well", "Drip", "Sprinkler", "Tank", "Others"];

interface Insurer {
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

import PaymentGatewayModal from '../../components/PaymentGatewayModal';

const PolicyRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get policy data from navigation state
  const policy = location.state?.policy;
  const selectedProvider = location.state?.selectedProvider;
  const isRenewal = location.state?.isRenewal || !!location.state?.renewPolicyId;

  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState<any>(null); // Store success details

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    insurerId: '',
    cropType: '',
    cropName: '',
    insuredArea: '',
    requestedStartDate: '',
    requestType: 'new',
    existingPolicyId: '',
    // Crop details
    cropVariety: '',
    expectedYield: '',
    cultivationSeason: '',
    sowingDate: '',
    surveyNumber: '',
    khewatNumber: '',
    insuranceUnit: '',
    sumInsured: '',
    soilType: '',
    irrigationMethod: '',
    cropDescription: '',
    wildAnimalAttackCoverage: false,
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [farmImages, setFarmImages] = useState<File[]>([]);

  useEffect(() => {
    fetchInsurers();
  }, []);

  useEffect(() => {
    // Pre-fill form data if it's a renewal request
    if (isRenewal && policy) {
      setFormData(prev => ({
        ...prev,
        insurerId: policy.insurer?.id || '',
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
        insurerId: selectedProvider.id || selectedProvider._id || '',
      }));
    }
  }, [isRenewal, policy, selectedProvider]);

  // Auto-prefill from farmer profile including new fields
  useEffect(() => {
    const prefillFromProfile = async () => {
      try {
        // Use the correct endpoint /farmer/profile which returns { personalInfo, farmInfo, ... }
        const res = await api.get('/farmer/profile');
        const d = res.data?.farmInfo;

        if (!d) return;

        setFormData(prev => ({
          ...prev,
          // Only pre-fill if not already set by user (or if coming fresh)
          cropType: prev.cropType || d.cropType || prev.cropType,
          cropName: prev.cropName || d.cropName || prev.cropName,
          cropVariety: prev.cropVariety || d.cropVariety || prev.cropVariety,
          cultivationSeason: prev.cultivationSeason || d.cropSeason || prev.cultivationSeason,
          // Map wildAnimalAttackCoverage (ensure boolean)
          wildAnimalAttackCoverage: prev.wildAnimalAttackCoverage || !!d.wildAnimalAttackCoverage,

          surveyNumber: prev.surveyNumber || d.surveyNumber || d.landRecordKhasra || prev.surveyNumber,
          khewatNumber: prev.khewatNumber || d.landRecordKhatauni || prev.khewatNumber,
          insuranceUnit: prev.insuranceUnit || d.insuranceUnit || d.village || prev.insuranceUnit,

          // Bank Details (Read-only)
          bankName: prev.bankName || d.bankName || '',
          bankAccountNo: prev.bankAccountNo || d.bankAccountNo || '',
          bankIfsc: prev.bankIfsc || d.bankIfsc || '',

          // Use farm size/area for insured area if reasonable, or leave blank for user to specify specific plot
          // We can suggest it but maybe not force it if they are insuring a sub-plot
          insuredArea: prev.insuredArea || (d.area ? String(d.area) : d.landAreaSize) || prev.insuredArea,
        }));

        logger.farmer.policy('Form pre-filled from profile data');
      } catch (err) {
        // Silent fail; user can fill manually
        logger.farmer.error('Failed to pre-fill form from profile', { error: err });
      }
    };
    prefillFromProfile();
  }, []);

  const fetchInsurers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/insurers/approved');
      setInsurers(response.data || []);
      logger.farmer.policy('Fetched approved insurers', { count: response.data?.length || 0 });
    } catch (err: any) {
      logger.farmer.error('Error fetching insurers', { error: err });
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load insurers. Please try again.');
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

  const calculatePremium = () => {
    // Logic: 2% of Sum Insured for Kharif, 1.5% for Rabi.
    // Simplify to 2% for mock.
    const sum = parseFloat(formData.sumInsured);
    if (isNaN(sum) || sum <= 0) return 0;
    return Math.round(sum * 0.02);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentDetails({
      transactionId,
      amount: paymentAmount,
      date: new Date().toISOString(),
      status: 'success'
    });
    setShowPaymentModal(false);
    // Trigger API submission immediately after payment success
    submitPolicyRequest({
      transactionId,
      amount: paymentAmount,
      date: new Date().toISOString(),
      status: 'success'
    });
  };

  const submitPolicyRequest = async (paymentData: any) => {
    try {
      setSubmitting(true);
      logger.farmer.policy('Submitting policy request with payment', {
        insurerId: formData.insurerId,
        paymentId: paymentData.transactionId
      });

      const formDataToSend = new FormData();
      formDataToSend.append('insurerId', formData.insurerId);
      formDataToSend.append('cropType', formData.cropType);
      formDataToSend.append('cropName', formData.cropName);
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
      if (formData.sowingDate) {
        formDataToSend.append('sowingDate', formData.sowingDate);
      }
      if (formData.surveyNumber) {
        formDataToSend.append('surveyNumber', formData.surveyNumber.trim());
      }
      if (formData.khewatNumber) {
        formDataToSend.append('khewatNumber', formData.khewatNumber.trim());
      }
      if (formData.insuranceUnit) {
        formDataToSend.append('insuranceUnit', formData.insuranceUnit.trim());
      }
      if (formData.sumInsured) {
        formDataToSend.append('sumInsured', formData.sumInsured);
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
      formDataToSend.append('wildAnimalAttackCoverage', String(formData.wildAnimalAttackCoverage));

      // Payment Details
      formDataToSend.append('paymentDetails', JSON.stringify(paymentData));

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
      setSuccess('Policy request submitted successfully! The insurer will review your request.');

      // Clear form (but keep pre-filled data if it was a renewal)
      if (!isRenewal) {
        setFormData({
          insurerId: '',
          cropType: '',
          cropName: '',
          insuredArea: '',
          requestedStartDate: '',
          requestType: 'new',
          existingPolicyId: '',
          // Crop details
          cropVariety: '',
          expectedYield: '',
          cultivationSeason: '',
          sowingDate: '',
          surveyNumber: '',
          khewatNumber: '',
          insuranceUnit: '',
          sumInsured: '',
          soilType: '',
          irrigationMethod: '',
          cropDescription: '',
          wildAnimalAttackCoverage: false,
          bankName: formData.bankName,
          bankAccountNo: formData.bankAccountNo,
          bankIfsc: formData.bankIfsc,
        });
      }
      setDocuments([]);
      setFarmImages([]);
      setPaymentDetails(null);

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
        // Don't clear payment on submit error, allow retry?
        // But payment success was already recorded clientside.
        // In real app, we would query verification from server again.
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.insurerId) {
      setError('Please select an insurer');
      return;
    }
    if (!formData.cropType) {
      setError('Please select crop type category');
      return;
    }
    if (!formData.cropName) {
      setError('Please select specific crop name');
      return;
    }
    if (!formData.insuredArea || parseFloat(formData.insuredArea) <= 0) {
      setError('Please enter a valid insured area (in Hectares/Acres)');
      return;
    }
    if (!formData.cultivationSeason) {
      setError('Please select cultivation season');
      return;
    }
    if (!formData.sowingDate) {
      setError('Sowing Date is mandatory for PMFBY 2026');
      return;
    }
    const sowing = new Date(formData.sowingDate);
    const today = new Date();
    if (sowing.getTime() > today.getTime()) {
      setError('Sowing Date cannot be in the future');
      return;
    }
    if (!formData.surveyNumber.trim()) {
      setError('Survey/Khasra number is mandatory for PMFBY');
      return;
    }
    if (!formData.insuranceUnit.trim()) {
      setError('Insurance Unit (Village/GP) is mandatory for PMFBY');
      return;
    }
    if (!formData.sumInsured || parseFloat(formData.sumInsured) <= 0) {
      setError('Proposed Sum Insured is required to calculate premium');
      return;
    }

    // Farm images are required for new/renewal policy requests
    if (farmImages.length === 0) {
      setError('Please upload at least one farm photo from different angles. This is required for PMFBY policy verification.');
      return;
    }

    // Land records/sowing certificate are mandatory for PMFBY
    if (documents.length === 0) {
      setError('Please upload land records (Satbara/7/12) or Sowing Certificate. This is mandatory for PMFBY policy issuance.');
      return;
    }

    // Logic: If already paid, submit directly. If not, show payment.
    const calculated = calculatePremium();
    if (calculated <= 0) {
      setError('Invalid premium calculation. Please check Sum Insured.');
      return;
    }
    setPaymentAmount(calculated);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insurers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 no-scrollbar">
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
          <form onSubmit={handleInitialSubmit} className="space-y-6">
            {/* Insurer Selection */}
            <div className="space-y-2">
              <Label htmlFor="insurerId">Insurer *</Label>
              <Select
                value={formData.insurerId || undefined}
                onValueChange={(value) => setFormData(prev => ({ ...prev, insurerId: value }))}
                disabled={insurers.length === 0 || (isRenewal && !!formData.insurerId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    selectedProvider && formData.insurerId
                      ? `${selectedProvider.name} (Selected)`
                      : isRenewal && formData.insurerId
                        ? `${policy?.insurer?.name || 'Current Insurer'} (Renewal)`
                        : insurers.length === 0
                          ? "No insurers available"
                          : "Select an insurer"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {insurers.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No insurers available</div>
                  ) : (
                    insurers.map((sp) => {
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
              {insurers.length === 0 && (
                <p className="text-sm text-gray-500">No approved insurers are currently available.</p>
              )}
            </div>

            {/* Crop Type Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type Category *</Label>
                <Select
                  value={formData.cropType || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cropType: value, cropName: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Crop Name */}
              <div className="space-y-2">
                <Label htmlFor="cropName">Specific Crop Name *</Label>
                <Select
                  value={formData.cropName || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cropName: value }))}
                  disabled={!formData.cropType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.cropType ? "Select Crop" : "Select Category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.cropType && CROPS_BY_TYPE[formData.cropType]?.map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Insured Area */}
            <div className="space-y-2">
              <Label htmlFor="insuredArea">Insured Area (in Hectares/Acres) *</Label>
              <Input
                id="insuredArea"
                name="insuredArea"
                type="number"
                step="0.01"
                min="0"
                value={formData.insuredArea}
                onChange={handleInputChange}
                placeholder="e.g., 2.5"
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
                  <Label htmlFor="cultivationSeason">Cultivation Season *</Label>
                  <Select
                    value={formData.cultivationSeason || undefined}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cultivationSeason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kharif">Kharif</SelectItem>
                      <SelectItem value="Rabi">Rabi</SelectItem>
                      <SelectItem value="Summer/Zaid">Summer/Zaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sowingDate">Sowing Date *</Label>
                  <Input
                    id="sowingDate"
                    name="sowingDate"
                    type="date"
                    value={formData.sowingDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surveyNumber">Survey/Khasra Number *</Label>
                  <Input
                    id="surveyNumber"
                    name="surveyNumber"
                    value={formData.surveyNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 123/4"
                    required
                  />
                </div>

                {/* Bank Details (Read-only) */}
                <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Linked Bank Account for DBT</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-blue-700 block">Bank Name</span>
                      <span className="font-medium text-blue-900">{formData.bankName || 'Not linked'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block">Account Number</span>
                      <span className="font-medium text-blue-900">{formData.bankAccountNo || 'Not linked'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block">IFSC Code</span>
                      <span className="font-medium text-blue-900">{formData.bankIfsc || 'Not linked'}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-600 mt-2">
                    * This account will be used for claim settlements. To change, go to Profile Settings.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="khewatNumber">Khewat Number (Optional)</Label>
                  <Input
                    id="khewatNumber"
                    name="khewatNumber"
                    value={formData.khewatNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 45"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceUnit">Insurance Unit (Village/GP) *</Label>
                  <Input
                    id="insuranceUnit"
                    name="insuranceUnit"
                    value={formData.insuranceUnit}
                    onChange={handleInputChange}
                    placeholder="e.g., Rampur GP"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sumInsured">Proposed Sum Insured (₹)</Label>
                  <Input
                    id="sumInsured"
                    name="sumInsured"
                    type="number"
                    value={formData.sumInsured}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select
                    value={formData.soilType || undefined}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, soilType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Soil Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOIL_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irrigationMethod">Irrigation Method</Label>
                  <Select
                    value={formData.irrigationMethod || undefined}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, irrigationMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Irrigation Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {IRRIGATION_METHODS.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="mt-4 flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
                <input
                  type="checkbox"
                  id="wildAnimalAttackCoverage"
                  checked={formData.wildAnimalAttackCoverage}
                  onChange={(e) => setFormData(prev => ({ ...prev, wildAnimalAttackCoverage: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319] cursor-pointer"
                />
                <div>
                  <Label htmlFor="wildAnimalAttackCoverage" className="text-sm font-semibold text-[#1A5319] cursor-pointer block">
                    Add Wild Animal Attack Coverage (PMFBY 2026)
                  </Label>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    New for 2026: Protect your crop against damage caused by wild animals. Additional premium may apply based on state regulations.
                  </p>
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
              />
            </div>

            {/* Documents Upload */}
            <div className="space-y-2">
              <Label>Supporting Documents (Land Records / Sowing Certificate) *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="documents"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="documents"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload documents (PDF, JPG, DOC)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Proof of land ownership or tenancy is mandatory</p>
                </label>
              </div>

              {/* Display uploaded documents */}
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Selected Documents:</p>
                  <div className="space-y-2">
                    {documents.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#1A5319] hover:bg-[#154214] text-white"
              disabled={submitting || loading}
            >
              {submitting ? 'Processing...' : 'Pay Premium & Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <PaymentGatewayModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={paymentAmount}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default PolicyRequest;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Save, X, Shield, User, Crop, Calendar, DollarSign, FileText, MapPin, Droplet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import api from '../../lib/api';

const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Mountain", "Saline", "Peaty"];
const IRRIGATION_METHODS = ["Rain-fed", "Canal", "Tube Well", "Drip", "Sprinkler", "Tank", "Others"];
const SEASONS = ["Kharif", "Rabi", "Zaid", "Perennial"];

interface PolicyData {
  policyNumber?: string;
  farmerId?: string;
  cropType?: string;
  insuredArea?: number | string;
  sumInsured?: number | string;
  premium?: number | string;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  // PMFBY-specific fields
  cropVariety?: string;
  expectedYield?: number | string;
  cultivationSeason?: string;
  sowingDate?: string;
  soilType?: string;
  irrigationMethod?: string;
  surveyNumber?: string;
  khewatNumber?: string;
  insuranceUnit?: string;
  wildAnimalAttackCoverage?: boolean;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  cropDescription?: string;
}

const COMMON_CROPS = [
  "Rice", "Wheat", "Maize", "Cotton", "Sugarcane",
  "Soybean", "Groundnut", "Mustard", "Jowar", "Bajra",
  "Pulses", "Vegetables", "Fruits", "Spices"
];

const InsurerAddPolicy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingPolicy = location.state?.policy;
  const policyRequest = location.state?.request;
  const [farmers, setFarmers] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);

  const [policyData, setPolicyData] = useState<PolicyData>({
    policyNumber: '',
    farmerId: '',
    cropType: '',
    insuredArea: '',
    sumInsured: '',
    premium: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: '',
    cropVariety: '',
    expectedYield: '',
    cultivationSeason: '',
    sowingDate: '',
    soilType: '',
    irrigationMethod: '',
    surveyNumber: '',
    khewatNumber: '',
    insuranceUnit: '',
    wildAnimalAttackCoverage: false,
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    cropDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmersAndCrops = async () => {
      try {
        const [farmersRes, cropsRes] = await Promise.all([
          api.get('/insurer/farmers').catch(() => ({ data: [] })),
          api.get('/crops').catch(() => ({ data: [] })),
        ]);
        setFarmers(farmersRes.data || []);

        let fetchedCrops = cropsRes.data || [];
        // If insurer has no managed crops, Provide common defaults
        if (fetchedCrops.length === 0) {
          fetchedCrops = COMMON_CROPS.map(name => ({ id: name, name }));
        }

        // If we are responding to a request with a specific crop not in our list, add it
        if (policyRequest?.cropType && !fetchedCrops.find((c: any) => c.name === policyRequest.cropType)) {
          fetchedCrops.push({ id: policyRequest.cropType, name: policyRequest.cropType });
        }

        setCrops(fetchedCrops);
      } catch (err) {
        console.error('Error fetching farmers/crops:', err);
      }
    };

    fetchFarmersAndCrops();
  }, []); // Only fetch on mount

  useEffect(() => {
    if (editingPolicy) {
      setPolicyData({
        policyNumber: editingPolicy.policyNumber || editingPolicy.policyId || '',
        farmerId: (typeof editingPolicy.farmerId === 'object' ? editingPolicy.farmerId._id || editingPolicy.farmerId.id : editingPolicy.farmerId) || editingPolicy.farmer || '',
        cropType: editingPolicy.cropType || editingPolicy.crop || '',
        insuredArea: editingPolicy.insuredArea || '',
        sumInsured: editingPolicy.sumInsured || '',
        premium: editingPolicy.premium || '',
        startDate: editingPolicy.startDate?.split('T')[0] || '',
        endDate: editingPolicy.endDate?.split('T')[0] || '',
        status: editingPolicy.status || 'Active',
        notes: editingPolicy.notes || '',
        cropVariety: editingPolicy.cropDetails?.cropVariety || '',
        expectedYield: editingPolicy.cropDetails?.expectedYield || '',
        cultivationSeason: editingPolicy.cropDetails?.cultivationSeason || '',
        sowingDate: editingPolicy.cropDetails?.sowingDate || '',
        soilType: editingPolicy.cropDetails?.soilType || '',
        irrigationMethod: editingPolicy.cropDetails?.irrigationMethod || '',
        surveyNumber: editingPolicy.cropDetails?.surveyNumber || '',
        khewatNumber: editingPolicy.cropDetails?.khewatNumber || '',
        insuranceUnit: editingPolicy.cropDetails?.insuranceUnit || '',
        wildAnimalAttackCoverage: editingPolicy.cropDetails?.wildAnimalAttackCoverage || false,
        bankName: editingPolicy.cropDetails?.bankName || '',
        bankAccountNo: editingPolicy.cropDetails?.bankAccountNo || '',
        bankIfsc: editingPolicy.cropDetails?.bankIfsc || '',
        cropDescription: editingPolicy.cropDetails?.cropDescription || '',
      });
    } else if (policyRequest) {
      const fId = policyRequest.farmerId || policyRequest.farmer?._id || policyRequest.farmer?.id || '';
      // We can look up details since we have the farmers list now
      const farmerProfile = farmers.find(f => (f._id || f.id) === fId);

      setPolicyData({
        policyNumber: `POL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
        farmerId: fId,
        cropType: policyRequest.cropName || policyRequest.cropType || farmerProfile?.cropType || '',
        insuredArea: policyRequest.insuredArea || farmerProfile?.area || '',
        sumInsured: policyRequest.sumInsured || '',
        premium: '',
        startDate: policyRequest.requestedStartDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Active',
        notes: '',
        cropVariety: policyRequest.cropDetails?.cropVariety || farmerProfile?.cropVariety || '',
        expectedYield: policyRequest.cropDetails?.expectedYield || farmerProfile?.expectedYield || '',
        cultivationSeason: policyRequest.cropDetails?.cultivationSeason || farmerProfile?.cropSeason || '',
        sowingDate: (policyRequest.cropDetails?.sowingDate || '').split('T')[0],
        soilType: policyRequest.cropDetails?.soilType || farmerProfile?.soilType || '',
        irrigationMethod: policyRequest.cropDetails?.irrigationMethod || farmerProfile?.irrigationMethod || '',
        surveyNumber: policyRequest.cropDetails?.surveyNumber || farmerProfile?.surveyNumber || '',
        khewatNumber: policyRequest.cropDetails?.khewatNumber || farmerProfile?.landRecordKhatauni || '',
        insuranceUnit: policyRequest.cropDetails?.insuranceUnit || farmerProfile?.village || '',
        wildAnimalAttackCoverage: policyRequest.cropDetails?.wildAnimalAttackCoverage ?? farmerProfile?.wildAnimalAttackCoverage ?? false,
        bankName: policyRequest.cropDetails?.bankName || farmerProfile?.bankName || '',
        bankAccountNo: policyRequest.cropDetails?.bankAccountNo || farmerProfile?.bankAccountNo || '',
        bankIfsc: policyRequest.cropDetails?.bankIfsc || farmerProfile?.bankIfsc || '',
        cropDescription: policyRequest.cropDetails?.cropDescription || '',
      });
    } else {
      // New Policy Creation - Defaults
      setPolicyData(prev => ({
        ...prev,
        policyNumber: `POL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
        startDate: new Date().toISOString().split('T')[0],
      }));
    }
  }, [editingPolicy, policyRequest, farmers]); // This runs when farmers are loaded or policy/request changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPolicyData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPolicyData(prev => {
      const newData = { ...prev, [name]: value };

      // Automate dates based on season selection
      if (name === 'cultivationSeason') {
        const currentYear = new Date().getFullYear();
        if (value === 'Kharif') {
          newData.startDate = `${currentYear}-06-01`;
          newData.endDate = `${currentYear}-10-31`;
        } else if (value === 'Rabi') {
          newData.startDate = `${currentYear}-10-01`;
          newData.endDate = `${currentYear + 1}-03-31`;
        } else if (value === 'Zaid') {
          newData.startDate = `${currentYear}-02-01`;
          newData.endDate = `${currentYear}-05-30`;
        }
      }

      return newData;
    });
  };

  const handleFarmerSelect = (farmerId: string) => {
    const selectedFarmer = farmers.find(f => (f._id || f.id) === farmerId);
    if (selectedFarmer) {
      setPolicyData(prev => ({
        ...prev,
        farmerId,
        cropType: selectedFarmer.cropType || prev.cropType,
        cropVariety: selectedFarmer.cropVariety || prev.cropVariety,
        surveyNumber: selectedFarmer.surveyNumber || selectedFarmer.landRecordKhasra || prev.surveyNumber,
        khewatNumber: selectedFarmer.khewatNumber || selectedFarmer.landRecordKhatauni || prev.khewatNumber,
        insuranceUnit: selectedFarmer.insuranceUnit || selectedFarmer.village || prev.insuranceUnit,
        bankName: selectedFarmer.bankName || prev.bankName,
        bankAccountNo: selectedFarmer.bankAccountNo || prev.bankAccountNo,
        bankIfsc: selectedFarmer.bankIfsc || prev.bankIfsc,
        insuredArea: parseFloat(selectedFarmer.landAreaSize || selectedFarmer.area) || prev.insuredArea,
        cultivationSeason: selectedFarmer.cropSeason || prev.cultivationSeason,
        wildAnimalAttackCoverage: !!selectedFarmer.wildAnimalAttackCoverage,
      }));
    } else {
      setPolicyData(prev => ({ ...prev, farmerId }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setPolicyData(prev => ({ ...prev, wildAnimalAttackCoverage: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Frontend Mandatory Field Validation
    if (!policyData.farmerId || policyData.farmerId.trim() === '') {
      setError('Please select a farmer.');
      setLoading(false);
      return;
    }
    if (!policyData.cropType || policyData.cropType.trim() === '') {
      setError('Please select a crop type.');
      setLoading(false);
      return;
    }
    if (!policyData.insuredArea || parseFloat(policyData.insuredArea.toString()) <= 0) {
      setError('Please enter a valid insured area.');
      setLoading(false);
      return;
    }
    if (!policyData.startDate || !policyData.endDate) {
      setError('Please select both start and end dates.');
      setLoading(false);
      return;
    }

    try {
      // Prepare payload with cropDetails JSON
      const payload = {
        policyNumber: policyData.policyNumber,
        farmerId: policyData.farmerId,
        cropType: policyData.cropType,
        insuredArea: parseFloat(policyData.insuredArea?.toString() || '0'),
        startDate: policyData.startDate,
        endDate: policyData.endDate,
        premium: parseFloat(policyData.premium?.toString() || '0'),
        sumInsured: parseFloat(policyData.sumInsured?.toString() || '0'),
        status: policyData.status,
        cropDetails: {
          cropVariety: policyData.cropVariety,
          expectedYield: parseFloat(policyData.expectedYield?.toString() || '0'),
          cultivationSeason: policyData.cultivationSeason,
          sowingDate: policyData.sowingDate,
          soilType: policyData.soilType,
          irrigationMethod: policyData.irrigationMethod,
          surveyNumber: policyData.surveyNumber,
          khewatNumber: policyData.khewatNumber,
          insuranceUnit: policyData.insuranceUnit,
          wildAnimalAttackCoverage: policyData.wildAnimalAttackCoverage,
          bankName: policyData.bankName,
          bankAccountNo: policyData.bankAccountNo,
          bankIfsc: policyData.bankIfsc,
          cropDescription: policyData.cropDescription,
        },
      };

      if (editingPolicy?._id || editingPolicy?.id) {
        await api.put(`/policies/${editingPolicy._id || editingPolicy.id}`, payload);
        setSuccess('Policy updated successfully!');
      } else if (policyRequest) {
        // Correctly use the issuance endpoint when processing a request
        const requestId = policyRequest.id || policyRequest._id;
        await api.post(`/policy-requests/${requestId}/issue`, payload);
        setSuccess('Policy issued from request successfully!');
      } else {
        await api.post('/policies', payload);
        setSuccess('Policy created successfully!');
      }
      setTimeout(() => {
        navigate('/insurer-dashboard/policy-management');
      }, 1500);
    } catch (err: any) {
      console.error('Policy save error:', err);
      setError(err?.response?.data?.message || 'Failed to save policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
          </h1>
          <p className="text-gray-600 mt-1">
            {editingPolicy ? 'Update policy information' : 'Create a new PMFBY-compliant insurance policy'}
          </p>
        </div>
        <Link to="/insurer-dashboard/policy-management">
          <Button variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </Link>
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

        {/* Policy Information */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="bg-purple-50/50 border-b border-purple-100">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <FileText className="h-5 w-5" />
              Policy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  value={policyData.policyNumber}
                  onChange={handleChange}
                  placeholder="Auto-generated"
                  readOnly={true}
                  className="mt-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-500 mt-1 italic">
                  Auto-generated by system. Cannot be edited manually.
                </p>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={policyData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farmer & Crop Selection */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="h-5 w-5" />
              Farmer & Crop Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="farmerId">Select Farmer *</Label>
                <Select
                  value={policyData.farmerId}
                  onValueChange={handleFarmerSelect}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer._id || farmer.id} value={farmer._id || farmer.id}>
                        {farmer.name} {farmer.contact ? `(${farmer.contact})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select
                  value={policyData.cropType}
                  onValueChange={(value) => handleSelectChange('cropType', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop._id || crop.id} value={crop.name}>
                        {crop.name} {crop.variety ? `(${crop.variety})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cropVariety">Crop Variety</Label>
                <Input
                  id="cropVariety"
                  name="cropVariety"
                  value={policyData.cropVariety}
                  onChange={handleChange}
                  placeholder="e.g., Basmati, Hybrid"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="insuredArea">Insured Area (acres) *</Label>
                <Input
                  id="insuredArea"
                  name="insuredArea"
                  type="number"
                  step="0.01"
                  value={policyData.insuredArea}
                  onChange={handleChange}
                  placeholder="10.5"
                  min="0"
                  required
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PMFBY Crop Details */}
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="bg-green-50/50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Crop className="h-5 w-5" />
              PMFBY Crop Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cultivationSeason">Cultivation Season</Label>
                <Select
                  value={policyData.cultivationSeason}
                  onValueChange={(value) => handleSelectChange('cultivationSeason', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>{season}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sowingDate">Sowing Date</Label>
                <Input
                  id="sowingDate"
                  name="sowingDate"
                  type="date"
                  value={policyData.sowingDate}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="expectedYield">Expected Yield (tons/acre)</Label>
                <Input
                  id="expectedYield"
                  name="expectedYield"
                  type="number"
                  step="0.01"
                  value={policyData.expectedYield}
                  onChange={handleChange}
                  placeholder="2.5"
                  min="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Select
                  value={policyData.soilType}
                  onValueChange={(value) => handleSelectChange('soilType', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((soil) => (
                      <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="irrigationMethod">Irrigation Method</Label>
                <Select
                  value={policyData.irrigationMethod}
                  onValueChange={(value) => handleSelectChange('irrigationMethod', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select irrigation method" />
                  </SelectTrigger>
                  <SelectContent>
                    {IRRIGATION_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="cropDescription">Crop Description</Label>
              <Textarea
                id="cropDescription"
                name="cropDescription"
                value={policyData.cropDescription}
                onChange={handleChange}
                placeholder="Additional details about the crop..."
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Land Records */}
        <Card className="border-l-4 border-l-cyan-500 shadow-lg">
          <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
            <CardTitle className="flex items-center gap-2 text-cyan-900">
              <MapPin className="h-5 w-5" />
              Land Records & Administrative Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="surveyNumber">Survey Number</Label>
                <Input
                  id="surveyNumber"
                  name="surveyNumber"
                  value={policyData.surveyNumber}
                  onChange={handleChange}
                  placeholder="e.g., 123/4"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="khewatNumber">Khewat Number</Label>
                <Input
                  id="khewatNumber"
                  name="khewatNumber"
                  value={policyData.khewatNumber}
                  onChange={handleChange}
                  placeholder="e.g., 456"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="insuranceUnit">Insurance Unit (Village/Block)</Label>
                <Input
                  id="insuranceUnit"
                  name="insuranceUnit"
                  value={policyData.insuranceUnit}
                  onChange={handleChange}
                  placeholder="e.g., Village Name"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wildAnimalAttackCoverage"
                checked={policyData.wildAnimalAttackCoverage}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="wildAnimalAttackCoverage" className="cursor-pointer">
                Wild Animal Attack Coverage
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="border-l-4 border-l-amber-500 shadow-lg">
          <CardHeader className="bg-amber-50/50 border-b border-amber-100">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <DollarSign className="h-5 w-5" />
              Bank Details (for DBT)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={policyData.bankName}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bankAccountNo">Bank Account Number</Label>
                <Input
                  id="bankAccountNo"
                  name="bankAccountNo"
                  value={policyData.bankAccountNo}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bankIfsc">Bank IFSC Code</Label>
                <Input
                  id="bankIfsc"
                  name="bankIfsc"
                  value={policyData.bankIfsc}
                  onChange={handleChange}
                  placeholder="e.g., SBIN0001234"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card className="border-l-4 border-l-indigo-500 shadow-lg">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sumInsured">Sum Insured (₹) *</Label>
                <Input
                  id="sumInsured"
                  name="sumInsured"
                  type="number"
                  value={policyData.sumInsured}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="premium">Premium Amount (₹)</Label>
                <Input
                  id="premium"
                  name="premium"
                  type="number"
                  value={policyData.premium}
                  onChange={handleChange}
                  placeholder="5000"
                  min="0"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Period */}
        <Card className="border-l-4 border-l-red-500 shadow-lg">
          <CardHeader className="bg-red-50/50 border-b border-red-100">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Calendar className="h-5 w-5" />
              Policy Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={policyData.startDate}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={policyData.endDate}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={policyData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about the policy..."
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/insurer-dashboard/policy-management">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InsurerAddPolicy;

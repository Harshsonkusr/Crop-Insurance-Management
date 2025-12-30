import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Save, X, Shield, User, Crop, Calendar, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';

interface PolicyData {
  policyNumber?: string;
  farmerId?: string;
  cropType?: string;
  sumInsured?: number;
  premium?: number;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  coverage?: string;
}

const ServiceProviderAddPolicy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingPolicy = location.state?.policy;
  const [farmers, setFarmers] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);

  const [policyData, setPolicyData] = useState<PolicyData>({
    policyNumber: '',
    farmerId: '',
    cropType: '',
    sumInsured: 0,
    premium: 0,
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: '',
    coverage: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmersAndCrops = async () => {
      try {
        const [farmersRes, cropsRes] = await Promise.all([
          api.get('/service-provider/farmers').catch(() => ({ data: [] })),
          api.get('/crops').catch(() => ({ data: [] })),
        ]);
        setFarmers(farmersRes.data || []);
        setCrops(cropsRes.data || []);
      } catch (err) {
        console.error('Error fetching farmers/crops:', err);
      }
    };

    fetchFarmersAndCrops();

    if (editingPolicy) {
      setPolicyData({
        policyNumber: editingPolicy.policyNumber || editingPolicy.policyId || '',
        farmerId: (typeof editingPolicy.farmerId === 'object' ? editingPolicy.farmerId._id || editingPolicy.farmerId.id : editingPolicy.farmerId) || editingPolicy.farmer || '',
        cropType: editingPolicy.cropType || editingPolicy.crop || '',
        sumInsured: editingPolicy.sumInsured || 0,
        premium: editingPolicy.premium || 0,
        startDate: editingPolicy.startDate?.split('T')[0] || '',
        endDate: editingPolicy.endDate?.split('T')[0] || '',
        status: editingPolicy.status || 'Active',
        notes: editingPolicy.notes || '',
        coverage: editingPolicy.coverage || '',
      });
    }
  }, [editingPolicy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPolicyData(prev => ({
      ...prev,
      [name]: name === 'sumInsured' || name === 'premium' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPolicyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingPolicy?._id || editingPolicy?.id) {
        await api.put(`/policies/${editingPolicy._id || editingPolicy.id}`, policyData);
        setSuccess('Policy updated successfully!');
      } else {
        await api.post('/policies', policyData);
        setSuccess('Policy created successfully!');
      }
      setTimeout(() => {
        navigate('/service-provider-dashboard/policy-management');
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
            {editingPolicy ? 'Update policy information' : 'Create a new insurance policy for a farmer'}
          </p>
        </div>
        <Link to="/service-provider-dashboard/policy-management">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  value={policyData.policyNumber}
                  onChange={handleChange}
                  placeholder="Auto-generated if empty"
                  readOnly={!!editingPolicy}
                  className="mt-2"
                />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Farmer & Crop Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="farmerId">Select Farmer *</Label>
                <Select
                  value={policyData.farmerId}
                  onValueChange={(value) => handleSelectChange('farmerId', value)}
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
            </div>
            <div>
              <Label htmlFor="coverage">Coverage Area</Label>
              <Input
                id="coverage"
                name="coverage"
                value={policyData.coverage}
                onChange={handleChange}
                placeholder="e.g., 10 acres"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Policy Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <Link to="/service-provider-dashboard/policy-management">
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

export default ServiceProviderAddPolicy;

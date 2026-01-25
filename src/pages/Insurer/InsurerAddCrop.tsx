import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Save, X, Crop, Calendar, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';

interface CropData {
  name: string;
  description?: string;
  expectedYield?: string;
  cultivationSeason?: string;
  variety?: string;
  activePolicies?: number;
  cropYield?: string;
  previousClaims?: number;
  damageSusceptibility?: string;
}

const InsurerAddCrop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingCrop = location.state?.crop;

  const [cropData, setCropData] = useState<CropData>({
    name: '',
    description: '',
    expectedYield: '',
    cultivationSeason: '',
    variety: '',
    activePolicies: 0,
    cropYield: '',
    previousClaims: 0,
    damageSusceptibility: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editingCrop) {
      setCropData({
        name: editingCrop.name || '',
        description: editingCrop.description || '',
        expectedYield: editingCrop.expectedYield || editingCrop.cropYield || '',
        cultivationSeason: editingCrop.cultivationSeason || editingCrop.season || '',
        variety: editingCrop.variety || '',
        activePolicies: editingCrop.activePolicies || 0,
        cropYield: editingCrop.cropYield || '',
        previousClaims: editingCrop.previousClaims || 0,
        damageSusceptibility: editingCrop.damageSusceptibility || 'Medium',
      });
    }
  }, [editingCrop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCropData(prev => ({
      ...prev,
      [name]: name === 'activePolicies' || name === 'previousClaims' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCropData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingCrop?._id || editingCrop?.id) {
        await api.put(`/crops/${editingCrop._id || editingCrop.id}`, cropData);
        setSuccess('Crop updated successfully!');
      } else {
        await api.post('/crops', cropData);
        setSuccess('Crop added successfully!');
      }
      setTimeout(() => {
        navigate('/insurer-dashboard/crop-management');
      }, 1500);
    } catch (err: any) {
      console.error('Crop save error:', err);
      setError(err?.response?.data?.message || 'Failed to save crop. Please try again.');
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
            <Crop className="h-8 w-8 text-purple-600" />
            {editingCrop ? 'Edit Crop' : 'Add New Crop'}
          </h1>
          <p className="text-gray-600 mt-1">
            {editingCrop ? 'Update crop information' : 'Add a new crop to your management system'}
          </p>
        </div>
        <Link to="/insurer-dashboard/crop-management">
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

        {/* Basic Information */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="bg-purple-50/50 border-b border-purple-100">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Crop Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={cropData.name}
                  onChange={handleChange}
                  placeholder="e.g., Wheat, Rice, Cotton"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  name="variety"
                  value={cropData.variety}
                  onChange={handleChange}
                  placeholder="e.g., HD 2967, Basmati 370"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cultivationSeason">Cultivation Season</Label>
                <Select
                  value={cropData.cultivationSeason}
                  onValueChange={(value) => handleSelectChange('cultivationSeason', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rabi">Rabi</SelectItem>
                    <SelectItem value="Kharif">Kharif</SelectItem>
                    <SelectItem value="Zaid">Zaid</SelectItem>
                    <SelectItem value="Year Round">Year Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="damageSusceptibility">Damage Susceptibility</Label>
                <Select
                  value={cropData.damageSusceptibility}
                  onValueChange={(value) => handleSelectChange('damageSusceptibility', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={cropData.description}
                onChange={handleChange}
                placeholder="Additional details about the crop..."
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Yield & Statistics */}
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="bg-green-50/50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="h-5 w-5" />
              Yield & Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedYield">Expected Yield</Label>
                <Input
                  id="expectedYield"
                  name="expectedYield"
                  value={cropData.expectedYield}
                  onChange={handleChange}
                  placeholder="e.g., 50 quintals/acre"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="cropYield">Current Crop Yield</Label>
                <Input
                  id="cropYield"
                  name="cropYield"
                  value={cropData.cropYield}
                  onChange={handleChange}
                  placeholder="e.g., 45 quintals/acre"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activePolicies">Active Policies</Label>
                <Input
                  id="activePolicies"
                  name="activePolicies"
                  type="number"
                  value={cropData.activePolicies}
                  onChange={handleChange}
                  min="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="previousClaims">Previous Claims</Label>
                <Input
                  id="previousClaims"
                  name="previousClaims"
                  type="number"
                  value={cropData.previousClaims}
                  onChange={handleChange}
                  min="0"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/insurer-dashboard/crop-management">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : editingCrop ? 'Update Crop' : 'Add Crop'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InsurerAddCrop;

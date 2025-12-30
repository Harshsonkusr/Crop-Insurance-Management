import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Save, X, User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';

interface FarmerData {
  name: string;
  email?: string;
  contact: string;
  location?: string;
  address?: string;
  registeredDate?: string;
  status: string;
  notes?: string;
}

const ServiceProviderAddFarmer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingFarmer = location.state?.farmer;

  const [farmerData, setFarmerData] = useState<FarmerData>({
    name: '',
    email: '',
    contact: '',
    location: '',
    address: '',
    registeredDate: '',
    status: 'Active',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editingFarmer) {
      setFarmerData({
        name: editingFarmer.name || '',
        email: editingFarmer.email || '',
        contact: editingFarmer.contact || editingFarmer.mobileNumber || '',
        location: editingFarmer.location || '',
        address: editingFarmer.address || '',
        registeredDate: editingFarmer.registeredDate || editingFarmer.createdAt?.split('T')[0] || '',
        status: editingFarmer.status || 'Active',
        notes: editingFarmer.notes || '',
      });
    }
  }, [editingFarmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFarmerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFarmerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingFarmer?._id || editingFarmer?.id) {
        await api.put(`/service-provider/farmers/${editingFarmer._id || editingFarmer.id}`, farmerData);
        setSuccess('Farmer updated successfully!');
      } else {
        await api.post('/service-provider/farmers', farmerData);
        setSuccess('Farmer added successfully!');
      }
      setTimeout(() => {
        navigate('/service-provider-dashboard/farmer-management');
      }, 1500);
    } catch (err: any) {
      console.error('Farmer save error:', err);
      setError(err?.response?.data?.message || 'Failed to save farmer. Please try again.');
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
            <User className="h-8 w-8 text-purple-600" />
            {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
          </h1>
          <p className="text-gray-600 mt-1">
            {editingFarmer ? 'Update farmer information' : 'Register a new farmer in your system'}
          </p>
        </div>
        <Link to="/service-provider-dashboard/farmer-management">
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

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Farmer Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={farmerData.name}
                  onChange={handleChange}
                  placeholder="Enter farmer's full name"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={farmerData.contact}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={farmerData.email}
                  onChange={handleChange}
                  placeholder="farmer@example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={farmerData.location}
                  onChange={handleChange}
                  placeholder="Village, District"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={farmerData.address}
                onChange={handleChange}
                placeholder="Complete address with pin code"
                rows={2}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Registration Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registeredDate">Registered Date</Label>
                <Input
                  id="registeredDate"
                  name="registeredDate"
                  type="date"
                  value={farmerData.registeredDate}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={farmerData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={farmerData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about the farmer..."
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/service-provider-dashboard/farmer-management">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : editingFarmer ? 'Update Farmer' : 'Add Farmer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceProviderAddFarmer;

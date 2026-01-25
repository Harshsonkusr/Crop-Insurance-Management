import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Mail, Phone, MapPin, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import api from '../../lib/api';

const AdminAddInsurer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceType: 'Crop Monitoring',
    description: '',
    // Extended fields
    businessName: '',
    spType: 'Insurance Company',
    gstNumber: '',
    panNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    aiAssessmentCertified: false,
    state: '',
    district: '',
    serviceArea: '', // Comma separated string
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Name, email, and phone are required");
      setLoading(false);
      return;
    }

    try {
      // Convert serviceArea string to array if needed on backend, 
      // but our backend logic now handles string parsing too.
      // We'll send it as JSON string or let backend handle it.
      // Let's send a JSON string array to be safe since backend expects JSON.parse if string
      const serviceAreaArray = formData.serviceArea
        ? formData.serviceArea.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        serviceArea: JSON.stringify(serviceAreaArray)
      };

      await api.post('/admin/insurers', payload);
      setSuccess("Insurer added successfully! Account created with default password.");
      setTimeout(() => {
        navigate("/admin-dashboard/insurers");
      }, 2000);
    } catch (err: any) {
      console.error("Error adding insurer:", err);
      setError(err?.response?.data?.message || "Failed to add insurer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin-dashboard/insurers"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Building2 className="h-8 w-8" />
            </span>
            Add Insurer
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Create a new insurer profile (User account will be auto-created)</p>
        </div>
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

        {/* Business Information */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="businessName">Business Name (Company)</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. AgriSure Tech Pvt Ltd"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="spType">Provider Type</Label>
              <Select
                value={formData.spType}
                onValueChange={(value) => setFormData({ ...formData, spType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insurance Company">Insurance Company</SelectItem>
                  <SelectItem value="Individual Surveyor">Individual Surveyor</SelectItem>
                  <SelectItem value="Agri-Tech Firm">Agri-Tech Firm</SelectItem>
                  <SelectItem value="Logistics Provider">Logistics Provider</SelectItem>
                  <SelectItem value="Lab Service">Lab Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Contact Person Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="serviceType">Primary Service</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crop Monitoring">Crop Monitoring</SelectItem>
                  <SelectItem value="Pest Control">Pest Control</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Soil Testing">Soil Testing</SelectItem>
                  <SelectItem value="Claim Survey">Claim Survey</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="border-l-4 border-l-cyan-500 shadow-lg">
          <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
            <CardTitle className="flex items-center gap-2 text-cyan-900">
              <Phone className="h-5 w-5" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="corporate@example.com"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="mt-2"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal & Compliance */}
        <Card className="border-l-4 border-l-amber-500 shadow-lg">
          <CardHeader className="bg-amber-50/50 border-b border-amber-100">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <FileText className="h-5 w-5" />
              Legal & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="22AAAAA0000A1Z5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  placeholder="ABCDE1234F"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">IRDAI License No.</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="License Number"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="aiCertified" className="font-semibold text-gray-900">AI Assessment Certified</Label>
                <p className="text-sm text-gray-500">Is this provider certified for AI-based claim assessment?</p>
              </div>
              <Switch
                id="aiCertified"
                checked={formData.aiAssessmentCertified}
                onCheckedChange={(checked) => setFormData({ ...formData, aiAssessmentCertified: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Service Area */}
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="bg-green-50/50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <MapPin className="h-5 w-5" />
              Location & Service Area
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Nagpur"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Building No, Street, City, Zip"
                rows={2}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="serviceArea">Service Area (Districts/GPs)</Label>
              <Textarea
                id="serviceArea"
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                placeholder="Enter comma-separated locations (e.g. Nagpur, Wardha, Amravati)"
                rows={3}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple locations with commas.</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            to="/admin-dashboard/insurers"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating Account...' : 'Create Insurer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddInsurer;

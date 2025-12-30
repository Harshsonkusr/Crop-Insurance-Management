import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertTriangle, User, MapPin, Calendar, FileText, Image as ImageIcon, Shield, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';

interface ClaimDetails {
  id: string;
  _id?: string; // Keep for backward compatibility
  claimId: string;
  farmerId?: {
    name: string;
    id?: string;
    mobileNumber?: string;
  };
  farmerName?: string;
  location?: string;
  locationOfIncident?: string;
  cropType?: string;
  dateOfClaim?: string;
  submissionDate?: string;
  dateOfIncident?: string;
  status: string;
  description?: string;
  damageDescription?: string;
  images?: string[];
  documents?: string[];
  policyId?: {
    policyNumber?: string;
    sumInsured?: number;
  };
  policyDetails?: {
    policyId: string;
    coverage: string;
    claimLimit: string;
  };
  verificationStatus?: string;
}

const ServiceProviderClaimDetails = () => {
  const { claimId } = useParams();
  const [claimDetails, setClaimDetails] = useState<ClaimDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState({
    verifiedArea: '',
    damageConfirmation: '',
    commentBox: '',
    fieldPhotos: null as FileList | null,
  });

  useEffect(() => {
    const fetchClaimDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/service-provider/claims/${claimId}`);
        setClaimDetails(response.data);
      } catch (err: any) {
        console.error('Claim details fetch error:', err);
        setError(err?.response?.data?.message || 'Failed to fetch claim details.');
      } finally {
        setLoading(false);
      }
    };

    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  const handleVerificationChange = (name: string, value: string) => {
    setVerificationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVerificationData(prev => ({ ...prev, fieldPhotos: e.target.files }));
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await api.put(`/service-provider/claims/${claimId}/draft`, verificationData);
      alert('Draft saved successfully!');
    } catch (err: any) {
      console.error('Save draft error:', err);
      alert(err?.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!verificationData.damageConfirmation) {
      alert('Please select damage confirmation before submitting.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/service-provider/claims/${claimId}/submit`, verificationData);
      alert('Report submitted successfully!');
      // Refresh claim details
      const response = await api.get(`/service-provider/claims/${claimId}`);
      setClaimDetails(response.data);
    } catch (err: any) {
      console.error('Submit report error:', err);
      alert(err?.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkFraudSuspect = async () => {
    if (!window.confirm('Are you sure you want to mark this claim as fraud suspect?')) return;
    setSaving(true);
    try {
      await api.post(`/service-provider/claims/${claimId}/fraud-suspect`, {});
      alert('Claim marked as fraud suspect!');
      const response = await api.get(`/service-provider/claims/${claimId}`);
      setClaimDetails(response.data);
    } catch (err: any) {
      console.error('Mark fraud suspect error:', err);
      alert(err?.response?.data?.message || 'Failed to mark as fraud suspect.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error && !claimDetails) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!claimDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No claim details found.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    };
    const statusLower = status?.toLowerCase() || '';
    const statusConfig = config[statusLower] || { label: status || 'Unknown', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/service-provider-dashboard/claim-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-purple-600" />
              Claim Details: {claimDetails.claimId || claimId}
            </h1>
            <p className="text-gray-600 mt-1">Review and verify claim information</p>
          </div>
        </div>
        {getStatusBadge(claimDetails.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Claim Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Farmer Name</Label>
                <p className="font-medium">{claimDetails.farmerName || claimDetails.farmerId?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Contact</Label>
                <p className="font-medium">{claimDetails.farmerId?.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Location</Label>
                <p className="font-medium">{claimDetails.location || claimDetails.locationOfIncident || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Crop Type</Label>
                <p className="font-medium">{claimDetails.cropType || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Date of Incident</Label>
                <p className="font-medium">
                  {claimDetails.dateOfIncident 
                    ? new Date(claimDetails.dateOfIncident).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Date Submitted</Label>
                <p className="font-medium">
                  {claimDetails.dateOfClaim || claimDetails.submissionDate
                    ? new Date(claimDetails.dateOfClaim || claimDetails.submissionDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            {(claimDetails.description || claimDetails.damageDescription) && (
              <div>
                <Label className="text-gray-500">Damage Description</Label>
                <p className="mt-2 text-gray-700">{claimDetails.description || claimDetails.damageDescription}</p>
              </div>
            )}
            {claimDetails.images && claimDetails.images.length > 0 && (
              <div>
                <Label className="text-gray-500 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Farmer's Uploaded Images
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {claimDetails.images.map((image, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => window.open(`/api/claims/${claimDetails.id}/files/images/${index}`, '_blank')}>
                      <img
                        src={`/api/claims/${claimDetails.id}/files/images/${index}`}
                        alt={`Claim Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                        <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farmer's Uploaded Documents */}
            {claimDetails.documents && claimDetails.documents.length > 0 && (
              <div>
                <Label className="text-gray-500 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Farmer's Uploaded Documents
                </Label>
                <div className="space-y-2 mt-2">
                  {claimDetails.documents.map((document, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Document {index + 1}
                          </p>
                          <p className="text-sm text-gray-500">
                            {document.split('/').pop() || 'Unknown file'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(`/api/claims/${claimDetails.id}/files/documents/${index}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Policy Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-gray-500">Policy Number</Label>
              <p className="font-medium">
                {claimDetails.policyDetails?.policyId || claimDetails.policyId?.policyNumber || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-gray-500">Coverage</Label>
              <p className="font-medium">{claimDetails.policyDetails?.coverage || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-500">Sum Insured</Label>
              <p className="font-medium">
                {claimDetails.policyId?.sumInsured 
                  ? `₹${claimDetails.policyId.sumInsured.toLocaleString('en-IN')}`
                  : claimDetails.policyDetails?.claimLimit || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verification Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verifiedArea">Verified Area</Label>
              <Input
                id="verifiedArea"
                value={verificationData.verifiedArea}
                onChange={(e) => handleVerificationChange('verifiedArea', e.target.value)}
                placeholder="e.g., 100 acres"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="damageConfirmation">Damage Confirmation *</Label>
              <Select
                value={verificationData.damageConfirmation}
                onValueChange={(value) => handleVerificationChange('damageConfirmation', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select confirmation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Damage Confirmed</SelectItem>
                  <SelectItem value="no">No - No Damage</SelectItem>
                  <SelectItem value="partial">Partial - Partial Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="commentBox">Comments</Label>
            <Textarea
              id="commentBox"
              value={verificationData.commentBox}
              onChange={(e) => handleVerificationChange('commentBox', e.target.value)}
              placeholder="Add your verification comments here..."
              rows={4}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fieldPhotos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload Field Photos
            </Label>
            <Input
              id="fieldPhotos"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*"
              className="mt-2"
            />
            {verificationData.fieldPhotos && (
              <p className="text-sm text-gray-500 mt-1">
                {verificationData.fieldPhotos.length} file(s) selected
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkFraudSuspect}
              disabled={saving}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark Fraud Suspect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceProviderClaimDetails;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertTriangle, User, MapPin, Calendar, FileText, Image as ImageIcon, Shield, Camera, Satellite, CheckCircle, Cloud, Droplets, Thermometer, Sprout, Bug, Map, Phone, Mail, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '../../lib/api';

interface ClaimDetails {
  id: string;
  _id?: string;
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
  // AI Fields
  aiDamagePercent?: number;
  aiRecommendedAmount?: number;
  aiValidationFlags?: any;
  aiReport?: any;
  // Payout
  payoutStatus?: string;
  payoutAmount?: number;
  payoutDate?: string;
  payoutTransactionId?: string;
  resolutionDetails?: string;
}

const itemValueOrNa = (val: any) => (val ? val : 'N/A');

const DetailItem = ({ label, value, icon: Icon, fullWidth = false }: { label: string, value: any, icon?: any, fullWidth?: boolean }) => (
  <div className={`${fullWidth ? 'col-span-full' : ''} p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center gap-2 mb-2">
      {Icon && <div className="p-1.5 bg-purple-50 rounded text-purple-600"><Icon className="h-4 w-4" /></div>}
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
    <div className="text-sm font-semibold text-gray-900 break-words">
      {value}
    </div>
  </div>
);

const InsurerClaimDetails = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
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

  // Payout State
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutData, setPayoutData] = useState({
    amount: '',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    if (claimDetails?.aiRecommendedAmount) {
      setPayoutData(prev => ({ ...prev, amount: claimDetails.aiRecommendedAmount?.toString() || '' }));
    } else if (claimDetails?.policyId?.sumInsured) {
      setPayoutData(prev => ({ ...prev, amount: claimDetails.policyId.sumInsured?.toString() || '' }));
    }
  }, [claimDetails]);

  const handlePayout = async () => {
    setSaving(true);
    try {
      await api.post(`/insurer/claims/${claimId}/payout`, payoutData);
      alert('Payout processed successfully!');
      setPayoutOpen(false);
      // Refresh
      const response = await api.get(`/insurer/claims/${claimId}`);
      setClaimDetails(response.data);
    } catch (err: any) {
      console.error('Payout error:', err);
      alert(err?.response?.data?.message || 'Failed to process payout.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchClaimDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/insurer/claims/${claimId}`);
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
      await api.put(`/insurer/claims/${claimId}/draft`, verificationData);
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
      await api.post(`/insurer/claims/${claimId}/submit`, verificationData);
      alert('Final Decision submitted successfully! The status has been updated and a report has been generated.');
      // Refresh claim details
      const response = await api.get(`/insurer/claims/${claimId}`);
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
      await api.post(`/insurer/claims/${claimId}/fraud-suspect`, {});
      alert('Claim marked as fraud suspect! The farmer has been notified.');
      const response = await api.get(`/insurer/claims/${claimId}`);
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
      'ai_satellite_processed': { label: 'Ready for Review', className: 'bg-blue-100 text-blue-800' }
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
          <Link to="/insurer-dashboard/claim-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-purple-900 tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8 text-purple-600" />
              Claim Review: {claimDetails.claimId || claimId}
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">Review AI insights and Farmer evidence to make your final decision.</p>
          </div>
        </div>
        {getStatusBadge(claimDetails.status)}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border text-gray-500">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
            <User className="h-4 w-4 mr-2" /> Claim Overview
          </TabsTrigger>
          <TabsTrigger value="ai-report" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
            <Satellite className="h-4 w-4 mr-2" /> AI Analysis Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Claim Information */}
            <Card className="lg:col-span-2 border-l-4 border-l-purple-500 shadow-lg">
              <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <User className="h-5 w-5" />
                  Claim Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    label="Farmer Name"
                    value={itemValueOrNa(claimDetails.farmerName || (claimDetails as any).farmer?.name)}
                    icon={User}
                  />
                  <DetailItem
                    label="Contact"
                    value={itemValueOrNa((claimDetails as any).farmer?.mobileNumber || (claimDetails as any).farmer?.mobileNumberEncrypted)}
                    icon={Phone}
                  />
                  <DetailItem
                    label="Location"
                    value={itemValueOrNa(claimDetails.location || claimDetails.locationOfIncident)}
                    icon={MapPin}
                  />
                  <DetailItem
                    label="Crop Type"
                    value={itemValueOrNa(claimDetails.cropType || (claimDetails as any).policy?.cropType)}
                    icon={FileText}
                  />
                  <DetailItem
                    label="Date of Incident"
                    value={claimDetails.dateOfIncident ? new Date(claimDetails.dateOfIncident).toLocaleDateString() : 'N/A'}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Date Submitted"
                    value={(claimDetails.dateOfClaim || (claimDetails as any).createdAt) ? new Date(claimDetails.dateOfClaim || (claimDetails as any).createdAt).toLocaleDateString() : 'N/A'}
                    icon={Calendar}
                  />
                  <Button variant="outline" className="w-full text-xs" onClick={() => navigate(`/insurer-dashboard/view-detail/farmer/${claimDetails.farmerId}`)}>
                    View Full Profile
                  </Button>
                </div>

                {(claimDetails.description || claimDetails.damageDescription) && (
                  <DetailItem
                    label="Damage Description"
                    value={claimDetails.description || claimDetails.damageDescription}
                    icon={FileText}
                    fullWidth
                  />
                )}
                {/* Farmer's Uploaded Images */}
                {((claimDetails as any).images || (claimDetails as any).documents?.filter((f: any) => f.kind === 'image'))?.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Farmer's Uploaded Images
                    </Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {((claimDetails as any).images || (claimDetails as any).documents?.filter((f: any) => f.kind === 'image')).map((image: any, index: number) => {
                        const imgUrl = typeof image === 'string' ? image : image.path;
                        return (
                          <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-sm" onClick={() => window.open(imgUrl.startsWith('http') ? imgUrl : `/api/${imgUrl}`, '_blank')}>
                            <img
                              src={imgUrl.startsWith('http') ? imgUrl : `/api/${imgUrl}`}
                              alt={`Claim Image ${index + 1}`}
                              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Farmer's Uploaded Documents */}
                {((claimDetails as any).documents?.filter((f: any) => f.kind === 'document'))?.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Supporting Documents
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(claimDetails as any).documents.filter((f: any) => f.kind === 'document').map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-blue-50 rounded text-blue-600">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm truncate">
                                {doc.fileName || `Document ${index + 1}`}
                              </p>
                              <p className="text-[10px] text-gray-500 uppercase">
                                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'PDF'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.path.startsWith('http') ? doc.path : `/api/${doc.path}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 h-8"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policy Details */}
            <Card className="border-t-4 border-t-purple-600 shadow-lg">
              <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Shield className="h-5 w-5" />
                  Policy Context
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <DetailItem
                  label="Policy Number"
                  value={itemValueOrNa((claimDetails as any).policy?.policyNumber || claimDetails.policyDetails?.policyId)}
                  icon={FileText}
                />
                <DetailItem
                  label="Crop & Area"
                  value={`${itemValueOrNa((claimDetails as any).policy?.cropType)} (${itemValueOrNa((claimDetails as any).policy?.insuredArea)} acres)`}
                  icon={MapPin}
                />
                <DetailItem
                  label="Sum Insured"
                  value={(claimDetails as any).policy?.sumInsured
                    ? `₹${(claimDetails as any).policy.sumInsured.toLocaleString('en-IN')}`
                    : 'N/A'}
                  icon={DollarSign}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-report">
          <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Satellite className="h-6 w-6" />
                AI-Driven Damage Assessment Report
              </CardTitle>
              <CardDescription>
                Automated analysis from satellite imagery and fraud detection algorithms.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {claimDetails.aiDamagePercent !== null && claimDetails.aiDamagePercent !== undefined ? (
                <div className="space-y-8">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">AI Estimated Damage</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{claimDetails.aiDamagePercent.toFixed(1)}%</p>
                        <Badge variant={claimDetails.aiDamagePercent > 50 ? "destructive" : "outline"} className="mt-2">
                          {claimDetails.aiDamagePercent > 70 ? 'CRITICAL' : (claimDetails.aiDamagePercent > 40 ? 'MODERATE' : 'LOW')} SEVERITY
                        </Badge>
                      </div>
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${claimDetails.aiDamagePercent > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        <Satellite className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Recommended Payout</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">₹{(claimDetails.aiRecommendedAmount || 0).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-blue-600 mt-2 font-medium flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Based on {(claimDetails as any).policy?.sumInsured ? 'Sum Insured' : 'Policy Limits'}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Weather Analysis */}
                  {claimDetails.aiReport?.weatherAnalysis && (
                    <div className="bg-slate-50 border rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-blue-500" /> Weather Impact Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Droplets className="h-3 w-3" /> Rainfall (Season)</p>
                          <p className="font-bold text-gray-900">{claimDetails.aiReport.weatherAnalysis.rainfall}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${claimDetails.aiReport.weatherAnalysis.deviationFromNormal.includes('+') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {claimDetails.aiReport.weatherAnalysis.deviationFromNormal} vs Normal
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp Stress</p>
                          <p className="font-bold text-gray-900">{claimDetails.aiReport.weatherAnalysis.temperatureStress}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Flood Risk</p>
                          <Badge variant={claimDetails.aiReport.weatherAnalysis.floodRisk === 'HIGH' ? "destructive" : "secondary"}>
                            {claimDetails.aiReport.weatherAnalysis.floodRisk}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crop Health Intelligence */}
                  {claimDetails.aiReport?.cropHealth && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" /> Crop Health Intelligence
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-green-200 pb-2">
                            <span className="text-sm text-gray-600">NDVI Index (Vegetation)</span>
                            <span className="font-bold text-gray-900">{claimDetails.aiReport.cropHealth.ndviIndex}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-green-200 pb-2">
                            <span className="text-sm text-gray-600">Growth Stage</span>
                            <span className="font-medium text-gray-900">{claimDetails.aiReport.cropHealth.growthStage}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-green-200 pb-2">
                            <span className="text-sm text-gray-600">Chlorophyll Analysis</span>
                            <span className="font-medium text-amber-700">{claimDetails.aiReport.cropHealth.chlorophyllContent}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-green-200 pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-1"><Bug className="h-3 w-3" /> Pest Risk</span>
                            <span className="font-medium text-red-600">{claimDetails.aiReport.cropHealth.pestactivity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Geospatial Verification */}
                  {claimDetails.aiReport?.geospatial && (
                    <div className="bg-white border rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Map className="h-5 w-5 text-indigo-500" /> Geospatial Verification
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase">Location Match Score</p>
                          <p className={`text-xl font-bold mt-1 ${claimDetails.aiReport.geospatial.locationMatchScore > 80 ? 'text-green-600' : 'text-red-500'}`}>
                            {claimDetails.aiReport.geospatial.locationMatchScore}/100
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase">Field Boundary Overlap</p>
                          <p className="text-lg font-semibold mt-1 text-gray-800">{claimDetails.aiReport.geospatial.fieldBoundaryOverlap}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase">Soil Type Detected</p>
                          <p className="text-lg font-semibold mt-1 text-gray-800">{claimDetails.aiReport.geospatial.soilType}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fraud Flags */}
                  {claimDetails.aiValidationFlags && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Risk & Integrity Flags
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(claimDetails.aiValidationFlags).map(([key, value]) => {
                          // Handle array of strings (new mock format) or object (old format)
                          if (key === 'flags' && Array.isArray(value)) {
                            return value.map((flag: string, idx: number) => (
                              <div key={idx} className="flex items-center justify-between bg-red-50 p-3 border border-red-100 rounded-md shadow-sm">
                                <span className="text-red-700 font-medium">{flag}</span>
                                <Badge variant="destructive">Risk</Badge>
                              </div>
                            ));
                          }
                          if (key === 'isSuspect' || key === 'riskScore') return null; // Skip non-display fields or handle separately

                          return (
                            <div key={key} className="flex items-center justify-between bg-white p-3 border rounded-md shadow-sm">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <Badge variant={String(value).toLowerCase() === 'low' || String(value) === 'true' ? 'secondary' : 'destructive'}>
                                {String(value)}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Satellite className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No AI analysis report is available yet. The admin has not forwarded the report or analysis failed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Form (Always Visible at Bottom) */}
      <Card className="border-t-4 border-t-purple-500">
        <CardHeader className="bg-purple-50/50">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <FileText className="h-5 w-5" />
            Insurer Decision & Verification
          </CardTitle>
          <CardDescription>
            Review the evidence above and submit your final verdict.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verifiedArea">Verified Area (Acres)</Label>
              <Input
                id="verifiedArea"
                value={verificationData.verifiedArea}
                onChange={(e) => handleVerificationChange('verifiedArea', e.target.value)}
                placeholder="e.g., 100"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="damageConfirmation">Final Decision *</Label>
              <Select
                value={verificationData.damageConfirmation}
                onValueChange={(value) => handleVerificationChange('damageConfirmation', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Approve Claim (Damage Confirmed)</SelectItem>
                  <SelectItem value="no">Reject Claim (No Damage)</SelectItem>
                  <SelectItem value="partial">Approve Partial (Partial Damage)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="commentBox">Reason / Comments</Label>
            <Textarea
              id="commentBox"
              value={verificationData.commentBox}
              onChange={(e) => handleVerificationChange('commentBox', e.target.value)}
              placeholder="Explain your decision..."
              rows={4}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fieldPhotos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload Field Inspection Photos (Optional)
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
            {claimDetails.status === 'approved' ? (
              <Button
                onClick={() => setPayoutOpen(true)}
                className="bg-green-600 hover:bg-green-700 font-bold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Process Payout
              </Button>
            ) : claimDetails.status === 'resolved' || claimDetails.status === 'paid' ? (
              <Button disabled className="bg-green-800 text-white opacity-100">
                <CheckCircle className="h-4 w-4 mr-2" />
                Payout Processed
              </Button>
            ) : (
              <>
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
                  className="bg-purple-600 hover:bg-purple-700 font-semibold"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Final Decision
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleMarkFraudSuspect}
                  disabled={saving}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Flag as Fraud
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Claim Settlement</DialogTitle>
            <DialogDescription>
              Enter the payout details to settle this claim. This will notify the farmer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>payout Amount (₹)</Label>
              <Input
                type="number"
                value={payoutData.amount}
                onChange={(e) => setPayoutData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction / Reference ID</Label>
              <Input
                value={payoutData.transactionId}
                onChange={(e) => setPayoutData(prev => ({ ...prev, transactionId: e.target.value }))}
                placeholder="e.g. TXN12345678"
              />
            </div>
            <div className="space-y-2">
              <Label>Settlement Notes</Label>
              <Textarea
                value={payoutData.notes}
                onChange={(e) => setPayoutData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any comments for the farmer..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button onClick={handlePayout} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Processing...' : 'Confirm Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsurerClaimDetails;

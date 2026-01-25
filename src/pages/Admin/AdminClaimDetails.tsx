import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Download,
  Eye,
  Brain,
  Send,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from '../../lib/api';

interface ClaimDetails {
  id: string;
  _id?: string; // Keep for backward compatibility
  claimId?: string;
  farmerId: {
    name: string;
    id: string;
    _id?: string;
    mobileNumber?: string;
  };
  policyId?: {
    policyNumber: string;
    cropType: string;
    sumInsured: number;
  };
  dateOfClaim: string;
  dateOfIncident: string;
  locationOfIncident?: string;
  description: string;
  status: string;
  verificationStatus?: string;
  amountClaimed?: number;
  assignedTo?: {
    name: string;
    id: string;
    _id?: string;
  };
  images?: string[];
  documents?: string[];
  aiDamageAssessment?: {
    damagePercentage?: number;
    confidence?: number;
    verificationStatus?: string;
  };
  aiDamagePercent?: number;
  aiRecommendedAmount?: number;
  aiValidationFlags?: any;
  aiReport?: any;
  aiTasks?: Array<{
    id: string;
    taskType: string;
    status: string;
    outputData?: any;
    completedAt?: string;
    errorMessage?: string;
  }>;
  createdAt: string;
  resolutionDetails?: string;
}

const itemValueOrNa = (val: any) => (val ? val : 'N/A');

const DetailItem = ({ label, value, icon: Icon, fullWidth = false }: { label: string, value: any, icon?: any, fullWidth?: boolean }) => (
  <div className={`${fullWidth ? 'col-span-full' : ''} p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center gap-2 mb-2">
      {Icon && <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Icon className="h-4 w-4" /></div>}
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
    <div className="text-sm font-semibold text-gray-900 break-words">
      {value}
    </div>
  </div>
);

const AdminClaimDetails = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claimData, setClaimData] = useState<ClaimDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    assignedTo: '',
    resolutionDetails: '',
    adminOverrideReason: '',
    reassignTo: '',
  });
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
      // Check if claim has AI report ready for review
      checkAiReportStatus();
    }
  }, [claimId]);

  const checkAiReportStatus = async () => {
    if (!claimId) return;
    try {
      const response = await api.get(`/claims/${claimId}`);
      if (response.data.verificationStatus === 'AI_Processed_Admin_Review') {
        fetchAiReport();
      }
    } catch (err) {
      // Ignore errors, claim might not have AI report
    }
  };

  const fetchAiReport = async () => {
    if (!claimId) return;
    try {
      setLoadingAiReport(true);
      const response = await api.get(`/admin/claims/${claimId}/ai-report`);
      setAiReport(response.data.claim);
    } catch (err: any) {
      console.error("Error fetching AI report:", err);
    } finally {
      setLoadingAiReport(false);
    }
  };

  const handleForwardToInsurer = async () => {
    if (!claimId) return;

    try {
      setProcessing(true);
      await api.post(`/admin/claims/${claimId}/forward-to-insurer`, {
        adminNotes: adminNotes.trim() || undefined,
      });
      setShowForwardDialog(false);
      setAdminNotes('');
      fetchClaimDetails();
      alert('AI report forwarded to insurer successfully.');
    } catch (err: any) {
      console.error("Error forwarding AI report:", err);
      alert(err?.response?.data?.message || "Failed to forward AI report.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!claimId) return;
    try {
      setProcessing(true);
      await api.post(`/admin/claims/${claimId}/analyze`);
      alert('AI Analysis initiated successfully.');
      fetchClaimDetails();
      fetchAiReport();
    } catch (err: any) {
      console.error("Error triggering AI analysis:", err);
      alert(err?.response?.data?.message || "Failed to trigger AI analysis.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectAIReport = async () => {
    if (!claimId || !rejectReason.trim()) return;

    try {
      setProcessing(true);
      await api.post(`/admin/claims/${claimId}/reject-ai-report`, {
        reason: rejectReason.trim(),
        adminNotes: adminNotes.trim() || undefined,
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setAdminNotes('');
      fetchClaimDetails();
      alert('AI report rejected and sent for manual review.');
    } catch (err: any) {
      console.error("Error rejecting AI report:", err);
      alert(err?.response?.data?.message || "Failed to reject AI report.");
    } finally {
      setProcessing(false);
    }
  };

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/claims/${claimId}`);
      setClaimData(response.data);
      setEditData({
        status: response.data.status || '',
        assignedTo: response.data.assignedTo?._id || '',
        resolutionDetails: response.data.resolutionDetails || '',
        adminOverrideReason: '',
        reassignTo: '',
      });
    } catch (err: any) {
      console.error("Error fetching claim details:", err);
      setError(err?.response?.data?.message || "Failed to fetch claim details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!claimId) return;

    try {
      setSaving(true);
      await api.put(`/claims/${claimId}`, {
        status: editData.status,
        assignedTo: editData.assignedTo || editData.reassignTo || undefined,
        resolutionDetails: editData.resolutionDetails || undefined,
        adminOverrideReason: editData.adminOverrideReason || undefined,
        reassignTo: editData.reassignTo || undefined,
      });
      setIsEditing(false);
      fetchClaimDetails(); // Refresh data
    } catch (err: any) {
      console.error("Error updating claim:", err);
      alert(err?.response?.data?.message || "Failed to update claim.");
    } finally {
      setSaving(false);
    }
  };

  const handleOverride = () => {
    setShowOverrideDialog(true);
  };

  const confirmOverride = async () => {
    if (!claimId || !overrideReason.trim()) return;

    try {
      await api.put(`/claims/${claimId}/admin-override`, {
        adminOverrideReason: overrideReason,
        status: 'pending', // Reset status for admin review
      });
      setShowOverrideDialog(false);
      setOverrideReason('');
      fetchClaimDetails(); // Refresh data
      alert('Claim decision overridden successfully. Status reset for admin review.');
    } catch (err: any) {
      console.error("Error overriding claim:", err);
      alert(err?.response?.data?.message || "Failed to override claim decision.");
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      'in_review': { label: 'In Review', className: 'bg-blue-100 text-blue-800' },
    };
    const statusConfig = config[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error || !claimData) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <p className="text-red-800 font-semibold mb-2">Error Loading Data</p>
          <p className="text-red-600">{error || "Claim not found"}</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 bg-white hover:bg-red-50 text-red-700 border-red-200">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in bg-gray-50/30 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/admin-dashboard/claims')}
          className="mb-2 hover:bg-white bg-white/50 border-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Claims
        </Button>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
                <FileText className="h-8 w-8" />
              </span>
              Claim #{claimData.claimId || claimData._id?.slice(-8)}
            </h1>
            <p className="text-gray-500 mt-1 ml-14">Adjudication Protocol & Details</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!isEditing ? (
              <>
                {/* Run AI Analysis Button */}
                {claimData.verificationStatus !== 'AI_Processed_Admin_Review' &&
                  claimData.verificationStatus !== 'AI_Satellite_Processed' && (
                    <Button
                      onClick={handleRunAIAnalysis}
                      disabled={processing}
                      className="bg-purple-600 hover:bg-purple-700 shadow-sm"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {processing ? 'Analyzing...' : 'Run AI Analysis'}
                    </Button>
                  )}

                {/* AI Actions */}
                {claimData.verificationStatus === 'AI_Processed_Admin_Review' && (
                  <>
                    <Button
                      onClick={() => setShowForwardDialog(true)}
                      className="bg-green-600 hover:bg-green-700 shadow-sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Forward to Insurer
                    </Button>
                    <Button
                      onClick={() => setShowRejectDialog(true)}
                      variant="destructive"
                      className="shadow-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject AI Report
                    </Button>
                  </>
                )}

                <Button onClick={() => setIsEditing(true)} variant="outline" className="bg-white hover:bg-gray-50">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Claim
                </Button>
                <Button onClick={handleOverride} variant="destructive" className="shadow-sm">
                  Override Decision
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)} variant="ghost" className="hover:bg-gray-100">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Claim Information Card */}
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="h-5 w-5" />
                  Claim Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</p>
                    </div>
                    {isEditing ? (
                      <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">{getStatusBadge(claimData.status)}</div>
                    )}
                  </div>

                  <DetailItem
                    label="Date of Claim"
                    value={itemValueOrNa(new Date(claimData.dateOfClaim).toLocaleDateString())}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Date of Incident"
                    value={itemValueOrNa(new Date(claimData.dateOfIncident).toLocaleDateString())}
                    icon={Calendar}
                  />

                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-50 rounded text-blue-600"><DollarSign className="h-4 w-4" /></div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amount Claimed</p>
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      {claimData.amountClaimed ? `₹${claimData.amountClaimed.toLocaleString('en-IN')}` : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <DetailItem
                    label="Description"
                    value={claimData.description}
                    icon={FileText}
                    fullWidth
                  />

                  {claimData.locationOfIncident && (
                    <DetailItem
                      label="Location of Incident"
                      value={claimData.locationOfIncident}
                      icon={MapPin}
                      fullWidth
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Report Section */}
            {(claimData.verificationStatus === 'AI_Processed_Admin_Review' || aiReport || claimData.aiReport) && (
              <Card className="shadow-lg border-t-4 border-t-purple-500 overflow-hidden">
                <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Brain className="h-5 w-5" />
                      AI Analysis Report
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">Ready for Review</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {loadingAiReport ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <>
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl border-2 border-purple-100 shadow-sm flex flex-col justify-center text-center">
                          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">AI Damage Assessment</p>
                          <p className="text-3xl font-bold text-purple-700 mt-2">
                            {aiReport?.aiDamagePercent || claimData.aiDamagePercent || 'N/A'}%
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-green-100 shadow-sm flex flex-col justify-center text-center">
                          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Recommended Amount</p>
                          <p className="text-3xl font-bold text-green-700 mt-2">
                            ₹{((aiReport?.aiRecommendedAmount || claimData.aiRecommendedAmount || 0).toLocaleString('en-IN'))}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm flex flex-col justify-center text-center">
                          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Original Claim</p>
                          <p className="text-3xl font-bold text-gray-700 mt-2">
                            ₹{(claimData.amountClaimed || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {aiReport?.aiValidationFlags && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Validation Flags</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(aiReport.aiValidationFlags).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 shadow-sm">
                                <span className="font-medium text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <Badge variant={value ? 'default' : 'destructive'} className={value ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                                  {value ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiReport?.aiTasks && aiReport.aiTasks.length > 0 && (
                        <div>
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Processing Tasks</Label>
                          <div className="space-y-2">
                            {aiReport.aiTasks.map((task: any) => (
                              <div key={task.id} className="p-3 bg-white rounded border border-gray-200 shadow-sm flex items-center justify-between">
                                <span className="font-medium text-sm capitalize flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  {task.taskType.replace('_', ' ')}
                                </span>
                                <Badge variant={task.status === 'completed' ? 'secondary' : 'outline'} className={task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Damage Images Gallery */}
            {claimData.images && claimData.images.length > 0 && (
              <Card className="shadow-lg border-l-4 border-l-orange-500">
                <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <ImageIcon className="h-5 w-5" />
                    Damage Documented Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {claimData.images.map((image, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border bg-gray-100 aspect-square shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={image}
                          alt={`Damage ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => window.open(`/api/claims/${claimData.id}/files/images/${index}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-[10px] text-white font-medium truncate">Photo {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supporting Documents */}
            {claimData.documents && claimData.documents.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileText className="h-5 w-5" />
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {claimData.documents.map((document, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-blue-100 rounded text-blue-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">Document {index + 1}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{document.split('/').pop() || 'FILE'}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-blue-600 hover:text-blue-800"
                          onClick={() => window.open(`/api/claims/${claimData.id}/files/documents/${index}`, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">

            {/* Farmer Profile Card */}
            <Card className="shadow-lg border-t-4 border-t-green-600">
              <CardHeader className="bg-green-50/50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <User className="h-5 w-5" />
                  Farmer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <DetailItem label="Name" value={claimData.farmerId?.name || 'Unknown'} icon={User} />
                <DetailItem label="Mobile Number" value={claimData.farmerId?.mobileNumber || 'N/A'} icon={User} />
                <Button variant="outline" className="w-full text-xs" onClick={() => navigate(`/admin-dashboard/view-detail/farmer/${claimData.farmerId}`)}>
                  View Full Profile
                </Button>
              </CardContent>
            </Card>

            {/* Policy Info Card */}
            {claimData.policyId && (
              <Card className="shadow-lg border-t-4 border-t-purple-600">
                <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Building2 className="h-5 w-5" />
                    Policy Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <DetailItem label="Policy Number" value={claimData.policyId.policyNumber} icon={FileText} />
                  <DetailItem label="Crop Type" value={claimData.policyId.cropType} icon={FileText} />
                  <DetailItem label="Sum Insured" value={`₹${claimData.policyId.sumInsured?.toLocaleString('en-IN') || 'N/A'}`} icon={DollarSign} />
                </CardContent>
              </Card>
            )}

            {/* Assignment Card */}
            <Card className="shadow-lg border-l-4 border-l-amber-500">
              <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <User className="h-5 w-5" />
                  Assignment & Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Assigned to (Insurer ID)</Label>
                      <Input
                        value={editData.assignedTo}
                        onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                        placeholder="Paste Insurer ID..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Resolution Details</Label>
                      <Textarea
                        value={editData.resolutionDetails}
                        onChange={(e) => setEditData({ ...editData, resolutionDetails: e.target.value })}
                        placeholder="Enter resolution notes..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DetailItem
                      label="Assigned To"
                      value={claimData.assignedTo?.name || 'Unassigned'}
                      icon={User}
                    />
                    {claimData.resolutionDetails && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Resolution Details</p>
                        <p className="text-sm text-gray-700">{claimData.resolutionDetails}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Dialogs - Kept as is */}
        <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Override Insurer Decision</DialogTitle>
              <DialogDescription>
                Provide a reason for overriding the Insurer's decision. This action will be logged.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="overrideReason">Override Reason *</Label>
                <Textarea
                  id="overrideReason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Enter reason for overriding Insurer decision..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmOverride}
                disabled={!overrideReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm Override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Forward to SP Dialog */}
        <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Forward AI Report to Insurer</DialogTitle>
              <DialogDescription>
                Forward the AI-processed report to the assigned insurer for review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes for the insurer..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowForwardDialog(false);
                setAdminNotes('');
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleForwardToInsurer}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Forwarding...' : 'Confirm Forward'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject AI Report Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject AI Report</DialogTitle>
              <DialogDescription>
                Reject the AI report and send the claim for manual review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why the AI report is being rejected..."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNotesReject">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
                setAdminNotes('');
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleRejectAIReport}
                disabled={processing || !rejectReason.trim()}
                variant="destructive"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminClaimDetails;

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
  AlertTriangle
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
}

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

  const handleForwardToSP = async () => {
    if (!claimId) return;

    try {
      setProcessing(true);
      await api.post(`/admin/claims/${claimId}/forward-to-sp`, {
        adminNotes: adminNotes.trim() || undefined,
      });
      setShowForwardDialog(false);
      setAdminNotes('');
      fetchClaimDetails();
      alert('AI report forwarded to service provider successfully.');
    } catch (err: any) {
      console.error("Error forwarding AI report:", err);
      alert(err?.response?.data?.message || "Failed to forward AI report.");
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error || !claimData) {
    return (
      <div className="space-y-4">
        <Link to="/admin-dashboard/claims" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Claims
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || "Claim not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin-dashboard/claims"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Claim Details
            </h1>
            <p className="text-gray-600 mt-1">
              Claim #{claimData.claimId || claimData._id.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing ? (
            <>
              {claimData.verificationStatus === 'AI_Processed_Admin_Review' && (
                <>
                  <Button 
                    onClick={() => setShowForwardDialog(true)} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Forward to SP
                  </Button>
                  <Button 
                    onClick={() => setShowRejectDialog(true)} 
                    variant="destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject AI Report
                  </Button>
                </>
              )}
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Claim
              </Button>
              <Button onClick={handleOverride} variant="destructive">
                Override SP Decision
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Information */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Status</Label>
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
                <div>
                  <Label className="text-gray-500">Date of Claim</Label>
                  <p className="mt-1 font-medium">
                    {new Date(claimData.dateOfClaim).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Date of Incident</Label>
                  <p className="mt-1 font-medium">
                    {new Date(claimData.dateOfIncident).toLocaleDateString()}
                  </p>
                </div>
                {claimData.amountClaimed && (
                  <div>
                    <Label className="text-gray-500">Amount Claimed</Label>
                    <p className="mt-1 font-medium text-lg">
                      ₹{claimData.amountClaimed.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                  {claimData.description}
                </p>
              </div>

              {claimData.locationOfIncident && (
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location of Incident
                  </Label>
                  <p className="mt-1 font-medium">{claimData.locationOfIncident}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {claimData.images && claimData.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Damage Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {claimData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Damage image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => window.open(`/api/claims/${claimData.id}/files/images/${index}`, '_blank')}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg"
                      >
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {claimData.documents && claimData.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {claimData.documents.map((document, index) => (
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
                        onClick={() => window.open(`/api/claims/${claimData.id}/files/documents/${index}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Report Section */}
          {(claimData.verificationStatus === 'AI_Processed_Admin_Review' || aiReport || claimData.aiReport) && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Report - Ready for Review
                  </CardTitle>
                  <Badge className="bg-purple-100 text-purple-800">AI Processed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAiReport ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-500">AI Damage Assessment</Label>
                        <p className="mt-1 font-semibold text-lg text-purple-600">
                          {aiReport?.aiDamagePercent || claimData.aiDamagePercent || 'N/A'}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">AI Recommended Amount</Label>
                        <p className="mt-1 font-semibold text-lg text-green-600">
                          ₹{((aiReport?.aiRecommendedAmount || claimData.aiRecommendedAmount || 0).toLocaleString('en-IN'))}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Claimed Amount</Label>
                        <p className="mt-1 font-semibold text-lg">
                          ₹{(claimData.amountClaimed || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {aiReport?.aiValidationFlags && (
                      <div>
                        <Label className="text-gray-500 mb-2 block">Validation Flags</Label>
                        <div className="space-y-2">
                          {Object.entries(aiReport.aiValidationFlags).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <Badge variant={value ? 'default' : 'destructive'}>
                                {value ? 'Pass' : 'Fail'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiReport?.aiTasks && aiReport.aiTasks.length > 0 && (
                      <div>
                        <Label className="text-gray-500 mb-2 block">AI Processing Tasks</Label>
                        <div className="space-y-2">
                          {aiReport.aiTasks.map((task: any) => (
                            <div key={task.id} className="p-3 bg-gray-50 rounded border">
                              <div className="flex items-center justify-between">
                                <span className="font-medium capitalize">{task.taskType.replace('_', ' ')}</span>
                                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                  {task.status}
                                </Badge>
                              </div>
                              {task.errorMessage && (
                                <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
                                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                                  <span>{task.errorMessage}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiReport?.aiReport && (
                      <div>
                        <Label className="text-gray-500 mb-2 block">Detailed AI Report</Label>
                        <div className="p-4 bg-gray-50 rounded border">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(aiReport.aiReport, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legacy AI Assessment (for backward compatibility) */}
          {claimData.aiDamageAssessment && !aiReport && claimData.verificationStatus !== 'AI_Processed_Admin_Review' && (
            <Card>
              <CardHeader>
                <CardTitle>AI Damage Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {claimData.aiDamageAssessment.damagePercentage !== undefined && (
                    <div>
                      <Label className="text-gray-500">Damage Percentage</Label>
                      <p className="mt-1 font-semibold text-lg">
                        {claimData.aiDamageAssessment.damagePercentage}%
                      </p>
                    </div>
                  )}
                  {claimData.aiDamageAssessment.confidence !== undefined && (
                    <div>
                      <Label className="text-gray-500">Confidence Level</Label>
                      <p className="mt-1 font-semibold text-lg">
                        {(claimData.aiDamageAssessment.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Farmer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Farmer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-gray-500">Name</Label>
                <p className="mt-1 font-medium">{claimData.farmerId?.name || 'Unknown'}</p>
              </div>
              {claimData.farmerId?.mobileNumber && (
                <div>
                  <Label className="text-gray-500">Mobile Number</Label>
                  <p className="mt-1 font-medium">{claimData.farmerId.mobileNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policy Information */}
          {claimData.policyId && (
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-gray-500">Policy Number</Label>
                  <p className="mt-1 font-medium">{claimData.policyId.policyNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Crop Type</Label>
                  <p className="mt-1 font-medium">{claimData.policyId.cropType}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Sum Insured</Label>
                  <p className="mt-1 font-medium">
                    ₹{claimData.policyId.sumInsured?.toLocaleString('en-IN') || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Assigned To</Label>
                    <Input
                      value={editData.assignedTo}
                      onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                      placeholder="Service Provider ID"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Resolution Details</Label>
                    <Textarea
                      value={editData.resolutionDetails}
                      onChange={(e) => setEditData({ ...editData, resolutionDetails: e.target.value })}
                      placeholder="Add resolution details..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-500">Assigned To</Label>
                    <p className="mt-1 font-medium">
                      {claimData.assignedTo?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override SP Decision</DialogTitle>
            <DialogDescription>
              Provide a reason for overriding the Service Provider's decision. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="overrideReason">Override Reason *</Label>
              <Textarea
                id="overrideReason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter reason for overriding SP decision..."
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
            <DialogTitle>Forward AI Report to Service Provider</DialogTitle>
            <DialogDescription>
              Forward the AI-processed report to the assigned service provider for review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes for the service provider..."
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
              onClick={handleForwardToSP}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Forwarding...' : 'Forward to SP'}
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
                placeholder="Enter reason for rejecting the AI report..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminNotesReject">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotesReject"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
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
              {processing ? 'Rejecting...' : 'Reject & Send for Manual Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClaimDetails;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, PlusCircle, Shield, User, Crop, Calendar, DollarSign, FileText, Image as ImageIcon, MapPin, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal } from "lucide-react";
import api from '../../lib/api';
import logger from '../../utils/logger';

// Component for document items
const DocumentItem: React.FC<{
  doc: { path: string; fileName: string; fileSize: number; mimeType: string };
  requestId: string;
  index: number;
  getDocumentUrl: (requestId: string, index: number) => Promise<string>;
}> = ({ doc, requestId, index, getDocumentUrl }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleView = async () => {
    setIsLoading(true);
    try {
      const url = await getDocumentUrl(requestId, index);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium">{doc.fileName}</p>
          <p className="text-sm text-gray-500">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.mimeType}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        View
      </Button>
    </div>
  );
};

// Component for loading farm images asynchronously
const FarmImageGrid: React.FC<{
  requestId: string;
  images: Array<{ path: string; fileName: string }>;
  getFarmImageUrl: (requestId: string, index: number) => Promise<string>;
}> = ({ requestId, images, getFarmImageUrl }) => {
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    images.forEach((_, index) => {
      setLoading(prev => ({ ...prev, [index]: true }));
      getFarmImageUrl(requestId, index).then(url => {
        if (url) {
          setImageUrls(prev => ({ ...prev, [index]: url }));
        }
        setLoading(prev => ({ ...prev, [index]: false }));
      });
    });

    // Cleanup
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [requestId]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative">
          {loading[index] ? (
            <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : imageUrls[index] ? (
            <a
              href={imageUrls[index]}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={imageUrls[index]}
                alt={`Farm image ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
              />
            </a>
          ) : (
            <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
              Failed to load
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface Policy {
  _id?: string;
  id?: string;
  policyNumber?: string;
  farmerId?: {
    name: string;
  };
  farmer?: string | {
    name: string;
  };
  cropType?: string;
  crop?: string;
  sumInsured?: number;
  premium?: number;
  startDate: string;
  endDate: string;
  status: string;
  coverage?: string;
}

interface PolicyRequest {
  id: string;
  farmer: {
    name: string;
    email: string;
    mobileNumber: string;
  };
  cropType: string;
  insuredArea: number;
  requestedStartDate?: string;
  documents?: Array<{
    path: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  farmImages?: Array<{
    path: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>;
  cropDetails?: {
    cropVariety?: string;
    expectedYield?: number;
    cultivationSeason?: string;
    soilType?: string;
    irrigationMethod?: string;
    cropDescription?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'issued';
  rejectionReason?: string;
  issuedPolicyId?: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceProviderPolicyManagement: React.FC = () => {
  const navigate = useNavigate();

  // Policies state
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [policiesError, setPoliciesError] = useState<string | null>(null);
  const [policiesSearchTerm, setPoliciesSearchTerm] = useState('');

  // Policy Requests state
  const [requests, setRequests] = useState<PolicyRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestsSearchTerm, setRequestsSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PolicyRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Issue policy form state
  const [issueForm, setIssueForm] = useState({
    policyNumber: '',
    startDate: '',
    endDate: '',
    premium: '',
    sumInsured: '',
  });

  // Reject form state
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPolicies();
    fetchPolicyRequests();
  }, []);

  const fetchPolicies = async () => {
    setPoliciesLoading(true);
    setPoliciesError(null);
    try {
      const response = await api.get('/policies');
      setPolicies(response.data || []);
    } catch (err: any) {
      setPoliciesError(err?.response?.data?.message || 'Failed to fetch policies.');
    } finally {
      setPoliciesLoading(false);
    }
  };

  const fetchPolicyRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await api.get('/policy-requests');
      setRequests(response.data || []);
      logger.sp.policy('Fetched policy requests', { count: response.data?.length || 0 });
    } catch (err: any) {
      logger.sp.error('Error fetching policy requests', { error: err });
      setRequestsError(err?.response?.data?.message || 'Failed to fetch policy requests.');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleViewRequest = (request: PolicyRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleIssuePolicy = (request: PolicyRequest) => {
    setSelectedRequest(request);
    // Pre-fill form with request data
    setIssueForm({
      policyNumber: '',
      startDate: request.requestedStartDate || new Date().toISOString().split('T')[0],
      endDate: '',
      premium: '',
      sumInsured: '',
    });
    setIssueDialogOpen(true);
  };

  const handleSubmitIssue = async () => {
    if (!selectedRequest) return;

    // Validation
    if (!issueForm.policyNumber || !issueForm.startDate || !issueForm.endDate || !issueForm.premium || !issueForm.sumInsured) {
      setRequestsError('All fields are required');
      return;
    }

    if (new Date(issueForm.startDate) >= new Date(issueForm.endDate)) {
      setRequestsError('End date must be after start date');
      return;
    }

    try {
      setProcessing(true);
      setRequestsError(null);

      const response = await api.post(`/policy-requests/${selectedRequest.id}/issue`, issueForm);

      logger.sp.policy('Policy issued from request', {
        requestId: selectedRequest.id,
        policyId: response.data?.policy?.id
      });

      setIssueDialogOpen(false);
      fetchPolicyRequests(); // Refresh list
      fetchPolicies(); // Refresh policies list

      // Show success message
      alert('Policy issued successfully!');
    } catch (err: any) {
      logger.sp.error('Error issuing policy', { error: err });
      setRequestsError(err?.response?.data?.message || 'Failed to issue policy.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = (request: PolicyRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleSubmitReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      setRequestsError(null);

      await api.post(`/policy-requests/${selectedRequest.id}/reject`, {
        rejectionReason: rejectionReason || 'Rejected by service provider',
      });

      logger.sp.reject('Policy request rejected', {
        requestId: selectedRequest.id
      });

      setRejectDialogOpen(false);
      fetchPolicyRequests(); // Refresh list

      // Show success message
      alert('Policy request rejected.');
    } catch (err: any) {
      logger.sp.error('Error rejecting policy request', { error: err });
      setRequestsError(err?.response?.data?.message || 'Failed to reject policy request.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Approved', className: 'bg-blue-100 text-blue-800' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      'issued': { label: 'Issued', className: 'bg-green-100 text-green-800' },
    };
    const statusLower = status.toLowerCase();
    const statusConfig = config[statusLower] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const getPolicyStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'Active': { label: 'Active', className: 'bg-green-100 text-green-800' },
      'Inactive': { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      'Expired': { label: 'Expired', className: 'bg-red-100 text-red-800' },
    };
    const statusConfig = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const filteredPolicies = policies.filter(policy =>
    policy.farmerId?.name?.toLowerCase().includes(policiesSearchTerm.toLowerCase()) ||
    policy.policyNumber?.toLowerCase().includes(policiesSearchTerm.toLowerCase()) ||
    policy.cropType?.toLowerCase().includes(policiesSearchTerm.toLowerCase()) ||
    policy.status?.toLowerCase().includes(policiesSearchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(request =>
    request.farmer?.name?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
    request.cropType?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
    request.status?.toLowerCase().includes(requestsSearchTerm.toLowerCase())
  );

  // Helper to get authenticated farm image URL
  const getFarmImageUrl = async (requestId: string, index: number): Promise<string> => {
    try {
      const response = await api.get(
        `/policy-requests/${requestId}/farm-images/${index}`,
        { responseType: 'blob' }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      logger.sp.error('Error fetching farm image', { error, requestId, index });
      return '';
    }
  };

  // Helper to get authenticated document URL
  const getDocumentUrl = async (requestId: string, index: number): Promise<string> => {
    try {
      const response = await api.get(
        `/policy-requests/${requestId}/documents/${index}`,
        { responseType: 'blob' }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      logger.sp.error('Error fetching document', { error, requestId, index });
      return '';
    }
  };

  const handleAddPolicy = () => {
    navigate('/service-provider-dashboard/policy-management/add');
  };

  const handleEditPolicy = (policy: Policy) => {
    navigate('/service-provider-dashboard/policy-management/add', { state: { policy } });
  };

  const handleViewPolicy = (policyId: string) => {
    navigate(`/service-provider-dashboard/view-detail/policy/${policyId}`);
  };


  if (policiesLoading && policies.length === 0 && requestsLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            Policy Management
          </h1>
          <p className="text-gray-600 mt-1">Manage insurance policies and requests</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Issued Policies ({filteredPolicies.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Policy Requests ({filteredRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search policies by number, farmer, or crop..."
                  value={policiesSearchTerm}
                  onChange={(e) => setPoliciesSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {policiesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{policiesError}</p>
            </div>
          )}

          {/* Loading State */}
          {policiesLoading && filteredPolicies.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading policies...</p>
              </div>
            </div>
          )}

          {/* Policies List */}
          {!policiesLoading && filteredPolicies.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No policies found</p>
                <p className="text-gray-500 mt-2">
                  {policiesSearchTerm ? 'Try adjusting your search criteria.' : 'No policies have been issued yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolicies.map((policy) => (
                <Card key={policy._id || policy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {policy.policyNumber || `Policy #${(policy._id || policy.id)?.slice(-8)}`}
                        </CardTitle>
                        {getPolicyStatusBadge(policy.status)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/service-provider/policy-details/${policy._id || policy.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{policy.farmerId?.name || (typeof policy.farmer === 'object' && policy.farmer && (policy.farmer as {name: string}).name) || (typeof policy.farmer === 'string' ? policy.farmer : 'N/A')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Crop className="h-4 w-4 text-gray-400" />
                        <span>{policy.cropType || policy.crop || 'N/A'}</span>
                      </div>
                      {policy.sumInsured && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>Sum Insured: ₹{policy.sumInsured.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Policy Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search requests by farmer, crop, or status..."
                  value={requestsSearchTerm}
                  onChange={(e) => setRequestsSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {requestsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{requestsError}</p>
            </div>
          )}

          {/* Loading State */}
          {requestsLoading && filteredRequests.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading policy requests...</p>
              </div>
            </div>
          )}

          {/* Requests List */}
          {!requestsLoading && filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No policy requests found</p>
                <p className="text-gray-500 mt-2">
                  {requestsSearchTerm ? 'Try adjusting your search criteria.' : 'No policy requests have been submitted yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Request #{request.id.slice(-8)}
                        </CardTitle>
                        {getStatusBadge(request.status)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleIssuePolicy(request)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Issue Policy
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectRequest(request)} className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{request.farmer.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Crop className="h-4 w-4 text-gray-400" />
                        <span>{request.cropType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{request.insuredArea} acres</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Policy Request Details</DialogTitle>
            <DialogDescription>
              Review the farmer's policy request and supporting documents
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Farmer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedRequest.farmer.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedRequest.farmer.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedRequest.farmer.mobileNumber}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Policy Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Crop Type:</span> {selectedRequest.cropType}</p>
                    <p><span className="font-medium">Area:</span> {selectedRequest.insuredArea} acres</p>
                    <p><span className="font-medium">Requested Start:</span> {selectedRequest.requestedStartDate ? new Date(selectedRequest.requestedStartDate).toLocaleDateString() : 'Not specified'}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedRequest.status)}</p>
                  </div>
                </div>
              </div>

              {/* Crop Details */}
              {selectedRequest.cropDetails && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Crop Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedRequest.cropDetails.cropVariety && (
                      <p><span className="font-medium">Variety:</span> {selectedRequest.cropDetails.cropVariety}</p>
                    )}
                    {selectedRequest.cropDetails.expectedYield && (
                      <p><span className="font-medium">Expected Yield:</span> {selectedRequest.cropDetails.expectedYield} tons/acre</p>
                    )}
                    {selectedRequest.cropDetails.cultivationSeason && (
                      <p><span className="font-medium">Season:</span> {selectedRequest.cropDetails.cultivationSeason}</p>
                    )}
                    {selectedRequest.cropDetails.soilType && (
                      <p><span className="font-medium">Soil Type:</span> {selectedRequest.cropDetails.soilType}</p>
                    )}
                    {selectedRequest.cropDetails.irrigationMethod && (
                      <p><span className="font-medium">Irrigation:</span> {selectedRequest.cropDetails.irrigationMethod}</p>
                    )}
                    {selectedRequest.cropDetails.cropDescription && (
                      <div className="col-span-2">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-gray-600">{selectedRequest.cropDetails.cropDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Farm Images */}
              {selectedRequest.farmImages && selectedRequest.farmImages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Farm Images</h3>
                  <FarmImageGrid
                    requestId={selectedRequest.id}
                    images={selectedRequest.farmImages}
                    getFarmImageUrl={getFarmImageUrl}
                  />
                </div>
              )}

              {/* Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Documents</h3>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <DocumentItem
                        key={index}
                        doc={doc}
                        requestId={selectedRequest.id}
                        index={index}
                        getDocumentUrl={getDocumentUrl}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Policy Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Policy</DialogTitle>
            <DialogDescription>
              Create and issue a policy based on this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                value={issueForm.policyNumber}
                onChange={(e) => setIssueForm(prev => ({ ...prev, policyNumber: e.target.value }))}
                placeholder="Enter policy number"
                required
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={issueForm.startDate}
                onChange={(e) => setIssueForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={issueForm.endDate}
                onChange={(e) => setIssueForm(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="premium">Premium (₹) *</Label>
              <Input
                id="premium"
                type="number"
                value={issueForm.premium}
                onChange={(e) => setIssueForm(prev => ({ ...prev, premium: e.target.value }))}
                placeholder="Enter premium amount"
                required
              />
            </div>
            <div>
              <Label htmlFor="sumInsured">Sum Insured (₹) *</Label>
              <Input
                id="sumInsured"
                type="number"
                value={issueForm.sumInsured}
                onChange={(e) => setIssueForm(prev => ({ ...prev, sumInsured: e.target.value }))}
                placeholder="Enter sum insured amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitIssue}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Issue Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Policy Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this policy request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection (optional)"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleSubmitReject}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceProviderPolicyManagement;

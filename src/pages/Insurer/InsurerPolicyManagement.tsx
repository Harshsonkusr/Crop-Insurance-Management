import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, PlusCircle, Shield, User, Crop, Calendar, DollarSign, FileText, Image as ImageIcon, MapPin, AlertCircle, Loader2, CheckCircle2, XCircle, Clock, MoreHorizontal, Building2 } from 'lucide-react';
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
  farmerId: string;
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
    cropName?: string;
    cropVariety?: string;
    expectedYield?: number;
    cultivationSeason?: string;
    sowingDate?: string;
    surveyNumber?: string;
    khewatNumber?: string;
    insuranceUnit?: string;
    sumInsured?: number;
    soilType?: string;
    irrigationMethod?: string;
    cropDescription?: string;
    wildAnimalAttackCoverage?: boolean;
    bankName?: string;
    bankAccountNo?: string;
    bankIfsc?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'issued';
  rejectionReason?: string;
  issuedPolicyId?: string;
  createdAt: string;
  updatedAt: string;
}

const InsurerPolicyManagement: React.FC = () => {
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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);


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
      logger.insurer.policy('Fetched policy requests', { count: response.data?.length || 0 });
    } catch (err: any) {
      logger.insurer.error('Error fetching policy requests', { error: err });
      setRequestsError(err?.response?.data?.message || 'Failed to fetch policy requests.');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleViewRequest = (request: PolicyRequest) => {
    navigate(`/insurer-dashboard/view-detail/policy-request/${request.id}`);
  };

  const handleIssuePolicy = (request: PolicyRequest) => {
    navigate('/insurer-dashboard/policy-management/add', { state: { request } });
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
        rejectionReason: rejectionReason || 'Rejected by insurer',
      });

      logger.insurer.reject('Policy request rejected', {
        requestId: selectedRequest.id
      });

      setRejectDialogOpen(false);
      fetchPolicyRequests(); // Refresh list

      // Show success message
      alert('Policy request rejected.');
    } catch (err: any) {
      logger.insurer.error('Error rejecting policy request', { error: err });
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

  const filteredRequests = requests.filter(request => {
    const isMatched = request.farmer?.name?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
      request.cropType?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
      request.status?.toLowerCase().includes(requestsSearchTerm.toLowerCase());

    // Only show pending requests in this section as requested
    return isMatched && request.status === 'pending';
  });

  // Helper to get authenticated farm image URL
  const getFarmImageUrl = async (requestId: string, index: number): Promise<string> => {
    try {
      const response = await api.get(
        `/policy-requests/${requestId}/farm-images/${index}`,
        { responseType: 'blob' }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      logger.insurer.error('Error fetching farm image', { error, requestId, index });
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
      logger.insurer.error('Error fetching document', { error, requestId, index });
      return '';
    }
  };

  const handleAddPolicy = () => {
    navigate('/insurer-dashboard/policy-management/add');
  };

  const handleEditPolicy = (policy: Policy) => {
    navigate('/insurer-dashboard/policy-management/add', { state: { policy } });
  };

  const handleViewPolicy = (policyId: string) => {
    navigate(`/insurer-dashboard/view-detail/policy/${policyId}`);
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <Shield className="h-8 w-8" />
            </span>
            Policy Management
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Manage insurance policies and requests</p>
        </div>
        <Button onClick={handleAddPolicy} className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
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

          {/* Policies List - Professional Table */}
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
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-purple-600 border-b border-purple-700">
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Policy Number & Farmer</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Crop</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Sum Insured</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Validity Period</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredPolicies.map((policy) => (
                      <tr key={policy._id || policy.id} className="hover:bg-purple-50 transition-all group border-l-4 border-transparent hover:border-purple-500">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{policy.policyNumber || `Policy #${(policy._id || policy.id)?.slice(-8)}`}</span>
                            <span className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                              {policy.farmerId?.name || (typeof policy.farmer === 'object' && policy.farmer && (policy.farmer as { name: string }).name) || (typeof policy.farmer === 'string' ? policy.farmer : 'N/A')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">{policy.cropType || policy.crop || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-green-700">₹{policy.sumInsured?.toLocaleString('en-IN') || '0'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getPolicyStatusBadge(policy.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewPolicy(policy._id || policy.id || '')}
                              title="View Details"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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

          {/* Requests List - Professional Table */}
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
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-purple-600 border-b border-purple-700">
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Request ID & Farmer</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Crop Type</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Area (Acres)</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Sum Insured</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Premium</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Submission Date</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-purple-50/50 transition-all group border-l-4 border-transparent hover:border-purple-500">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Request #{request.id.slice(-8)}</span>
                            <span className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">{request.farmer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                          {request.cropDetails?.cropName || request.cropType}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-700">
                          {request.insuredArea} Acres
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-green-700">
                            ₹{request.cropDetails?.sumInsured?.toLocaleString('en-IN') ?? '0'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">-</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewRequest(request)}
                              title="View Details"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleIssuePolicy(request)}
                                  title="Issue Policy"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRejectRequest(request)}
                                  title="Reject Request"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>


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

export default InsurerPolicyManagement;

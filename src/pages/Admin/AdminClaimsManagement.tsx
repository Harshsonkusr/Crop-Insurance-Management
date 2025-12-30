import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, MoreVertical, FileText, Clock, CheckCircle2, XCircle, Brain, Send, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import api from '../../lib/api';

interface Claim {
  id: string;
  _id?: string; // Keep for backward compatibility
  claimId?: string;
  farmerId: {
    name: string;
    id: string;
    _id?: string;
  };
  dateOfClaim: string;
  description: string;
  status: string;
  assignedTo?: {
    name: string;
    id: string;
    _id?: string;
  };
  amountClaimed?: number;
  createdAt: string;
}

const AdminClaimsManagement = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [aiReadyClaims, setAiReadyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalClaims, setTotalClaims] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (activeTab === 'all') {
      fetchClaims();
    } else if (activeTab === 'ai-ready') {
      fetchAiReadyClaims();
    }
  }, [currentPage, filterStatus, searchTerm, activeTab]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/claims', { params });
      setClaims(response.data.claims || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalClaims(response.data.totalClaims || 0);
    } catch (err: any) {
      console.error("Error fetching claims:", err);
      setError(err?.response?.data?.message || "Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiReadyClaims = async () => {
    try {
      setAiLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await api.get('/admin/claims/ai-ready', { params });
      setAiReadyClaims(response.data.claims || []);
      setTotalPages(response.data.pages || 1);
      setTotalClaims(response.data.total || 0);
    } catch (err: any) {
      console.error("Error fetching AI-ready claims:", err);
      setError(err?.response?.data?.message || "Failed to fetch AI-ready claims.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleForwardToSP = async () => {
    if (!selectedClaim) return;

    try {
      setProcessing(true);
      await api.post(`/admin/claims/${selectedClaim.id || selectedClaim._id}/forward-to-sp`, {
        adminNotes: adminNotes.trim() || undefined,
      });
      setShowForwardDialog(false);
      setAdminNotes('');
      setSelectedClaim(null);
      fetchAiReadyClaims();
      alert('AI report forwarded to service provider successfully.');
    } catch (err: any) {
      console.error("Error forwarding AI report:", err);
      alert(err?.response?.data?.message || "Failed to forward AI report.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectAIReport = async () => {
    if (!selectedClaim || !rejectReason.trim()) return;

    try {
      setProcessing(true);
      await api.post(`/admin/claims/${selectedClaim.id || selectedClaim._id}/reject-ai-report`, {
        reason: rejectReason.trim(),
        adminNotes: adminNotes.trim() || undefined,
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setAdminNotes('');
      setSelectedClaim(null);
      fetchAiReadyClaims();
      alert('AI report rejected and sent for manual review.');
    } catch (err: any) {
      console.error("Error rejecting AI report:", err);
      alert(err?.response?.data?.message || "Failed to reject AI report.");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      'pending': { label: 'Pending', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Approved', variant: 'default', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', variant: 'destructive', className: 'bg-red-100 text-red-800' },
      'in_review': { label: 'In Review', variant: 'outline', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status.toLowerCase()] || { 
      label: status, 
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  const displayClaims = activeTab === 'ai-ready' ? aiReadyClaims : claims;
  const isLoading = activeTab === 'ai-ready' ? aiLoading : loading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Claims</h1>
          <p className="text-gray-600 mt-1">View and manage all insurance claims</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{totalClaims}</span> claims
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="ai-ready">
            <Brain className="h-4 w-4 mr-2" />
            AI Ready for Review ({aiReadyClaims.length})
          </TabsTrigger>
        </TabsList>

        {/* All Claims Tab */}
        <TabsContent value="all" className="space-y-6">

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by claim ID, farmer name, description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Claims List */}
          {displayClaims.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No claims found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No claims have been submitted yet.'}
            </p>
          </CardContent>
        </Card>
          ) : (
            <div className="space-y-4">
              {displayClaims.map((claim) => (
            <Card key={claim._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Claim #{claim.claimId || claim._id.slice(-8)}
                          </h3>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {claim.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Farmer</p>
                        <p className="font-medium text-gray-900">
                          {claim.farmerId?.name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date Submitted</p>
                        <p className="font-medium text-gray-900">
                          {new Date(claim.dateOfClaim || claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Assigned To</p>
                        <p className="font-medium text-gray-900">
                          {claim.assignedTo?.name || 'Unassigned'}
                        </p>
                      </div>
                      {claim.amountClaimed && (
                        <div>
                          <p className="text-gray-500">Amount Claimed</p>
                          <p className="font-medium text-gray-900">
                            ₹{claim.amountClaimed.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <Link
                      to={`/admin-dashboard/claims/${claim.id || claim._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {activeTab === 'ai-ready' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowForwardDialog(true);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Forward
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowRejectDialog(true);
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </TabsContent>

        {/* AI Ready Claims Tab */}
        <TabsContent value="ai-ready" className="space-y-6">
          {aiLoading && aiReadyClaims.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading AI-ready claims...</p>
              </div>
            </div>
          ) : aiReadyClaims.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No AI-ready claims</p>
                <p className="text-gray-500 mt-2">No claims are currently ready for AI report review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {aiReadyClaims.map((claim) => (
                <Card key={claim._id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Claim #{claim.claimId || claim._id.slice(-8)}
                              </h3>
                              <Badge className="bg-purple-100 text-purple-800">
                                <Brain className="h-3 w-3 mr-1" />
                                AI Ready
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {claim.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Farmer</p>
                            <p className="font-medium text-gray-900">
                              {claim.farmerId?.name || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date Submitted</p>
                            <p className="font-medium text-gray-900">
                              {new Date(claim.dateOfClaim || claim.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Assigned To</p>
                            <p className="font-medium text-gray-900">
                              {claim.assignedTo?.name || 'Unassigned'}
                            </p>
                          </div>
                          {claim.amountClaimed && (
                            <div>
                              <p className="text-gray-500">Amount Claimed</p>
                              <p className="font-medium text-gray-900">
                                ₹{claim.amountClaimed.toLocaleString('en-IN')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                        <Link
                          to={`/admin-dashboard/claims/${claim.id || claim._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review AI Report
                        </Link>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowForwardDialog(true);
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Forward
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowRejectDialog(true);
                            }}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
              setSelectedClaim(null);
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
              setSelectedClaim(null);
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

export default AdminClaimsManagement;

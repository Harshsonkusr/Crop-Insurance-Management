import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, Brain, Send, X, FileText } from 'lucide-react';
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
  _id?: string;
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

  const handleForwardToInsurer = async () => {
    if (!selectedClaim) return;

    try {
      setProcessing(true);
      await api.post(`/admin/claims/${selectedClaim.id || selectedClaim._id}/forward-to-insurer`, {
        adminNotes: adminNotes.trim() || undefined,
      });
      setShowForwardDialog(false);
      setAdminNotes('');
      setSelectedClaim(null);
      fetchAiReadyClaims();
      alert('AI report forwarded to insurer successfully.');
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

  const currentDisplayClaims = activeTab === 'ai-ready' ? aiReadyClaims : claims;
  const currentLoading = activeTab === 'ai-ready' ? aiLoading : loading;

  const TableView = (
    <div className="space-y-4">
      {currentDisplayClaims.length === 0 && !currentLoading ? (
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
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 border-b border-blue-700">
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Claim ID & Farmer</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Date Submitted</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Assigned To</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentDisplayClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-blue-50/50 transition-all group border-l-4 border-transparent hover:border-blue-500">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">#{claim.claimId || claim._id?.slice(-8)}</span>
                        <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">{claim.farmerId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{new Date(claim.dateOfClaim || claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {claim.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-700">
                      ₹{claim.amountClaimed?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin-dashboard/claims/${claim.id || claim._id}`}>
                          <Button variant="ghost" size="icon" title="View Details" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {activeTab === 'ai-ready' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowForwardDialog(true);
                              }}
                              title="Forward to Insurer"
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowRejectDialog(true);
                              }}
                              title="Reject AI Report"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <FileText className="h-8 w-8" />
            </span>
            Manage Claims
          </h1>
          <p className="text-gray-600 mt-1 ml-14">View and manage all insurance claims</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{totalClaims}</span> claims
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="ai-ready">
            <Brain className="h-4 w-4 mr-2" />
            AI Ready for Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by claim ID, farmer name..."
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
                    <SelectValue placeholder="Status" />
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
          {TableView}
        </TabsContent>

        <TabsContent value="ai-ready" className="mt-6">
          <div className="mb-4 flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg text-purple-800 text-sm">
            <Brain className="h-4 w-4" />
            <span>These claims have been processed by satellite AI and are ready for official verification.</span>
          </div>
          {TableView}
        </TabsContent>
      </Tabs>

      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward AI Report to Insurer</DialogTitle>
            <DialogDescription>Forward the AI-processed report to the assigned insurer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForwardDialog(false)}>Cancel</Button>
            <Button onClick={handleForwardToInsurer} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? 'Forwarding...' : 'Forward to Insurer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject AI Report</DialogTitle>
            <DialogDescription>Reject AI report and send for manual review.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Rejection Reason *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button onClick={handleRejectAIReport} disabled={processing || !rejectReason.trim()} variant="destructive">
              {processing ? 'Rejecting...' : 'Reject & Send Manual'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClaimsManagement;

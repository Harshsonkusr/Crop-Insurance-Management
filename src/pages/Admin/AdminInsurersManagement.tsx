import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Edit, Trash2, Building2, Mail, Phone, MapPin, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import logger from '../../utils/logger';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
import api from '../../lib/api';

interface Insurer {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  serviceType?: string;
  status?: string;
  userId?: string;
  createdAt: string;
}

interface PendingInsurer {
  _id: string;
  id: string; // User ID
  name: string;
  email: string;
  mobileNumber?: string;
  role: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  insurer?: {
    id: string;
    businessName?: string;
    address?: string;
    serviceType?: string;
    serviceDescription?: string;
    gstNumber?: string;
    panNumber?: string;
    licenseNumber?: string;
    state?: string;
    district?: string;
  };
}

const AdminInsurersManagement = () => {
  const navigate = useNavigate();
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [pendingInsurers, setPendingInsurers] = useState<PendingInsurer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchInsurers();
    fetchPendingInsurers();
  }, [currentPage, filterServiceType, searchTerm]);

  const fetchInsurers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        status: 'active' // Only fetch active/approved insurers for the main list
      };

      if (filterServiceType !== 'all') {
        params.serviceType = filterServiceType;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admin/insurers', { params });
      const data = response.data.insurers || response.data.serviceProviders || [];
      setInsurers(data);
      setTotalPages(response.data.totalPages || 1);
      logger.admin.view('Fetched insurers', { count: data.length });
    } catch (err: any) {
      logger.admin.error("Error fetching insurers", { error: err });
      setError(err?.response?.data?.message || "Failed to fetch insurers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInsurers = async () => {
    try {
      setLoadingPending(true);
      const response = await api.get('/admin/users/pending');
      // Filter only INSURER role
      const pending = (response.data.users || []).filter((user: any) => user.role === 'INSURER');
      setPendingInsurers(pending);
      logger.admin.view('Fetched pending insurers', { count: pending.length });
    } catch (err: any) {
      logger.admin.error('Error fetching pending insurers', { error: err });
      setError('Failed to load pending insurers');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to approve this Insurer registration?')) {
      return;
    }

    setProcessingId(userId);
    try {
      // Use id field if available, otherwise use _id
      const idToUse = userId.includes('-') ? userId : userId; // UUID format check
      await api.put(`/admin/users/${idToUse}/approve`, { approved: true });
      logger.admin.approve('Insurer approved', { userId: idToUse });
      alert('Insurer approved successfully!');
      fetchPendingInsurers();
      fetchInsurers(); // Refresh the list
    } catch (err: any) {
      logger.admin.error('Error approving Insurer', { error: err, userId });
      alert(err?.response?.data?.message || 'Failed to approve registration.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setPendingRejectId(userId);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!pendingRejectId) return;
    const userId = pendingRejectId;
    setProcessingId(userId);
    try {
      // Use id field if available, otherwise use _id
      const idToUse = userId.includes('-') ? userId : userId; // UUID format check
      await api.put(`/admin/users/${idToUse}/approve`, {
        approved: false,
        rejectionReason: rejectReason.trim() || 'Registration rejected by administrator'
      });
      logger.admin.reject('Insurer rejected', { userId: idToUse, reason: rejectReason });
      alert('Insurer registration rejected.');
      fetchPendingInsurers();
      fetchInsurers(); // Refresh the list
    } catch (err: any) {
      logger.admin.error('Error rejecting Insurer', { error: err, userId });
      alert(err?.response?.data?.message || 'Failed to reject registration.');
    } finally {
      setProcessingId(null);
      setPendingRejectId(null);
      setRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this insurer?")) return;

    try {
      // Use id field if available, otherwise use _id
      const idToUse = id.includes('-') ? id : id; // UUID format check
      await api.delete(`/admin/insurers/${idToUse}`);
      logger.admin.delete('Insurer deleted', { insurerId: idToUse });
      fetchInsurers();
    } catch (err: any) {
      logger.admin.error('Error deleting Insurer', { error: err, insurerId: id });
      alert(err?.response?.data?.message || "Failed to delete insurer.");
    }
  };

  if (loading && insurers.length === 0 && pendingInsurers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading insurers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Building2 className="h-8 w-8" />
            </span>
            Insurers & Partners
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Strategic management of insurance providers and underwriting nodes.</p>
        </div>
        <Link
          to="/admin-dashboard/insurers/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 w-fit"
        >
          <PlusCircle className="h-4 w-4" />
          Add Insurer
        </Link>
      </div>

      {/* Tabs for Pending and Approved */}
      <Tabs defaultValue="approved" className="w-full">
        <TabsList>
          <TabsTrigger value="approved">
            Approved ({insurers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests ({pendingInsurers.length})
            {pendingInsurers.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">{pendingInsurers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Approved Insurers */}
        <TabsContent value="approved" className="space-y-6 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={filterServiceType} onValueChange={(value) => {
                  setFilterServiceType(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Crop Monitoring">Crop Monitoring</SelectItem>
                    <SelectItem value="Pest Control">Pest Control</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Soil Testing">Soil Testing</SelectItem>
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

          {/* Approved Insurers - Professional Table */}
          {insurers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No insurers found</p>
                <p className="text-gray-500 mt-2">
                  {searchTerm || filterServiceType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No insurers have been registered yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-600 border-b border-blue-700">
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Insurer Entity & Type</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Digital Channel</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-center">Protocol Response</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Operations Hub</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white/40">
                    {insurers.map((provider) => (
                      <tr key={provider._id} className="hover:bg-blue-50/50 transition-all group border-l-4 border-transparent hover:border-blue-500">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm group-hover:scale-110 transition-transform">
                              {provider.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">{provider.name}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge variant="outline" className="text-[9px] font-bold bg-blue-50/50 text-blue-600 border-blue-100 px-1.5 py-0 uppercase tracking-tighter">
                                  {provider.serviceType || 'Standard'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-lg border border-transparent group-hover:border-gray-100 transition-all w-fit">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 truncate max-w-[180px]" title={provider.email}>
                              {provider.email || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/40 rounded-lg border border-blue-100/50 group-hover:bg-blue-50 transition-all">
                            <Phone className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-700 tabular-nums">
                              {provider.phone || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white transition-all w-fit">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={provider.address}>
                              {provider.address || 'Regional'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const id = provider.userId || provider.id || provider._id;
                                navigate(`/admin-dashboard/view-detail/insurer/${id}`);
                              }}
                              className="h-9 w-9 text-blue-600 hover:bg-blue-100 rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link to={`/admin-dashboard/insurers/${provider.id || provider._id}`}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-600 hover:bg-amber-100 rounded-xl">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(provider._id)}
                              className="h-9 w-9 text-red-600 hover:bg-red-100 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="font-semibold border-gray-200"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="font-semibold border-gray-200"
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Pending Requests - Professional Table */}
        <TabsContent value="pending" className="space-y-4 mt-6">
          {loadingPending ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600 font-medium">Syncing pipeline...</p>
              </div>
            </div>
          ) : pendingInsurers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">All registrations processed</p>
                <p className="text-gray-500 mt-2">
                  No pending insurer applications found.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-600 border-b border-amber-700">
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Applicant Identity</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Contact Cluster</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Initial Registration</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Mediator Status</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white/40">
                    {pendingInsurers.map((insurer) => (
                      <tr key={insurer._id} className="hover:bg-amber-50/50 transition-all group border-l-4 border-transparent hover:border-amber-500">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200 shadow-sm group-hover:scale-110 transition-transform">
                              {insurer.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 tracking-tight group-hover:text-amber-700 transition-colors uppercase">{insurer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1 px-3 py-1.5 bg-gray-50/50 rounded-lg border border-transparent group-hover:border-gray-100 transition-all w-fit">
                            <span className="text-xs font-semibold text-gray-700">{insurer.email}</span>
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider tabular-nums">{insurer.mobileNumber || 'OFFLINE'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                            <Clock className="h-3 w-3 text-gray-300" />
                            <span>{new Date(insurer.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-100 text-[10px] font-bold uppercase tracking-widest">
                            Pending
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const id = insurer.id || insurer._id;
                                navigate(`/admin-dashboard/view-detail/insurer/${id}`);
                              }}
                              className="h-9 w-9 text-blue-600 hover:bg-blue-100 rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(insurer.id || insurer._id)}
                              disabled={processingId === (insurer.id || insurer._id)}
                              className="h-9 w-9 text-emerald-600 hover:bg-emerald-100 rounded-xl"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(insurer.id || insurer._id)}
                              disabled={processingId === (insurer.id || insurer._id)}
                              className="h-9 w-9 text-rose-600 hover:bg-rose-100 rounded-xl"
                            >
                              <XCircle className="h-4 w-4" />
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
      </Tabs>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Insurer</AlertDialogTitle>
            <AlertDialogDescription>
              Optionally provide a reason for rejection. This will be stored with the request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={processingId !== null}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



    </div >
  );
};

export default AdminInsurersManagement;

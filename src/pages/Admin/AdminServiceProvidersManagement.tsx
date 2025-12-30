import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Edit, Trash2, Building2, Mail, Phone, MapPin, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
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

interface ServiceProvider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  serviceType?: string;
  status?: string;
  userId?: string;
  createdAt: string;
}

interface PendingSP {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  businessName?: string;
  address?: string;
  servicesProvided?: string;
}

const AdminServiceProvidersManagement = () => {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [pendingSPs, setPendingSPs] = useState<PendingSP[]>([]);
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
    fetchServiceProviders();
    fetchPendingSPs();
  }, [currentPage, filterServiceType, searchTerm]);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filterServiceType !== 'all') {
        params.serviceType = filterServiceType;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admin/service-providers', { params });
      setServiceProviders(response.data.serviceProviders || []);
      setTotalPages(response.data.totalPages || 1);
      logger.admin.view('Fetched service providers', { count: response.data.serviceProviders?.length || 0 });
    } catch (err: any) {
      logger.admin.error("Error fetching service providers", { error: err });
      setError(err?.response?.data?.message || "Failed to fetch service providers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSPs = async () => {
    try {
      setLoadingPending(true);
      const response = await api.get('/admin/users/pending');
      // Filter only SERVICE_PROVIDER role
      const sps = (response.data.users || []).filter((user: any) => user.role === 'SERVICE_PROVIDER');
      setPendingSPs(sps);
      logger.admin.view('Fetched pending service providers', { count: sps.length });
    } catch (err: any) {
      logger.admin.error('Error fetching pending SPs', { error: err });
      setError('Failed to load pending service providers');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to approve this Service Provider registration?')) {
      return;
    }

    setProcessingId(userId);
    try {
      // Use id field if available, otherwise use _id
      const idToUse = userId.includes('-') ? userId : userId; // UUID format check
      await api.put(`/admin/users/${idToUse}/approve`, { approved: true });
      logger.admin.approve('Service Provider approved', { userId: idToUse });
      alert('Service Provider approved successfully!');
      fetchPendingSPs();
      fetchServiceProviders(); // Refresh the list
    } catch (err: any) {
      logger.admin.error('Error approving SP', { error: err, userId });
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
      logger.admin.reject('Service Provider rejected', { userId: idToUse, reason: rejectReason });
      alert('Service Provider registration rejected.');
      fetchPendingSPs();
      fetchServiceProviders(); // Refresh the list
    } catch (err: any) {
      logger.admin.error('Error rejecting SP', { error: err, userId });
      alert(err?.response?.data?.message || 'Failed to reject registration.');
    } finally {
      setProcessingId(null);
      setPendingRejectId(null);
      setRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service provider?")) return;

    try {
      // Use id field if available, otherwise use _id
      const idToUse = id.includes('-') ? id : id; // UUID format check
      await api.delete(`/admin/service-providers/${idToUse}`);
      logger.admin.delete('Service Provider deleted', { spId: idToUse });
      fetchServiceProviders();
    } catch (err: any) {
      logger.admin.error('Error deleting SP', { error: err, spId: id });
      alert(err?.response?.data?.message || "Failed to delete service provider.");
    }
  };

  if (loading && serviceProviders.length === 0 && pendingSPs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading service providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-1">Manage service provider companies and pending requests</p>
        </div>
        <Link
          to="/admin-dashboard/service-providers/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 w-fit"
        >
          <PlusCircle className="h-4 w-4" />
          Add Service Provider
        </Link>
      </div>

      {/* Tabs for Pending and Approved */}
      <Tabs defaultValue="approved" className="w-full">
        <TabsList>
          <TabsTrigger value="approved">
            Approved ({serviceProviders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests ({pendingSPs.length})
            {pendingSPs.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">{pendingSPs.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Approved Service Providers */}
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

          {/* Service Providers List */}
          {serviceProviders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No service providers found</p>
                <p className="text-gray-500 mt-2">
                  {searchTerm || filterServiceType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No service providers have been registered yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceProviders.map((provider) => (
                <Card key={provider._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {provider.name}
                          </h3>
                          {provider.serviceType && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {provider.serviceType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {provider.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{provider.email}</span>
                          </div>
                        )}
                        {provider.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{provider.phone}</span>
                          </div>
                        )}
                        {provider.address && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="line-clamp-2">{provider.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Link
                          to={`/admin-dashboard/service-providers/${provider.id || provider._id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          onClick={() => logger.admin.view('Viewing service provider details', { spId: provider.id || provider._id })}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        <Link
                          to={`/admin-dashboard/service-providers/${provider.id || provider._id}`}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          onClick={() => logger.admin.view('Editing service provider', { spId: provider.id || provider._id })}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <Button
                          onClick={() => handleDelete(provider._id)}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
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
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4 mt-6">
          {loadingPending ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading pending requests...</p>
              </div>
            </div>
          ) : pendingSPs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No pending requests</p>
                <p className="text-gray-500 mt-2">
                  All Service Provider registrations have been processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingSPs.map((sp) => (
                <Card key={sp._id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{sp.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Registered {new Date(sp.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {sp.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{sp.email}</span>
                        </div>
                      )}
                      {sp.mobileNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{sp.mobileNumber}</span>
                        </div>
                      )}
                      {sp.businessName && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Business: </span>
                          <span className="text-gray-900 font-medium">{sp.businessName}</span>
                        </div>
                      )}
                    </div>
                    {sp.address && (
                      <div className="mb-4 text-sm">
                        <span className="text-gray-500">Address: </span>
                        <span className="text-gray-900">{sp.address}</span>
                      </div>
                    )}
                    {sp.servicesProvided && (
                      <div className="mb-4 text-sm">
                        <span className="text-gray-500">Services: </span>
                        <span className="text-gray-900">{sp.servicesProvided}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button
                        onClick={() => handleApprove(sp.id || sp._id)}
                        disabled={processingId === (sp.id || sp._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processingId === sp._id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleReject(sp.id || sp._id)}
                        disabled={processingId === (sp.id || sp._id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Service Provider</AlertDialogTitle>
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
    </div>
  );
};

export default AdminServiceProvidersManagement;

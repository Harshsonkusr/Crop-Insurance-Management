import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '../../lib/api';

interface Claim {
  id: string;
  _id?: string; // Keep for backward compatibility
  claimId: string;
  dateSubmitted: string;
  farmerName: string;
  claimType: string;
  status: string;
  verificationStatus: string;
  assignedTo?: {
    name: string;
    email: string;
  };
  lastUpdated: string;
}

const ServiceProviderClaimsManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    fetchClaims();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filterStatus !== 'All') {
        params.status = filterStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/service-provider/claims', { params });
      setClaims(response.data.claims || response.data || []);
      setTotalItems(response.data.totalClaims || response.data.length || 0);
      setTotalPages(Math.ceil((response.data.totalClaims || response.data.length || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('Error fetching claims:', err);
      setError(err?.response?.data?.message || 'Failed to fetch claims.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in_review': { label: 'In Review', className: 'bg-blue-100 text-blue-800', icon: Eye },
      'submitted': { label: 'Submitted', className: 'bg-gray-100 text-gray-800', icon: Clock },
    };
    const statusLower = status?.toLowerCase() || '';
    const statusConfig = config[statusLower] || { label: status || 'Unknown', className: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = statusConfig.icon;
    return (
      <Badge className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'verified': { label: 'Verified', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    };
    const statusLower = status?.toLowerCase() || '';
    const statusConfig = config[statusLower] || { label: status || 'Pending', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.farmerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || claim.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Claims</h1>
          <p className="text-gray-600 mt-1">Manage and verify claims assigned to you</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Claim ID, Farmer Name..."
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
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
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
      {filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No claims found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || filterStatus !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No claims have been assigned to you yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <Card key={claim._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">Claim #{claim.claimId || claim._id.slice(-8)}</h3>
                      {getStatusBadge(claim.status)}
                      {getVerificationBadge(claim.verificationStatus)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Farmer: </span>
                        <span className="font-medium text-gray-900">{claim.farmerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type: </span>
                        <span className="font-medium text-gray-900">{claim.claimType || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted: </span>
                        <span className="font-medium text-gray-900">
                          {new Date(claim.dateSubmitted || claim.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      {claim.assignedTo && (
                        <div>
                          <span className="text-gray-500">Assigned To: </span>
                          <span className="font-medium text-gray-900">{claim.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/service-provider-dashboard/claims/${claim.id || claim._id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/service-provider-dashboard/claims/${claim.id || claim._id}/edit`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
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
};

export default ServiceProviderClaimsManagement;

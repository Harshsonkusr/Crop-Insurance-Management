import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Clock, CheckCircle2, XCircle, AlertCircle, ScrollText } from 'lucide-react';
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

const InsurerClaimsManagement = () => {
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

      const response = await api.get('/insurer/claims', { params });
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <ScrollText className="h-8 w-8" />
            </span>
            Claims Management
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Manage and verify claims from your issued policies</p>
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

      {/* Claims List - Modern Professional Table */}
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
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-600 border-b border-purple-700">
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Claim ID & Farmer</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Claim Type</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Submitted Date</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Verification</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-purple-50 transition-all group border-l-4 border-transparent hover:border-purple-500">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">#{claim.claimId || claim._id?.slice(-8)}</span>
                        <span className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">{(claim as any).farmer?.name || claim.farmerName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{claim.claimType || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{new Date(claim.dateSubmitted || claim.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getVerificationBadge(claim.verificationStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/insurer-dashboard/claims/${claim.id || claim._id}`}>
                          <Button variant="ghost" size="icon" title="View Details" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/insurer-dashboard/claims/${claim.id || claim._id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit Claim" className="h-8 w-8 text-purple-600 hover:bg-purple-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
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

export default InsurerClaimsManagement;

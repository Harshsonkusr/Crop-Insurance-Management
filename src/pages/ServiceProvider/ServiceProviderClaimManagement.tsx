import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';

interface Claim {
  _id?: string;
  id?: string;
  claimId?: string;
  submissionDate?: string;
  dateOfClaim?: string;
  farmerName?: string;
  farmerId?: {
    name: string;
  };
  cropType?: string;
  status: string;
  assignedTo?: string;
  lastUpdated?: string;
}

const ServiceProviderClaimManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/service-provider/claims');
      setClaims(response.data.claims || response.data || []);
    } catch (err: any) {
      console.error('Claim fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch claims.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!window.confirm('Are you sure you want to delete this claim?')) return;
    try {
      await api.delete(`/service-provider/claims/${claimId}`);
      setClaims(claims.filter(claim => (claim._id || claim.id) !== claimId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete claim.');
    }
  };

  const filteredClaims = claims.filter(claim =>
    (claim.claimId || claim.id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (claim.farmerName || claim.farmerId?.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.cropType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in_review': { label: 'In Review', className: 'bg-blue-100 text-blue-800', icon: Eye },
    };
    const statusLower = status?.toLowerCase() || '';
    const statusConfig = config[statusLower] || { label: status || 'Unknown', className: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = statusConfig.icon;
    return (
      <Badge className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-600" />
            Claim Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and process claims assigned to you</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Claim ID, Farmer Name, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No claims found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No claims have been assigned to you yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <Card key={claim._id || claim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Claim #{claim.claimId || claim.id || 'N/A'}
                      </h3>
                      {getStatusBadge(claim.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Farmer: </span>
                        <span className="font-medium text-gray-900">{claim.farmerName || claim.farmerId?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Crop: </span>
                        <span className="font-medium text-gray-900">{claim.cropType || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted: </span>
                        <span className="font-medium text-gray-900">
                          {new Date(claim.submissionDate || claim.dateOfClaim || claim.lastUpdated || '').toLocaleDateString()}
                        </span>
                      </div>
                      {claim.assignedTo && (
                        <div>
                          <span className="text-gray-500">Assigned To: </span>
                          <span className="font-medium text-gray-900">{claim.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/service-provider-dashboard/claims/${claim._id || claim.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/service-provider-dashboard/claims/${claim._id || claim.id}/edit`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClaim(claim._id || claim.id || '')}
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
    </div>
  );
};

export default ServiceProviderClaimManagement;

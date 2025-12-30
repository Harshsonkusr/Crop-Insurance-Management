import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Calendar,
  MapPin,
  IndianRupee,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  ChevronRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '../../lib/api';

interface Claim {
  id?: string;
  _id?: string;
  claimId: string;
  policy?: {
    policyNumber: string;
    cropType: string;
    sumInsured?: number;
  };
  policyId?: string | {
    policyNumber: string;
    cropType: string;
  };
  dateOfIncident: string;
  dateOfClaim: string;
  locationOfIncident: string;
  description: string;
  status: string;
  amountClaimed?: number;
  verificationStatus?: string;
  aiDamageAssessment?: any;
  createdAt: string;
  assignedTo?: {
    name: string;
    email: string;
  };
}

const ClaimTracking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchClaims();
  }, []);

  // Refresh claims when navigating to this page (e.g., after submitting a claim)
  useEffect(() => {
    if (location.pathname === '/farmer-dashboard/my-claims') {
      fetchClaims();
    }
  }, [location.pathname]);

  useEffect(() => {
    filterClaims();
  }, [claims, filterStatus, searchQuery]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/claims/my-claims');
      const claimsData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched claims:', claimsData.length, claimsData);
      setClaims(claimsData);
      setFilteredClaims(claimsData);
    } catch (err: any) {
      console.error('Error fetching claims:', err);
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err?.response?.status === 403) {
        setError('Access denied. You do not have permission to view claims.');
      } else if (err?.message) {
        setError(`Failed to fetch claims: ${err.message}`);
      } else {
        setError('Failed to fetch claims. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = [...claims];

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(claim => 
        claim.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claimId?.toLowerCase().includes(query) ||
        (claim.policy?.policyNumber || (typeof claim.policyId === 'object' ? claim.policyId?.policyNumber : '') || '').toLowerCase().includes(query) ||
        claim.policyId?.cropType?.toLowerCase().includes(query) ||
        claim.description?.toLowerCase().includes(query)
      );
    }

    setFilteredClaims(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any } } = {
      'pending': { label: 'Pending', variant: 'secondary', icon: Clock },
      'submitted': { label: 'Submitted', variant: 'secondary', icon: Clock },
      'in-progress': { label: 'In Progress', variant: 'secondary', icon: Clock },
      'under_review': { label: 'Under Review', variant: 'secondary', icon: Clock },
      'approved': { label: 'Approved', variant: 'default', icon: CheckCircle2 },
      'resolved': { label: 'Resolved', variant: 'default', icon: CheckCircle2 },
      'rejected': { label: 'Rejected', variant: 'destructive', icon: XCircle },
    };

    const config = statusConfig[status.toLowerCase()] || { 
      label: status, 
      variant: 'outline' as const,
      icon: AlertCircle
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return '₹0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Claims</h1>
          <p className="text-gray-600">Track and manage all your insurance claims</p>
        </div>
        <Button
          onClick={() => navigate('/farmer-dashboard/submit-claim')}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Submit New Claim
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by claim ID, policy number, crop type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      {error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {claims.length === 0 ? 'No Claims Yet' : 'No Claims Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {claims.length === 0
                ? "You haven't submitted any claims yet. Click the button below to submit your first claim."
                : 'Try adjusting your filters or search query.'}
            </p>
            {claims.length === 0 && (
              <Button
                onClick={() => navigate('/farmer-dashboard/submit-claim')}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Submit Your First Claim
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClaims.map((claim) => {
            const claimId = claim.id || claim._id || '';
            return (
            <Card
              key={claimId}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/farmer-dashboard/view-details/claim/${claimId}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">
                        {claim.claimId || `Claim #${(claim.id || claim._id || '').slice(-8)}`}
                      </h3>
                      {getStatusBadge(claim.status)}
                      {claim.verificationStatus && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {claim.verificationStatus}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>
                          <span className="font-medium">Policy:</span>{' '}
                          {claim.policy?.policyNumber || (typeof claim.policyId === 'object' ? claim.policyId?.policyNumber : 'N/A') || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          <span className="font-medium">Incident:</span>{' '}
                          {formatDate(claim.dateOfIncident || claim.dateOfClaim)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {claim.locationOfIncident || 'Location not provided'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <IndianRupee className="h-4 w-4" />
                        <span>
                          <span className="font-medium">Amount:</span>{' '}
                          {formatCurrency(claim.amountClaimed)}
                        </span>
                      </div>
                    </div>

                    {claim.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {claim.description}
                      </p>
                    )}

                    {claim.policyId?.cropType && (
                      <div>
                        <Badge variant="outline">{claim.policyId.cropType}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/farmer-dashboard/view-details/claim/${claimId}`);
                      }}
                      className="flex items-center gap-2"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {claims.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Claims</div>
              <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {claims.filter(c => ['pending', 'submitted', 'in-progress', 'under_review'].includes(c.status.toLowerCase())).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold text-green-600">
                {claims.filter(c => ['approved', 'resolved'].includes(c.status.toLowerCase())).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(claims.reduce((sum, c) => sum + (c.amountClaimed || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClaimTracking;

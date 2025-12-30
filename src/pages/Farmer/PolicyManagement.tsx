import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Calendar, 
  IndianRupee, 
  TrendingUp,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  PlusCircle,
  ExternalLink
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '../../lib/api';
import logger from '../../utils/logger';

interface Policy {
  _id: string;
  id?: string;
  policyNumber: string;
  cropType: string;
  sumInsured: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: string;
  insuredArea?: number;
  source?: 'internal' | 'external';
  isExternal?: boolean;
  canRenew?: boolean;
  policyVerified?: boolean;
  serviceProvider?: {
    name: string;
    email?: string;
  };
}

const PolicyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, filterStatus]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/farmer/policies');
      const policiesData = Array.isArray(response.data) ? response.data : [];
      setPolicies(policiesData);
      setFilteredPolicies(policiesData);
      logger.farmer.policy('Fetched policies', { count: policiesData.length });
    } catch (err: any) {
      logger.farmer.error('Error fetching policies', { error: err });
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err?.response?.status === 403) {
        setError('Access denied. You do not have permission to view policies.');
      } else if (err?.message) {
        setError(`Failed to fetch policies: ${err.message}`);
      } else {
        setError('Failed to fetch policies. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = () => {
    if (filterStatus === 'All') {
      setFilteredPolicies(policies);
    } else {
      setFilteredPolicies(policies.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase()));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any } } = {
      'active': { label: 'Active', variant: 'default', icon: CheckCircle2 },
      'inactive': { label: 'Inactive', variant: 'secondary', icon: Clock },
      'expired': { label: 'Expired', variant: 'outline', icon: AlertCircle },
    };

    const config = statusConfig[status.toLowerCase()] || { 
      label: status, 
      variant: 'outline' as const,
      icon: Shield
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const handleDownload = async (policyId: string) => {
    try {
      logger.farmer.policy('Downloading policy', { policyId });
      // Fetch policy details
      const response = await api.get(`/farmer/policies/${policyId}`);
      const policy = response.data;

      // Create a simple PDF-like text content
      const policyContent = `
CLAIM EASY - POLICY DETAILS
===========================

Policy Information:
Policy Number: ${policy.policyNumber || 'N/A'}
Status: ${policy.status || 'N/A'}
Crop Type: ${policy.cropType || 'N/A'}
Sum Insured: ₹${policy.sumInsured?.toLocaleString('en-IN') || 'N/A'}
Premium: ₹${policy.premium?.toLocaleString('en-IN') || 'N/A'}
Start Date: ${policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A'}
End Date: ${policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A'}
Insured Area: ${policy.insuredArea || 'N/A'} acres

Farmer Information:
Name: ${policy.farmer?.name || 'N/A'}
Email: ${policy.farmer?.email || 'N/A'}
Mobile: ${policy.farmer?.mobileNumber || 'N/A'}

Service Provider Information:
Name: ${policy.serviceProvider?.name || 'N/A'}
Email: ${policy.serviceProvider?.email || 'N/A'}

Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}

Note: This is an electronic copy of your policy details. For official documentation,
please contact your service provider.
      `;

      // Create and download as text file
      const blob = new Blob([policyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `policy-${policy.policyNumber || policyId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading policy:', error);
      alert('Failed to download policy. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Policies</h1>
          <p className="text-gray-600">View and manage your insurance policies</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/farmer-dashboard/policy-request')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Request New Policy
          </Button>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Policies</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policies Found</h3>
            <p className="text-gray-600 mb-4">
              {policies.length === 0
                ? "You don't have any insurance policies yet. Request a new policy or check if external policies are available."
                : 'Try adjusting your filter.'}
            </p>
            {policies.length === 0 && (
              <Button
                onClick={() => navigate('/farmer-dashboard/policy-request')}
                className="mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Request New Policy
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Policies Grid */}
      {!error && filteredPolicies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <Card
              key={policy._id}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                isExpiringSoon(policy.endDate) ? 'border-yellow-400 border-2' : ''
              }`}
              onClick={() => navigate(`/farmer-dashboard/view-details/policy/${policy._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{policy.policyNumber}</CardTitle>
                      {policy.isExternal && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          External
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{policy.cropType}</p>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>
                {isExpiringSoon(policy.endDate) && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium">
                      ⚠️ Expiring soon - Renew before {formatDate(policy.endDate)}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Coverage</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(policy.sumInsured)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Premium</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(policy.premium)}
                    </p>
                  </div>
                </div>

                {policy.insuredArea && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Insured Area</p>
                    <p className="text-sm font-medium text-gray-900">
                      {policy.insuredArea} acres
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">Start:</span> {formatDate(policy.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">End:</span> {formatDate(policy.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/farmer-dashboard/view-details/policy/${policy.id || policy._id}`);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(policy.id || policy._id);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {policy.canRenew && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        logger.farmer.policy('Renew policy requested', { policyId: policy.id || policy._id });
                        navigate('/farmer-dashboard/policy-request', {
                          state: {
                            policy,
                            isRenewal: true
                          }
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {policies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div className="text-sm text-gray-600">Total Policies</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{policies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {policies.filter(p => p.status.toLowerCase() === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div className="text-sm text-gray-600">Total Coverage</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(policies.reduce((sum, p) => sum + (p.sumInsured || 0), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-5 w-5 text-orange-500" />
                <div className="text-sm text-gray-600">Total Premium</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(policies.reduce((sum, p) => sum + (p.premium || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;

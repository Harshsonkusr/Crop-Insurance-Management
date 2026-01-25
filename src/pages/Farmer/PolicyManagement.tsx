import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Calendar,
  Crop,
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
  ExternalLink,
  Building2,
  XCircle
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
  status: string; // Backend DB status
  viewStatus: 'Active' | 'Expired' | 'Pending' | 'Rejected' | 'Approved'; // Backend mapped status
  type: 'policy' | 'request';
  insuredArea?: number;
  source?: 'internal' | 'external';
  isExternal?: boolean;
  canRenew?: boolean;
  policyVerified?: boolean;
  insurerName?: string;
  cultivationSeason?: string;
  cropDetails?: any;
}

const PolicyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, filterStatus, searchQuery]);

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
      setError(err?.response?.data?.message || 'Failed to fetch policies.');
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = () => {
    let filtered = [...policies];

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(p => p.viewStatus.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.policyNumber.toLowerCase().includes(query) ||
        p.cropType.toLowerCase().includes(query) ||
        (p.insurerName || '').toLowerCase().includes(query) ||
        p.viewStatus.toLowerCase().includes(query) ||
        (p.id || '').toLowerCase().includes(query)
      );
    }

    setFilteredPolicies(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any } } = {
      'active': { label: 'Active', variant: 'default', icon: CheckCircle2 },
      'expired': { label: 'Expired', variant: 'secondary', icon: AlertCircle },
      'pending': { label: 'Pending', variant: 'outline', icon: Clock },
      'approved': { label: 'Approved', variant: 'secondary', icon: CheckCircle2 },
      'rejected': { label: 'Rejected', variant: 'destructive', icon: XCircle },
    };

    const config = statusConfig[status.toLowerCase()] || {
      label: status,
      variant: 'outline' as const,
      icon: Shield
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className={`flex items-center gap-1 ${status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
        status.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''
        }`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
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
Crop Variety: ${policy.cropDetails?.cropVariety || 'N/A'}
Season: ${policy.cropDetails?.cultivationSeason || 'N/A'}
Sum Insured: ₹${policy.sumInsured?.toLocaleString('en-IN') || 'N/A'}
Premium: ₹${policy.premium?.toLocaleString('en-IN') || 'N/A'}
Start Date: ${policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A'}
End Date: ${policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A'}
Insured Area: ${policy.insuredArea || 'N/A'} acres

Land & Crop Specifics:
Survey/Khasra: ${policy.cropDetails?.surveyNumber || 'N/A'}
Khewat/Khatauni: ${policy.cropDetails?.khewatNumber || 'N/A'}
Insurance Unit: ${policy.cropDetails?.insuranceUnit || 'N/A'}
Sowing Date: ${policy.cropDetails?.sowingDate || 'N/A'}
Expected Yield: ${policy.cropDetails?.expectedYield || 'N/A'} tons/acre
Irrigation: ${policy.cropDetails?.irrigationMethod || 'N/A'}
Soil Type: ${policy.cropDetails?.soilType || 'N/A'}
Wild Animal Coverage: ${policy.cropDetails?.wildAnimalAttackCoverage ? 'Yes' : 'No'}

Bank Details (DBT):
Bank Name: ${policy.cropDetails?.bankName || 'N/A'}
Account No: ${policy.cropDetails?.bankAccountNo || 'N/A'}
IFSC Code: ${policy.cropDetails?.bankIfsc || 'N/A'}

Farmer Information:
Name: ${policy.farmer?.name || 'N/A'}
Email: ${policy.farmer?.email || 'N/A'}
Mobile: ${policy.farmer?.mobileNumber || 'N/A'}

Insurer Information:
Name: ${policy.insurer?.name || 'N/A'}
Email: ${policy.insurer?.email || 'N/A'}

Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}

Note: This is an electronic copy of your policy details. For official documentation,
please contact your insurer.
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
          <p className="text-gray-600">Unified view of your active insurance and policy requests</p>
        </div>
        <Button
          onClick={() => navigate('/farmer-dashboard/policy-request')}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Request New Policy
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by policy number, crop type, insurer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Items</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Expired">Expired/Inactive</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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

      {/* Policies List - Professional Grid */}
      {!error && filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{policies.length === 0 ? 'No Records Found' : 'No Policies Found'}</h3>
            <p className="text-gray-600 mb-4">
              {policies.length === 0
                ? "You haven't requested any insurance policies yet."
                : 'Try changing your filter or search query.'}
            </p>
            <Button
              onClick={() => navigate('/farmer-dashboard/policy-request')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Start First Request
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && filteredPolicies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((item) => (
            <Card key={item._id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 ${item.viewStatus === 'Active' ? 'border-t-green-500' :
              item.viewStatus === 'Approved' ? 'border-t-blue-500' :
                item.viewStatus === 'Pending' ? 'border-t-yellow-500' :
                  item.viewStatus === 'Rejected' ? 'border-t-red-500' : 'border-t-gray-300'
              } ${isExpiringSoon(item.endDate) ? 'ring-2 ring-yellow-400' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {item.type === 'policy' ? 'Policy Number' : 'Request Number'}
                    </span>
                    <span className="font-bold text-gray-900">
                      {item.policyNumber || `REQ-${(item._id || item.id)?.slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                  {getStatusBadge(item.viewStatus)}
                </div>
                <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                  <Crop className="h-5 w-5" />
                  {item.cropType}
                </CardTitle>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {item.insurerName || 'Processing Insurer'}
                </p>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Sum Insured</span>
                    <div className="flex items-center gap-1 text-green-700 font-bold">
                      <IndianRupee className="h-3 w-3" />
                      {item.type === 'policy' ? item.sumInsured?.toLocaleString('en-IN') : 'Pending'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Premium</span>
                    <div className="flex items-center gap-1 text-gray-900 font-semibold">
                      <IndianRupee className="h-3 w-3" />
                      {item.type === 'policy' ? item.premium?.toLocaleString('en-IN') : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>{formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Open'}</span>
                    </div>
                  </div>

                  {item.cultivationSeason && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      <span>Season: <span className="font-medium text-gray-700">{item.cultivationSeason}</span></span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {item.type === 'policy' ? (
                    <>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-9"
                        onClick={() => navigate(`/farmer-dashboard/view-details/policy/${item.id || item._id}`)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-green-200 text-green-700 hover:bg-green-50 text-xs h-9"
                        onClick={() => handleDownload(item.id || item._id)}
                      >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        PDF
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-9"
                      onClick={() => navigate(`/farmer-dashboard/view-details/policy-request/${item.id || item._id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      Review Request
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {policies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div className="text-xs uppercase font-bold text-blue-700">Total Items</div>
              </div>
              <div className="text-2xl font-bold text-blue-900">{policies.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="text-xs uppercase font-bold text-green-700">Active</div>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {policies.filter(p => p.viewStatus === 'Active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="text-xs uppercase font-bold text-yellow-700">Processing</div>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {policies.filter(p => p.viewStatus === 'Pending' || p.viewStatus === 'Approved').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <div className="text-xs uppercase font-bold text-gray-600">Expired</div>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {policies.filter(p => p.viewStatus === 'Expired').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;

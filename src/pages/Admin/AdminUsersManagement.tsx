import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Trash2, Ban, Users, Mail, Smartphone, FileText, Shield, MapPin, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '../../lib/api';

interface Farmer {
  _id: string;
  name: string;
  mobileNumber?: string;
  status: string;
  createdAt: string;
}

interface FarmerDetails {
  farmer: Farmer;
  claims: any[];
  policies: any[];
  farmDetails: any;
}

const AdminUsersManagement = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFarmers, setTotalFarmers] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFarmers();
  }, [currentPage, searchTerm]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        role: 'FARMER', // Only fetch farmers
      };

      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      const response = await api.get('/admin/users', { params });
      setFarmers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalFarmers(response.data.totalItems || 0);
    } catch (err: any) {
      console.error("Error fetching farmers:", err);
      setError(err?.response?.data?.message || "Failed to fetch farmers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerDetails = async (farmerId: string) => {
    try {
      setLoadingDetails(true);
      setSelectedFarmer(null);

      // Fetch farmer details, claims, and policies using admin endpoints
      const [farmerResponse, claimsResponse, policiesResponse, farmDetailsResponse] = await Promise.all([
        api.get(`/admin/users/${farmerId}`).catch(() => ({ data: null })),
        // Admin can get all claims, filter by farmerId
        api.get('/admin/claims', { params: { farmerId } }).catch(() => ({ data: { claims: [] } })),
        // Get all policies and filter by farmerId
        api.get('/admin/policies', { params: { farmerId } }).catch(() => ({ data: { policies: [] } })),
        // Farm details endpoint - admin access
        api.get(`/admin/farm-details/${farmerId}`).catch(() => ({ data: null })),
      ]);

      // Filter policies by farmerId if needed
      const policiesData = policiesResponse.data?.policies || policiesResponse.data || [];
      const allPolicies = Array.isArray(policiesData) ? policiesData : [];
      const farmerPolicies = allPolicies.filter((p: any) => 
        p.farmerId?._id === farmerId || p.farmerId === farmerId || p.farmerId?._id?.toString() === farmerId
      );

      // Filter claims by farmerId if needed
      const allClaims = claimsResponse.data?.claims || claimsResponse.data || [];
      const farmerClaims = Array.isArray(allClaims) ? allClaims.filter((c: any) => 
        c.farmerId?._id === farmerId || c.farmerId === farmerId || c.farmerId?._id?.toString() === farmerId
      ) : [];

      setSelectedFarmer({
        farmer: farmerResponse.data || farmers.find(f => f._id === farmerId),
        claims: farmerClaims,
        policies: farmerPolicies,
        farmDetails: farmDetailsResponse.data,
      });
    } catch (err: any) {
      console.error("Error fetching farmer details:", err);
      alert(err?.response?.data?.message || "Failed to fetch farmer details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this farmer?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      fetchFarmers();
      if (selectedFarmer?.farmer._id === id) {
        setSelectedFarmer(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete farmer.");
    }
  };

  const handleBanUnban = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'banned' ? 'ban' : 'unban'} this farmer?`)) return;

    try {
      await api.put(`/admin/users/${id}`, { status: newStatus });
      fetchFarmers();
      if (selectedFarmer?.farmer._id === id) {
        fetchFarmerDetails(id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update farmer status.");
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'active': { label: 'Active', className: 'bg-green-100 text-green-800' },
      'banned': { label: 'Banned', className: 'bg-red-100 text-red-800' },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    };
    const statusConfig = config[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const getClaimStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      'in_review': { label: 'In Review', className: 'bg-blue-100 text-blue-800' },
    };
    const statusConfig = config[status?.toLowerCase()] || { label: status || 'Unknown', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  if (loading && farmers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Farmers</h1>
          <p className="text-gray-600 mt-1">View and manage all registered farmers</p>
        </div>
        <Link
          to="/admin-dashboard/users/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 w-fit"
        >
          <UserPlus className="h-4 w-4" />
          Add Farmer
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, mobile number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farmers List */}
        <div className={`lg:col-span-${selectedFarmer ? '1' : '3'} space-y-4`}>
          {farmers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No farmers found</p>
                <p className="text-gray-500 mt-2">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'No farmers have been registered yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {farmers.map((farmer) => (
                <Card 
                  key={farmer._id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${selectedFarmer?.farmer._id === farmer._id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => fetchFarmerDetails(farmer._id)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                        {getStatusBadge(farmer.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        {farmer.mobileNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <span>{farmer.mobileNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Joined: {new Date(farmer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBanUnban(farmer._id, farmer.status);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {farmer.status === 'banned' ? 'Unban' : 'Ban'}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(farmer._id);
                          }}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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

        {/* Farmer Details Panel */}
        {selectedFarmer && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedFarmer.farmer.name} - Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFarmer(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDetails ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading details...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="claims">Claims ({selectedFarmer.claims.length})</TabsTrigger>
                      <TabsTrigger value="policies">Policies ({selectedFarmer.policies.length})</TabsTrigger>
                      <TabsTrigger value="farm">Farm Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{selectedFarmer.farmer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mobile Number</p>
                          <p className="font-medium">{selectedFarmer.farmer.mobileNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          {getStatusBadge(selectedFarmer.farmer.status)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Joined Date</p>
                          <p className="font-medium">
                            {new Date(selectedFarmer.farmer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedFarmer.claims.length}</p>
                          <p className="text-sm text-gray-600">Total Claims</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{selectedFarmer.policies.length}</p>
                          <p className="text-sm text-gray-600">Total Policies</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedFarmer.farmDetails ? '1' : '0'}
                          </p>
                          <p className="text-sm text-gray-600">Farm Details</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="claims" className="space-y-3 mt-4">
                      {selectedFarmer.claims.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No claims found</p>
                        </div>
                      ) : (
                        selectedFarmer.claims.map((claim: any) => (
                          <Card key={claim._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">Claim #{claim.claimId || claim._id.slice(-8)}</h4>
                                    {getClaimStatusBadge(claim.status)}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{claim.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>Date: {new Date(claim.dateOfClaim).toLocaleDateString()}</span>
                                    {claim.amountClaimed && (
                                      <span>Amount: ₹{claim.amountClaimed.toLocaleString('en-IN')}</span>
                                    )}
                                  </div>
                                </div>
                                <Link
                                  to={`/admin-dashboard/claims/${claim._id}`}
                                  className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="policies" className="space-y-3 mt-4">
                      {selectedFarmer.policies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No policies found</p>
                        </div>
                      ) : (
                        selectedFarmer.policies.map((policy: any) => (
                          <Card key={policy._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{policy.policyNumber}</h4>
                                    <Badge className={policy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                      {policy.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>
                                      <span className="text-gray-500">Crop Type: </span>
                                      <span className="font-medium">{policy.cropType}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Sum Insured: </span>
                                      <span className="font-medium">₹{policy.sumInsured?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Start Date: </span>
                                      <span className="font-medium">{new Date(policy.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">End Date: </span>
                                      <span className="font-medium">{new Date(policy.endDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="farm" className="mt-4">
                      {selectedFarmer.farmDetails ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Farm Name</p>
                              <p className="font-medium">{selectedFarmer.farmDetails.farmName || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Crop Type</p>
                              <p className="font-medium">{selectedFarmer.farmDetails.cropType || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Area</p>
                              <p className="font-medium">{selectedFarmer.farmDetails.area || 'N/A'} acres</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">{selectedFarmer.farmDetails.location || 'N/A'}</p>
                            </div>
                          </div>
                          {selectedFarmer.farmDetails.latitude && selectedFarmer.farmDetails.longitude && (
                            <div>
                              <p className="text-sm text-gray-500">Coordinates</p>
                              <p className="font-medium">
                                {selectedFarmer.farmDetails.latitude}, {selectedFarmer.farmDetails.longitude}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No farm details available</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersManagement;

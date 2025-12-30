import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, PlusCircle, User, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';

interface Farmer {
  _id?: string;
  id?: string;
  name: string;
  location?: string;
  contact?: string;
  mobileNumber?: string;
  email?: string;
  registeredDate?: string;
  createdAt?: string;
  status?: string;
}

const ServiceProviderFarmerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/service-provider/farmers');
      setFarmers(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch farmers:', err);
      setError(err?.response?.data?.message || 'Failed to load farmers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarmer = () => {
    navigate('/service-provider-dashboard/farmer-management/add');
  };

  const handleEditFarmer = (farmer: Farmer) => {
    navigate('/service-provider-dashboard/farmer-management/add', { state: { farmer } });
  };

  const handleViewFarmer = (farmerId: string) => {
    navigate(`/service-provider-dashboard/view-detail/farmer/${farmerId}`);
  };

  const handleDeleteFarmer = async (farmerId: string) => {
    if (!window.confirm('Are you sure you want to delete this farmer?')) return;
    try {
      await api.delete(`/service-provider/farmers/${farmerId}`);
      setFarmers(farmers.filter(farmer => (farmer._id || farmer.id) !== farmerId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete farmer.');
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const config: Record<string, { label: string; className: string }> = {
      'active': { label: 'Active', className: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      'suspended': { label: 'Suspended', className: 'bg-red-100 text-red-800' },
    };
    const statusLower = status.toLowerCase();
    const statusConfig = config[statusLower] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  if (loading && farmers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading farmers...</p>
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
            <User className="h-8 w-8 text-purple-600" />
            Farmer Management
          </h1>
          <p className="text-gray-600 mt-1">Manage farmers in your service area</p>
        </div>
        <Button onClick={handleAddFarmer} className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Farmer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search farmers by name, contact, or location..."
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

      {/* Farmers List */}
      {filteredFarmers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No farmers found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No farmers have been registered yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map((farmer) => (
            <Card key={farmer._id || farmer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{farmer.name}</CardTitle>
                    {getStatusBadge(farmer.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {farmer.contact && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{farmer.contact}</span>
                    </div>
                  )}
                  {farmer.mobileNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{farmer.mobileNumber}</span>
                    </div>
                  )}
                  {farmer.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{farmer.location}</span>
                    </div>
                  )}
                  {(farmer.registeredDate || farmer.createdAt) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        Registered: {new Date(farmer.registeredDate || farmer.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewFarmer(farmer._id || farmer.id || '')}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFarmer(farmer)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFarmer(farmer._id || farmer.id || '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceProviderFarmerManagement;

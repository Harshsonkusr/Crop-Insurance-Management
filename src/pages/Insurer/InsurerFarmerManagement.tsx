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

const InsurerFarmerManagement: React.FC = () => {
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
      const response = await api.get('/insurer/farmers');
      setFarmers(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch farmers:', err);
      setError(err?.response?.data?.message || 'Failed to load farmers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarmer = () => {
    navigate('/insurer-dashboard/farmer-management/add');
  };

  const handleEditFarmer = (farmer: Farmer) => {
    navigate('/insurer-dashboard/farmer-management/add', { state: { farmer } });
  };

  const handleViewFarmer = (farmerId: string) => {
    navigate(`/insurer-dashboard/view-detail/farmer/${farmerId}`);
  };

  const handleDeleteFarmer = async (farmerId: string) => {
    if (!window.confirm('Are you sure you want to delete this farmer?')) return;
    try {
      await api.delete(`/insurer/farmers/${farmerId}`);
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <User className="h-8 w-8" />
            </span>
            Farmer Management
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Overseeing the growth and security of your insured network.</p>
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

      {/* Farmers List - Modern Professional Table */}
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
        <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-600 border-b border-purple-700">
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Farmer Identity</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Contact Cluster</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Territory / Location</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Onboarding Date</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Lifecycle Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white/40">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer._id || farmer.id} className="hover:bg-purple-50 transition-all group border-l-4 border-transparent hover:border-purple-500">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200 shadow-sm group-hover:scale-110 transition-transform">
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 tracking-tight group-hover:text-purple-700 transition-colors uppercase">{farmer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 px-3 py-1.5 bg-gray-50/50 rounded-lg border border-transparent group-hover:border-gray-100 transition-all w-fit">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <Phone className="h-3 w-3 text-purple-400" />
                          <span className="tabular-nums">{farmer.mobileNumber || farmer.contact || '—'}</span>
                        </div>
                        {farmer.email && (
                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[140px] lowercase">{farmer.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50/40 rounded-lg border border-purple-100/50 group-hover:bg-purple-50 transition-all w-fit">
                        <MapPin className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700 truncate max-w-[180px]" title={farmer.location}>
                          {farmer.location || 'Regional'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-gray-300" />
                        <span>{new Date(farmer.registeredDate || farmer.createdAt || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(farmer.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewFarmer(farmer._id || farmer.id || '')}
                          className="h-9 w-9 text-blue-600 hover:bg-blue-100 rounded-xl"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditFarmer(farmer)}
                          className="h-9 w-9 text-amber-600 hover:bg-amber-100 rounded-xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFarmer(farmer._id || farmer.id || '')}
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
    </div>
  );
};

export default InsurerFarmerManagement;

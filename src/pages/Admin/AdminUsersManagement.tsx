import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Edit, Trash2, User, Users, Mail, Smartphone, MapPin, Eye, Filter, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '../../lib/api';
import logger from '../../utils/logger';

interface Farmer {
    id: string;
    _id: string; // fallback if id is not available
    name: string;
    email: string;
    mobileNumber: string;
    status: string;
    role: string;
    createdAt: string;
    farmDetails?: {
        district?: string;
        state?: string;
    };
}

const AdminUsersManagement = () => {
    const navigate = useNavigate();
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const itemsPerPage = 10;



    useEffect(() => {
        fetchFarmers();
    }, [currentPage, filterStatus, searchTerm]);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const params: any = {
                role: 'FARMER',
                page: currentPage,
                limit: itemsPerPage,
            };

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await api.get('/admin/users', { params });
            // Filter only FARMER role if backend hasn't filtered it
            const allUsers = response.data.users || [];
            const filteredFarmers = allUsers.filter((u: any) => u.role === 'FARMER');

            setFarmers(filteredFarmers);
            setTotalPages(response.data.totalPages || 1);
            logger.admin.view('Fetched farmers', { count: filteredFarmers.length });
        } catch (err: any) {
            logger.admin.error("Error fetching farmers", { error: err });
            setError(err?.response?.data?.message || "Failed to fetch farmers.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this farmer? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/users/${id}`);
            logger.admin.delete('Farmer deleted', { userId: id });
            fetchFarmers();
        } catch (err: any) {
            logger.admin.error('Error deleting farmer', { error: err, userId: id });
            alert(err?.response?.data?.message || "Failed to delete farmer.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'banned':
            case 'inactive':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Banned</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                        <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
                            <Users className="h-8 w-8" />
                        </span>
                        Manage Farmers
                    </h1>
                    <p className="text-gray-600 mt-1 ml-14">Operational oversight of all registered platform participants.</p>
                </div>
                <Link
                    to="/admin-dashboard/users/add"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 w-fit"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add New Farmer
                </Link>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm group">
                    <div className="h-1 bg-blue-500"></div>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Registered Farmers</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors tracking-tight">{farmers.length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by name, email, or mobile..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterStatus} onValueChange={(value) => {
                                setFilterStatus(value);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List / Table - Modern Professional Table */}
            {loading && farmers.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center text-red-600">
                        {error}
                        <Button variant="outline" className="mt-4 block mx-auto" onClick={fetchFarmers}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : farmers.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No farmers found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-600 border-b border-blue-700">
                                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Farmer Name & Member Since</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Email Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Secure Mobile</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Region / District</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white/40">
                                {farmers.map((farmer) => (
                                    <tr key={farmer.id || farmer._id} className="hover:bg-blue-50/50 transition-all group border-l-4 border-transparent hover:border-blue-500">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm group-hover:scale-110 transition-transform">
                                                    {farmer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">{farmer.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Clock className="h-3 w-3 text-gray-300" />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Joined {new Date(farmer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-lg border border-transparent group-hover:border-gray-100 transition-all w-fit">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600 truncate max-w-[180px]" title={farmer.email}>
                                                    {farmer.email || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/40 rounded-lg border border-blue-100/50 group-hover:bg-blue-50 transition-all w-fit">
                                                <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-sm font-semibold text-blue-700 tabular-nums">
                                                    {farmer.mobileNumber}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white transition-all w-fit">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {farmer.farmDetails?.district || 'Regional'}
                                                </span>
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
                                                    onClick={() => {
                                                        const id = farmer.id || farmer._id;
                                                        navigate(`/admin-dashboard/view-detail/farmer/${id}`);
                                                    }}
                                                    className="h-9 w-9 text-blue-600 hover:bg-blue-100 rounded-xl"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Link to={`/admin-dashboard/users/edit/${farmer.id || farmer._id}`}>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-600 hover:bg-amber-100 rounded-xl">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(farmer.id || farmer._id)}
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

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className="w-9 h-9 p-0"
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}


        </div>
    );
};

export default AdminUsersManagement;

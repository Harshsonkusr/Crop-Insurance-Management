import React, { useState, useEffect } from 'react';
import { Search, Filter, ScrollText, Clock, User, Activity, Users, Building2, Shield, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';
import { useAuth } from '../../components/Auth/AuthContext';

interface AuditLog {
  _id: string;
  timestamp: string;
  userId?: {
    _id: string;
    name: string;
    role: string;
  };
  user?: string;
  action: string;
  details: string | any;
  ipAddress?: string;
}

const AdminAuditLog = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? 'all' : 'farmers');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, filterAction, searchTerm, activeTab]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Use the audit logs endpoint
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterAction !== 'all') {
        params.action = filterAction;
      }

      console.log('Fetching audit logs with params:', params);
      const response = await api.get('/admin/audit-logs', { params });
      if (response.data.auditLogs) {
        const logs = response.data.auditLogs.map((log: any) => ({
          _id: log._id,
          timestamp: log.timestamp,
          userId: log.user ? {
            _id: log.user.id || log.user._id,
            name: log.user.name || 'System',
            role: log.user.role || 'UNKNOWN',
          } : undefined,
          user: log.user?.name || log.user || 'System',
          action: log.action || 'Unknown Action',
          details: log.details || '',
          ipAddress: log.ipAddress,
          role: log.user?.role || 'UNKNOWN',
        }));
        setAllLogs(logs);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
      let errorMessage = "Failed to fetch audit logs.";

      // Handle network errors
      if (err?.code === 'ECONNREFUSED' || err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please ensure the backend server is running.";
      } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err?.response?.status === 403) {
        errorMessage = "You don't have permission to view audit logs.";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs by role based on active tab
  const getFilteredLogs = () => {
    let filtered = allLogs;

    // Filter by role based on tab
    if (activeTab === 'farmers') {
      filtered = filtered.filter(log => {
        const userRole = log.userId?.role || (log.details as any)?.role || '';
        return userRole === 'FARMER' || (log.action && (log.action.includes('Farmer') || log.action.includes('FARMER')));
      });
    } else if (activeTab === 'service-providers') {
      filtered = filtered.filter(log => {
        const userRole = log.userId?.role || (log.details as any)?.role || '';
        return userRole === 'INSURER' || userRole === 'SERVICE_PROVIDER' || (log.action && (log.action.includes('Insurer') || log.action.includes('INSURER') || log.action.includes('Service Provider')));
      });
    } else if (activeTab === 'admins') {
      filtered = filtered.filter(log => {
        const userRole = log.userId?.role || (log.details as any)?.role || '';
        return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
      });
    }
    // 'all' tab shows everything (only for Super Admin)

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof log.details === 'string' && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    return filtered;
  };

  const filteredLogs = getFilteredLogs();

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('login')) {
      return <LogIn className="h-5 w-5 text-green-600" />;
    } else if (action.toLowerCase().includes('logout')) {
      return <LogOut className="h-5 w-5 text-red-600" />;
    }
    return <Activity className="h-5 w-5 text-blue-600" />;
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const config: Record<string, { label: string; className: string }> = {
      'FARMER': { label: 'Farmer', className: 'bg-green-100 text-green-800' },
      'INSURER': { label: 'Insurer', className: 'bg-purple-100 text-purple-800' },
      'ADMIN': { label: 'Admin', className: 'bg-blue-100 text-blue-800' },
      'SUPER_ADMIN': { label: 'Super Admin', className: 'bg-red-100 text-red-800' },
    };
    const roleConfig = config[role] || { label: role, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={roleConfig.className}>{roleConfig.label}</Badge>;
  };

  if (loading && allLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
          <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
            <ScrollText className="h-8 w-8" />
          </span>
          Audit Log
        </h1>
        <p className="text-gray-600 mt-1 ml-14">View system activity and user actions</p>
      </div>

      {/* Tabs for different user types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: isSuperAdmin ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)' }}>
          {isSuperAdmin && (
            <TabsTrigger value="all">
              <Users className="h-4 w-4 mr-2" />
              All Users
            </TabsTrigger>
          )}
          <TabsTrigger value="farmers">
            <User className="h-4 w-4 mr-2" />
            Farmers
          </TabsTrigger>
          <TabsTrigger value="insurers">
            <Building2 className="h-4 w-4 mr-2" />
            Insurers
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="admins">
              <Shield className="h-4 w-4 mr-2" />
              Admins
            </TabsTrigger>
          )}
        </TabsList>

        {/* All Users Tab (Super Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="all" className="space-y-4 mt-6">
            <AuditLogContent
              logs={filteredLogs}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAction={filterAction}
              setFilterAction={setFilterAction}
              loading={loading}
              error={error}
              getActionIcon={getActionIcon}
              getRoleBadge={getRoleBadge}
            />
          </TabsContent>
        )}

        {/* Farmers Tab */}
        <TabsContent value="farmers" className="space-y-4 mt-6">
          <AuditLogContent
            logs={filteredLogs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterAction={filterAction}
            setFilterAction={setFilterAction}
            loading={loading}
            error={error}
            getActionIcon={getActionIcon}
            getRoleBadge={getRoleBadge}
          />
        </TabsContent>

        <TabsContent value="insurers" className="space-y-4 mt-6">
          <AuditLogContent
            logs={filteredLogs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterAction={filterAction}
            setFilterAction={setFilterAction}
            loading={loading}
            error={error}
            getActionIcon={getActionIcon}
            getRoleBadge={getRoleBadge}
          />
        </TabsContent>

        {/* Admins Tab (Super Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="admins" className="space-y-4 mt-6">
            <AuditLogContent
              logs={filteredLogs}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAction={filterAction}
              setFilterAction={setFilterAction}
              loading={loading}
              error={error}
              getActionIcon={getActionIcon}
              getRoleBadge={getRoleBadge}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Separate component for audit log content to avoid repetition
interface AuditLogContentProps {
  logs: AuditLog[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAction: string;
  setFilterAction: (value: string) => void;
  loading: boolean;
  error: string | null;
  getActionIcon: (action: string) => React.ReactNode;
  getRoleBadge: (role?: string) => React.ReactNode | null;
}

const AuditLogContent = ({
  logs,
  searchTerm,
  setSearchTerm,
  filterAction,
  setFilterAction,
  loading,
  error,
  getActionIcon,
  getRoleBadge,
}: AuditLogContentProps) => {
  return (
    <>
      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by user, action, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-[220px] bg-gray-50/50 border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="System Action" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All System Actions</SelectItem>
                <SelectItem value="User Login">Authentications (Login)</SelectItem>
                <SelectItem value="User Logout">Sessions (Logout)</SelectItem>
                <SelectItem value="Claim Created">Filing (Claim Created)</SelectItem>
                <SelectItem value="System Setting Update">Core Configurations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-100 bg-red-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-red-500" />
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs List - Standardized Table */}
      {logs.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-16 text-center">
            <ScrollText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-800 text-xl font-bold tracking-tight">Zero Activity Detected</p>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              {searchTerm || filterAction !== 'all'
                ? 'No logs match your current search or filter parameters.'
                : 'The system audit logs are currently empty. Activity will appear here as users interact with the platform.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 border-b border-blue-700">
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">User / Identity</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Action Sequence</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Context / IP</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-blue-50/50 transition-all group border-l-4 border-transparent hover:border-blue-500">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold border border-blue-100 shadow-sm transition-transform group-hover:scale-105">
                          {(log.user || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">{log.user || 'System'}</span>
                          <div className="mt-0.5">
                            {getRoleBadge(log.userId?.role || (log.details as any)?.role)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 shadow-sm transition-all text-gray-600">
                          {getActionIcon(log.action)}
                        </div>
                        <span className="font-semibold text-gray-800 tracking-tight">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 max-w-[300px]">
                        {log.details && typeof log.details === 'string' && (
                          <p className="text-sm font-medium text-gray-600 truncate group-hover:whitespace-normal transition-all" title={log.details}>
                            {log.details}
                          </p>
                        )}
                        {log.ipAddress && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                            <Activity className="h-3 w-3" />
                            <span>NODE: {log.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
};

export default AdminAuditLog;

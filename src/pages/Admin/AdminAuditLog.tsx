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
        return userRole === 'SERVICE_PROVIDER' || (log.action && (log.action.includes('Service Provider') || log.action.includes('SERVICE_PROVIDER')));
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
      'SERVICE_PROVIDER': { label: 'SP', className: 'bg-purple-100 text-purple-800' },
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
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-1">View system activity and user actions</p>
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
          <TabsTrigger value="service-providers">
            <Building2 className="h-4 w-4 mr-2" />
            Service Providers
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

        {/* Service Providers Tab */}
        <TabsContent value="service-providers" className="space-y-4 mt-6">
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
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by user, action, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="User Login">User Login</SelectItem>
                <SelectItem value="User Logout">User Logout</SelectItem>
                <SelectItem value="Claim Created">Claim Created</SelectItem>
                <SelectItem value="System Setting Update">System Setting Update</SelectItem>
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

      {/* Audit Logs List */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ScrollText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No audit logs found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || filterAction !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No activity has been logged yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{log.user || 'System'}</span>
                          {getRoleBadge(log.userId?.role || (log.details as any)?.role)}
                        </div>
                        <p className="font-semibold text-gray-900 mb-1">{log.action}</p>
                        {log.details && typeof log.details === 'string' && (
                          <p className="text-sm text-gray-600">{log.details}</p>
                        )}
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">IP: {log.ipAddress}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminAuditLog;

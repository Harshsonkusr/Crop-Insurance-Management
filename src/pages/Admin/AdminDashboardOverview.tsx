import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';
import { useAuth } from '../../components/Auth/AuthContext';

interface DashboardSummary {
  totalUsers: number;
  totalClaims: number;
  totalServiceProviders: number;
  claimsByStatus: Array<{ _id: string; count: number }>;
  recentAuditLogs: Array<{
    _id: string;
    action: string;
    user: string;
    timestamp: string;
  }>;
}

const AdminDashboardOverview = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard/summary');
        setSummary(response.data);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err?.response?.data?.message || "Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const claimsByStatusMap = summary?.claimsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {} as Record<string, number>) || {};

  const pendingClaims = claimsByStatusMap['pending'] || 0;
  const approvedClaims = claimsByStatusMap['approved'] || 0;
  const rejectedClaims = claimsByStatusMap['rejected'] || 0;
  const inReviewClaims = claimsByStatusMap['in_review'] || 0;

  const statCards = [
    {
      title: 'Total Users',
      value: summary?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin-dashboard/users',
    },
    {
      title: 'Total Claims',
      value: summary?.totalClaims || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin-dashboard/claims',
    },
    {
      title: 'Service Providers',
      value: summary?.totalServiceProviders || 0,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin-dashboard/service-providers',
    },
    {
      title: 'Pending Claims',
      value: pendingClaims,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/admin-dashboard/claims?status=pending',
    },
  ];

  const claimStatusCards = [
    {
      title: 'Approved',
      value: approvedClaims,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rejected',
      value: rejectedClaims,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'In Review',
      value: inReviewClaims,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'Admin'}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Claim Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {claimStatusCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title} Claims
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.recentAuditLogs && summary.recentAuditLogs.length > 0 ? (
              <div className="space-y-4">
                {summary.recentAuditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.user} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
            <Link
              to="/admin-dashboard/audit-log"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all activity →
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin-dashboard/claims"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-gray-900">View Claims</p>
              </Link>
              <Link
                to="/admin-dashboard/users/add"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium text-gray-900">Add User</p>
              </Link>
              <Link
                to="/admin-dashboard/users/pending"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center"
              >
                <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm font-medium text-gray-900">Pending</p>
              </Link>
              <Link
                to="/admin-dashboard/reports"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium text-gray-900">Reports</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {pendingClaims > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">
                  {pendingClaims} claim{pendingClaims !== 1 ? 's' : ''} pending review
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Review and process pending claims to keep the system running smoothly.
                </p>
              </div>
              <Link
                to="/admin-dashboard/claims?status=pending"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Review Now
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardOverview;

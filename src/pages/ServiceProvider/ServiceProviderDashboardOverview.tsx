import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, Shield, Clock, AlertCircle, TrendingUp, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/Auth/AuthContext';
import api from '../../lib/api';

interface DashboardMetrics {
  totalClaimsAssigned: number;
  claimsPendingVerification: number;
  claimsApproved: number;
  claimsRejected: number;
  aiFlaggedClaims: number;
  averageVerificationTime: string;
  notificationsAlerts: number;
  recentClaims?: any[];
}

const ServiceProviderDashboardOverview = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard/service-provider/overview');
        setMetrics(response.data);
      } catch (err: any) {
        console.error('Dashboard metrics fetch error:', err);
        setError(err?.response?.data?.message || 'Failed to fetch dashboard metrics.');
        // Set default values for demo
        setMetrics({
          totalClaimsAssigned: 0,
          claimsPendingVerification: 0,
          claimsApproved: 0,
          claimsRejected: 0,
          aiFlaggedClaims: 0,
          averageVerificationTime: '0 days',
          notificationsAlerts: 0,
          recentClaims: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Claims Assigned',
      value: metrics?.totalClaimsAssigned || 0,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Verification',
      value: metrics?.claimsPendingVerification || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Approved Claims',
      value: metrics?.claimsApproved || 0,
      icon: CheckCircle2,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rejected Claims',
      value: metrics?.claimsRejected || 0,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'AI Flagged Claims',
      value: metrics?.aiFlaggedClaims || 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Avg. Verification Time',
      value: metrics?.averageVerificationTime || '0 days',
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const quickActions = [
    { name: 'Pending Claims', path: '/service-provider-dashboard/claim-management', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'AI Alerts', path: '/service-provider-dashboard/claim-management', icon: AlertCircle, color: 'bg-orange-100 text-orange-700' },
    { name: 'View All Claims', path: '/service-provider-dashboard/claim-management', icon: Eye, color: 'bg-blue-100 text-blue-700' },
    { name: 'Manage Crops', path: '/service-provider-dashboard/crop-management', icon: BarChart3, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Service Provider'}! 👋</h1>
            <p className="text-purple-100">Manage claims, verify damages, and support farmers with AI-powered insights.</p>
          </div>
          <Link
            to="/service-provider-dashboard/claim-management"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            View Claims
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.path}
                    className={`${action.color} p-4 rounded-lg hover:shadow-md transition-all flex flex-col items-center gap-2`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="font-medium text-center">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.recentClaims && metrics.recentClaims.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentClaims.slice(0, 5).map((claim: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{claim.claimId || `Claim #${index + 1}`}</p>
                      <p className="text-xs text-gray-500">{claim.farmerName || 'Farmer'}</p>
                    </div>
                    <Badge className={claim.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {claim.status || 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      {metrics && metrics.notificationsAlerts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">You have {metrics.notificationsAlerts} pending alerts</p>
                <p className="text-sm text-orange-700">Review AI-flagged claims and pending verifications</p>
              </div>
              <Link to="/service-provider-dashboard/claim-management">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  View Alerts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceProviderDashboardOverview;

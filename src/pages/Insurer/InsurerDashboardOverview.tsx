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
  pendingPayouts: number;
  notificationsAlerts: number;
  recentClaims?: any[];
}

const InsurerDashboardOverview = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/insurer/overview');
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
          pendingPayouts: 0,
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
      title: 'Pending Payouts',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(metrics?.pendingPayouts || 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const quickActions = [
    { name: 'Farmers', path: '/insurer-dashboard/farmer-management', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: 'Claims', path: '/insurer-dashboard/claim-management', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'Policies', path: '/insurer-dashboard/policy-management', icon: Shield, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { name: 'Reports', path: '/insurer-dashboard/reports-management', icon: BarChart3, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -tr-y-1/2 -tr-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome back, {user?.name || 'Insurer'}! 👋</h1>
            <p className="text-purple-100 font-medium max-w-xl">Manage claims, verify damages, and support farmers with AI-powered insights. Your platform oversight is live.</p>
          </div>
          <Link
            to="/insurer-dashboard/claim-management"
            className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-purple-700 transition-all shadow-lg flex items-center gap-2 group/btn"
          >
            <FileText className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
            View Claims
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const accentColor = stat.color;
          return (
            <Card key={index} className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm group">
              <div className={`h-1 ${accentColor}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform origin-left tracking-tight`}>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Hub */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-white border-l-4 border-l-purple-500 overflow-hidden group">
          <CardHeader className="bg-purple-50/30 border-b border-purple-100/50">
            <CardTitle className="flex items-center gap-2 text-purple-900 group-hover:text-purple-700 transition-colors">
              <BarChart3 className="h-5 w-5" />
              Management Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.path}
                    className="p-5 border border-gray-100 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center shadow-sm hover:shadow-md group/action flex flex-col items-center gap-3"
                  >
                    <div className={`w-14 h-14 ${action.bgColor} rounded-2xl flex items-center justify-center ${action.color} group-hover/action:scale-110 group-hover/action:rotate-3 transition-transform shadow-inner`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight text-sm">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-xl bg-white border-l-4 border-l-blue-500 overflow-hidden group">
          <CardHeader className="bg-blue-50/30 border-b border-blue-100/50">
            <CardTitle className="flex items-center gap-2 text-blue-900 group-hover:text-blue-700 transition-colors">
              <Clock className="h-5 w-5" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {metrics?.recentClaims && metrics.recentClaims.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentClaims.slice(0, 5).map((claim: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-blue-50 transition-all rounded-xl border border-transparent hover:border-blue-100 group/item">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 group-hover/item:text-blue-700 transition-colors">{claim.claimId || `Claim #${index + 1}`}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{claim.farmerName || 'Registered Farmer'}</p>
                    </div>
                    <Badge className={`${claim.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} font-bold px-2.5 py-1 rounded-lg`}>
                      {claim.status || 'Routing'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No recent activity detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Alerts */}
      {metrics && metrics.notificationsAlerts > 0 && (
        <Card className="border-none shadow-xl bg-white border-l-4 border-l-orange-500 overflow-hidden group animate-pulse-subtle">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner group-hover:scale-110 transition-transform">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-orange-950 tracking-tight">Attention Required: {metrics.notificationsAlerts} Alerts Detected</p>
                <p className="text-sm font-medium text-orange-800/80">Multiple AI-flagged claims and high-priority verifications are waiting for your review.</p>
              </div>
              <Link to="/insurer-dashboard/claim-management">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 rounded-xl shadow-lg hover:shadow-orange-200 transition-all">
                  Take Action
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsurerDashboardOverview;

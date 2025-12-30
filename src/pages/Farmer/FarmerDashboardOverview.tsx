import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Bell, 
  Cloud, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  TrendingUp,
  Shield,
  MapPin,
  Droplet,
  Sun,
  AlertTriangle,
  ArrowRight,
  Eye,
  Calendar,
  IndianRupee,
  Activity,
  BarChart3,
  Zap
} from "lucide-react";
import api from '../../lib/api';
import { useAuth } from '@/components/Auth/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuickStat {
  title: string;
  value: string;
  icon: JSX.Element;
  trend?: string;
  color?: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  cropType: string;
  dateOfIncident: string;
  status: string;
  estimatedLoss: number;
  aiVerificationStatus?: string;
  createdAt: string;
}

interface Policy {
  id: string;
  policyNumber: string;
  cropType: string;
  coverageAmount: number;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  nextPremiumDue?: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  rainfall: number;
  forecast: string;
}

const FarmerDashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [activePolicies, setActivePolicies] = useState<Policy[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch quick stats
      try {
        const statsResponse = await api.get('/admin/dashboard/farmer/quick-stats');
        const mappedStats = statsResponse.data.map((stat: any) => ({
          ...stat,
          icon: getIconComponent(stat.iconName),
        }));
        setQuickStats(mappedStats);
      } catch (err) {
        // Fallback stats if API fails
        setQuickStats([
          {
            title: 'Active Policies',
            value: '0',
            icon: <Shield className="h-5 w-5 text-blue-500" />,
            color: 'text-blue-600'
          },
          {
            title: 'Pending Claims',
            value: '0',
            icon: <Clock className="h-5 w-5 text-yellow-500" />,
            color: 'text-yellow-600'
          },
          {
            title: 'Total Coverage',
            value: '₹0',
            icon: <IndianRupee className="h-5 w-5 text-green-500" />,
            color: 'text-green-600'
          }
        ]);
      }

      // Fetch recent claims
      try {
        const claimsResponse = await api.get('/claims/my-claims');
        const claims = Array.isArray(claimsResponse.data) ? claimsResponse.data : [];
        setRecentClaims(claims.slice(0, 5)); // Show latest 5
      } catch (err: any) {
        console.error('Error fetching claims:', err);
        if (err?.response?.status === 401) {
          console.error('Authentication failed - user may need to login again');
        } else if (err?.response?.status === 403) {
          console.error('Access denied - user may not have FARMER role');
        } else if (err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error')) {
          console.error('Backend server is not running or not reachable');
          setError('Cannot connect to server. Please ensure the backend is running.');
        }
        setRecentClaims([]);
      }

      // Fetch policies
      try {
        const policiesResponse = await api.get('/farmer/policies');
        const policies = Array.isArray(policiesResponse.data) ? policiesResponse.data : [];
        setActivePolicies(policies.filter((p: Policy) => p.status === 'active').slice(0, 3));
      } catch (err: any) {
        console.error('Error fetching policies:', err);
        if (err?.response?.status === 401) {
          console.error('Authentication failed - user may need to login again');
        } else if (err?.response?.status === 403) {
          console.error('Access denied - user may not have FARMER role');
        } else if (err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error')) {
          console.error('Backend server is not running or not reachable');
          if (!error) {
            setError('Cannot connect to server. Please ensure the backend is running.');
          }
        }
        setActivePolicies([]);
      }

      // Mock weather data (replace with actual API call)
      setWeatherData({
        temperature: 32,
        condition: 'Partly Cloudy',
        humidity: 65,
        rainfall: 12,
        forecast: 'Scattered thunderstorms expected this afternoon. Good conditions for rice cultivation.'
      });

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'PlusCircle': <PlusCircle className="h-5 w-5 text-blue-500" />,
      'Clock': <Clock className="h-5 w-5 text-yellow-500" />,
      'CheckCircle2': <CheckCircle2 className="h-5 w-5 text-green-500" />,
      'XCircle': <XCircle className="h-5 w-5 text-red-500" />,
      'Shield': <Shield className="h-5 w-5 text-blue-500" />,
      'FileText': <FileText className="h-5 w-5 text-purple-500" />,
    };
    return iconMap[iconName] || <Activity className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      'pending': { label: 'Pending', variant: 'secondary' },
      'submitted': { label: 'Submitted', variant: 'secondary' },
      'under_review': { label: 'Under Review', variant: 'secondary' },
      'ai_verified': { label: 'AI Verified', variant: 'default' },
      'approved': { label: 'Approved', variant: 'default' },
      'rejected': { label: 'Rejected', variant: 'destructive' },
      'settled': { label: 'Settled', variant: 'default' },
      'active': { label: 'Active', variant: 'default' },
      'expired': { label: 'Expired', variant: 'outline' },
    };

    const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
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

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'Farmer'}! 👋
            </h1>
            <p className="text-green-100 text-sm md:text-base">
              Manage your crop insurance, track claims, and protect your farm with AI-powered insights.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/farmer-dashboard/submit-claim">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold">
                <PlusCircle className="mr-2 h-5 w-5" />
                Submit New Claim
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.length > 0 ? (
          quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                  {stat.value}
                </div>
                {stat.trend && (
                  <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                <Shield className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activePolicies.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {recentClaims.filter(c => c.status === 'pending' || c.status === 'under_review').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
                <IndianRupee className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(activePolicies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {recentClaims.filter(c => c.status === 'approved' || c.status === 'settled').length}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link to="/farmer-dashboard/submit-claim">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <PlusCircle className="h-6 w-6 text-blue-500" />
                    <span className="text-sm">New Claim</span>
                  </Button>
                </Link>
                <Link to="/farmer-dashboard/my-policies">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-500" />
                    <span className="text-sm">My Policies</span>
                  </Button>
                </Link>
                <Link to="/farmer-dashboard/farm-details">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <MapPin className="h-6 w-6 text-green-500" />
                    <span className="text-sm">Farm Details</span>
                  </Button>
                </Link>
                <Link to="/farmer-dashboard/my-claims">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <Eye className="h-6 w-6 text-orange-500" />
                    <span className="text-sm">Track Claims</span>
                  </Button>
                </Link>
                <Link to="/farmer-dashboard/resources">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-indigo-500" />
                    <span className="text-sm">Resources</span>
                  </Button>
                </Link>
                <Link to="/farmer-dashboard/support">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <Bell className="h-6 w-6 text-red-500" />
                    <span className="text-sm">Support</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Claims */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Your latest claim submissions and their status</CardDescription>
              </div>
              <Link to="/farmer-dashboard/my-claims">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentClaims.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-4">No claims submitted yet</p>
                  <Link to="/farmer-dashboard/submit-claim">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Submit Your First Claim
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/farmer-dashboard/view-details/claim/${claim.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {claim.claimNumber || `Claim #${claim.id.slice(-6)}`}
                          </h4>
                          {getStatusBadge(claim.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(claim.dateOfIncident || claim.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {claim.cropType || 'Crop'}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            {formatCurrency(claim.estimatedLoss || 0)}
                          </span>
                        </div>
                        {claim.aiVerificationStatus && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-gray-500">AI Verification: {claim.aiVerificationStatus}</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Policies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Policies</CardTitle>
                <CardDescription>Your current insurance coverage</CardDescription>
              </div>
              <Link to="/farmer-dashboard/my-policies">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activePolicies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-4">No active policies</p>
                  <p className="text-sm text-gray-400">Contact your service provider to get insured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/farmer-dashboard/view-details/policy/${policy.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {policy.policyNumber || `Policy #${policy.id.slice(-6)}`}
                          </h4>
                          <p className="text-sm text-gray-600">{policy.cropType}</p>
                        </div>
                        {getStatusBadge(policy.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Coverage</p>
                          <p className="font-semibold text-green-600">{formatCurrency(policy.coverageAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Premium</p>
                          <p className="font-semibold">{formatCurrency(policy.premiumAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Valid Until</p>
                          <p className="font-semibold">{formatDate(policy.endDate)}</p>
                        </div>
                        {policy.nextPremiumDue && (
                          <div>
                            <p className="text-gray-500">Next Premium</p>
                            <p className="font-semibold text-orange-600">{formatDate(policy.nextPremiumDue)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Weather & Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sun className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
                        <div className="text-sm text-gray-600">{weatherData.condition}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Droplet className="h-4 w-4" />
                        Humidity
                      </span>
                      <span className="font-semibold">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Cloud className="h-4 w-4" />
                        Rainfall
                      </span>
                      <span className="font-semibold">{weatherData.rainfall} mm</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-800">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      {weatherData.forecast}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Weather data unavailable</p>
              )}
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePolicies.some(p => p.nextPremiumDue) && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Premium Due Soon</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Your premium payment is due in the next 7 days. Please make payment to avoid policy lapse.
                    </p>
                  </div>
                </div>
              )}
              {recentClaims.some(c => c.status === 'pending' || c.status === 'under_review') && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Claims Under Review</p>
                    <p className="text-xs text-blue-700 mt-1">
                      You have {recentClaims.filter(c => c.status === 'pending' || c.status === 'under_review').length} claim(s) being processed.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">System Update</p>
                  <p className="text-xs text-green-700 mt-1">
                    AI-powered damage assessment is now available for faster claim processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farm Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Health Overview</CardTitle>
              <CardDescription>AI-powered analysis of your farm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Satellite imagery analysis</p>
                    <p className="text-xs text-gray-500 mt-1">Processing farm health data...</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">NDVI Index</span>
                  <Badge variant="default">Good</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Crop Health</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/farmer-dashboard/support">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link to="/farmer-dashboard/resources">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardOverview;

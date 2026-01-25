import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, FileText, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '../../lib/api';

const AdminReportsAnalytics = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      // Fetch summary data
      const response = await api.get('/admin/dashboard/summary');
      setStats(response.data);
    } catch (err: any) {
      console.error("Error fetching reports data:", err);
      setError(err?.response?.data?.message || "Failed to fetch reports data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <BarChart3 className="h-8 w-8" />
            </span>
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1 ml-14">View platform statistics and insights</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => {
          import('../../utils/download').then(({ downloadJSON }) => {
            downloadJSON(stats, 'Admin_Analytics_Report');
          });
        }}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm group">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm group">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Claims</p>
                <p className="text-3xl font-extrabold text-gray-900 group-hover:text-green-600 transition-colors">
                  {stats?.totalClaims || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-inner group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm group">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Insurers</p>
                <p className="text-3xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {stats?.totalInsurers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm group">
          <div className="h-1 bg-yellow-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Claim Categories</p>
                <p className="text-3xl font-extrabold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {stats?.claimsByStatus?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shadow-inner group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims by Status */}
      {stats?.claimsByStatus && stats.claimsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.claimsByStatus.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100 shadow-sm hover:shadow-md">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors capitalize tracking-tight">{item._id || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Categorized Claim Volume</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-black text-blue-600 group-hover:scale-110 transition-transform">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Claim Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsAnalytics;

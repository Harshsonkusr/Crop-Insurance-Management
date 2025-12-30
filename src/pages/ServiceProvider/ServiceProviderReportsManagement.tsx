import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, Calendar, Filter, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';

interface Report {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  date: string;
  status: string;
  content?: string;
}

const ServiceProviderReportsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/service-provider/reports');
      setReports(response.data || []);
    } catch (err: any) {
      console.error('Reports fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/service-provider-dashboard/view-detail/report/${reportId}`);
  };

  const handleGenerateReport = () => {
    // Navigate to report generation page or show modal
    alert('Report generation feature coming soon!');
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      // In a real app, this would download the report file
      alert('Download feature coming soon!');
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  const filteredReports = reports.filter(report =>
    report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'generated': { label: 'Generated', className: 'bg-green-100 text-green-800' },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    };
    const statusLower = status.toLowerCase();
    const statusConfig = config[statusLower] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading reports...</p>
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
            <FileText className="h-8 w-8 text-purple-600" />
            Reports Management
          </h1>
          <p className="text-gray-600 mt-1">Generate and manage reports</p>
        </div>
        <Button onClick={handleGenerateReport} className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search reports..."
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

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No reports found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No reports have been generated yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card key={report._id || report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>Type: {report.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report._id || report.id || '')}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report._id || report.id || '')}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
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

export default ServiceProviderReportsManagement;

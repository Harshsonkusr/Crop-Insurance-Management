import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, Calendar, Filter, PlusCircle, BarChart2 } from 'lucide-react';
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
  content?: any;
  reportType?: 'INSURER_INSPECTION' | 'AI_ASSESSMENT';
}

const InsurerReportsManagement: React.FC = () => {
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
      const response = await api.get('/insurer/reports');
      setReports(response.data || []);
    } catch (err: any) {
      console.error('Reports fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/insurer-dashboard/view-detail/report/${reportId}`);
  };



  const handleDownloadReport = async (reportId: string) => {
    try {
      const report = reports.find(r => (r._id || r.id) === reportId);
      if (report) {
        import('../../utils/download').then(({ downloadJSON }) => {
          downloadJSON(report, `report-${report.name.replace(/\s+/g, '_')}`);
        });
      } else {
        alert('Report not found');
      }
    } catch (err) {
      console.error('Download error:', err);
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <BarChart2 className="h-8 w-8" />
            </span>
            Intelligence & Audits
          </h1>
          <p className="text-gray-600 mt-1 ml-14">Vetting inspection accuracy and AI-driven assessment reports.</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm bg-white/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Filter reports by name or intelligence type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Reports List - Professional Table */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No intelligence reports found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No audit documentation has been generated for this node yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-600 border-b border-purple-700">
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Report Nomenclature & Node</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Classification</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Lifecycle Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredReports.map((report) => (
                  <tr key={report._id || report.id} className="hover:bg-purple-50 transition-all group border-l-4 border-transparent hover:border-purple-500">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{report.name}</span>
                        <div className="mt-1">
                          <Badge variant="outline" className={
                            report.reportType === 'AI_ASSESSMENT' ? 'text-[10px] border-purple-200 text-purple-700 bg-purple-50' : 'text-[10px] border-blue-200 text-blue-700 bg-blue-50'
                          }>
                            {report.reportType === 'AI_ASSESSMENT' ? 'AI Assessment' : 'Inspection'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{report.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{new Date(report.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReport(report._id || report.id || '')}
                          title="View Report"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadReport(report._id || report.id || '')}
                          title="Download PDF"
                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4" />
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

export default InsurerReportsManagement;

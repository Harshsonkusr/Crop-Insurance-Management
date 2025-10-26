import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reports = [
  { id: 'R001', name: 'Monthly Claim Summary', type: 'Financial', date: '2024-06-01', status: 'Generated' },
  { id: 'R002', name: 'Quarterly Performance Review', type: 'Performance', date: '2024-05-15', status: 'Pending' },
  { id: 'R003', name: 'Annual Fraud Analysis', type: 'Security', date: '2024-01-01', status: 'Generated' },
  { id: 'R004', name: 'Crop Damage Trends', type: 'Analytical', date: '2024-06-10', status: 'Generated' },
];

const ServiceProviderReportsManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleViewReport = (reportId: string) => {
    navigate(`/service-provider-dashboard/view-detail/report/${reportId}`);
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">Reports Management</h1>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border border-sp-neutral-light rounded-md p-2">
          <Search className="w-5 h-5 text-sp-neutral-dark" />
          <input
            type="text"
            placeholder="Search reports..."
            className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark"
          />
        </div>
        <button className="flex items-center space-x-2 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <Filter className="w-5 h-5" />
          <span>Generate New Report</span>
        </button>
      </div>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-sp-primary-DEFAULT text-white uppercase text-sm leading-normal">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sp-neutral-dark text-sm">
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-sp-neutral-light hover:bg-sp-off-white-light">
                <td className="px-6 py-4 whitespace-nowrap">{report.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{report.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{report.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{report.date}</td>
                <td className="py-3 px-6 text-left">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                    report.status === "Generated" ? "text-green-800" :
                    "text-orange-800"
                  }`}>
                    <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                      report.status === "Generated" ? "bg-green-300" :
                      "bg-orange-300"
                    }`}></span>
                    <span className="relative">{report.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleViewReport(report.id)} className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3">View</button>
                  <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceProviderReportsManagement;
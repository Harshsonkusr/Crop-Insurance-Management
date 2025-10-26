import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const AdminAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'AL001',
      timestamp: '2023-10-26 10:00:00',
      user: 'admin@example.in',
      action: 'User Login',
      details: 'Successful login from IP 103.21.43.100',
    },
    {
      id: 'AL002',
      timestamp: '2023-10-26 10:05:00',
      user: 'priya.patel@krishiseva.in',
      action: 'Claim Created',
      details: 'Claim ID C001 created by Priya Patel',
    },
    {
      id: 'AL003',
      timestamp: '2023-10-26 10:15:00',
      user: 'admin@example.com',
      action: 'System Setting Update',
      details: 'Updated siteName from Old Name to New Name',
    },
    {
      id: 'AL004',
      timestamp: '2023-10-26 10:30:00',
      user: 'john.smith@farmcare.com',
      action: 'Service Provider Profile Edit',
      details: 'Updated contact information for FarmCare Services',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === '' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Audit Log</h1>

      {/* Filters and Search */}
      <div className="bg-card-background shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border rounded-md p-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by User, Action, Details..."
            className="flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="User Login">User Login</option>
          <option value="Claim Created">Claim Created</option>
          <option value="System Setting Update">System Setting Update</option>
          <option value="Service Provider Profile Edit">Service Provider Profile Edit</option>
        </select>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <Filter className="w-5 h-5" />
          <span>Filter by Date</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card-background shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-600 text-white uppercase text-sm leading-normal">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap">admin@example.in</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination can be added here */}
      </div>
    </div>
  );
};

export default AdminAuditLog;
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';

const PolicyManagement: React.FC = () => {
  const navigate = useNavigate();
  const policies = [
    { id: 'POL001', cropType: 'Wheat', coverage: '$10,000', status: 'Active', details: 'Policy details for Wheat. This includes terms, conditions, and coverage specifics.', date: '2023-03-01' },
    { id: 'POL002', cropType: 'Corn', coverage: '$15,000', status: 'Pending Renewal', details: 'Policy details for Corn. Renewal information and updated terms.', date: '2023-03-10' },
    { id: 'POL003', cropType: 'Soybeans', coverage: '$12,000', status: 'Expired', details: 'Policy details for Soybeans. Information regarding expiration and renewal options.', date: '2023-03-15' },
  ];

  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (policy: any) => {
    navigate(`/farmer-dashboard/view-details/policy/${policy.id}`);
  };

  const handleDownload = (policyId: string) => {
    alert(`Downloading policy ${policyId} details... (This is a placeholder for actual download functionality)`);
    // In a real application, you would trigger a file download here.
  };

  const [searchId, setSearchId] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredPolicies = policies.filter(policy => {
    const matchesStatus = filterStatus === 'All' || policy.status === filterStatus;
    return matchesStatus;
  });

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">Policy Management</h1>

      <div className="bg-card-background shadow-lg rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="filterStatus">Filter by Status</Label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
       
        </div>
      </div>

      <div className="bg-card-background shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-primary-green text-white uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Policy ID</th>
                <th className="py-3 px-6 text-left">Crop Type</th>
                <th className="py-3 px-6 text-left">Coverage</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="border-b border-gray-200 hover:bg-secondary-green">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{policy.id}</td>
                  <td className="py-3 px-6 text-left">{policy.cropType}</td>
                  <td className="py-3 px-6 text-left">{policy.coverage}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${policy.status === 'Active' ? 'text-green-800' : policy.status === 'Pending Renewal' ? 'text-yellow-800' : 'text-red-800'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${policy.status === 'Active' ? 'bg-green-300' : policy.status === 'Pending Renewal' ? 'bg-yellow-300' : 'bg-red-300'}`}></span>
                      <span className="relative">{policy.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(policy)}
                      className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownload(policy.id)}
                      className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PolicyManagement;
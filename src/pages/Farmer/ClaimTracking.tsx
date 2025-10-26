import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ClaimTracking: React.FC = () => {
  const claims = [
    { id: 'CL001', farmId: 'FARM001-PLOT001', cropType: 'Wheat', declaredCropType: 'Wheat', status: 'Submitted', date: '2023-01-15', estimatedLoss: '7500', verificationStatus: 'Pending' },
    { id: 'CL002', farmId: 'FARM001-PLOT002', cropType: 'Corn', declaredCropType: 'Corn', status: 'Under Review', date: '2023-01-20', estimatedLoss: '10000', verificationStatus: 'In Progress' },
    { id: 'CL003', farmId: 'FARM002-PLOT001', cropType: 'Soybeans', declaredCropType: 'Soybeans', status: 'Approved', date: '2023-01-25', estimatedLoss: '5000', verificationStatus: 'Verified' },
    { id: 'CL004', farmId: 'FARM003-PLOT001', cropType: 'Rice', declaredCropType: 'Rice', status: 'Rejected', date: '2023-01-28', estimatedLoss: '2000', verificationStatus: 'Rejected' },
  ];

  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = filterStatus === 'All' || claim.status === filterStatus;
    return matchesStatus;
  });

  const handleNewClaim = () => {
    navigate('/farmer-dashboard/submit-claim');
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">My Claims</h1>
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
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleNewClaim}
              className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Submit New Claim
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-card-background shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-primary-green text-white uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Claim ID</th>
                <th className="py-3 px-6 text-left">Farm ID</th>
                <th className="py-3 px-6 text-left">Crop Type</th>
                <th className="py-3 px-6 text-left">Declared Crop Type</th>
                <th className="py-3 px-6 text-left">Estimated Loss</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Verification Status</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="border-b border-gray-200 hover:bg-secondary-green">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{claim.id}</td>
                  <td className="py-3 px-6 text-left">{claim.farmId}</td>
                  <td className="py-3 px-6 text-left">{claim.cropType}</td>
                  <td className="py-3 px-6 text-left">{claim.declaredCropType}</td>
                  <td className="py-3 px-6 text-left">{claim.estimatedLoss}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${claim.status === 'Approved' ? 'text-green-800' : claim.status === 'Under Review' ? 'text-yellow-800' : claim.status === 'Rejected' ? 'text-red-800' : 'text-gray-800'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${claim.status === 'Approved' ? 'bg-green-300' : claim.status === 'Under Review' ? 'bg-yellow-300' : claim.status === 'Rejected' ? 'bg-red-300' : 'bg-gray-300'}`}></span>
                      <span className="relative">{claim.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${claim.verificationStatus === 'Verified' ? 'text-green-800' : claim.verificationStatus === 'In Progress' ? 'text-blue-800' : claim.verificationStatus === 'Rejected' ? 'text-red-800' : 'text-gray-800'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${claim.verificationStatus === 'Verified' ? 'bg-green-300' : claim.verificationStatus === 'In Progress' ? 'bg-blue-300' : claim.verificationStatus === 'Rejected' ? 'bg-red-300' : 'bg-gray-300'}`}></span>
                      <span className="relative">{claim.verificationStatus}</span>
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">{claim.date}</td>
                  <td className="py-3 px-6 text-center">
                    <button className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mb-2"
                    onClick={() => navigate(`/farmer-dashboard/view-details/claim/${claim.id}`)}>
                      View Details
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

export default ClaimTracking;
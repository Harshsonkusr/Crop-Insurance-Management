import React from 'react';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const claims = [
  {
    id: "CLM001",
    farmerName: "Rajesh Kumar",
    location: "Punjab",
    cropType: "Wheat",
    submissionDate: "2023-01-15",
    status: "Pending",
    assignedTo: "Service Provider A",
    lastUpdated: "2023-01-20",
  },
  {
    id: "CLM002",
    farmerName: "Priya Sharma",
    location: "Haryana",
    cropType: "Rice",
    submissionDate: "2023-01-10",
    status: "Under Review",
    assignedTo: "Service Provider B",
    lastUpdated: "2023-01-18",
  },
  {
    id: "CLM003",
    farmerName: "Amit Singh",
    location: "Uttar Pradesh",
    cropType: "Sugarcane",
    submissionDate: "2023-01-20",
    status: "Verified",
    assignedTo: "Service Provider A",
    lastUpdated: "2023-01-22",
  },
  {
    id: "CLM004",
    farmerName: "Deepak Yadav",
    location: "Rajasthan",
    cropType: "Cotton",
    submissionDate: "2023-01-18",
    status: "Fraud Suspected",
    assignedTo: "Service Provider C",
    lastUpdated: "2023-01-21",
  },
];

const ServiceProviderClaimManagement = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">Claim Management</h1>

      {/* Filters and Search */}
      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border border-sp-neutral-light rounded-md p-2">
          <Search className="w-5 h-5 text-sp-neutral-dark" />
          <input
            type="text"
            placeholder="Search by Claim ID, Farmer Name, Location..."
            className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark"
          />
        </div>
        <button className="flex items-center space-x-2 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Claims Table */}
      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-sp-primary-DEFAULT text-white uppercase text-sm leading-normal">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Claim ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Claim Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="text-sp-neutral-dark text-sm">
            {claims.map((claim) => (
              <tr key={claim.id} className="border-b border-sp-neutral-light hover:bg-sp-off-white-light">
                <td className="px-6 py-4 whitespace-nowrap">{claim.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.submissionDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.farmerName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.cropType}</td>
                <td className="py-3 px-6 text-left">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                    claim.status === "Pending" ? "text-yellow-800" :
                    claim.status === "Under Review" ? "text-orange-800" :
                    claim.status === "Verified" ? "text-green-800" :
                    "text-red-800"
                  }`}>
                    <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                      claim.status === "Pending" ? "bg-yellow-300" :
                      claim.status === "Under Review" ? "bg-orange-300" :
                      claim.status === "Verified" ? "bg-green-300" :
                      "bg-red-300"
                    }`}></span>
                    <span className="relative">{claim.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.assignedTo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.lastUpdated}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Link to={`/service-provider-dashboard/claims/${claim.id}`}><Eye className="w-5 h-5" /></Link></button>
                  <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Link to={`/service-provider-dashboard/claims/${claim.id}/edit`}><Edit className="w-5 h-5" /></Link></button>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination can be added here */}
      </div>
    </div>
  );
};

export default ServiceProviderClaimManagement;
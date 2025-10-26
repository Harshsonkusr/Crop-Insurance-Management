import React from 'react';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminClaimsManagement = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Manage Claims</h1>

      {/* Filters and Search */}
      <div className="bg-card-background shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border rounded-md p-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Claim ID, Farmer Name, Service Provider..."
            className="flex-1 outline-none"
          />
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Claims Table */}
      <div className="bg-card-background shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-600 text-white uppercase text-sm leading-normal">
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
          <tbody className="text-gray-700 text-sm">
            <tr className="border-b border-gray-200 hover:bg-blue-50">
              <td className="px-6 py-4 whitespace-nowrap">#001</td>
              <td className="px-6 py-4 whitespace-nowrap">2023-01-15</td>
              <td className="px-6 py-4 whitespace-nowrap">Ramesh Chandra</td>
              <td className="px-6 py-4 whitespace-nowrap">Crop Damage</td>
              <td className="py-3 px-6 text-left">
                <span className="relative inline-block px-3 py-1 font-semibold leading-tight text-yellow-800">
                  <span aria-hidden className="absolute inset-0 opacity-50 rounded-full bg-yellow-300"></span>
                  <span className="relative">In Review</span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">GreenAgro Services</td>
              <td className="px-6 py-4 whitespace-nowrap">2023-01-20</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Link to={`/admin-dashboard/claims/001`}><Eye className="w-5 h-5" /></Link></button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Link to={`/admin-dashboard/claims/001`}><Edit className="w-5 h-5" /></Link></button>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"><Trash2 className="w-5 h-5" /></button>
              </td>
            </tr>
            {/* More rows can be added here */}
          </tbody>
        </table>
        {/* Pagination can be added here */}
      </div>
    </div>
  );
};

export default AdminClaimsManagement;
import React from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';

const AdminReportsAnalytics = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Reports & Analytics</h1>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card-background p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Claim Trends</h2>
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
            <LineChart className="w-12 h-12 text-blue-500" />
            <p className="text-gray-500 ml-4">Placeholder for Claim Trends Chart</p>
          </div>
        </div>
        <div className="bg-card-background p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
            <BarChart className="w-12 h-12 text-green-500" />
            <p className="text-gray-500 ml-4">Placeholder for User Activity Chart</p>
          </div>
        </div>
        <div className="bg-card-background p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Service Provider Performance</h2>
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
            <PieChart className="w-12 h-12 text-purple-500" />
            <p className="text-gray-500 ml-4">Placeholder for Service Provider Performance Chart</p>
          </div>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="bg-card-background p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Detailed Reports</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <p className="font-medium">Claims by Status Report</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">View Report</button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <p className="font-medium">User Registration Trends</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">View Report</button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <p className="font-medium">Service Provider Ratings</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">View Report</button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-card-background p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <div className="flex space-x-4">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Export to CSV</button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Export to PDF</button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsAnalytics;
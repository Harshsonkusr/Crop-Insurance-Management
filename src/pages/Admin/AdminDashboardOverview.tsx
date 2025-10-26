import React from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboardOverview = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Dashboard Overview</h1>
      {/* Welcome Message */}
      <div className="bg-card-background p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold">Welcome, Admin!</h2>
      </div>

      {/* Key Aggregate Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Key Aggregate Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card-background p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-gray-500">Total Farmers Registered</p>
            <p className="text-4xl font-bold text-blue-600">5,678</p>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-gray-500">Total Insurance Companies</p>
            <p className="text-4xl font-bold text-green-600">15</p>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-gray-500">Total Active Policies</p>
            <p className="text-4xl font-bold text-purple-600">2,345</p>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-gray-500">Total Premiums Processed</p>
            <p className="text-4xl font-bold text-yellow-600">₹12,34,567</p>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-gray-500">Total Claims Filed/Processed</p>
            <p className="text-4xl font-bold text-red-600">890/750</p>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-gray-500">Total Platform Commission Earned</p>
            <p className="text-4xl font-bold text-teal-600">₹5,67,890</p>
          </div>
        </div>
      </div>

      {/* Platform Growth Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Platform Growth Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card-background p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">User Registration Trends</h3>
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
              <LineChart className="w-16 h-16 text-blue-500" />
              <p className="text-gray-500 ml-4">Placeholder for User Registration Trends Chart</p>
            </div>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">New Insurance Company Onboarding Rate</h3>
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
              <BarChart className="w-16 h-16 text-green-500" />
              <p className="text-gray-500 ml-4">Placeholder for New Insurance Company Onboarding Rate Chart</p>
            </div>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Policy Issuance Trends</h3>
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
              <LineChart className="w-16 h-16 text-purple-500" />
              <p className="text-gray-500 ml-4">Placeholder for Policy Issuance Trends Chart</p>
            </div>
          </div>
          <div className="bg-card-background p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Claims vs. Payout Trends</h3>
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
              <BarChart className="w-16 h-16 text-red-500" />
              <p className="text-gray-500 ml-4">Placeholder for Claims vs. Payout Trends Chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-background p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium">Total Claims Submitted</h3>
          <p className="text-2xl font-bold">1,200</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium">Claims in Progress</h3>
          <p className="text-2xl font-bold">75</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium">Claims Approved (Last 30 Days)</h3>
          <p className="text-2xl font-bold">450</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium">Average Resolution Time</h3>
          <p className="text-2xl font-bold">48 hours</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul>
          <li className="border-b pb-2 mb-2">Claim #IND1234 submitted by Rajesh Kumar</li>
          <li className="border-b pb-2 mb-2">Claim #IND5678 status updated to 'In Review'</li>
          <li className="border-b pb-2 mb-2">New user registered: Pooja Sharma</li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-card-background p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Assign New Claim</button>
          <Link to="/admin-dashboard/claims" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">View All Claims</Link>
          <Link to="/admin-dashboard/users/add" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Add New User</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
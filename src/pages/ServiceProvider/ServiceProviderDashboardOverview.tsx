import React from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';

const ServiceProviderDashboardOverview = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      {/* Header */}
     <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">Dashboard Overview</h1>
      {/* Welcome Message */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <p className="text-lg font-semibold text-gray-800">Welcome, Service Provider!</p>
      </div>

      {/* Key Aggregate Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-sp-neutral-dark mb-4 text-center">Your Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-sp-neutral-DEFAULT">Total Claims Assigned</p>
            <p className="text-4xl font-bold text-sp-primary-DEFAULT">1,234</p>
          </div>
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-sp-neutral-DEFAULT">Claims Pending Verification</p>
            <p className="text-4xl font-bold text-sp-warning-DEFAULT">150</p>
          </div>
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-sp-neutral-DEFAULT">Claims Approved / Rejected</p>
            <p className="text-4xl font-bold text-sp-accent-DEFAULT">800 / 50</p>
          </div>
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-sp-neutral-DEFAULT">AI Flagged Claims</p>
            <p className="text-4xl font-bold text-sp-warning-DEFAULT">25</p>
          </div>
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-sp-neutral-DEFAULT">Average Verification Time</p>
            <p className="text-4xl font-bold text-sp-primary-light">24 hours</p>
          </div>
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <p className="text-lg text-sp-neutral-DEFAULT">Notifications & Alerts</p>
            <p className="text-4xl font-bold text-sp-accent-light">10</p>
          </div>
        </div>
      </div>

      {/* Platform Growth Metrics (Adapted for Service Provider) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-sp-neutral-dark mb-4 text-center">Claim Trends & Regional Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Weekly Claims Trend</h3>
            <div className="flex items-center justify-center h-48 bg-sp-neutral-light rounded-md">
              <LineChart className="w-16 h-16 text-sp-primary-light" />
              <p className="text-sp-neutral-DEFAULT ml-4">Placeholder for Weekly Claims Trend Chart</p>
            </div>
          </div>
          <div className="bg-sp-off-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Regional Claim Heat Map</h3>
            <div className="flex items-center justify-center h-48 bg-sp-neutral-light rounded-md">
              <BarChart className="w-16 h-16 text-sp-accent-DEFAULT" />
              <p className="text-sp-neutral-DEFAULT ml-4">Placeholder for Regional Claim Heat Map (using Mapbox or Leaflet)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-sp-off-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex space-x-4">
          <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Pending Claims</button>
          <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">AI Alerts</button>
          <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">View All Claims</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDashboardOverview;
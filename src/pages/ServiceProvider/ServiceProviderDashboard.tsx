import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, FileText, Users, HardHat, BarChart2, Settings, ScrollText, MessageSquare, Crop } from 'lucide-react';

const ServiceProviderDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const storedState = localStorage.getItem('spIsSidebarOpen');
    return storedState ? JSON.parse(storedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('spIsSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const navLinks = [
    { name: 'Dashboard', path: '/service-provider-dashboard', icon: (<Home className="h-6 w-6" />) },
    { name: 'Crop Management', path: '/service-provider-dashboard/crop-management', icon: (<Crop className="h-6 w-6" />) },
    { name: 'Farmer Management', path: '/service-provider-dashboard/farmer-management', icon: (<Users className="h-6 w-6" />) },
    { name: 'Policy Management', path: '/service-provider-dashboard/policy-management', icon: (<FileText className="h-6 w-6" />) },
    { name: 'Claim Management', path: '/service-provider-dashboard/claim-management', icon: (<ScrollText className="h-6 w-6" />) },
    { name: 'Reports Management', path: '/service-provider-dashboard/reports-management', icon: (<BarChart2 className="h-6 w-6" />) },
    { name: 'Settings', path: '/service-provider-dashboard/settings', icon: (<Settings className="h-6 w-6" />) },
  ];

  return (
    <div className="flex h-screen bg-sp-off-white">
      {/* Sidebar */}
      <div className={`bg-sp-primary-DEFAULT shadow-md transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 text-2xl font-bold text-white flex justify-between items-center">
          {isSidebarOpen && "SP Panel"}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center py-2.5 px-4 rounded-lg transition duration-200 text-white hover:bg-sp-primary-dark transform hover:-translate-y-1 hover:scale-105 ${location.pathname === link.path ? 'bg-sp-primary-dark' : ''}`}
            >
              {link.icon}
              {isSidebarOpen && <span className="ml-3">{link.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
        {/* Content */}
        <main className="flex-1 p-4 overflow-y-auto flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
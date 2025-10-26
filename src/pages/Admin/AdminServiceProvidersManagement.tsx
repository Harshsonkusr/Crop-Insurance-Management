import React from 'react';
import { Search, Filter, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminServiceProvidersManagement = () => {
  const serviceProviders = [
    {
      id: 'SP001',
      name: 'AgriTech Solutions',
      contactPerson: 'Jane Doe',
      email: 'jane.doe@agritech.com',
      serviceType: 'Crop Monitoring',
      status: 'Active',
      joinedDate: '2022-01-15',
    },
    {
      id: 'SP002',
      name: 'FarmCare Services',
      contactPerson: 'John Smith',
      email: 'john.smith@farmcare.com',
      serviceType: 'Pest Control',
      status: 'Active',
      joinedDate: '2021-11-01',
    },
    {
      id: 'SP003',
      name: 'Harvest Logistics',
      contactPerson: 'Emily White',
      email: 'emily.white@harvestlogistics.com',
      serviceType: 'Transportation',
      status: 'Inactive',
      joinedDate: '2023-03-20',
    },
  ];

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Manage Companies</h1>

      {/* Filters and Search */}
      <div className="bg-card-background shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border rounded-md p-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Name, Email, Service Type..."
            className="flex-1 outline-none"
          />
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <Filter className="w-5 h-5" />
          <span>Filter by Service Type</span>
        </button>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <PlusCircle className="w-5 h-5" />
          <Link to="/admin-dashboard/service-providers/add"><span>Add New Provider</span></Link>
        </button>
      </div>

      {/* Service Provider Table */}
      <div className="bg-card-background shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-600 text-white uppercase text-sm leading-normal">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Provider ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Joined Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {serviceProviders.map((provider) => (
              <tr key={provider.id} className="border-b border-gray-200 hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">{provider.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.contactPerson}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.serviceType}</td>
                <td className="py-3 px-6 text-left">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      provider.status === 'Active' ? 'text-green-800' : 'text-yellow-800'
                    }`}
                  >
                    <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                      provider.status === 'Active' ? 'bg-green-300' : 'bg-yellow-300'
                    }`}></span>
                    <span className="relative">{provider.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.joinedDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Link to={`/admin-dashboard/service-providers/${provider.id}`}><Edit className="w-5 h-5" /></Link></button>
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

export default AdminServiceProvidersManagement;
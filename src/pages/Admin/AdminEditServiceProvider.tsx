import React from 'react';
import { useParams, Link } from 'react-router-dom';

const AdminEditServiceProvider = () => {
  const { providerId } = useParams();

  // In a real application, you would fetch service provider data using providerId
  const serviceProvider = {
    id: providerId,
    name: 'AgriTech Solutions',
    contactPerson: 'Jane Doe',
    email: 'jane.doe@agritech.com',
    phone: '123-456-7890',
    address: '123 Farm Lane, Rural City',
    serviceType: 'Crop Monitoring',
    status: 'Active',
    joinedDate: '2022-01-15',
    description: 'Provides advanced crop monitoring services using drones and AI.',
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Edit Service Provider: {serviceProvider.name}</h1>

      <div className="bg-card-background shadow-lg rounded-lg p-6">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Provider Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                defaultValue={serviceProvider.name}
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                defaultValue={serviceProvider.contactPerson}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                defaultValue={serviceProvider.email}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                id="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                defaultValue={serviceProvider.phone}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
              defaultValue={serviceProvider.address}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
              <select
                id="serviceType"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                defaultValue={serviceProvider.serviceType}
              >
                <option>Crop Monitoring</option>
                <option>Pest Control</option>
                <option>Transportation</option>
                <option>Soil Testing</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                defaultValue={serviceProvider.status}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
              defaultValue={serviceProvider.description}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/admin-dashboard/service-providers" className="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Cancel</Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm text-sm font-medium hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditServiceProvider;
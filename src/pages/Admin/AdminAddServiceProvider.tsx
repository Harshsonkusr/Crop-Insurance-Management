import React from 'react';
import { Link } from 'react-router-dom';

const AdminAddServiceProvider = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Add New Service Provider</h1>

      <div className="bg-card-background p-6 rounded-lg shadow-lg">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Provider Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Krishi Seva Pvt. Ltd."
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Priya Patel"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="priya.patel@krishiseva.in"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                id="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="456 Green Fields, Pune"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
              <select
                id="serviceType"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Brief description of services offered."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/admin-dashboard/service-providers" className="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Cancel</Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm text-sm font-medium hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Add Service Provider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddServiceProvider;
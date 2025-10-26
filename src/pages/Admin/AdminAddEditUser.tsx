import React from 'react';
import { Link, useParams } from 'react-router-dom';

const AdminAddEditUser = () => {
  const { userId } = useParams();
  const isEditing = !!userId;

  const pageTitle = isEditing ? `Edit User: ${userId}` : 'Add New User';
  const buttonText = isEditing ? 'Save Changes' : 'Add User';
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">{pageTitle}</h1>

      <div className="bg-card-background p-4 rounded-lg shadow-lg">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                placeholder="Amit Kumar"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                placeholder="amit.kumar@example.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
              >
                <option>Farmer</option>
                <option>Admin</option>
                <option>Service Provider</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                placeholder="********"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/admin-dashboard/users" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Cancel</Link>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEditUser;
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ServiceProviderAddFarmer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingFarmer = location.state?.farmer;

  const [farmerData, setFarmerData] = useState({
    id: '',
    name: '',
    location: '',
    contact: '',
    email: '',
    address: '',
    registeredDate: '',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (editingFarmer) {
      setFarmerData({
        id: editingFarmer.id || '',
        name: editingFarmer.name || '',
        location: editingFarmer.location || '',
        contact: editingFarmer.contact || '',
        email: editingFarmer.email || '',
        address: editingFarmer.address || '',
        registeredDate: editingFarmer.registeredDate || '',
        status: editingFarmer.status || 'Active',
        notes: editingFarmer.notes || '',
      });
    }
  }, [editingFarmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFarmerData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFarmer) {
      console.log('Updating Farmer:', farmerData);
      // TODO: Implement API call to update farmer
    } else {
      console.log('Adding New Farmer:', farmerData);
      // TODO: Implement API call to add new farmer
    }
    navigate('/service-provider-dashboard/farmer-management');
  };

  const formTitle = editingFarmer ? 'Edit Farmer' : 'Add New Farmer';
  const submitButtonText = editingFarmer ? 'Update Farmer' : 'Add Farmer';

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">
        {formTitle}
      </h1>

      <div className="bg-sp-off-white-DEFAULT p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-sp-neutral-dark">Farmer Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="John Doe"
                value={farmerData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-sp-neutral-dark">Contact Number</label>
              <input
                type="text"
                id="contact"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="+91 98765 43210"
                value={farmerData.contact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sp-neutral-dark">Email Address</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="john.doe@example.com"
                value={farmerData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-sp-neutral-dark">Location</label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="Rural Area 1"
                value={farmerData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-sp-neutral-dark">Address</label>
            <input
              type="text"
              id="address"
              className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
              placeholder="123 Farm Road, Village, District"
              value={farmerData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="registeredDate" className="block text-sm font-medium text-sp-neutral-dark">Registered Date</label>
              <input
                type="date"
                id="registeredDate"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                value={farmerData.registeredDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-sp-neutral-dark">Status</label>
              <select
                id="status"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                value={farmerData.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-sp-neutral-dark">Notes</label>
            <textarea
              id="notes"
              rows={4}
              className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
              placeholder="Any additional notes about the farmer."
              value={farmerData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/service-provider-dashboard/farmer-management" className="px-4 py-2 border border-sp-neutral-light rounded-full shadow-sm text-sm font-medium text-sp-neutral-dark hover:bg-sp-off-white-light transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Cancel</Link>
            <button
              type="submit"
              className="px-4 py-2 bg-sp-primary-DEFAULT text-white rounded-full shadow-sm text-sm font-medium hover:bg-sp-primary-dark transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceProviderAddFarmer;
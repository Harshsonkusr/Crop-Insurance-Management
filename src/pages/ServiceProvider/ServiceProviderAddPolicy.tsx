import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ServiceProviderAddPolicy = () => {
  const location = useLocation();
  const editingPolicy = location.state?.policy;

  const [policyData, setPolicyData] = useState({
    policyId: '',
    farmer: '',
    crop: '',
    coverage: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (editingPolicy) {
      setPolicyData(editingPolicy);
    } else {
      setPolicyData({
        policyId: '',
        farmer: '',
        crop: '',
        coverage: '',
        startDate: '',
        endDate: '',
        status: 'Active',
        notes: '',
      });
    }
  }, [editingPolicy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setPolicyData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Policy Data Submitted:', policyData);
    // Here you would typically send data to your backend API
    // For add: api.post('/policies', policyData)
    // For edit: api.put(`/policies/${policyData.policyId}`, policyData)
  };

  const formTitle = editingPolicy ? 'Edit Policy' : 'Create New Policy';
  const submitButtonText = editingPolicy ? 'Update Policy' : 'Create Policy';

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">{formTitle}</h1>

      <div className="bg-sp-off-white-DEFAULT p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="policyId" className="block text-sm font-medium text-gray-700">Policy ID</label>
              <input
                type="text"
                id="policyId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="P005"
                value={policyData.policyId}
                onChange={handleChange}
                readOnly={!!editingPolicy} // Policy ID should not be editable
              />
            </div>
            <div>
              <label htmlFor="farmer" className="block text-sm font-medium text-gray-700">Farmer</label>
              <input
                type="text"
                id="farmer"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Select Farmer"
                value={policyData.farmer}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="crop" className="block text-sm font-medium text-gray-700">Crop</label>
              <input
                type="text"
                id="crop"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Select Crop"
                value={policyData.crop}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="coverage" className="block text-sm font-medium text-gray-700">Coverage</label>
              <input
                type="text"
                id="coverage"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="e.g., 10 acres"
                value={policyData.coverage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={policyData.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={policyData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={policyData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Expired</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="notes"
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Any additional notes about the policy."
              value={policyData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/service-provider-dashboard/policy-management">
              <Button
                type="button"
                className="w-full bg-sp-neutral-light text-sp-neutral-dark hover:bg-sp-neutral-DEFAULT hover:text-white transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Cancel
              </Button>
            </Link>
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

export default ServiceProviderAddPolicy;
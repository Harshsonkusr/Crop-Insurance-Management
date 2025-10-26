import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ServiceProviderAddCrop = () => {
  const location = useLocation();
  const editingCrop = location.state?.crop;

  const [cropData, setCropData] = useState({
    id: '',
    name: '',
    season: '',
    variety: '',
    activePolicies: 0,
    cropYield: '',
    previousClaims: 0,
    damageSusceptibility: '',
  });

  useEffect(() => {
    if (editingCrop) {
      setCropData(editingCrop);
    } else {
      setCropData({
        id: '',
        name: '',
        season: '',
        variety: '',
        activePolicies: 0,
        cropYield: '',
        previousClaims: 0,
        damageSusceptibility: '',
      });
    }
  }, [editingCrop]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setCropData(prevData => ({
      ...prevData,
      [id]: id === 'activePolicies' || id === 'previousClaims' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCrop) {
      console.log('Updating Crop:', cropData);
      // In a real application, you would send this data to an API to update the crop
    } else {
      console.log('Adding New Crop:', cropData);
      // In a real application, you would send this data to an API to add a new crop
    }
    // Optionally navigate back to the crop management page
    // navigate('/service-provider-dashboard/crop-management');
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">
        {editingCrop ? 'Edit Crop' : 'Add New Crop'}
      </h1>

      <div className="bg-sp-off-white-DEFAULT p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-sp-neutral-dark">Crop Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="Wheat"
                value={cropData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="season" className="block text-sm font-medium text-sp-neutral-dark">Season</label>
              <input
                type="text"
                id="season"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="Rabi"
                value={cropData.season}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="variety" className="block text-sm font-medium text-sp-neutral-dark">Variety</label>
            <input
              type="text"
              id="variety"
              className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
              placeholder="HD 2967"
              value={cropData.variety}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="activePolicies" className="block text-sm font-medium text-sp-neutral-dark">Active Policies</label>
              <input
                type="number"
                id="activePolicies"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="0"
                value={cropData.activePolicies}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="cropYield" className="block text-sm font-medium text-sp-neutral-dark">Crop Yield</label>
              <input
                type="text"
                id="cropYield"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="50 quintals/acre"
                value={cropData.cropYield}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="previousClaims" className="block text-sm font-medium text-sp-neutral-dark">Previous Claims</label>
              <input
                type="number"
                id="previousClaims"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="0"
                value={cropData.previousClaims}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="damageSusceptibility" className="block text-sm font-medium text-sp-neutral-dark">Damage Susceptibility</label>
              <input
                type="text"
                id="damageSusceptibility"
                className="mt-1 block w-full border border-sp-neutral-light rounded-md shadow-sm p-2"
                placeholder="Medium (Rust)"
                value={cropData.damageSusceptibility}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/service-provider-dashboard/crop-management" className="px-4 py-2 border border-sp-neutral-light rounded-full shadow-sm text-sm font-medium text-sp-neutral-dark hover:bg-sp-off-white-light transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Cancel</Link>
            <button
              type="submit"
              className="px-4 py-2 bg-sp-primary-DEFAULT text-white rounded-full shadow-sm text-sm font-medium hover:bg-sp-primary-dark transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              {editingCrop ? 'Save Changes' : 'Add Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceProviderAddCrop;
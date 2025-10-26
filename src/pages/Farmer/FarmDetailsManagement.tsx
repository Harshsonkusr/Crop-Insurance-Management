import React, { useState, useEffect } from 'react';

const FarmDetailsManagement: React.FC = () => {
  const [farmDetails, setFarmDetails] = useState({
    farmId: '',
    ownerName: '',
    aadhaarNumber: '',
    cropType: '',
    latitude: '',
    longitude: '',
    farmSize: '',
    landDocument: null as File | null,
    verificationStatus: 'Pending',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFarmDetails((prevDetails) => ({
        ...prevDetails,
        [name]: file,
      }));
    } else {
      setFarmDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFarmDetails((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(4),
          longitude: position.coords.longitude.toFixed(4),
        }));
      },
      (error) => {
        alert(`Error getting location: ${error.message}`);
      }
    );
  };

  useEffect(() => {
    // Simulate loading existing farm details from API
    setTimeout(() => {
      setFarmDetails({
        farmId: 'F001',
        ownerName: 'John Doe',
        aadhaarNumber: '1234 5678 9012',
        cropType: 'Wheat',
        latitude: '34.0522',
        longitude: '-118.2437',
        farmSize: '150',
        landDocument: null,
        verificationStatus: 'Pending',
      });
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Farm Details Submitted:', farmDetails);
    // Here you would typically send this data to a backend API
    alert('Farm details submitted successfully!');
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">Farm Details Management</h1>
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="farmId" className="block text-sm font-medium text-gray-700">Farm ID</label>
            <input
              type="text"
              name="farmId"
              id="farmId"
              value={farmDetails.farmId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
              placeholder="e.g., F001"
              required
            />
          </div>
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Owner Name</label>
            <input
              type="text"
              name="ownerName"
              id="ownerName"
              value={farmDetails.ownerName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
              placeholder="e.g., John Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              type="text"
              name="aadhaarNumber"
              id="aadhaarNumber"
              value={farmDetails.aadhaarNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
              placeholder="e.g., 1234 5678 9012"
              required
            />
          </div>
          <div>
            <label htmlFor="cropType" className="block text-sm font-medium text-gray-700">Crop Type</label>
            <input
              type="text"
              name="cropType"
              id="cropType"
              value={farmDetails.cropType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
              placeholder="e.g., Wheat, Corn, Soybeans"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                value={farmDetails.latitude}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                placeholder="e.g., 34.0522"
                required
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                value={farmDetails.longitude}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                placeholder="e.g., -118.2437"
                required
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleGeolocation}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Get Current Location
            </button>
          </div>
          <div>
            <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700">Farm Size (acres)</label>
            <input
              type="number"
              name="farmSize"
              id="farmSize"
              value={farmDetails.farmSize}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
              placeholder="e.g., 100, 500"
              required
            />
          </div>
          <div>
            <label htmlFor="landDocument" className="block text-sm font-medium text-gray-700">Land Document (PDF, Image)</label>
            <input
              type="file"
              name="landDocument"
              id="landDocument"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-700"
              accept=".pdf, .jpg, .jpeg, .png"
            />
            {farmDetails.landDocument && <p className="mt-2 text-sm text-gray-500">Selected file: {farmDetails.landDocument.name}</p>}
          </div>
          <div>
            <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700">Verification Status</label>
            <p className="mt-1 text-sm text-gray-900">{farmDetails.verificationStatus}</p>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-primary-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Save Farm Details
          </button>
        </form>
      </div>
    </div>

  );
};

export default FarmDetailsManagement;
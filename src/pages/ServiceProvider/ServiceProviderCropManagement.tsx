import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const initialCrops = [
  {
    id: "CROP001",
    name: "Wheat",
    season: "Rabi",
    variety: "HD 2967",
    activePolicies: 150,
    cropYield: "50 quintals/acre",
    previousClaims: 20,
    damageSusceptibility: "Medium (Rust)",
  },
  {
    id: "CROP002",
    name: "Rice",
    season: "Kharif",
    variety: "Pusa Basmati 1121",
    activePolicies: 200,
    cropYield: "60 quintals/acre",
    previousClaims: 35,
    damageSusceptibility: "High (Blast)",
  },
  {
    id: "CROP003",
    name: "Sugarcane",
    season: "Year-round",
    variety: "Co 0238",
    activePolicies: 80,
    cropYield: "800 quintals/acre",
    previousClaims: 10,
    damageSusceptibility: "Low (Red Rot)",
  },
];

const ServiceProviderCropManagement = () => {
  const [crops, setCrops] = useState(initialCrops);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.variety.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCrop = () => {
    navigate('/service-provider-dashboard/crop-management/add');
  };

  const handleEditCrop = (crop) => {
    // This will be handled by the new component, passing crop data via state or URL params
    navigate('/service-provider-dashboard/crop-management/edit', { state: { crop } });
  };

  const handleViewCrop = (cropId: string) => {
    navigate(`/service-provider-dashboard/view-detail/crop/${cropId}`);
  };

  const handleDeleteCrop = (cropId) => {
    setCrops(crops.filter(crop => crop.id !== cropId));
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">Crop Management</h1>

      {/* Filters and Search */}
      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border border-sp-neutral-light rounded-md p-2">
          <Search className="w-5 h-5 text-sp-neutral-dark" />
          <input
            type="text"
            placeholder="Search crops by Name or Variety..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark"
          />
        </div>
        <button onClick={handleAddCrop} className="flex items-center space-x-2 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          <PlusCircle className="w-4 h-4" />
          <span>Add New Crop</span>
        </button>
      </div>

      {/* Crops Table */}
      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-sp-primary-DEFAULT text-white uppercase text-sm leading-normal">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Crop ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Season</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Variety</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Active Policies</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Crop Yield</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Previous Claims</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Damage Susceptibility</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sp-neutral-dark text-sm">
            {filteredCrops.map((crop) => (
              <tr key={crop.id} className="border-b border-sp-neutral-light hover:bg-sp-off-white-light">
                <td className="px-6 py-4 whitespace-nowrap">{crop.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{crop.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{crop.season}</td>
                <td className="px-6 py-4 whitespace-nowrap">{crop.variety}</td>
                <td className="px-6 py-4 whitespace-nowrap">{crop.activePolicies}</td>
                <td className="px-6 py-4 whitespace-nowrap">{crop.cropYield}</td>
                <td className="px-6 py-4 whitespace-nowrap">{crop.previousClaims}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                    crop.damageSusceptibility.includes("High") ? "text-red-800" :
                    crop.damageSusceptibility.includes("Medium") ? "text-orange-800" :
                    "text-green-800"
                  }`}>
                    <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                      crop.damageSusceptibility.includes("High") ? "bg-red-300" :
                      crop.damageSusceptibility.includes("Medium") ? "bg-orange-300" :
                      "bg-green-300"
                    }`}></span>
                    <span className="relative">{crop.damageSusceptibility}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-sp-primary-DEFAULT hover:bg-sp-primary-light hover:text-sp-primary-DEFAULT cursor-pointer"
                        onClick={() => handleViewCrop(crop.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Crop
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-sp-primary-DEFAULT hover:bg-sp-primary-light hover:text-sp-primary-DEFAULT cursor-pointer"
                        onClick={() => handleEditCrop(crop)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Crop
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                        onClick={() => handleDeleteCrop(crop.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Crop
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

export default ServiceProviderCropManagement;
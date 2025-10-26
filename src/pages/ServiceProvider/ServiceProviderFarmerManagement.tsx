import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, Edit, Trash2, PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const farmers = [
  { id: 'F001', name: 'John Doe', location: 'Rural Area 1', contact: 'johndoe@example.com', registeredDate: '2023-01-15' },
  { id: 'F002', name: 'Jane Smith', location: 'Rural Area 2', contact: 'janesmith@example.com', registeredDate: '2023-02-20' },
  { id: 'F003', name: 'Peter Jones', location: 'Rural Area 3', contact: 'peterjones@example.com', registeredDate: '2023-03-10' },
  { id: 'F004', name: 'Alice Brown', location: 'Rural Area 1', contact: 'alicebrown@example.com', registeredDate: '2023-04-05' },
];

const ServiceProviderFarmerManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleAddFarmer = () => {
    navigate('/service-provider-dashboard/farmer-management/add');
  };

  const handleEditFarmer = (farmer: any) => {
    navigate(`/service-provider-dashboard/farmer-management/add`, { state: { farmer } });
  };

  const handleViewFarmer = (farmerId: string) => {
    navigate(`/service-provider-dashboard/view-detail/farmer/${farmerId}`);
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">
        Farmer Management
      </h1>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2 border border-sp-neutral-light rounded-md p-2">
          <Search className="w-5 h-5 text-sp-neutral-dark" />
          <Input
            type="text"
            placeholder="Search farmers..."
            className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border-none focus-visible:ring-0"
          />
        </div>
        <Button
          onClick={handleAddFarmer}
          className="flex items-center space-x-2 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Farmer
        </Button>
      </div>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-sp-primary-DEFAULT">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                Farmer ID
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                Name
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                Location
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                Contact
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                Registered Date
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <tbody className="text-sp-neutral-dark text-sm">
            {farmers.map((farmer) => (
              <TableRow
                key={farmer.id}
                className="border-b border-sp-neutral-light hover:bg-sp-purple-light-hover"
              >
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  {farmer.id}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  {farmer.name}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  {farmer.location}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  {farmer.contact}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  {farmer.registeredDate}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleViewFarmer(farmer.id)} className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Eye className="w-5 h-5" /></button>
                  <button onClick={() => handleEditFarmer(farmer)} className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mr-3"><Edit className="w-5 h-5" /></button>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"><Trash2 className="w-5 h-5" /></button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ServiceProviderFarmerManagement;
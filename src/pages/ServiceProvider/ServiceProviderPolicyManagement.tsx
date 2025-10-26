import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { MoreHorizontal, Eye, Edit, Trash2, PlusCircle } from "lucide-react";

const policies = [
  { id: 'P001', farmer: 'John Doe', crop: 'Wheat', coverage: '5 acres', status: 'Active', startDate: '2023-03-01', endDate: '2024-02-28' },
  { id: 'P002', farmer: 'Jane Smith', crop: 'Corn', coverage: '10 acres', status: 'Pending', startDate: '2023-04-10', endDate: '2024-03-31' },
  { id: 'P003', farmer: 'Peter Jones', crop: 'Rice', coverage: '7 acres', status: 'Active', startDate: '2023-05-01', endDate: '2024-04-30' },
  { id: 'P004', farmer: 'Alice Brown', crop: 'Soybeans', coverage: '12 acres', status: 'Expired', startDate: '2022-06-01', endDate: '2023-05-31' },
];

const ServiceProviderPolicyManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleAddPolicy = () => {
    navigate('/service-provider-dashboard/policy-management/add');
  };

  const handleEditPolicy = (policy: any) => {
    navigate('/service-provider-dashboard/policy-management/add', { state: { policy } });
  };

  const handleViewPolicy = (policyId: string) => {
    navigate(`/service-provider-dashboard/view-detail/policy/${policyId}`);
  };
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">
        Policy Management
      </h1>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 w-full sm:w-auto flex items-center space-x-2 border border-sp-neutral-light rounded-md p-2">
          <Input
            placeholder="Search policies..."
            className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border-none"
          />
        </div>
        <Button
          className="w-full sm:w-auto flex items-center space-x-2 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          onClick={handleAddPolicy}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span>Create New Policy</span>
        </Button>
      </div>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-sp-primary-DEFAULT text-white uppercase text-sm leading-normal">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Policy ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sp-neutral-dark text-sm divide-y divide-sp-neutral-light">
              {policies.map((policy) => (
                <tr
                  key={policy.id}
                  className="hover:bg-sp-off-white-light transition-colors duration-200 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {policy.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {policy.farmer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {policy.crop}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {policy.coverage}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      policy.status === "Active" ? "text-green-800" :
                      policy.status === "Pending" ? "text-yellow-800" :
                      policy.status === "Expired" ? "text-red-800" :
                      "text-orange-800"
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        policy.status === "Active" ? "bg-green-300" :
                        policy.status === "Pending" ? "bg-yellow-300" :
                        policy.status === "Expired" ? "bg-red-300" :
                        "bg-orange-300"
                      }`}></span>
                      <span className="relative">{policy.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policy.startDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policy.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                          onClick={() => handleViewPolicy(policy.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sp-primary-DEFAULT hover:bg-sp-primary-light hover:text-sp-primary-DEFAULT cursor-pointer"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 hover:bg-red-100 hover:text-red-600 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Policy
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default ServiceProviderPolicyManagement;
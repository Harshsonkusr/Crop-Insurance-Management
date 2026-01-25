import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Star,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  IndianRupee,
  Users,
  Award,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from '../../lib/api';
import logger from '../../utils/logger';

interface Insurer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  address?: string;
  licenseNumber?: string;
  kycVerified?: boolean;
  status?: string;
  createdAt?: string;
}

const PolicyComparison: React.FC = () => {
  const navigate = useNavigate();
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Insurer | null>(null);

  useEffect(() => {
    fetchInsurers();
  }, []);

  const fetchInsurers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/insurers/approved');
      setInsurers(response.data || []);
      logger.farmer.policy('Fetched insurers for comparison', { count: response.data?.length || 0 });
    } catch (err: any) {
      logger.farmer.error('Error fetching insurers for comparison', { error: err });
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load insurers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPolicy = (provider: Insurer) => {
    logger.farmer.policy('Selected provider for policy request', { providerId: provider.id || provider._id });
    navigate('/farmer-dashboard/policy-request', {
      state: {
        selectedProvider: provider
      }
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'crop insurance':
        return <Shield className="h-5 w-5 text-green-600" />;
      case 'livestock insurance':
        return <Users className="h-5 w-5 text-blue-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insurers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/farmer-dashboard/my-policies')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Insurers</h1>
          <p className="text-gray-600">Choose the best insurance provider for your farming needs</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Providers</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchInsurers} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Providers */}
      {insurers.length === 0 && !error && (
        <Card>
          <CardContent className="p-6 text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Insurers Available</h3>
            <p className="text-gray-600 mb-4">
              There are currently no approved insurers available. Please check back later.
            </p>
            <Button onClick={() => navigate('/farmer-dashboard/my-policies')}>
              Back to Policies
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insurers.map((provider) => (
          <Card key={provider.id || provider._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getServiceTypeIcon(provider.serviceType)}
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <p className="text-sm text-gray-600">{provider.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {provider.kycVerified && (
                    <CheckCircle className="h-5 w-5 text-green-600" title="KYC Verified" />
                  )}
                  {getStatusBadge(provider.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Provider Details */}
              <div className="space-y-2 text-sm">
                {provider.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{provider.address}</span>
                  </div>
                )}
                {provider.licenseNumber && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="h-4 w-4 flex-shrink-0" />
                    <span>License: {provider.licenseNumber}</span>
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{provider.phone}</span>
                  </div>
                )}
              </div>

              {/* Features/Advantages */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Key Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Quick claim processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Government compliant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Wide coverage options</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getServiceTypeIcon(provider.serviceType)}
                        {provider.name} - {provider.serviceType}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Status:</strong> {getStatusBadge(provider.status)}
                        </div>
                        <div>
                          <strong>KYC Verified:</strong> {provider.kycVerified ? 'Yes' : 'No'}
                        </div>
                        {provider.licenseNumber && (
                          <div>
                            <strong>License:</strong> {provider.licenseNumber}
                          </div>
                        )}
                        {provider.createdAt && (
                          <div>
                            <strong>Member Since:</strong> {new Date(provider.createdAt).getFullYear()}
                          </div>
                        )}
                      </div>

                      {provider.address && (
                        <div>
                          <strong>Address:</strong> {provider.address}
                        </div>
                      )}

                      <div className="space-y-2">
                        <strong>Services Offered:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Crop insurance policies</li>
                          <li>Risk assessment and coverage</li>
                          <li>Claim processing and settlement</li>
                          <li>Agricultural advisory services</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <strong>Contact Information:</strong>
                        <div className="space-y-1 text-sm">
                          {provider.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{provider.email}</span>
                            </div>
                          )}
                          {provider.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{provider.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => handleRequestPolicy(provider)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Request Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tips for Choosing an Insurer</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check if the insurer is KYC verified and has a valid license</li>
                <li>• Review the service type to ensure it matches your farming needs</li>
                <li>• Consider insurers with local presence for better support</li>
                <li>• Look for insurers with good claim settlement history</li>
                <li>• Compare coverage options and premium rates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyComparison;


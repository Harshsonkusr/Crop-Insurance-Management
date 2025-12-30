import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  IndianRupee,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Edit,
  Zap,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '../../lib/api';

interface PolicyDetails {
  _id: string;
  policyNumber: string;
  cropType: string;
  sumInsured: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: string;
  insuredArea?: number;
  farmerId?: any;
  serviceProviderId?: any;
}

interface ClaimDetails {
  _id: string;
  claimId: string;
  policyId?: {
    _id: string;
    policyNumber: string;
    cropType: string;
  };
  dateOfIncident: string;
  dateOfClaim: string;
  locationOfIncident: string;
  description: string;
  status: string;
  amountClaimed?: number;
  verificationStatus?: string;
  aiDamageAssessment?: any;
  satelliteVerification?: any;
  documents?: string[];
  images?: string[];
  notes?: string[];
  resolutionDetails?: string;
  resolutionDate?: string;
}

type FarmerViewDetailsParams = {
  type: 'policy' | 'claim';
  id: string;
};

const FarmerViewDetails: React.FC = () => {
  const { type, id } = useParams<FarmerViewDetailsParams>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<PolicyDetails | ClaimDetails | null>(null);

  useEffect(() => {
    if (type && id) {
      fetchDetails();
    }
  }, [type, id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (type === 'policy') {
        response = await api.get(`/farmer/policies/${id}`);
        setDetails(response.data as PolicyDetails);
      } else if (type === 'claim') {
        response = await api.get(`/claims/farmer/${id}`);
        setDetails(response.data as ClaimDetails);
      }
    } catch (err: any) {
      console.error(`Error fetching ${type} details:`, err);
      setError(err?.response?.data?.message || `Failed to fetch ${type} details.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any } } = {
      'active': { label: 'Active', variant: 'default', icon: CheckCircle2 },
      'inactive': { label: 'Inactive', variant: 'secondary', icon: Clock },
      'expired': { label: 'Expired', variant: 'outline', icon: AlertCircle },
      'pending': { label: 'Pending', variant: 'secondary', icon: Clock },
      'submitted': { label: 'Submitted', variant: 'secondary', icon: Clock },
      'in-progress': { label: 'In Progress', variant: 'secondary', icon: Clock },
      'under_review': { label: 'Under Review', variant: 'secondary', icon: Clock },
      'approved': { label: 'Approved', variant: 'default', icon: CheckCircle2 },
      'resolved': { label: 'Resolved', variant: 'default', icon: CheckCircle2 },
      'rejected': { label: 'Rejected', variant: 'destructive', icon: XCircle },
    };

    const config = statusConfig[status.toLowerCase()] || { 
      label: status, 
      variant: 'outline' as const,
      icon: AlertCircle
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return '₹0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No details found.</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === 'policy' 
              ? `Policy: ${(details as PolicyDetails).policyNumber}`
              : `Claim: ${(details as ClaimDetails).claimId || `#${(details as ClaimDetails)._id.slice(-8)}`}`}
          </h1>
          <p className="text-gray-600">
            {type === 'policy' ? 'View complete policy information' : 'View complete claim details and status'}
          </p>
        </div>
        {getStatusBadge((details as any).status)}
      </div>

      {/* Policy Details */}
      {type === 'policy' && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Policy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Policy Number</Label>
                    <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).policyNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Crop Type</Label>
                    <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).cropType}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge((details as PolicyDetails).status)}
                    </div>
                  </div>
                  {(details as PolicyDetails).insuredArea && (
                    <div>
                      <Label className="text-sm text-gray-500">Insured Area</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {(details as PolicyDetails).insuredArea} acres
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Validity Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Start Date</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate((details as PolicyDetails).startDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">End Date</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate((details as PolicyDetails).endDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Days Remaining</Label>
                    <p className="text-lg font-semibold text-green-600">
                      {Math.ceil((new Date((details as PolicyDetails).endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Sum Insured</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency((details as PolicyDetails).sumInsured)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Premium Amount</Label>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency((details as PolicyDetails).premium)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <CardTitle>Coverage Information</CardTitle>
                <CardDescription>Detailed coverage terms and conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Coverage Summary</h3>
                    <p className="text-sm text-blue-700">
                      This policy provides comprehensive coverage for {((details as PolicyDetails).cropType).toLowerCase()} crops 
                      with a sum insured of {formatCurrency((details as PolicyDetails).sumInsured)}. 
                      Coverage is valid from {formatDate((details as PolicyDetails).startDate)} to {formatDate((details as PolicyDetails).endDate)}.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => alert('Downloading policy document...')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Policy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Claim Details */}
      {type === 'claim' && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evidence">Evidence & Documents</TabsTrigger>
            <TabsTrigger value="verification">AI Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Claim Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Claim ID</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {(details as ClaimDetails).claimId || `#${(details as ClaimDetails)._id.slice(-8)}`}
                    </p>
                  </div>
                  {(details as ClaimDetails).policyId && (
                    <div>
                      <Label className="text-sm text-gray-500">Policy Number</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {(details as ClaimDetails).policyId.policyNumber}
                      </p>
                    </div>
                  )}
                  {(details as ClaimDetails).policyId && (
                    <div>
                      <Label className="text-sm text-gray-500">Crop Type</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {(details as ClaimDetails).policyId.cropType}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge((details as ClaimDetails).status)}
                    </div>
                  </div>
                  {(details as ClaimDetails).verificationStatus && (
                    <div>
                      <Label className="text-sm text-gray-500">Verification Status</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {(details as ClaimDetails).verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Incident Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Date of Incident</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate((details as ClaimDetails).dateOfIncident || (details as ClaimDetails).dateOfClaim)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Location</Label>
                    <p className="text-lg font-semibold text-gray-900 break-all">
                      {(details as ClaimDetails).locationOfIncident || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Claim Amount</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency((details as ClaimDetails).amountClaimed)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {(details as ClaimDetails).description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>

              {(details as ClaimDetails).resolutionDetails && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Resolution Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {(details as ClaimDetails).resolutionDetails}
                    </p>
                    {(details as ClaimDetails).resolutionDate && (
                      <p className="text-sm text-gray-500 mt-2">
                        Resolved on: {formatDate((details as ClaimDetails).resolutionDate)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Evidence & Documents
                </CardTitle>
                <CardDescription>
                  Photos and documents submitted with this claim
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(details as ClaimDetails).images && (details as ClaimDetails).images!.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Damage Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(details as ClaimDetails).images!.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${img.split('/').pop() || img}`}
                              alt={`Damage photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                              }}
                            />
                            <a
                              href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${img.split('/').pop() || img}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                            >
                              <Eye className="h-6 w-6 text-white" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(details as ClaimDetails).documents && (details as ClaimDetails).documents!.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Supporting Documents</h3>
                        <div className="space-y-2">
                          {(details as ClaimDetails).documents!.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {doc.split('/').pop() || `Document ${index + 1}`}
                                </span>
                              </div>
                              <a
                                href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${doc.split('/').pop() || doc}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No evidence uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(details as ClaimDetails).aiDamageAssessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      AI Damage Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries((details as ClaimDetails).aiDamageAssessment).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-sm font-semibold">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(details as ClaimDetails).satelliteVerification && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Satellite Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries((details as ClaimDetails).satelliteVerification).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-sm font-semibold">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!(details as ClaimDetails).aiDamageAssessment && !(details as ClaimDetails).satelliteVerification && (
                <Card className="md:col-span-2">
                  <CardContent className="p-8 text-center text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>AI verification results are being processed</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        {type === 'claim' && (details as ClaimDetails).status === 'pending' && (
          <Button
            variant="outline"
            onClick={() => navigate(`/farmer-dashboard/submit-claim`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Claim
          </Button>
        )}
        <Button variant="outline" onClick={() => alert('Downloading...')}>
          <Download className="h-4 w-4 mr-2" />
          Download {type === 'policy' ? 'Policy' : 'Claim'} Details
        </Button>
      </div>
    </div>
  );
};

export default FarmerViewDetails;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Crop, Shield, FileText, Calendar, MapPin, Phone, Mail, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import api from '../../lib/api';

interface FarmerData {
  _id?: string;
  id?: string;
  name: string;
  contact?: string;
  mobileNumber?: string;
  email?: string;
  address?: string;
  location?: string;
  registeredDate?: string;
  createdAt?: string;
  status?: string;
  totalLand?: string;
  cropsGrown?: string[];
  activePolicies?: string[];
  claimsHistory?: string[];
}

interface CropData {
  _id?: string;
  id?: string;
  name: string;
  season?: string;
  cultivationSeason?: string;
  variety?: string;
  activePolicies?: number;
  cropYield?: string;
  expectedYield?: string;
  previousClaims?: number;
  damageSusceptibility?: string;
  description?: string;
}

interface PolicyData {
  _id?: string;
  id?: string;
  policyNumber?: string;
  farmerId?: {
    name: string;
  };
  farmer?: string;
  cropType?: string;
  crop?: string;
  coverage?: string;
  status: string;
  startDate: string;
  endDate: string;
  premium?: number;
  sumInsured?: number;
  notes?: string;
}

interface ReportData {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  date: string;
  status: string;
  content?: string;
}

type EntityData = FarmerData | CropData | PolicyData | ReportData;

const ServiceProviderViewDetail = () => {
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<EntityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntityDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '';
        if (entityType === 'farmer') {
          endpoint = `/service-provider/farmers/${id}`;
        } else if (entityType === 'crop') {
          endpoint = `/crops/${id}`;
        } else if (entityType === 'policy') {
          endpoint = `/policies/${id}`;
        } else if (entityType === 'report') {
          endpoint = `/service-provider/reports/${id}`;
        } else {
          setError(`Invalid entity type: ${entityType}`);
          setLoading(false);
          return;
        }

        const response = await api.get(endpoint);
        setData(response.data);
      } catch (err: any) {
        console.error(`${entityType} fetch error:`, err);
        setError(err?.response?.data?.message || `Failed to fetch ${entityType} details.`);
      } finally {
        setLoading(false);
      }
    };

    if (id && entityType) {
      fetchEntityDetail();
    }
  }, [entityType, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading {entityType} details...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No {entityType} details found.</p>
      </div>
    );
  }

  const getTitle = () => {
    switch (entityType) {
      case "farmer":
        return "Farmer Details";
      case "crop":
        return "Crop Details";
      case "policy":
        return "Policy Details";
      case "report":
        return "Report Details";
      default:
        return "Details";
    }
  };

  const getIcon = () => {
    switch (entityType) {
      case "farmer":
        return <User className="h-8 w-8 text-purple-600" />;
      case "crop":
        return <Crop className="h-8 w-8 text-purple-600" />;
      case "policy":
        return <Shield className="h-8 w-8 text-purple-600" />;
      case "report":
        return <FileText className="h-8 w-8 text-purple-600" />;
      default:
        return <FileText className="h-8 w-8 text-purple-600" />;
    }
  };

  const renderDetails = () => {
    switch (entityType) {
      case "farmer": {
        const farmerData = data as FarmerData;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Farmer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Name" value={farmerData.name} icon={User} />
                <DetailItem label="Contact" value={farmerData.contact || farmerData.mobileNumber || 'N/A'} icon={Phone} />
                <DetailItem label="Email" value={farmerData.email || 'N/A'} icon={Mail} />
                <DetailItem label="Location" value={farmerData.location || 'N/A'} icon={MapPin} />
                <DetailItem 
                  label="Address" 
                  value={farmerData.address || 'N/A'} 
                  icon={MapPin}
                  fullWidth
                />
                <DetailItem 
                  label="Registered Date" 
                  value={farmerData.registeredDate || farmerData.createdAt 
                    ? new Date(farmerData.registeredDate || farmerData.createdAt || '').toLocaleDateString()
                    : 'N/A'} 
                  icon={Calendar} 
                />
                {farmerData.status && (
                  <DetailItem 
                    label="Status" 
                    value={<Badge className={farmerData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {farmerData.status}
                    </Badge>} 
                    icon={User}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
      case "crop": {
        const cropData = data as CropData;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crop className="h-5 w-5" />
                Crop Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Crop Name" value={cropData.name} icon={Crop} />
                <DetailItem label="Variety" value={cropData.variety || 'N/A'} icon={Package} />
                <DetailItem label="Season" value={cropData.season || cropData.cultivationSeason || 'N/A'} icon={Calendar} />
                <DetailItem label="Yield" value={cropData.cropYield || cropData.expectedYield || 'N/A'} icon={Package} />
                <DetailItem label="Active Policies" value={(cropData.activePolicies || 0).toString()} icon={Shield} />
                <DetailItem label="Previous Claims" value={(cropData.previousClaims || 0).toString()} icon={FileText} />
                <DetailItem 
                  label="Damage Susceptibility" 
                  value={cropData.damageSusceptibility || 'N/A'} 
                  icon={Crop}
                />
                {cropData.description && (
                  <DetailItem 
                    label="Description" 
                    value={cropData.description} 
                    icon={FileText}
                    fullWidth
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
      case "policy": {
        const policyData = data as PolicyData;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem 
                  label="Policy Number" 
                  value={policyData.policyNumber || `Policy #${(policyData._id || policyData.id)?.slice(-8)}`} 
                  icon={Shield} 
                />
                <DetailItem 
                  label="Farmer" 
                  value={
                    (typeof policyData.farmerId === 'object' && policyData.farmerId !== null ? policyData.farmerId.name : policyData.farmerId) ||
                    (typeof policyData.farmer === 'object' && policyData.farmer !== null ? policyData.farmer.name : policyData.farmer) ||
                    'N/A'
                  } 
                  icon={User} 
                />
                <DetailItem label="Crop" value={policyData.cropType || policyData.crop || 'N/A'} icon={Crop} />
                <DetailItem label="Coverage" value={policyData.coverage || 'N/A'} icon={Package} />
                <DetailItem 
                  label="Status" 
                  value={<Badge className={
                    policyData.status === 'Active' ? 'bg-green-100 text-green-800' :
                    policyData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {policyData.status}
                  </Badge>} 
                  icon={Shield}
                />
                <DetailItem 
                  label="Start Date" 
                  value={new Date(policyData.startDate).toLocaleDateString()} 
                  icon={Calendar} 
                />
                <DetailItem 
                  label="End Date" 
                  value={new Date(policyData.endDate).toLocaleDateString()} 
                  icon={Calendar} 
                />
                {policyData.sumInsured && (
                  <DetailItem 
                    label="Sum Insured" 
                    value={`₹${policyData.sumInsured.toLocaleString('en-IN')}`} 
                    icon={DollarSign} 
                  />
                )}
                {policyData.premium && (
                  <DetailItem 
                    label="Premium" 
                    value={`₹${policyData.premium.toLocaleString('en-IN')}`} 
                    icon={DollarSign} 
                  />
                )}
                {policyData.notes && (
                  <DetailItem 
                    label="Notes" 
                    value={policyData.notes} 
                    icon={FileText}
                    fullWidth
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
      case "report": {
        const reportData = data as ReportData;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Report Name" value={reportData.name} icon={FileText} />
                <DetailItem label="Type" value={reportData.type} icon={FileText} />
                <DetailItem 
                  label="Date" 
                  value={new Date(reportData.date).toLocaleDateString()} 
                  icon={Calendar} 
                />
                <DetailItem 
                  label="Status" 
                  value={<Badge className={reportData.status === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {reportData.status}
                  </Badge>} 
                  icon={FileText}
                />
                {reportData.content && (
                  <DetailItem 
                    label="Content" 
                    value={reportData.content} 
                    icon={FileText}
                    fullWidth
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
      default:
        return <div className="p-4 text-center text-red-500">Unknown entity type: {entityType}</div>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h1>
          <p className="text-gray-600 mt-1">View detailed information</p>
        </div>
      </div>

      {renderDetails()}
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
  icon?: any;
  fullWidth?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon: Icon, fullWidth }) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-1">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <Label className="text-gray-500 text-sm">{label}</Label>
        <div className="mt-1">
          {typeof value === 'string' ? (
            <p className="font-medium text-gray-900">{value}</p>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ServiceProviderViewDetail;

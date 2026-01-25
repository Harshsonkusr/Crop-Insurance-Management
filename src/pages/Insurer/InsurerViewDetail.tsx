import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Crop, Shield, FileText, Calendar, MapPin, Phone, Mail, DollarSign, Package, Building2, Image as ImageIcon, Camera, Map, Download, Cloud, Droplets, Thermometer, Sprout, Bug, Satellite, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import api from '../../lib/api';
import FarmBoundaryMap from '@/components/FarmBoundaryMap';
import { API_BASE_URL } from '../../config';


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
  // Farm details specific fields
  farmName?: string;
  landAreaSize?: number;
  surveyNumber?: string;
  landRecordKhasra?: string;
  landRecordKhatauni?: string;
  insuranceUnit?: string;
  soilType?: string;
  irrigationMethod?: string;
  cropName?: string;
  cropType?: string;
  cropVariety?: string;
  cropSeason?: string;
  wildAnimalAttackCoverage?: boolean;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  // Documents
  satbaraImage?: string;
  patwariMapImage?: string;
  sowingCertificate?: string;
  bankPassbookImage?: string;
  aadhaarCardImage?: string;
  // Location details
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  pincode?: string;
  // Land images and GPS
  landImage1?: string; landImage1Gps?: string;
  landImage2?: string; landImage2Gps?: string;
  landImage3?: string; landImage3Gps?: string;
  landImage4?: string; landImage4Gps?: string;
  landImage5?: string; landImage5Gps?: string;
  landImage6?: string; landImage6Gps?: string;
  landImage7?: string; landImage7Gps?: string;
  landImage8?: string; landImage8Gps?: string;
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
  policyId?: string;
  policyNumber?: string;
  farmerId?: string | {
    id?: string;
    _id?: string;
    name: string;
  };
  farmer?: string | {
    id?: string;
    _id?: string;
    name: string;
  };
  cropType?: string;
  crop?: string;
  coverage?: string;
  status: string;
  startDate: string;
  endDate: string;
  premium?: number;
  sumInsured?: number;
  insuredArea?: number;
  notes?: string;
  cropDetails?: any;
  policyImages?: any;
  policyDocuments?: any;
}
interface PolicyRequestData {
  _id?: string;
  id?: string;
  farmerId?: string | {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
    mobileNumber?: string;
  };
  farmer?: string | {
    id?: string;
    _id?: string;
    name: string;
  };
  cropType: string;
  insuredArea: number;
  requestedStartDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'issued';
  cropDetails?: any;
  farmImages?: any;
  documents?: any;
  createdAt: string;
}

interface ReportData {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  date: string;
  status: string;
  content?: any; // inspectionReport JSON
  claimId?: string;
  farmer?: { name: string; email: string; mobileNumber: string };
  policy?: { policyNumber: string; cropType: string; sumInsured: number };
  claim?: any; // Full claim object
  reportType?: 'INSURER_INSPECTION' | 'AI_ASSESSMENT';
}

type EntityData = FarmerData | CropData | PolicyData | PolicyRequestData | ReportData;

const InsurerViewDetail = () => {
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
          // Flatten farmDetails logic similar to Admin
          const response = await api.get(`/insurer/farmers/${id}`);
          const userData = response.data;
          // If farmDetails exists separately, merge it
          if (userData.farmDetails) {
            const mergedData = { ...userData, ...userData.farmDetails };
            setData(mergedData);
          } else {
            setData(userData);
          }
        } else if (entityType === 'crop') {
          endpoint = `/crops/${id}`;
          const response = await api.get(endpoint);
          setData(response.data);
        } else if (entityType === 'policy') {
          endpoint = `/policies/${id}`;
          const response = await api.get(endpoint);
          setData(response.data);
        } else if (entityType === 'policy-request') {
          endpoint = `/policy-requests/${id}`;
          const response = await api.get(endpoint);
          setData(response.data);
        } else if (entityType === 'report') {
          endpoint = `/insurer/reports/${id}`;
          const response = await api.get(endpoint);
          setData(response.data);
        } else {
          setError(`Invalid entity type: ${entityType}`);
          setLoading(false);
          return;
        }
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

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800">Error Loading Details</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    let cleanPath = path;
    if (path.includes('uploads')) {
      const parts = path.split('uploads');
      if (parts.length > 1) {
        cleanPath = 'uploads' + parts[1];
      }
    }
    return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const DetailItem = ({ label, value, icon: Icon, fullWidth = false }: { label: string, value: any, icon?: any, fullWidth?: boolean }) => (
    <div className={`${fullWidth ? 'col-span-full' : ''} p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Icon className="h-4 w-4" /></div>}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <div className="text-sm font-semibold text-gray-900 break-words">
        {value}
      </div>
    </div>
  );

  const getIcon = () => {
    switch (entityType) {
      case "farmer": return <User className="h-8 w-8 text-purple-600" />;
      case "crop": return <Crop className="h-8 w-8 text-green-600" />;
      case "policy": return <Shield className="h-8 w-8 text-blue-600" />;
      case "policy-request": return <FileText className="h-8 w-8 text-orange-600" />;
      case "report": return <FileText className="h-8 w-8 text-indigo-600" />;
      default: return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (entityType) {
      case "farmer": return (data as FarmerData).name;
      case "crop": return (data as CropData).name;
      case "policy": return `Policy #${(data as PolicyData).policyNumber}`;
      case "policy-request": return `Request #${(data as PolicyRequestData).id?.substring(0, 8)}`;
      case "report": return (data as ReportData).name;
      default: return "Details";
    }
  };

  const renderDetails = () => {
    switch (entityType) {
      case "farmer": {
        const farmerObj = data as FarmerData;

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-blue-100 rounded-lg text-blue-700"><User className="h-8 w-8" /></span>
                  {farmerObj.name}
                </h1>
                <p className="text-gray-500 mt-1 ml-14">Farmer Profile & Registration Details</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="text-sm px-3 py-1 bg-green-100 text-green-800 border-green-200">{farmerObj.status || 'Active'}</Badge>
              </div>
            </div>

            {/* Farmland Boundary Map */}
            <Card className="shadow-lg overflow-hidden border-t-4 border-t-green-600">
              <CardHeader className="bg-green-50/50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Map className="h-5 w-5" />
                  Farmland Boundary Map (GIS)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] w-full relative">
                  <FarmBoundaryMap
                    coordinates={(() => {
                      const coords: { lat: number, lng: number }[] = [];
                      for (let i = 1; i <= 8; i++) {
                        const gpsVal = (farmerObj as any)[`landImage${i}Gps`];
                        if (gpsVal && gpsVal.includes(',')) {
                          const [lat, lng] = gpsVal.split(',').map((v: string) => parseFloat(v.trim()));
                          if (!isNaN(lat) && !isNaN(lng)) {
                            coords.push({ lat, lng });
                          }
                        }
                      }
                      return coords;
                    })()}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg border text-xs space-y-1">
                    <p className="font-bold text-green-800">Map Legend</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>Boundary Markers (1-8)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal & Identity Information */}
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DetailItem label="Full Name" value={farmerObj.name} icon={User} />
                  <DetailItem label="Mobile Number" value={farmerObj.mobileNumber || farmerObj.contact || 'N/A'} icon={Phone} />
                  <DetailItem label="Email Address" value={farmerObj.email || 'N/A'} icon={Mail} />
                  <DetailItem label="Registered Date" value={farmerObj.createdAt ? new Date(farmerObj.createdAt).toLocaleDateString() : 'N/A'} icon={Calendar} />
                  <div className="col-span-full mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Aadhaar Card Preview</p>
                    {farmerObj.aadhaarCardImage ? (
                      <div className="h-48 w-full md:w-96 bg-gray-100 rounded-lg overflow-hidden border">
                        <img src={getImageUrl(farmerObj.aadhaarCardImage)} className="h-full w-full object-cover" alt="Aadhaar" />
                      </div>
                    ) : <span className="text-sm text-gray-400 italic">No Aadhaar Image Uploaded</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Details */}
              <Card className="shadow-lg">
                <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailItem label="State" value={farmerObj.state || 'N/A'} icon={MapPin} />
                    <DetailItem label="District" value={farmerObj.district || 'N/A'} icon={MapPin} />
                    <DetailItem label="Tehsil/Block" value={farmerObj.tehsil || 'N/A'} icon={MapPin} />
                    <DetailItem label="Village" value={farmerObj.village || 'N/A'} icon={MapPin} />
                    <DetailItem label="PIN Code" value={farmerObj.pincode || 'N/A'} icon={MapPin} />
                    <DetailItem label="Full Address" value={farmerObj.address || 'N/A'} icon={MapPin} fullWidth />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card className="shadow-lg">
                <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Building2 className="h-5 w-5" />
                    Bank Details (DBT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-4">
                    <DetailItem label="Bank Name" value={farmerObj.bankName || 'N/A'} icon={Building2} />
                    <DetailItem label="Account Number" value={farmerObj.bankAccountNo || 'N/A'} icon={FileText} />
                    <DetailItem label="IFSC Code" value={farmerObj.bankIfsc || 'N/A'} icon={Building2} />
                    {farmerObj.bankPassbookImage && (
                      <div className="mt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Passbook Preview</p>
                        <div className="h-32 w-full bg-gray-100 rounded-lg overflow-hidden border">
                          <img src={getImageUrl(farmerObj.bankPassbookImage)} className="h-full w-full object-cover" alt="Passbook" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Farm & Land Records */}
            <Card className="shadow-lg border-t-4 border-t-emerald-500">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Package className="h-5 w-5" />
                  Farm & Check-in Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <DetailItem label="Farm Name" value={farmerObj.farmName || 'N/A'} icon={Building2} />
                  <DetailItem label="Land Area" value={farmerObj.landAreaSize ? `${farmerObj.landAreaSize} Hectares` : 'N/A'} icon={Package} />
                  <DetailItem label="Survey Number" value={farmerObj.surveyNumber || 'N/A'} icon={FileText} />
                  <DetailItem label="Crop Name" value={farmerObj.cropName || 'N/A'} icon={Crop} />
                  <DetailItem label="Crop Type" value={farmerObj.cropType || 'N/A'} icon={Crop} />
                  <DetailItem label="Insurance Unit" value={farmerObj.insuranceUnit || 'N/A'} icon={Shield} />
                  <DetailItem label="Soil Type" value={farmerObj.soilType || 'N/A'} icon={Package} />
                  <DetailItem label="Irrigation Method" value={farmerObj.irrigationMethod || 'N/A'} icon={Package} />
                  <DetailItem
                    label="Wild Animal Coverage"
                    value={farmerObj.wildAnimalAttackCoverage ? 'Opted' : 'Not Opted'}
                    icon={Shield}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supporting Documents & Photos Carousel */}
            <Card className="shadow-lg border-l-4 border-l-orange-500">
              <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <ImageIcon className="h-5 w-5" />
                  Site Photos & Document Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Satbara (7/12)', path: farmerObj.satbaraImage },
                    { label: 'Patwari Map', path: farmerObj.patwariMapImage },
                    { label: 'Sowing Cert.', path: farmerObj.sowingCertificate },
                    ...Array.from({ length: 8 }, (_, i) => ({
                      label: `Land Corner ${i + 1}`,
                      path: (farmerObj as any)[`landImage${i + 1}`],
                      gps: (farmerObj as any)[`landImage${i + 1}Gps`]
                    }))
                  ].map((doc, idx) => {
                    if (!doc.path) return null;
                    const fullUrl = getImageUrl(doc.path);
                    return (
                      <div key={idx} className="group relative border rounded-lg overflow-hidden bg-gray-50 flex flex-col items-center p-2 text-center hover:shadow-md transition-shadow">
                        <div className="w-full aspect-square bg-gray-200 rounded flex items-center justify-center overflow-hidden mb-2 relative">
                          <img
                            src={fullUrl}
                            alt={doc.label}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer"
                            onClick={() => window.open(fullUrl, '_blank')}
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-700 truncate w-full">{doc.label}</p>
                        {(doc as any).gps && <p className="text-[8px] text-gray-500 truncate w-full">📍 {(doc as any).gps}</p>}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-6 w-full text-[10px] text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(fullUrl, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      case "policy": {
        const policy = data as PolicyData;
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-purple-100 rounded-lg text-purple-700"><Shield className="h-8 w-8" /></span>
                  Policy #{policy.policyNumber}
                </h1>
                <p className="text-gray-500 mt-1 ml-14">Insurance Policy Details</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-sm px-3 py-1 ${policy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-green-200`}>{policy.status}</Badge>
              </div>
            </div>

            <Card className="border-l-4 border-l-purple-500 shadow-lg">
              <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Shield className="h-5 w-5" />
                  Policy Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Policy Number" value={policy.policyNumber} icon={Shield} />
                  <DetailItem label="Crop Type" value={policy.cropType || policy.crop} icon={Crop} />
                  <DetailItem
                    label="Validity Period"
                    value={`${new Date(policy.startDate).toLocaleDateString()} - ${new Date(policy.endDate).toLocaleDateString()}`}
                    icon={Calendar}
                  />
                  <DetailItem label="Premium Amount" value={`₹${policy.premium}`} icon={DollarSign} />
                  <DetailItem label="Sum Insured" value={`₹${policy.sumInsured}`} icon={DollarSign} />
                  <DetailItem label="Insured Area" value={`${policy.insuredArea || 0} Acres`} icon={Map} />
                </div>
              </CardContent>
            </Card>

            {/* Policy Specific Crop Details */}
            {policy.cropDetails && (
              <Card className="shadow-lg border-t-4 border-t-green-500">
                <CardHeader className="bg-green-50/50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Sprout className="h-5 w-5" />
                    Crop & Field Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Variety" value={policy.cropDetails.cropVariety || 'N/A'} icon={Sprout} />
                    <DetailItem label="Sowing Date" value={policy.cropDetails.sowingDate ? new Date(policy.cropDetails.sowingDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
                    <DetailItem label="Survey Numbers" value={policy.cropDetails.surveyNumber || 'N/A'} icon={FileText} />
                  </div>
                </CardContent>
              </Card>
            )}

            {policy.notes && (
              <Card className="shadow-lg">
                <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                  <CardTitle className="flex items-center gap-2 text-amber-900"><FileText className="h-5 w-5" /> Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700">{policy.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {policy.policyDocuments && policy.policyDocuments.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900"><FileText className="h-5 w-5" /> Documents</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {policy.policyDocuments.map((doc: string, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded">
                        <span>Document {idx + 1}</span>
                        <Button size="sm" variant="outline" onClick={() => window.open(`/api/${doc}`, '_blank')}>View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      }
      case "crop": {
        const crop = data as CropData;
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-green-100 rounded-lg text-green-700"><Crop className="h-8 w-8" /></span>
                  {crop.name}
                </h1>
                <p className="text-gray-500 mt-1 ml-14">Managed Crop Profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-purple-500 shadow-lg">
                <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Package className="h-5 w-5" />
                    Basic Crop Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <DetailItem label="Crop Name" value={crop.name} icon={Package} />
                  <DetailItem label="Variety" value={crop.variety || 'N/A'} icon={Sprout} />
                  <DetailItem label="Season" value={crop.season || crop.cultivationSeason || 'N/A'} icon={Calendar} />
                  <DetailItem label="Damage Susceptibility" value={crop.damageSusceptibility || 'Medium'} icon={AlertTriangle} />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-lg">
                <CardHeader className="bg-green-50/50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <TrendingUp className="h-5 w-5" />
                    Yield & Claims Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <DetailItem label="Expected Yield" value={crop.expectedYield || crop.cropYield || 'N/A'} icon={TrendingUp} />
                  <DetailItem label="Active Policies" value={crop.activePolicies || 0} icon={Shield} />
                  <DetailItem label="Previous Claims" value={crop.previousClaims || 0} icon={FileText} />
                </CardContent>
              </Card>
            </div>

            {crop.description && (
              <Card className="shadow-lg border-t-4 border-t-blue-500">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900"><FileText className="h-5 w-5" /> Crop Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 italic">"{crop.description}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      }
      case "policy-request": {
        const requestData = data as PolicyRequestData;
        const documents = requestData.documents;
        const farmImages = requestData.farmImages;

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-orange-100 rounded-lg text-orange-700"><FileText className="h-8 w-8" /></span>
                  Policy Issuance Request
                </h1>
                <p className="text-gray-500 mt-1 ml-14">Farmer Request for Coverage</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-sm px-3 py-1 ${requestData.status === 'issued' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} border-yellow-200`}>
                  {requestData.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <FileText className="h-5 w-5" />
                  Request Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Request ID" value={requestData.id || requestData._id || 'N/A'} icon={FileText} />
                  <DetailItem
                    label="Status"
                    value={requestData.status.toUpperCase()}
                    icon={Shield}
                  />
                  <DetailItem
                    label="Created At"
                    value={new Date(requestData.createdAt).toLocaleDateString()}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Requested Start Date"
                    value={requestData.requestedStartDate ? new Date(requestData.requestedStartDate).toLocaleDateString() : 'N/A'}
                    icon={Calendar}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardHeader className="bg-green-50/50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Crop className="h-5 w-5" />
                  Crop & Land Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Crop Type" value={requestData.cropType} icon={Crop} />
                  <DetailItem label="Insured Area" value={`${requestData.insuredArea} Acres`} icon={Map} />
                  {requestData.cropDetails && (
                    <>
                      <DetailItem label="Crop Variety" value={requestData.cropDetails.cropVariety || 'N/A'} icon={Sprout} />
                      <DetailItem label="Sowing Date" value={requestData.cropDetails.sowingDate ? new Date(requestData.cropDetails.sowingDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
                      <DetailItem label="Expected Yield" value={`${requestData.cropDetails.expectedYield || 0} Tons`} icon={Package} />
                      <DetailItem label="Survey Number" value={requestData.cropDetails.surveyNumber || 'N/A'} icon={FileText} />
                      <DetailItem label="Soil Type" value={requestData.cropDetails.soilType || 'N/A'} icon={Map} />
                      <DetailItem label="Irrigation Method" value={requestData.cropDetails.irrigationMethod || 'N/A'} icon={Droplets} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Farmer Info (if available) */}
            {(requestData.farmer || requestData.farmerId) && (
              <Card className="border-l-4 border-l-blue-500 shadow-lg">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900"><User className="h-5 w-5" /> Farmer Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem label="Name" value={(requestData.farmer as any)?.name || (requestData.farmerId as any)?.name || 'N/A'} icon={User} />
                    <DetailItem label="Email" value={(requestData.farmer as any)?.email || (requestData.farmerId as any)?.email || 'N/A'} icon={Mail} />
                    <DetailItem label="Mobile" value={(requestData.farmer as any)?.mobileNumber || (requestData.farmerId as any)?.mobileNumber || 'N/A'} icon={Phone} />
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Evidence - Farm Images */}
            {farmImages && Array.isArray(farmImages) && farmImages.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Farm Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {farmImages.map((img: string, idx: number) => {
                    // Check if it's a full URL or relative path
                    const imgSrc = img.startsWith('http') ? img : `/api/${img}`;
                    // Secure endpoint if specific route needed
                    // const authenticatedUrl = `/api/policy-requests/${requestData.id || requestData._id}/images/${idx}`;

                    return (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border bg-gray-100 aspect-video">
                        <img
                          src={imgSrc}
                          alt={`Farm ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => window.open(imgSrc, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evidence - Documents */}
            {documents && Array.isArray(documents) && documents.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Uploaded Documents (Land/ID)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc: any, idx: number) => {
                    const docPath = typeof doc === 'string' ? doc : doc.path;
                    const docName = typeof doc === 'string' ? doc.split('/').pop() : doc.fileName;
                    const viewUrl = docPath.startsWith('http') ? docPath : `/api/${docPath}`;

                    return (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-blue-100 rounded text-blue-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{docName || `Document ${idx + 1}`}</p>
                            <p className="text-[10px] text-gray-500 uppercase">FILE</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => window.open(viewUrl, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions for pending requests */}
            {requestData.status === 'pending' && (
              <div className="flex justify-end gap-4 p-4 bg-white border rounded-lg shadow-sm">
                <Button
                  variant="outline"
                  onClick={() => navigate('/insurer-dashboard/policy-management/add', { state: { request: requestData } })}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Review & Issue Policy
                </Button>
              </div>
            )}
          </div>
        );
      }
      case "report": {
        const reportData = data as ReportData;
        const verificationData = reportData.claim?.verificationData || reportData.content;
        const aiReport = reportData.content; // Alias for readability

        if (reportData.reportType === 'AI_ASSESSMENT') {
          return (
            <div className="space-y-6">
              <Card className="border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="bg-blue-50/50">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Satellite className="h-6 w-6" />
                    AI-Driven Damage Assessment Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {aiReport && (
                    <div className="space-y-8">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">AI Estimated Damage</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{aiReport.damageAssessment?.aiEstimatedDamage?.toFixed(1) || 0}%</p>
                            <Badge variant={(aiReport.damageAssessment?.aiEstimatedDamage || 0) > 50 ? "destructive" : "outline"} className="mt-2">
                              {(aiReport.damageAssessment?.aiEstimatedDamage || 0) > 70 ? 'CRITICAL' : ((aiReport.damageAssessment?.aiEstimatedDamage || 0) > 40 ? 'MODERATE' : 'LOW')} SEVERITY
                            </Badge>
                          </div>
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${(aiReport.damageAssessment?.aiEstimatedDamage || 0) > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <Satellite className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Confidence Score</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{((aiReport.damageAssessment?.confidenceScore || 0) * 100).toFixed(0)}%</p>
                            <p className="text-xs text-blue-600 mt-2 font-medium">Model Accuracy</p>
                          </div>
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Shield className="h-6 w-6" />
                          </div>
                        </div>
                      </div>

                      {/* Weather Analysis */}
                      {aiReport.weatherAnalysis && (
                        <div className="bg-slate-50 border rounded-lg p-5">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Cloud className="h-5 w-5 text-blue-500" /> Weather Impact Analysis
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Droplets className="h-3 w-3" /> Rainfall</p>
                              <p className="font-bold text-gray-900">{aiReport.weatherAnalysis.rainfall}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${aiReport.weatherAnalysis.deviationFromNormal.includes('+') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                {aiReport.weatherAnalysis.deviationFromNormal} vs Normal
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp Stress</p>
                              <p className="font-bold text-gray-900">{aiReport.weatherAnalysis.temperatureStress}</p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Flood Risk</p>
                              <Badge variant={aiReport.weatherAnalysis.floodRisk === 'HIGH' ? "destructive" : "secondary"}>
                                {aiReport.weatherAnalysis.floodRisk}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Crop Health Intelligence */}
                      {aiReport.cropHealth && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-5">
                          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                            <Sprout className="h-5 w-5 text-green-600" /> Crop Health Intelligence
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center border-b border-green-200 pb-2">
                                <span className="text-sm text-gray-600">NDVI Index (Vegetation)</span>
                                <span className="font-bold text-gray-900">{aiReport.cropHealth.ndviIndex}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-green-200 pb-2">
                                <span className="text-sm text-gray-600">Growth Stage</span>
                                <span className="font-medium text-gray-900">{aiReport.cropHealth.growthStage}</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center border-b border-green-200 pb-2">
                                <span className="text-sm text-gray-600">Chlorophyll Analysis</span>
                                <span className="font-medium text-amber-700">{aiReport.cropHealth.chlorophyllContent}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-green-200 pb-2">
                                <span className="text-sm text-gray-600 flex items-center gap-1"><Bug className="h-3 w-3" /> Pest Risk</span>
                                <span className="font-medium text-red-600">{aiReport.cropHealth.pestactivity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Geospatial Verification */}
                      {aiReport.geospatial && (
                        <div className="bg-white border rounded-lg p-5">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Map className="h-5 w-5 text-indigo-500" /> Geospatial Verification
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase">Location Match Score</p>
                              <p className={`text-xl font-bold mt-1 ${aiReport.geospatial.locationMatchScore > 80 ? 'text-green-600' : 'text-red-500'}`}>
                                {aiReport.geospatial.locationMatchScore}/100
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase">Field Boundary Overlap</p>
                              <p className="text-lg font-semibold mt-1 text-gray-800">{aiReport.geospatial.fieldBoundaryOverlap}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase">Soil Type Detected</p>
                              <p className="text-lg font-semibold mt-1 text-gray-800">{aiReport.geospatial.soilType}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* General Info */}
            <Card className="border-l-4 border-l-indigo-500 shadow-lg">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <FileText className="h-5 w-5" />
                  Report Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Report Name" value={reportData.name} icon={FileText} />
                  <DetailItem label="Type" value={<Badge variant="outline">{reportData.type}</Badge>} icon={Shield} />
                  <DetailItem
                    label="Date"
                    value={reportData.date ? new Date(reportData.date).toLocaleDateString() : 'N/A'}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Status"
                    value={<Badge className={reportData.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{reportData.status}</Badge>}
                    icon={Shield}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content based on type */}
            {(reportData.reportType === 'INSURER_INSPECTION' || !reportData.reportType) && verificationData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inspection Findings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem
                      label="Damage Confirmation"
                      value={verificationData.damageConfirmation || 'N/A'}
                      icon={Shield}
                    />
                    <DetailItem
                      label="Estimated Loss"
                      value={verificationData.estimatedLoss ? `₹${verificationData.estimatedLoss}` : 'N/A'}
                      icon={DollarSign}
                    />
                  </div>
                  {verificationData.verificationNotes && (
                    <DetailItem
                      label="Verification Notes"
                      value={verificationData.verificationNotes}
                      icon={FileText}
                      fullWidth
                    />
                  )}
                  {verificationData.recommendations && (
                    <DetailItem
                      label="Recommendations"
                      value={verificationData.recommendations}
                      icon={FileText}
                      fullWidth
                    />
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
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

      </div>

      {renderDetails()}
    </div>
  );
};


export default InsurerViewDetail;


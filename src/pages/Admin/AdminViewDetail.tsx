import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Crop, Shield, FileText, Calendar, MapPin, Phone, Mail, DollarSign, Package, Building2, Image as ImageIcon, Map, Download, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
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
    // Location details
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    pincode?: string;
    // Merged farm details
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

interface InsurerData {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    mobileNumber?: string;
    status?: string;
    isApproved?: boolean;
    insurer?: {
        name?: string;
        phone?: string;
        address?: string;
        state?: string;
        district?: string;
        serviceType?: string;
        serviceArea?: string;
        businessName?: string;
        gstNumber?: string;
        panNumber?: string;
        licenseNumber?: string;
        licenseExpiryDate?: string;
        aiCertified?: boolean;
        serviceDescription?: string;
    }
}

const AdminViewDetail = () => {
    const { entityType, id } = useParams<{ entityType: string; id: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEntityDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                if (entityType === 'farmer') {
                    const response = await api.get(`/admin/users/${id}`);
                    // Flatten farmDetails into main object for easier access similarly to InsurerViewDetail
                    const userData = response.data;
                    const mergedData = { ...userData, ...userData.farmDetails };
                    setData(mergedData);
                } else if (entityType === 'insurer') {
                    // Logic from ViewInsurerDialog
                    try {
                        const response = await api.get(`/admin/users/${id}`);
                        setData(response.data);
                    } catch (userErr: any) {
                        if (userErr.response?.status === 404) {
                            const insResponse = await api.get(`/admin/insurers/${id}`);
                            if (insResponse.data && insResponse.data.user) {
                                const { user, ...insurer } = insResponse.data;
                                setData({ ...user, insurer });
                            } else if (insResponse.data) {
                                // Fallback if data structure is just the insurer object
                                setData({ ...insResponse.data, insurer: insResponse.data });
                            } else {
                                throw userErr;
                            }
                        } else {
                            throw userErr;
                        }
                    }
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
            <div className="flex items-center justify-center h-screen bg-gray-50/50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading {entityType} details...</p>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-red-800 font-semibold mb-2">Error Loading Data</p>
                    <p className="text-red-600">{error}</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 bg-white hover:bg-red-50 text-red-700 border-red-200">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

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

            case "insurer": {
                const insurerObj = data as InsurerData;
                const details = insurerObj.insurer || {};

                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="p-2 bg-purple-100 rounded-lg text-purple-700"><Building2 className="h-8 w-8" /></span>
                                    {details.name || insurerObj.name}
                                </h1>
                                <p className="text-gray-500 mt-1 ml-14">Insurer Entity Profile</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {insurerObj.isApproved ? (
                                    <Badge className="text-sm px-3 py-1 bg-green-100 text-green-800 border-green-200 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
                                ) : (
                                    <Badge className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">Pending Approval</Badge>
                                )}
                                <Badge className="text-sm px-3 py-1 bg-blue-100 text-blue-800 border-blue-200">{insurerObj.status || 'Active'}</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Company Information */}
                            <Card className="border-l-4 border-l-purple-500 shadow-lg">
                                <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                                    <CardTitle className="flex items-center gap-2 text-purple-900">
                                        <Building2 className="h-5 w-5" />
                                        Corporate Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <DetailItem label="Business Name" value={details.businessName || details.name || insurerObj.name} icon={Building2} />
                                        <DetailItem label="Admin Email" value={insurerObj.email} icon={Mail} />
                                        <DetailItem label="Corporate Phone" value={details.phone || insurerObj.mobileNumber} icon={Phone} />
                                        <DetailItem label="Service Type" value={details.serviceType || 'Standard'} icon={Shield} />
                                        <DetailItem label="Service Area" value={details.serviceArea || 'N/A'} icon={MapPin} />
                                        <DetailItem label="AI Certified" value={details.aiCertified ? 'Yes' : 'No'} icon={CheckCircle} />
                                    </div>
                                    {details.serviceDescription && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Service Description</p>
                                            <p className="text-sm text-gray-700">{details.serviceDescription}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Registration & Legal */}
                            <Card className="shadow-lg border-l-4 border-l-blue-500">
                                <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                                    <CardTitle className="flex items-center gap-2 text-blue-900">
                                        <FileText className="h-5 w-5" />
                                        Legal & Registration Data
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <DetailItem label="GST Number" value={details.gstNumber || 'N/A'} icon={FileText} />
                                        <DetailItem label="PAN Number" value={details.panNumber || 'N/A'} icon={FileText} />
                                        <DetailItem label="License Number" value={details.licenseNumber || 'N/A'} icon={Shield} />
                                        <DetailItem label="License Expiry" value={details.licenseExpiryDate ? new Date(details.licenseExpiryDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card className="border-l-4 border-l-green-500 shadow-lg">
                                <CardHeader className="bg-green-50/50 border-b border-green-100">
                                    <CardTitle className="flex items-center gap-2 text-green-900">
                                        <MapPin className="h-5 w-5" />
                                        Operational Headquarters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <DetailItem label="Address" value={details.address || 'N/A'} icon={MapPin} fullWidth />
                                        <DetailItem label="State" value={details.state || 'N/A'} icon={MapPin} />
                                        <DetailItem label="District" value={details.district || 'N/A'} icon={MapPin} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            }
            default:
                return <div>Unknown entity type</div>;
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in bg-gray-50/30 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="mb-4 hover:bg-white bg-white/50 border-gray-200"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Button>
                {renderDetails()}
            </div>
        </div>
    );
};

export default AdminViewDetail;

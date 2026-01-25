import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, User, Tractor, CreditCard, FileText, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '../../lib/api';
import FarmBoundaryMap from '@/components/FarmBoundaryMap';

interface ViewFarmerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    farmerId: string | null;
}

const ViewFarmerDialog: React.FC<ViewFarmerDialogProps> = ({ open, onOpenChange, farmerId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && farmerId) {
            fetchFarmerDetails();
        } else {
            setData(null);
        }
    }, [open, farmerId]);

    const fetchFarmerDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${farmerId}`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching farmer details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path: string | undefined) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        // Handle specific case where path might already contain uploads/
        let cleanPath = path;
        if (path.includes('uploads')) {
            const parts = path.split('uploads');
            if (parts.length > 1) {
                cleanPath = 'uploads' + parts[1];
            }
        }

        return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    };

    const boundaryCoordinates = React.useMemo(() => {
        if (!data?.farmDetails) return [];
        const coords: { lat: number, lng: number }[] = [];
        for (let i = 1; i <= 8; i++) {
            const key = `landImage${i}Gps`;
            const gpsValue = data.farmDetails[key];
            if (gpsValue && typeof gpsValue === 'string' && gpsValue.includes(',')) {
                const [lat, lng] = gpsValue.split(',').map((v: string) => parseFloat(v.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                    coords.push({ lat, lng });
                }
            }
        }
        return coords;
    }, [data]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Farmer Profile Details
                    </DialogTitle>
                    <DialogDescription>
                        View full registration details for {data?.name || 'Farmer'}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : data ? (
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="personal">Personal</TabsTrigger>
                            <TabsTrigger value="farm">Farm & Crop</TabsTrigger>
                            <TabsTrigger value="bank">Bank</TabsTrigger>
                            <TabsTrigger value="policies">Policies ({data.policies?.length || 0})</TabsTrigger>
                            <TabsTrigger value="claims">Claims ({data.claims?.length || 0})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Full Name" value={data.name} />
                                <InfoItem label="Mobile Number" value={data.mobileNumber} />
                                <InfoItem label="Email" value={data.email || 'N/A'} />
                                <InfoItem label="Gender" value={data.gender || 'N/A'} />
                                <InfoItem label="Date of Birth" value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                <InfoItem label="Status" value={<Badge>{data.status}</Badge>} />
                            </div>

                            {data.farmDetails && (
                                <Card>
                                    <CardHeader><CardTitle className="text-sm">Address</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-2 text-sm">
                                        <InfoItem label="Village" value={data.farmDetails.village} />
                                        <InfoItem label="Tehsil" value={data.farmDetails.tehsil} />
                                        <InfoItem label="District" value={data.farmDetails.district} />
                                        <InfoItem label="State" value={data.farmDetails.state} />
                                        <InfoItem label="Pincode" value={data.farmDetails.pincode} />
                                        <InfoItem label="Full Address" value={data.farmDetails.address} />
                                    </CardContent>
                                </Card>
                            )}

                            <div className="mt-4">
                                <Label className="mb-2 block">Aadhaar Card</Label>
                                {data.farmDetails?.aadhaarCardImage ? (
                                    <img src={getImageUrl(data.farmDetails.aadhaarCardImage)} className="h-32 rounded border" alt="Aadhaar" />
                                ) : <span className="text-sm text-gray-500">Not uploaded</span>}
                            </div>
                        </TabsContent>

                        <TabsContent value="farm" className="space-y-4 pt-4">
                            {data.farmDetails ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InfoItem label="Farm Name" value={data.farmDetails.farmName} />
                                        <InfoItem label="Crop Type" value={data.farmDetails.cropType} />
                                        <InfoItem label="Crop Name" value={data.farmDetails.cropName} />
                                        <InfoItem label="Survey Number" value={data.farmDetails.surveyNumber} />
                                        <InfoItem label="Area Size" value={data.farmDetails.landAreaSize} />
                                        <InfoItem label="Wild Animal Coverage" value={data.farmDetails.wildAnimalAttackCoverage ? 'Yes' : 'No'} />
                                    </div>

                                    <div className="h-[300px] w-full rounded-lg overflow-hidden border mt-4">
                                        <FarmBoundaryMap coordinates={boundaryCoordinates} interactive={false} zoom={16} />
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                        {[1, 2, 3, 4].map(i => {
                                            const img = data.farmDetails[`landImage${i}`];
                                            return img ? (
                                                <img key={i} src={getImageUrl(img)} className="w-full h-24 object-cover rounded border" />
                                            ) : null;
                                        })}
                                    </div>
                                </>
                            ) : <p>No farm details available.</p>}
                        </TabsContent>

                        <TabsContent value="bank" className="space-y-4 pt-4">
                            {data.farmDetails ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoItem label="Bank Name" value={data.farmDetails.bankName} />
                                    <InfoItem label="Account No" value={data.farmDetails.bankAccountNo} />
                                    <InfoItem label="IFSC Code" value={data.farmDetails.bankIfsc} />
                                    <InfoItem label="Insurance Linked" value={data.farmDetails.insuranceLinked ? 'Yes' : 'No'} />
                                    <div className="col-span-2">
                                        <Label className="mb-2 block">Passbook Copy</Label>
                                        {data.farmDetails?.bankPassbookImage ? (
                                            <img src={getImageUrl(data.farmDetails.bankPassbookImage)} className="h-32 rounded border" alt="Passbook" />
                                        ) : <span className="text-sm text-gray-500">Not uploaded</span>}
                                    </div>
                                </div>
                            ) : <p>No bank details available.</p>}
                        </TabsContent>

                        <TabsContent value="policies" className="space-y-4 pt-4">
                            {data.policies && data.policies.length > 0 ? (
                                <div className="space-y-3">
                                    {data.policies.map((policy: any) => (
                                        <Card key={policy.id}>
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">{policy.policyNumber}</p>
                                                    <p className="text-sm text-gray-500">{policy.cropName} - {policy.season} {policy.year}</p>
                                                </div>
                                                <Badge>{policy.status}</Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500">No policies found.</p>}
                        </TabsContent>

                        <TabsContent value="claims" className="space-y-4 pt-4">
                            {data.claims && data.claims.length > 0 ? (
                                <div className="space-y-3">
                                    {data.claims.map((claim: any) => (
                                        <Card key={claim.id}>
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">Claim #{claim.claimId}</p>
                                                    <p className="text-sm text-gray-500">{new Date(claim.dateOfIncident).toLocaleDateString()}</p>
                                                </div>
                                                <Badge variant={claim.status === 'Approved' ? 'default' : 'secondary'}>{claim.status}</Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500">No claims found.</p>}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <p className="text-center text-red-500">Failed to load data</p>
                )}
            </DialogContent>
        </Dialog>
    );
};

const InfoItem = ({ label, value }: { label: string, value: any }) => (
    <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
    </div>
);

export default ViewFarmerDialog;

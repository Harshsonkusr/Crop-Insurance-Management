import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';

interface ViewInsurerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    insurerId: string | null;
}

const ViewInsurerDialog: React.FC<ViewInsurerDialogProps> = ({ open, onOpenChange, insurerId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && insurerId) {
            fetchInsurerDetails();
        } else {
            setData(null);
        }
    }, [open, insurerId]);

    const fetchInsurerDetails = async () => {
        try {
            setLoading(true);
            // Fetch user details which includes insurer relation
            try {
                const response = await api.get(`/admin/users/${insurerId}`);
                setData(response.data);
            } catch (userErr: any) {
                // If user fetch fails with 404, maybe it's actually an insurer ID
                if (userErr.response?.status === 404) {
                    const insResponse = await api.get(`/admin/insurers/${insurerId}`);
                    // If we get an insurer object, the dialog template expects a data structure:
                    // { ...user, insurer: { ...insurer } }
                    // backend /insurers/:id includes { ...insurer, user: { ...user } }
                    if (insResponse.data && insResponse.data.user) {
                        const { user, ...insurer } = insResponse.data;
                        setData({ ...user, insurer });
                    } else {
                        throw userErr; // Rethrow original error if fallback also fails
                    }
                } else {
                    throw userErr;
                }
            }
        } catch (error) {
            console.error("Error fetching insurer details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Insurer Profile Details
                    </DialogTitle>
                    <DialogDescription>
                        Registration and company information
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : data ? (
                    <Tabs defaultValue="company" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="company">Company Info</TabsTrigger>
                            <TabsTrigger value="registration">Registration Data</TabsTrigger>
                        </TabsList>

                        <TabsContent value="company" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Company Name" value={data.insurer?.name || data.name} />
                                <InfoItem label="Email" value={data.email} />
                                <InfoItem label="Phone" value={data.mobileNumber || data.insurer?.phone} />
                                <InfoItem label="Address" value={data.insurer?.address} />
                                <InfoItem label="State" value={data.insurer?.state} />
                                <InfoItem label="District" value={data.insurer?.district} />
                                <InfoItem label="Service Type" value={data.insurer?.serviceType} />
                                <InfoItem label="Service Area" value={data.insurer?.serviceArea} />
                            </div>
                        </TabsContent>

                        <TabsContent value="registration" className="space-y-4 pt-4">
                            <Card>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                    <InfoItem label="Business Name" value={data.insurer?.businessName} />
                                    <InfoItem label="GST Number" value={data.insurer?.gstNumber} />
                                    <InfoItem label="PAN Number" value={data.insurer?.panNumber} />
                                    <InfoItem label="License Number" value={data.insurer?.licenseNumber} />
                                    <InfoItem label="License Expiry" value={data.insurer?.licenseExpiryDate ? new Date(data.insurer.licenseExpiryDate).toLocaleDateString() : '-'} />
                                    <InfoItem label="AI Certified" value={data.insurer?.aiCertified ? 'Yes' : 'No'} />

                                    <div className="col-span-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">Verification Status</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {data.isApproved ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Approved
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                                                            Under Review
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">Account Status</p>
                                                <Badge variant={data.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                                                    {data.status?.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {data.insurer?.serviceDescription && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Service Description</p>
                                    <p className="text-sm bg-gray-50 p-3 rounded-lg border">{data.insurer.serviceDescription}</p>
                                </div>
                            )}
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
        <p className="text-sm font-medium text-gray-900 truncate" title={value?.toString()}>{value || '-'}</p>
    </div>
);

export default ViewInsurerDialog;

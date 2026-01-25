import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface PaymentGatewayModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    amount: number;
    onSuccess: (transactionId: string) => void;
    onCancel: () => void;
}

const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
    open,
    onOpenChange,
    amount,
    onSuccess,
    onCancel
}) => {
    const [processing, setProcessing] = useState(false);
    const [method, setMethod] = useState('upi');
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
    const [error, setError] = useState<string | null>(null);

    // Reset state when opened
    useEffect(() => {
        if (open) {
            setStep('details');
            setProcessing(false);
            setError(null);
        }
    }, [open]);

    const handlePayment = () => {
        setProcessing(true);
        setError(null);
        setStep('processing');

        // Simulate processing delay
        setTimeout(() => {
            // 90% success rate simulation
            if (Math.random() > 0.1) {
                setStep('success');
                // Auto close after success
                setTimeout(() => {
                    const mockTxnId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    onSuccess(mockTxnId);
                }, 1500);
            } else {
                setStep('details');
                setProcessing(false);
                setError('Payment Failed. Bank server timeout. Please try again.');
            }
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val && step === 'processing') return; // Prevent closing while processing
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Secure Payment Gateway
                    </DialogTitle>
                    <DialogDescription>
                        Complete your premium payment of ₹{amount.toLocaleString('en-IN')}
                    </DialogDescription>
                </DialogHeader>

                {step === 'details' && (
                    <div className="space-y-4 py-2">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600 text-sm">Policy Premium</span>
                                <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>GST (18%)</span>
                                <span>₹{Math.round(amount * 0.18).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="border-t border-blue-200 my-2 pt-2 flex justify-between items-center font-bold text-blue-800">
                                <span>Total Payable</span>
                                <span>₹{Math.round(amount * 1.18).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <Tabs defaultValue="upi" value={method} onValueChange={setMethod}>
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="upi">
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    UPI / QR
                                </TabsTrigger>
                                <TabsTrigger value="card">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Card
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="upi" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vpa">Virtual Payment Address (VPA)</Label>
                                    <Input id="vpa" placeholder="examples@upi" defaultValue="farmer@upi" />
                                </div>
                                <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-2">Scan QR Code</p>
                                    <div className="h-32 w-32 bg-gray-200 mx-auto rounded flex items-center justify-center">
                                        <Smartphone className="h-8 w-8 text-gray-400" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="card" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Card Number</Label>
                                    <Input placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Expiry</Label>
                                        <Input placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CVV</Label>
                                        <Input type="password" placeholder="123" maxLength={3} />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="py-12 text-center space-y-4">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                        <div>
                            <h3 className="text-lg font-semibold">Processing Payment...</h3>
                            <p className="text-sm text-gray-500">Please do not close this window</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8 text-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
                            <p className="text-sm text-gray-500">Redirecting back...</p>
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-between">
                    {step === 'details' && (
                        <>
                            <Button variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handlePayment} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                Pay ₹{Math.round(amount * 1.18).toLocaleString('en-IN')}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentGatewayModal;

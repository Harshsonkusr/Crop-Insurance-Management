import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import api from '../../lib/api';

const ForgotPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [demoLink, setDemoLink] = useState<string | null>(null);

    // Mode: 'request' (enter email) or 'reset' (enter new password)
    const mode = token ? 'reset' : 'request';

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        setDemoLink(null);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSuccess(res.data.message);
            // For demo purposes, display the link
            if (res.data.demoResetLink) {
                setDemoLink(res.data.demoResetLink);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">
                        {mode === 'request' ? 'Forgot Password' : 'Reset Password'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {mode === 'request'
                            ? 'Enter your email to receive a password reset link'
                            : 'Enter your new password below'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    {demoLink && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                            <p className="font-semibold text-blue-800 mb-1">Demo Mode:</p>
                            <p className="text-blue-700">Click this link to simulate clicking the email link:</p>
                            <a href={demoLink} className="text-blue-600 underline break-all mt-1 block font-mono bg-white p-2 rounded border border-blue-100">
                                {demoLink}
                            </a>
                        </div>
                    )}

                    {mode === 'request' ? (
                        <form onSubmit={handleRequestReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading || !!success}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || !!success}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || !!success}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Set New Password'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 flex items-center justify-center gap-1">
                            <ArrowLeft className="h-3 w-3" /> Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;

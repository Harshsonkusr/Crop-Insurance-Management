import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, Mail, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from '../../lib/api';

interface PendingUser {
  _id: string;
  name: string;
  email?: string;
  mobileNumber?: string;
  role: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  businessName?: string;
  address?: string;
}

const AdminPendingRegistrations = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users/pending');
      setPendingUsers(response.data.users || []);
    } catch (err: any) {
      console.error('Error fetching pending users:', err);
      setError(err?.response?.data?.message || 'Failed to fetch pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to approve this Insurer registration?')) {
      return;
    }

    setProcessingId(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`, { approved: true });
      alert('Insurer approved successfully!');
      fetchPendingUsers();
    } catch (err: any) {
      console.error('Error approving user:', err);
      alert(err?.response?.data?.message || 'Failed to approve registration.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setPendingRejectId(userId);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!pendingRejectId) return;
    const userId = pendingRejectId;
    setProcessingId(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`, {
        approved: false,
        rejectionReason: rejectReason.trim() || 'Registration rejected by administrator'
      });
      alert('Insurer registration rejected.');
      fetchPendingUsers();
    } catch (err: any) {
      console.error('Error rejecting user:', err);
      alert(err?.response?.data?.message || 'Failed to reject registration.');
    } finally {
      setProcessingId(null);
      setPendingRejectId(null);
      setRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Security Clearing House</h1>
            <p className="text-gray-500 mt-1 font-medium italic">High-precision vetting of corporate entity credentials for ecosystem access.</p>
          </div>
          <Link
            to="/admin-dashboard/insurers"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Insurers
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pending Users List - Standardized Table */}
        {pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No pending registrations</p>
              <p className="text-gray-500 mt-2">
                All Insurer registrations have been processed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-600 border-b border-amber-700">
                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Insurer / Contact</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Business Details</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Registered On</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-white uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white/40">
                  {pendingUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-amber-50/50 transition-all group border-l-4 border-transparent hover:border-amber-500">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200 shadow-sm group-hover:scale-110 transition-transform">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{user.name}</span>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {user.email && (
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  <span>{user.email}</span>
                                </div>
                              )}
                              {user.mobileNumber && (
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                  <Smartphone className="h-3 w-3" />
                                  <span>{user.mobileNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">{user.businessName || 'No Business Name'}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]" title={user.address}>
                            {user.address || 'No Address Provided'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleApprove(user._id)}
                            disabled={processingId === user._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 px-3 text-[11px] font-bold uppercase tracking-tight"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            {processingId === user._id ? '...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => handleReject(user._id)}
                            disabled={processingId === user._id}
                            variant="destructive"
                            size="sm"
                            className="h-8 px-3 text-[11px] font-bold uppercase tracking-tight"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Insurer</AlertDialogTitle>
            <AlertDialogDescription>
              Optionally provide a reason for rejection. This will be stored with the request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={processingId !== null}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};

export default AdminPendingRegistrations;

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
    if (!window.confirm('Are you sure you want to approve this Service Provider registration?')) {
      return;
    }

    setProcessingId(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`, { approved: true });
      alert('Service Provider approved successfully!');
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
      alert('Service Provider registration rejected.');
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
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Registrations
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve Service Provider registrations
          </p>
        </div>
        <Link
          to="/admin-dashboard/service-providers"
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Service Providers
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Pending Users List */}
      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No pending registrations</p>
            <p className="text-gray-500 mt-2">
              All Service Provider registrations have been processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <Card key={user._id} className="border-yellow-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Registered {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Approval
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{user.email}</span>
                    </div>
                  )}
                  {user.mobileNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{user.mobileNumber}</span>
                    </div>
                  )}
                  {user.businessName && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Business: </span>
                      <span className="text-gray-900 font-medium">{user.businessName}</span>
                    </div>
                  )}
                </div>
                {user.address && (
                  <div className="mb-4 text-sm">
                    <span className="text-gray-500">Address: </span>
                    <span className="text-gray-900">{user.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(user._id)}
                    disabled={processingId === user._id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingId === user._id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleReject(user._id)}
                    disabled={processingId === user._id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Service Provider</AlertDialogTitle>
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

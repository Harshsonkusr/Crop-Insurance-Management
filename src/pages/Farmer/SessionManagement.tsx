import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Monitor, Smartphone, Tablet, Laptop, LogOut, Trash2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import logger from '../../utils/logger';

interface Session {
  id: string;
  deviceInfo?: {
    device?: string;
    os?: string;
    browser?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  status: string;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/sessions');
      setSessions(response.data || []);
      logger.farmer.system('Fetched active sessions', { count: response.data?.length || 0 });
    } catch (err: any) {
      logger.farmer.error('Error fetching sessions', { error: err });
      setError(err?.response?.data?.message || 'Failed to fetch sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setRevokeDialogOpen(true);
  };

  const confirmRevokeSession = async () => {
    if (!selectedSessionId) return;

    try {
      setProcessing(true);
      await api.delete(`/sessions/${selectedSessionId}`);
      logger.farmer.system('Session revoked', { sessionId: selectedSessionId });
      setRevokeDialogOpen(false);
      fetchSessions();
    } catch (err: any) {
      logger.farmer.error('Error revoking session', { error: err });
      setError(err?.response?.data?.message || 'Failed to revoke session.');
    } finally {
      setProcessing(false);
      setSelectedSessionId(null);
    }
  };

  const handleRevokeAll = () => {
    setRevokeAllDialogOpen(true);
  };

  const confirmRevokeAll = async () => {
    try {
      setProcessing(true);
      await api.post('/sessions/revoke-all');
      logger.farmer.system('All sessions revoked');
      setRevokeAllDialogOpen(false);
      // Redirect to login after revoking all sessions
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err: any) {
      logger.farmer.error('Error revoking all sessions', { error: err });
      setError(err?.response?.data?.message || 'Failed to revoke all sessions.');
    } finally {
      setProcessing(false);
    }
  };

  const getDeviceIcon = (deviceInfo?: any) => {
    const device = deviceInfo?.device?.toLowerCase() || '';
    if (device.includes('mobile') || device.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (device.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    } else if (device.includes('laptop') || device.includes('desktop')) {
      return <Laptop className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceName = (session: Session) => {
    if (session.deviceInfo?.device) {
      return session.deviceInfo.device;
    }
    if (session.userAgent) {
      if (session.userAgent.includes('Mobile')) return 'Mobile Device';
      if (session.userAgent.includes('Tablet')) return 'Tablet';
      return 'Desktop';
    }
    return 'Unknown Device';
  };

  const isCurrentSession = (session: Session) => {
    // Check if this is likely the current session (most recent active session)
    const activeSessions = sessions.filter(s => s.status === 'active');
    if (activeSessions.length > 0) {
      const mostRecent = activeSessions.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      )[0];
      return session.id === mostRecent.id;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="h-8 w-8 text-green-600" />
            Active Sessions
          </h1>
          <p className="text-gray-600 mt-1">Manage your active sessions across devices</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleRevokeAll}
          disabled={sessions.filter(s => s.status === 'active').length === 0}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout Everywhere
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-gray-400">
                      {getDeviceIcon(session.deviceInfo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{getDeviceName(session)}</h3>
                        {isCurrentSession(session) && (
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        )}
                        <Badge className={session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>IP: {session.ipAddress || 'Unknown'}</p>
                        <p>Last activity: {new Date(session.lastActivity).toLocaleString()}</p>
                        <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  {session.status === 'active' && !isCurrentSession(session) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Session Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this session? The device will be logged out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevokeSession}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? 'Revoking...' : 'Revoke Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Dialog */}
      <AlertDialog open={revokeAllDialogOpen} onOpenChange={setRevokeAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Everywhere</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out from all devices. You will need to log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevokeAll}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? 'Logging out...' : 'Logout Everywhere'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionManagement;


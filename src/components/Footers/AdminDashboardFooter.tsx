import { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

const AdminDashboardFooter = () => {
  const currentYear = new Date().getFullYear();
  const [version] = useState('1.0.0');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    // Set initial sync time
    const updateSyncTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short',
      });
      setLastSyncTime(formatted);
    };

    updateSyncTime();
    
    // Update sync time every minute (optional - can be removed if not needed)
    const interval = setInterval(updateSyncTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    const now = new Date();
    const formatted = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short',
    });
    setLastSyncTime(formatted);
    // In a real app, this would trigger a data sync
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 lg:px-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
          <span>© {currentYear} Smart Crop Claim Assist (ClaimEasy) – Admin Console</span>
          <span className="hidden lg:inline">|</span>
          <span>Version {version}</span>
          {lastSyncTime && (
            <>
              <span className="hidden lg:inline">|</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span>Last data sync: {lastSyncTime}</span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
          title="Refresh sync time"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center lg:text-left">
        <p>This system is for authorized personnel only. Unauthorized access is prohibited.</p>
      </div>
    </footer>
  );
};

export default AdminDashboardFooter;


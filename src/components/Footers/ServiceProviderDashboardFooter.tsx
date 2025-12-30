import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';
import api from '../../lib/api';

const ServiceProviderDashboardFooter = () => {
  const currentYear = new Date().getFullYear();
  const [version] = useState('1.0.0');
  const { user } = useAuth();
  const [region, setRegion] = useState<string>('Not Assigned');

  useEffect(() => {
    // Fetch service provider details to get region
    const fetchSPDetails = async () => {
      try {
        // Try to get SP profile which might have region/area info
        const response = await api.get('/service-provider/profile').catch(() => null);
        const profile = response?.data?.profile || response?.data;
        const coverage = profile?.coverageAreas?.[0];
        const regionText = coverage?.district || coverage?.state || profile?.registeredOffice?.reg_state;
        if (regionText) setRegion(regionText);
      } catch (err) {
        // If API fails, use default or keep "Not Assigned"
        console.log('Could not fetch SP region, using default');
      }
    };

    if (user?.role === 'SERVICE_PROVIDER') {
      fetchSPDetails();
    }
  }, [user]);

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span>© {currentYear} ClaimEasy – Service Provider Panel</span>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span>Region: {region}</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <span>Version {version}</span>
        </div>
      </div>
    </footer>
  );
};

export default ServiceProviderDashboardFooter;


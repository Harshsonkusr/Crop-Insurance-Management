import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const FarmerDashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>© {currentYear} ClaimEasy – Farmer Portal</span>
          <span className="hidden sm:inline">|</span>
          <span className="text-gray-500">Need help? Contact your Service Provider or District Office.</span>
        </div>
        <Link
          to="/farmer-dashboard/support"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </Link>
      </div>
    </footer>
  );
};

export default FarmerDashboardFooter;


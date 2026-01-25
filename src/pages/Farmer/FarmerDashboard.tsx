import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Shield,
  MapPin,
  Settings,
  HelpCircle,
  BookOpen,
  PlusCircle,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '@/components/Auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FarmerDashboardFooter from '@/components/Footers/FarmerDashboardFooter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from '../../lib/api';
import { useUserPreferences } from '../../hooks/useUserPreferences';

const FarmerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { preferences, updateSidebarState } = useUserPreferences();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load sidebar state from preferences
  useEffect(() => {
    if (preferences) {
      setIsSidebarOpen(preferences.sidebarOpen);
    }
  }, [preferences]);

  // Update sidebar state in backend
  const handleSidebarToggle = (newState: boolean) => {
    setIsSidebarOpen(newState);
    updateSidebarState(newState).catch(err => {
      console.error('Error updating sidebar state:', err);
    });
  };

  useEffect(() => {
    // Fetch pending claims count
    const fetchPendingCount = async () => {
      try {
        const response = await api.get('/claims/my-claims');
        const claims = Array.isArray(response.data) ? response.data : [];
        const pending = claims.filter((c: any) =>
          c.status === 'pending' || c.status === 'under_review' || c.status === 'submitted'
        ).length;
        setPendingClaimsCount(pending);
      } catch (err) {
        console.error('Error fetching claims count:', err);
      }
    };
    fetchPendingCount();
  }, []);

  const navLinks = [
    {
      name: 'Dashboard',
      path: '/farmer-dashboard/overview',
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      name: 'Submit Claim',
      path: '/farmer-dashboard/submit-claim',
      icon: <PlusCircle className="h-5 w-5" />,
      highlight: true
    },
    {
      name: 'My Claims',
      path: '/farmer-dashboard/my-claims',
      icon: <FileText className="h-5 w-5" />,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined
    },
    {
      name: 'My Policies',
      path: '/farmer-dashboard/my-policies',
      icon: <Shield className="h-5 w-5" />
    },
    {
      name: 'Resources',
      path: '/farmer-dashboard/resources',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: 'Support',
      path: '/farmer-dashboard/support',
      icon: <HelpCircle className="h-5 w-5" />
    },
    {
      name: 'Settings',
      path: '/farmer-dashboard/profile-settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  const isActive = (link: typeof navLinks[0]) => {
    if (link.exact) {
      return location.pathname === link.path;
    }
    return location.pathname.startsWith(link.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-gradient-to-b from-green-600 to-green-700 shadow-xl transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo/Brand */}
        <div className={`p-4 border-b border-green-500/30 ${isSidebarOpen ? 'flex items-center justify-between' : 'flex flex-col items-center gap-2'}`}>
          {isSidebarOpen ? (
            <>
              <Logo variant="sidebar" className="flex-shrink-0" />
              <button
                onClick={() => handleSidebarToggle(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                aria-label="Toggle sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Logo variant="icon" className="mx-auto" />
              <button
                onClick={() => handleSidebarToggle(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                  ? 'bg-white text-green-700 shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
                  } ${link.highlight ? 'border-2 border-yellow-400' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={active ? 'text-green-700' : 'text-white'}>
                  {link.icon}
                </span>
                {isSidebarOpen && (
                  <>
                    <span className="flex-1 font-medium">{link.name}</span>
                    {link.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {link.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section - Only when sidebar is expanded */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name || 'Farmer'}</p>
                <p className="text-white/70 text-xs truncate">Farmer</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to login again to access your dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <Logo variant="navbar" className="!bg-transparent" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {pendingClaimsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Profile Dropdown - Only show when sidebar is collapsed */}
            {!isSidebarOpen && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'F'}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || 'Farmer'}</p>
                      <p className="text-xs text-gray-500">Farmer</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/farmer-dashboard/profile-settings" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/farmer-dashboard/profile-settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will need to login again to access your dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                          Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-b from-green-600 to-green-700 shadow-xl">
              <div className="p-4 border-b border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user?.name || 'Farmer'}</p>
                    <p className="text-white/70 text-xs">Farmer</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {navLinks.map((link) => {
                  const active = isActive(link);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                        ? 'bg-white text-green-700'
                        : 'text-white/90 hover:bg-white/10'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.icon}
                      <span className="flex-1 font-medium">{link.name}</span>
                      {link.badge && (
                        <Badge variant="destructive">{link.badge}</Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-green-500/30">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will need to login again to access your dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <FarmerDashboardFooter />
      </div>
    </div>
  );
};

export default FarmerDashboard;

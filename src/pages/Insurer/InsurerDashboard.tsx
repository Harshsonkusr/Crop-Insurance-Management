import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Home, FileText, Users, HardHat, BarChart2, Settings, ScrollText, MessageSquare, Bell, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import Logo from '../../components/Logo';
import InsurerDashboardFooter from '@/components/Footers/InsurerDashboardFooter';
import { useAuth } from '@/components/Auth/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
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
} from "@/components/ui/alert-dialog";

const InsurerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { preferences, updateSidebarState } = useUserPreferences();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    setIsLogoutDialogOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/insurer-dashboard', icon: (<Home className="h-6 w-6" />) },
    { name: 'Farmer Management', path: '/insurer-dashboard/farmer-management', icon: (<Users className="h-6 w-6" />) },
    { name: 'Policy Management', path: '/insurer-dashboard/policy-management', icon: (<FileText className="h-6 w-6" />) },
    { name: 'Claim Management', path: '/insurer-dashboard/claim-management', icon: (<ScrollText className="h-6 w-6" />) },
    { name: 'Reports Management', path: '/insurer-dashboard/reports-management', icon: (<BarChart2 className="h-6 w-6" />) },
    { name: 'Settings', path: '/insurer-dashboard/settings', icon: (<Settings className="h-6 w-6" />) },
  ];

  const isActive = (path: string) => {
    if (path === '/insurer-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-sp-off-white">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col bg-purple-700 shadow-md transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo/Brand */}
        <div className={`p-4 border-b border-white/20 ${isSidebarOpen ? 'flex items-center justify-between' : 'flex flex-col items-center gap-2'}`}>
          {isSidebarOpen ? (
            <>
              <Logo variant="sidebar" className="flex-shrink-0" />
              <button
                onClick={() => handleSidebarToggle(!isSidebarOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
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
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 overflow-y-auto px-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center py-2.5 px-4 rounded-lg transition duration-200 text-white hover:bg-purple-800 transform hover:-translate-y-1 hover:scale-105 mb-2 ${isActive(link.path) ? 'bg-purple-800' : ''
                }`}
            >
              {link.icon}
              {isSidebarOpen && <span className="ml-3">{link.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section - Only when sidebar is expanded */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'SP'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name || 'Insurer'}</p>
                <p className="text-white/70 text-xs truncate">Insurer</p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown - Only show when sidebar is collapsed */}
            {!isSidebarOpen && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'SP'}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || 'Insurer'}</p>
                      <p className="text-xs text-gray-500">Insurer</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/insurer-dashboard/settings" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/insurer-dashboard/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-64 bg-purple-700 shadow-xl">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'SP'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user?.name || 'Insurer'}</p>
                    <p className="text-white/70 text-xs">Insurer</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-white ${isActive(link.path)
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span className="flex-1 font-medium">{link.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-white/20">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 overflow-y-auto flex-grow">
          <Outlet />
        </main>

        {/* Footer */}
        <InsurerDashboardFooter />
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the Insurer dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InsurerDashboard;

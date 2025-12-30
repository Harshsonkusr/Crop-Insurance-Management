import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Contact from "./pages/public/Contact";
import NotFound from "./pages/public/NotFound";
import Login from "./components/Auth/Login";
import ServiceProviderSignup from "./pages/public/ServiceProviderSignup";
import FarmerSignup from "./pages/public/FarmerSignup";
import { AuthProvider } from "./components/Auth/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import FarmerDashboardOverview from "./pages/Farmer/FarmerDashboardOverview";
import FarmerDashboard from "./pages/Farmer/FarmerDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ServiceProviderDashboard from "./pages/ServiceProvider/ServiceProviderDashboard";
import ClaimSubmission from "./pages/Farmer/ClaimSubmission";
import ClaimTracking from './pages/Farmer/ClaimTracking';
import PolicyManagement from './pages/Farmer/PolicyManagement';
import PolicyRequest from './pages/Farmer/PolicyRequest';
import PolicyComparison from './pages/Farmer/PolicyComparison';
import FarmDetailsManagement from './pages/Farmer/FarmDetailsManagement';
import ProfileSettings from './pages/Farmer/ProfileSettings';
import Support from './pages/Farmer/Support';
import FarmerViewDetails from './pages/Farmer/FarmerViewDetails';
import Resources from './pages/Farmer/Resources';
import FarmerSessionManagement from './pages/Farmer/SessionManagement';
import AdminDashboardOverview from "./pages/Admin/AdminDashboardOverview";
import AdminClaimsManagement from "./pages/Admin/AdminClaimsManagement";
import AdminUsersManagement from "./pages/Admin/AdminUsersManagement";
import AdminServiceProvidersManagement from "./pages/Admin/AdminServiceProvidersManagement";
import AdminReportsAnalytics from "./pages/Admin/AdminReportsAnalytics";
import AdminSystemSettings from "./pages/Admin/AdminSystemSettings";
import AdminAuditLog from "./pages/Admin/AdminAuditLog";
import AdminClaimDetails from "./pages/Admin/AdminClaimDetails";
import AdminAddEditUser from "./pages/Admin/AdminAddEditUser";
import AdminEditServiceProvider from "./pages/Admin/AdminEditServiceProvider";
import AdminAddServiceProvider from "./pages/Admin/AdminAddServiceProvider";
import AdminPendingRegistrations from "./pages/Admin/AdminPendingRegistrations";
import ServiceProviderDashboardOverview from "./pages/ServiceProvider/ServiceProviderDashboardOverview";
import ServiceProviderClaimsManagement from "./pages/ServiceProvider/ServiceProviderClaimsManagement";
import ServiceProviderClaimDetails from "./pages/ServiceProvider/ServiceProviderClaimDetails";
import ServiceProviderAddCrop from "./pages/ServiceProvider/ServiceProviderAddCrop";
import ServiceProviderFarmerManagement from "./pages/ServiceProvider/ServiceProviderFarmerManagement";
import ServiceProviderAddFarmer from "./pages/ServiceProvider/ServiceProviderAddFarmer";
import ServiceProviderPolicyManagement from "./pages/ServiceProvider/ServiceProviderPolicyManagement";
import ServiceProviderReportsManagement from "./pages/ServiceProvider/ServiceProviderReportsManagement";
import ServiceProviderSettings from "./pages/ServiceProvider/ServiceProviderSettings";
import ServiceProviderAddPolicy from "./pages/ServiceProvider/ServiceProviderAddPolicy";
import ServiceProviderViewDetail from "./pages/ServiceProvider/ServiceProviderViewDetail";
import ServiceProviderSessionManagement from "./pages/ServiceProvider/SessionManagement";
import AdminSessionManagement from "./pages/Admin/SessionManagement";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideNavAndFooter = 
    location.pathname === "/login" ||
    location.pathname.startsWith("/farmer-dashboard") ||
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/service-provider-dashboard") ||
    location.pathname.startsWith("/signup");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!hideNavAndFooter && <Navbar />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/farmer" element={<FarmerSignup />} />
            <Route path="/signup/service-provider" element={<ServiceProviderSignup />} />
            <Route path="/farmer/claim-submission/:claimId" element={<ClaimSubmission />} />
            <Route
              path="/farmer-dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<FarmerDashboardOverview />} />
              <Route path="overview" element={<FarmerDashboardOverview />} />
              <Route path="submit-claim" element={<ClaimSubmission />} />
            <Route path="my-claims" element={<ClaimTracking />} />
            <Route path="my-policies" element={<PolicyManagement />} />
            <Route path="policy-comparison" element={<PolicyComparison />} />
            <Route path="policy-request" element={<PolicyRequest />} />
            <Route path="farm-details" element={<FarmDetailsManagement />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
            <Route path="session-management" element={<FarmerSessionManagement />} />
            <Route path="support" element={<Support />} />
            <Route path="resources" element={<Resources />} />
            <Route path="view-details/:type/:id" element={<FarmerViewDetails />} />
            </Route>
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardOverview />} />
              <Route path="overview" element={<AdminDashboardOverview />} />
              <Route path="claims" element={<AdminClaimsManagement />} />
              <Route path="claims/:claimId" element={<AdminClaimDetails />} />
              <Route path="users" element={<AdminUsersManagement />} />
              <Route path="users/pending" element={<AdminPendingRegistrations />} />
              <Route path="users/add" element={<AdminAddEditUser />} />
              <Route path="users/edit/:userId" element={<AdminAddEditUser />} />
              <Route path="service-providers" element={<AdminServiceProvidersManagement />} />
              <Route path="service-providers/:providerId" element={<AdminEditServiceProvider />} />
              <Route path="service-providers/add" element={<AdminAddServiceProvider />} />
            <Route path="reports" element={<AdminReportsAnalytics />} />
            <Route path="settings" element={<AdminSystemSettings />} />
            <Route path="session-management" element={<AdminSessionManagement />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
            </Route>
            <Route
              path="/service-provider-dashboard"
              element={
                <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
                  <ServiceProviderDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<ServiceProviderDashboardOverview />} />
              <Route path="overview" element={<ServiceProviderDashboardOverview />} />
              <Route path="claim-management" element={<ServiceProviderClaimsManagement />} />
            <Route path="claims/:claimId" element={<ServiceProviderClaimDetails />} />
            <Route path="claims/:claimId/edit" element={<ServiceProviderClaimDetails />} />
            <Route path="crop-management/add" element={<ServiceProviderAddCrop />} />
            <Route path="crop-management/edit" element={<ServiceProviderAddCrop />} />
            <Route path="farmer-management" element={<ServiceProviderFarmerManagement />} />
            <Route path="farmer-management/add" element={<ServiceProviderAddFarmer />} />
            <Route path="farmer-management/edit/:farmerId" element={<ServiceProviderAddFarmer />} />
            <Route path="policy-management" element={<ServiceProviderPolicyManagement />} />
            <Route path="policy-management/add" element={<ServiceProviderAddPolicy />} />
            <Route path="policy-management/edit/:policyId" element={<ServiceProviderAddPolicy />} />
            <Route path="session-management" element={<ServiceProviderSessionManagement />} />
            <Route path="reports-management" element={<ServiceProviderReportsManagement />} />
            <Route path="settings" element={<ServiceProviderSettings />} />
            <Route path="view-detail/:entityType/:id" element={<ServiceProviderViewDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!hideNavAndFooter && <Footer />}
      </div>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

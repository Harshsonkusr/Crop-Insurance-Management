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
import ForgotPassword from "./pages/public/ForgotPassword";
import InsurerSignup from "./pages/public/InsurerSignup";
import FarmerSignup from "./pages/public/FarmerSignup";
import { AuthProvider } from "./components/Auth/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import FarmerDashboardOverview from "./pages/Farmer/FarmerDashboardOverview";
import FarmerDashboard from "./pages/Farmer/FarmerDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import InsurerDashboard from "./pages/Insurer/InsurerDashboard";
import ClaimSubmission from "./pages/Farmer/ClaimSubmission";
import ClaimTracking from './pages/Farmer/ClaimTracking';
import PolicyManagement from './pages/Farmer/PolicyManagement';
import PolicyRequest from './pages/Farmer/PolicyRequest';
import PolicyComparison from './pages/Farmer/PolicyComparison';
import ProfileSettings from './pages/Farmer/ProfileSettings';
import Support from './pages/Farmer/Support';
import FarmerViewDetails from './pages/Farmer/FarmerViewDetails';
import Resources from './pages/Farmer/Resources';
import FarmerSessionManagement from './pages/Farmer/SessionManagement';
import AdminDashboardOverview from "./pages/Admin/AdminDashboardOverview";
import AdminClaimsManagement from "./pages/Admin/AdminClaimsManagement";
import AdminUsersManagement from "./pages/Admin/AdminUsersManagement";
import AdminInsurersManagement from "./pages/Admin/AdminInsurersManagement";
import AdminReportsAnalytics from "./pages/Admin/AdminReportsAnalytics";
import AdminSystemSettings from "./pages/Admin/AdminSystemSettings";
import AdminAuditLog from "./pages/Admin/AdminAuditLog";
import AdminClaimDetails from "./pages/Admin/AdminClaimDetails";
import AdminAddEditUser from "./pages/Admin/AdminAddEditUser";
import AdminEditInsurer from "./pages/Admin/AdminEditInsurer";
import AdminAddInsurer from "./pages/Admin/AdminAddInsurer";
import AdminPendingRegistrations from "./pages/Admin/AdminPendingRegistrations";
import InsurerDashboardOverview from "./pages/Insurer/InsurerDashboardOverview";
import InsurerClaimsManagement from "./pages/Insurer/InsurerClaimsManagement";
import InsurerClaimDetails from "./pages/Insurer/InsurerClaimDetails";
import InsurerAddCrop from "./pages/Insurer/InsurerAddCrop";
import InsurerFarmerManagement from "./pages/Insurer/InsurerFarmerManagement";
import InsurerAddFarmer from "./pages/Insurer/InsurerAddFarmer";
import InsurerPolicyManagement from "./pages/Insurer/InsurerPolicyManagement";
import InsurerReportsManagement from "./pages/Insurer/InsurerReportsManagement";
import InsurerSettings from "./pages/Insurer/InsurerSettings";
import InsurerAddPolicy from "./pages/Insurer/InsurerAddPolicy";
import InsurerViewDetail from "./pages/Insurer/InsurerViewDetail";
import InsurerSessionManagement from "./pages/Insurer/InsurerSessionManagement";
import AdminSessionManagement from "./pages/Admin/SessionManagement";

import AdminViewDetail from "./pages/Admin/AdminViewDetail";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideNavAndFooter =
    location.pathname === "/login" ||
    location.pathname.startsWith("/farmer-dashboard") ||
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/insurer-dashboard") ||
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ForgotPassword />} />
            <Route path="/signup/farmer" element={<FarmerSignup />} />
            <Route path="/signup/insurer" element={<InsurerSignup />} />
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
              {/* Farm Details consolidated into Profile Settings */}
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
              <Route path="insurers" element={<AdminInsurersManagement />} />
              <Route path="insurers/:providerId" element={<AdminEditInsurer />} />
              <Route path="insurers/add" element={<AdminAddInsurer />} />
              <Route path="reports" element={<AdminReportsAnalytics />} />
              <Route path="settings" element={<AdminSystemSettings />} />
              <Route path="session-management" element={<AdminSessionManagement />} />
              <Route path="audit-log" element={<AdminAuditLog />} />
              <Route path="view-detail/:entityType/:id" element={<AdminViewDetail />} />
            </Route>
            <Route
              path="/insurer-dashboard"
              element={
                <ProtectedRoute allowedRoles={["INSURER"]}>
                  <InsurerDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<InsurerDashboardOverview />} />
              <Route path="overview" element={<InsurerDashboardOverview />} />
              <Route path="claim-management" element={<InsurerClaimsManagement />} />
              <Route path="claims/:claimId" element={<InsurerClaimDetails />} />
              <Route path="claims/:claimId/edit" element={<InsurerClaimDetails />} />
              <Route path="crop-management/add" element={<InsurerAddCrop />} />
              <Route path="crop-management/edit" element={<InsurerAddCrop />} />
              <Route path="farmer-management" element={<InsurerFarmerManagement />} />
              <Route path="farmer-management/add" element={<InsurerAddFarmer />} />
              <Route path="farmer-management/edit/:farmerId" element={<InsurerAddFarmer />} />
              <Route path="policy-management" element={<InsurerPolicyManagement />} />
              <Route path="policy-management/add" element={<InsurerAddPolicy />} />
              <Route path="policy-management/edit/:policyId" element={<InsurerAddPolicy />} />
              <Route path="session-management" element={<InsurerSessionManagement />} />
              <Route path="reports-management" element={<InsurerReportsManagement />} />
              <Route path="settings" element={<InsurerSettings />} />
              <Route path="view-detail/:entityType/:id" element={<InsurerViewDetail />} />
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

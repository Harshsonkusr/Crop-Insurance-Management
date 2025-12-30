import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // SUPER_ADMIN has access to all ADMIN routes
  const hasAccess = allowedRoles.includes(user.role) || 
                    (user.role === 'SUPER_ADMIN' && allowedRoles.includes('ADMIN'));

  if (!user.role || !hasAccess) {
    // User logged in but does not have the allowed role, redirect to a suitable page (e.g., home or unauthorized)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
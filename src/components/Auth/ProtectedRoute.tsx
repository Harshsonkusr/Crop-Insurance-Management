import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    // User logged in but does not have the allowed role, redirect to a suitable page (e.g., home or unauthorized)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
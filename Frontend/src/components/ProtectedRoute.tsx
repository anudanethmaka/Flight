import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home or specific dashboard if role not allowed
    if (user.role === 'Administrator') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (user.role === 'Staff') {
      return <Navigate to="/dashboard/staff" replace />;
    } else {
      return <Navigate to="/dashboard/passenger" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

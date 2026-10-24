import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards private routes in the application.
 * - Displays a loading indicator while auth status is being determined.
 * - Redirects unauthenticated users to the /login page.
 * - Renders the requested protected component if the user is authenticated.
 */
function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  // 1. Show loading indicator while authentication status is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 font-medium text-lg">
          Loading...
        </div>
      </div>
    );
  }

  // 2. If user is not authenticated, redirect to /login
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user is authenticated, render requested content
  return children ? children : <Outlet />;
}

export default ProtectedRoute;

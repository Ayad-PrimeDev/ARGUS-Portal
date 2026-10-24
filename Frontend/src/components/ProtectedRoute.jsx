import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards private routes in the application.
 * - Displays a loading indicator while auth status is being determined.
 * - Redirects unauthenticated users to the /login page with redirect param.
 * - Renders the requested protected component if the user is authenticated.
 */
function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Show loading indicator while authentication status is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5]">
        <div className="text-[#5C645E] font-medium text-sm">
          Loading...
        </div>
      </div>
    );
  }

  // 2. If user is not authenticated, redirect to /login with redirect parameter
  if (!isAuthenticated && !user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // 3. If user is authenticated, render requested content
  return children ? children : <Outlet />;
}

export default ProtectedRoute;

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards private routes in the application.
 * - Displays a loading indicator while auth status is being determined.
 * - Redirects unauthenticated users to the /login page with redirect param.
 * - Renders the requested protected component if the user is authenticated.
 */
export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading, isVerifying } = useAuth();
  const location = useLocation();

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#5C645E]">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return children ? children : <Outlet />;
}

/**
 * AdminRoute Component
 * Strict authorization guard for administrative dashboard pages.
 * - Displays loading indicator while verifying session state with backend.
 * - Redirects unauthenticated users to /login?redirect=...
 * - Redirects authenticated non-admins to /dashboard.
 * - Renders admin child views if the user is verified as ADMIN.
 */
export function AdminRoute({ children }) {
  const { user, isAuthenticated, loading, isVerifying } = useAuth();
  const location = useLocation();

  // Session verification phase: prevent premature redirection during page reload
  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#5C645E]">Verifying administrative credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;

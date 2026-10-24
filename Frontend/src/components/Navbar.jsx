import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Renders the top navigation bar with dynamic navigation links:
 * - Logged out: Login, Register
 * - Logged in: Dashboard, Profile, Logout button
 */
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Handle user logout and redirect to login
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & General Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 tracking-wide hover:text-blue-700"
            >
              ARGUS
            </Link>

            <div className="flex space-x-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/items"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Items
              </Link>
            </div>
          </div>

          {/* Auth-Dependent Links */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <span className="hidden sm:inline-block text-sm text-gray-500 mr-2">
                    Hi, <span className="font-semibold text-gray-800">{user.name}</span>
                  </span>
                )}

                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

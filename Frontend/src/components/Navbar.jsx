import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Minimalist, premium navigation bar suitable for a public Lost & Found platform.
 * Dynamic actions based on authentication status.
 */
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E7E3DA] sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2.5 text-xl font-bold tracking-tight text-[#1B382B] hover:text-[#12281E] transition-colors"
            >
              <span className="font-serif tracking-tight text-2xl font-black">ARGUS</span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide text-[#5C645E] border-l border-[#DCD7CD] pl-2.5">
                Lost &amp; Found
              </span>
            </Link>

            {/* Main Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="text-[#1C201D] hover:text-[#1B382B] px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/items"
                className="text-[#5C645E] hover:text-[#1C201D] px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                All Listings
              </Link>
              <Link
                to="/items?action=report"
                className="text-[#5C645E] hover:text-[#1C201D] px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Report an Item
              </Link>
            </div>
          </div>

          {/* User / Auth Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <span className="hidden sm:inline-block text-xs text-[#5C645E]">
                    Signed in as <span className="font-semibold text-[#1C201D]">{user.name}</span>
                  </span>
                )}

                <Link
                  to="/dashboard"
                  className="text-[#1C201D] hover:text-[#1B382B] px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="text-[#1C201D] hover:text-[#1B382B] px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-[#5C645E] hover:text-[#C05634] border border-[#E7E3DA] hover:border-[#C05634]/40 px-3 py-1.5 rounded font-medium transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#1C201D] hover:text-[#1B382B] px-3.5 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] px-3.5 py-1.5 rounded text-sm font-medium shadow-xs transition-colors"
                >
                  Create account
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

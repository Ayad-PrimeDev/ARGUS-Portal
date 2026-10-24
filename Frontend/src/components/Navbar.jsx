import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Minimalist, premium navigation bar with active state indicators and responsive mobile navigation.
 */
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E7E3DA] sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2.5 text-xl font-bold tracking-tight text-[#1B382B] hover:text-[#142A20] transition-colors"
            >
              <span className="font-serif tracking-tight text-2xl font-black">ARGUS</span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide text-[#5C645E] border-l border-[#DCD7CD] pl-2.5">
                Lost &amp; Found
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-[#1B382B] font-semibold bg-[#1B382B]/5'
                    : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
                }`}
              >
                Home
              </Link>
              <Link
                to="/items"
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/items') && !location.pathname.startsWith('/items/report')
                    ? 'text-[#1B382B] font-semibold bg-[#1B382B]/5'
                    : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
                }`}
              >
                All Listings
              </Link>
              <Link
                to="/report"
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/report')
                    ? 'text-[#1B382B] font-semibold bg-[#1B382B]/5'
                    : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
                }`}
              >
                Report an Item
              </Link>
            </div>
          </div>

          {/* User / Auth Controls (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <span className="hidden lg:inline-block text-xs text-[#5C645E]">
                    Signed in as <span className="font-semibold text-[#1C201D]">{user.name}</span>
                  </span>
                )}

                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-[#1B382B] font-semibold bg-[#1B382B]/5'
                      : 'text-[#1C201D] hover:text-[#1B382B]'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'text-[#1B382B] font-semibold bg-[#1B382B]/5'
                      : 'text-[#1C201D] hover:text-[#1B382B]'
                  }`}
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-[#5C645E] hover:text-[#C05634] border border-[#E7E3DA] hover:border-[#C05634]/40 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#1C201D] hover:text-[#1B382B] px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] px-3.5 py-1.5 rounded-md text-sm font-medium shadow-xs transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7E3DA] bg-[#FBF9F5] px-4 pt-2 pb-5 space-y-2 animate-in fade-in duration-150">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/') && location.pathname === '/'
                ? 'bg-[#1B382B]/10 text-[#1B382B] font-semibold'
                : 'text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/items"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/items')
                ? 'bg-[#1B382B]/10 text-[#1B382B] font-semibold'
                : 'text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            All Listings
          </Link>
          <Link
            to="/report"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/report')
                ? 'bg-[#1B382B]/10 text-[#1B382B] font-semibold'
                : 'text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            Report an Item
          </Link>

          <div className="pt-3 border-t border-[#E7E3DA] space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-[#1C201D] hover:bg-[#F4F1EA]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-[#1C201D] hover:bg-[#F4F1EA]"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[#C05634] hover:bg-red-50 cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 px-3 border border-[#E7E3DA] rounded-md text-xs font-semibold text-[#1C201D] hover:bg-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2 px-3 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] rounded-md text-xs font-semibold"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

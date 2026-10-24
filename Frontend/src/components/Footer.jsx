import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Minimalist, universal platform footer with registry navigation and platform principles.
 */
function Footer() {
  return (
    <footer className="bg-[#F4F1EA] border-t border-[#E7E3DA] text-[#1C201D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1B382B]">
                ARGUS
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[#C05634] font-semibold bg-[#C05634]/10 px-2 py-0.5 rounded">
                Lost &amp; Found
              </span>
            </div>
            <p className="text-sm text-[#5C645E] leading-relaxed max-w-md">
              A modern, public Lost &amp; Found network connecting people with their misplaced possessions through verified ownership and transparent community reporting.
            </p>
          </div>

          {/* Registry Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1B382B] mb-3">
              Registry
            </h4>
            <ul className="space-y-2 text-sm text-[#5C645E]">
              <li>
                <Link to="/items" className="hover:text-[#1B382B] transition-colors">
                  All Active Listings
                </Link>
              </li>
              <li>
                <Link to="/items?type=LOST" className="hover:text-[#1B382B] transition-colors">
                  Browse Lost Items
                </Link>
              </li>
              <li>
                <Link to="/items?type=FOUND" className="hover:text-[#1B382B] transition-colors">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-[#1B382B] transition-colors">
                  Report an Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1B382B] mb-3">
              Account &amp; Security
            </h4>
            <ul className="space-y-2 text-sm text-[#5C645E]">
              <li>
                <Link to="/login" className="hover:text-[#1B382B] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#1B382B] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#1B382B] transition-colors">
                  My Activity &amp; Claims
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#E7E3DA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5C645E]">
          <p>© {new Date().getFullYear()} ARGUS. Public Lost &amp; Found Network.</p>
          <p className="mt-2 sm:mt-0 font-medium text-[#1C201D]">Verified ownership • Safe recovery</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

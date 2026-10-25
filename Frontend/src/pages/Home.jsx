import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getItems } from '../services/itemService';

/**
 * Home Page Component
 * Refined, minimalist public Lost & Found platform.
 * Features:
 * - Concise hero with functional search
 * - Direct navigation to lost, found, and report actions
 * - 3 purposeful platform principles (Report, Match, Verify)
 * - Real listings loaded from backend API with loading skeleton, empty state, and error handling
 * - Responsive layout, subtle transitions, and accessibility (prefers-reduced-motion)
 */
function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load real active items from backend
  const loadRecentItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems();
      if (Array.isArray(data)) {
        // Display up to 6 newest items
        setRecentItems(data.slice(0, 6));
      } else {
        setRecentItems([]);
      }
    } catch (err) {
      console.error('Error fetching recent items:', err);
      setError(err.response?.data?.message || err.message || 'Unable to connect to registry API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentItems();
  }, []);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/items?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/items');
    }
  };

  // Date formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1C201D] min-h-screen flex flex-col">
      {/* 1. Hero Section: Premium Atmospheric Canvas with 3D Visual */}
      <section className="relative border-b border-slate-800/80 bg-[#08101E] overflow-hidden py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 transition-colors">
        {/* Layered Radial Lighting & Ambient Depth */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle celestial/geo coordinate dots */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-10"></div>
          {/* Electric blue focal glow (top right) */}
          <div className="absolute -top-24 right-0 w-[550px] h-[550px] bg-sky-500/15 rounded-full blur-3xl animate-hero-glow"></div>
          {/* Subtle gold/amber rim glow (center right) */}
          <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-3xl"></div>
          {/* Deep slate base gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08101E] via-[#08101E]/90 to-transparent lg:to-[#08101E]/30"></div>
          {/* Bottom fade into section border */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#08101E] to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Calm, Prominent Headline & Interactive Controls */}
            <div className="lg:col-span-7 text-left">
              {/* Main Headline */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.12]">
                Reuniting people with
                <br />
                <span className="text-slate-300 font-normal italic">what matters most.</span>
              </h1>

              {/* Purposeful Subtext */}
              <p className="text-base sm:text-lg text-slate-300/90 max-w-xl mb-8 leading-relaxed font-normal">
                A trusted platform to report lost belongings, return found articles, and safely coordinate verified ownership claims.
              </p>

              {/* Functional Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl flex flex-col sm:flex-row gap-2 mb-7 bg-white/95 p-2 rounded-xl border border-white/20 shadow-xl focus-within:ring-2 focus-within:ring-sky-400/50 transition-all"
              >
                <div className="flex-1 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#5C645E] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, item, or location (e.g. Wallet, Library, Keys)..."
                    className="w-full px-3 py-2.5 bg-transparent text-[#1C201D] placeholder-[#5C645E]/80 text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Search Registry
                </button>
              </form>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <Link
                  to="/items?type=LOST"
                  className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 font-medium transition-colors shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C05634] mr-2" />
                  Browse Lost Items
                </Link>

                <Link
                  to="/items?type=FOUND"
                  className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 font-medium transition-colors shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                  Browse Found Items
                </Link>

                <Link
                  to="/report"
                  className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#C05634] hover:bg-[#A8482A] text-white font-semibold transition-colors shadow-xs"
                >
                  Report an Item &rarr;
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-5 sm:gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Verified Claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Real-Time Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Free Community Service</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Quality 3D Composition Visual */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-xs sm:max-w-sm lg:max-w-md w-full animate-hero-float">
                {/* Radial Glow Frame behind image */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-sky-500/20 via-transparent to-amber-500/20 rounded-3xl blur-lg opacity-75"></div>

                {/* 3D Visual Card Container */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#0C172B]/80 shadow-2xl backdrop-blur-xs">
                  <img
                    src="/hero-lost-items.jpg"
                    alt="3D composition of everyday lost items including keys, wallet, headphones, and backpack arranged around a locator pin"
                    className="w-full h-auto object-cover aspect-square"
                    loading="eager"
                  />

                  {/* Elegant Floating Status Badge */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#08101E]/90 backdrop-blur-md border border-white/15 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white tracking-wide">Live Recovery Network</p>
                        <p className="text-[10px] text-slate-300">Active registry &amp; matching</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Concise How-It-Works (3 Pillars) */}
      <section className="py-12 border-b border-[#E7E3DA] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#E7E3DA] rounded-xl shadow-2xs hover:border-[#C05634]/40 transition-colors">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#C05634]">01. Report</span>
              <h3 className="font-display text-base font-bold text-[#1B382B] mt-2 mb-1.5">Submit Details</h3>
              <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                Log lost belongings or report found items with category, description, and accurate location details.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E7E3DA] rounded-xl shadow-2xs hover:border-[#1B382B]/40 transition-colors">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#1B382B]">02. Search</span>
              <h3 className="font-display text-base font-bold text-[#1B382B] mt-2 mb-1.5">Discover &amp; Match</h3>
              <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                Search open listings across neighborhoods, venues, public spaces, transit hubs, and classrooms.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E7E3DA] rounded-xl shadow-2xs hover:border-[#1B382B]/40 transition-colors">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#1B382B]">03. Return</span>
              <h3 className="font-display text-base font-bold text-[#1B382B] mt-2 mb-1.5">Verify &amp; Claim</h3>
              <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                Confirm ownership through private verification challenges to ensure items are safely restored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Items Section (Real API Data) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[#E7E3DA]">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1B382B]">
              Recent Listings
            </h2>
            <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
              Active reports from the community, updated in real time.
            </p>
          </div>
          <Link
            to="/items"
            className="text-xs sm:text-sm font-semibold text-[#1B382B] hover:text-[#C05634] transition-colors mt-3 sm:mt-0 flex items-center gap-1 group"
          >
            <span>View all listings</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-white border border-[#E7E3DA] rounded-xl p-5 skeleton"
              >
                <div className="h-4 bg-[#E7E3DA] rounded w-1/4 mb-4" />
                <div className="h-6 bg-[#E7E3DA] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#E7E3DA] rounded w-full mb-2" />
                <div className="h-4 bg-[#E7E3DA] rounded w-2/3 mb-4" />
                <div className="h-4 bg-[#E7E3DA] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto shadow-xs">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Unable to load recent listings
            </h3>
            <p className="text-xs text-[#5C645E] mb-4">
              {error}. Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadRecentItems}
              className="px-4 py-2 bg-[#1B382B] text-[#FBF9F5] text-xs font-semibold rounded-lg hover:bg-[#142A20] transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recentItems.length === 0 && (
          <div className="bg-white border border-[#E7E3DA] rounded-xl p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F1EA] text-[#1B382B] font-bold text-base mb-3">
              Ø
            </div>
            <h3 className="font-display text-base font-bold text-[#1B382B] mb-1.5">
              No Active Listings Found
            </h3>
            <p className="text-xs text-[#5C645E] mb-5 leading-relaxed">
              There are currently no active lost or found reports. Report a lost item or submit a found article to start the registry.
            </p>
            <div className="flex justify-center gap-2">
              <Link
                to="/report"
                className="px-4 py-2 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded-lg transition-colors"
              >
                Report an Item
              </Link>
              <button
                type="button"
                onClick={loadRecentItems}
                className="px-4 py-2 border border-[#E7E3DA] bg-[#FBF9F5] hover:bg-white text-[#1C201D] text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Live Items Grid */}
        {!loading && !error && recentItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => {
              const isLost = item.type === 'LOST';

              return (
                <Link
                  key={item._id}
                  to={`/items/${item._id}`}
                  className="card-lift bg-white border border-[#E7E3DA] rounded-xl overflow-hidden flex flex-col justify-between group"
                >
                  {/* Photo or Category Fallback Banner */}
                  <div className="card-img-wrap relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-44 w-full object-cover border-b border-[#E7E3DA]"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`h-36 border-b border-[#E7E3DA] flex flex-col items-center justify-center ${
                          isLost ? 'bg-[#FDF5F2]' : 'bg-[#F2F7F4]'
                        }`}
                      >
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isLost
                              ? 'text-[#C05634] border-[#C05634]/30 bg-[#C05634]/10'
                              : 'text-[#1B382B] border-[#1B382B]/30 bg-[#1B382B]/10'
                          }`}
                        >
                          {item.category || 'Registry Item'}
                        </span>
                      </div>
                    )}

                    {/* Badge */}
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs ${
                        isLost
                          ? 'bg-[#C05634] text-white'
                          : 'bg-[#1B382B] text-[#FBF9F5]'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category & Date */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C645E]">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-[#5C645E]">
                          {formatDate(item.date || item.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-base font-bold text-[#1B382B] leading-snug mb-2 line-clamp-1 group-hover:text-[#C05634] transition-colors">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#5C645E] leading-relaxed mb-4 line-clamp-2">
                        {item.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-3 border-t border-[#E7E3DA] text-xs text-[#5C645E] flex items-center justify-between">
                      <span className="truncate max-w-[65%] font-medium text-[#1C201D] flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5 text-[#5C645E] shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {item.location}
                      </span>
                      <span className="font-semibold text-xs text-[#1B382B] group-hover:translate-x-0.5 transition-transform">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

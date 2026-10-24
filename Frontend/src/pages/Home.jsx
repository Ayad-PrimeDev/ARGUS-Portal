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
      {/* 1. Hero Section */}
      <section className="border-b border-[#E7E3DA] bg-[#F7F4EE] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center space-x-2 bg-white border border-[#E7E3DA] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1B382B] mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C05634]" />
            <span className="tracking-wide">Public Lost &amp; Found Registry</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1B382B] mb-5 leading-[1.15]">
            Reuniting people with
            <br />
            <span className="text-[#1C201D] font-normal italic">what matters most.</span>
          </h1>

          {/* Purposeful Subtext */}
          <p className="text-base sm:text-lg text-[#5C645E] max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
            A trusted platform to report lost belongings, return found articles, and safely coordinate verified ownership claims.
          </p>

          {/* Functional Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 mb-8 bg-white p-2 rounded-xl border border-[#E7E3DA] shadow-xs focus-within:border-[#1B382B] focus-within:ring-2 focus-within:ring-[#1B382B]/15 transition-all"
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
                className="w-full px-3 py-2.5 bg-transparent text-[#1C201D] placeholder-[#5C645E]/70 text-sm focus:outline-none"
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
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <Link
              to="/items?type=LOST"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-[#E7E3DA] text-[#1C201D] font-medium hover:border-[#C05634] hover:text-[#C05634] transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#C05634] mr-2" />
              Browse Lost Items
            </Link>

            <Link
              to="/items?type=FOUND"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-[#E7E3DA] text-[#1C201D] font-medium hover:border-[#1B382B] hover:text-[#1B382B] transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#1B382B] mr-2" />
              Browse Found Items
            </Link>

            <Link
              to="/report"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1B382B] text-[#FBF9F5] font-medium hover:bg-[#142A20] transition-colors shadow-xs"
            >
              Report an Item &rarr;
            </Link>
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

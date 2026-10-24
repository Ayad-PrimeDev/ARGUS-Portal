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
    <div className="bg-[#FBF9F5] text-[#1C201D] min-h-screen flex flex-col">
      {/* 1. Hero Section */}
      <section className="border-b border-[#E7E3DA] bg-[#F7F4EE] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center space-x-2 bg-white border border-[#E7E3DA] px-3 py-1 rounded-full text-xs font-medium text-[#1B382B] mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C05634]" />
            <span>Public Lost &amp; Found Registry</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1B382B] mb-5 leading-tight">
            Reuniting people with
            <br />
            <span className="text-[#1C201D] font-normal">what matters most.</span>
          </h1>

          {/* Purposeful Subtext */}
          <p className="text-base sm:text-lg text-[#5C645E] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            A trusted, modern platform to report lost belongings, return found items, and safely coordinate verified ownership claims.
          </p>

          {/* Functional Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 mb-8 bg-white p-2 rounded-lg border border-[#E7E3DA] shadow-xs"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, item, or location (e.g. Wallet, Airport, Keys)..."
              className="flex-1 px-4 py-3 bg-transparent text-[#1C201D] placeholder-[#5C645E] text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold px-6 py-3 rounded-md transition-colors cursor-pointer"
            >
              Search Registry
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              to="/items?type=LOST"
              className="inline-flex items-center px-4 py-2 rounded-md bg-white border border-[#E7E3DA] text-[#1C201D] font-medium hover:border-[#C05634] hover:text-[#C05634] transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#C05634] mr-2" />
              Browse Lost Items
            </Link>

            <Link
              to="/items?type=FOUND"
              className="inline-flex items-center px-4 py-2 rounded-md bg-white border border-[#E7E3DA] text-[#1C201D] font-medium hover:border-[#1B382B] hover:text-[#1B382B] transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#1B382B] mr-2" />
              Browse Found Items
            </Link>

            <Link
              to="/report"
              className="inline-flex items-center px-4 py-2 rounded-md bg-[#1B382B] text-[#FBF9F5] font-medium hover:bg-[#142A20] transition-colors shadow-xs"
            >
              Report an Item &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Concise How-It-Works (3 Pillars) */}
      <section className="py-12 border-b border-[#E7E3DA] bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#E7E3DA] rounded-md shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-[#C05634]">01. Report</span>
              <h3 className="text-base font-bold text-[#1B382B] mt-2 mb-1.5">Submit Details</h3>
              <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                Log lost belongings or report found items with category, description, and accurate location details.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E7E3DA] rounded-md shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-[#1B382B]">02. Search</span>
              <h3 className="text-base font-bold text-[#1B382B] mt-2 mb-1.5">Discover &amp; Match</h3>
              <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                Search open listings across neighborhoods, venues, public spaces, transit hubs, and workplaces.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E7E3DA] rounded-md shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-[#1B382B]">03. Return</span>
              <h3 className="text-base font-bold text-[#1B382B] mt-2 mb-1.5">Verify &amp; Claim</h3>
              <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                Confirm ownership through private verification questions to ensure items are safely restored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Items Section (Real API Data) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[#E7E3DA]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1B382B]">
              Recent Listings
            </h2>
            <p className="text-sm text-[#5C645E] mt-1">
              Active reports from the community, updated in real time.
            </p>
          </div>
          <Link
            to="/items"
            className="text-sm font-semibold text-[#1B382B] hover:text-[#C05634] transition-colors mt-3 sm:mt-0 flex items-center"
          >
            View all listings &rarr;
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-white border border-[#E7E3DA] rounded-md p-6 motion-safe:animate-pulse motion-reduce:animate-none"
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
          <div className="bg-white border border-red-200 rounded-md p-8 text-center max-w-md mx-auto shadow-xs">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Unable to load recent listings
            </h3>
            <p className="text-xs text-[#5C645E] mb-4">
              {error}. Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadRecentItems}
              className="px-4 py-2 bg-[#1B382B] text-[#FBF9F5] text-xs font-semibold rounded hover:bg-[#142A20] transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recentItems.length === 0 && (
          <div className="bg-white border border-[#E7E3DA] rounded-md p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F1EA] text-[#1B382B] font-bold text-base mb-3">
              Ø
            </div>
            <h3 className="text-base font-bold text-[#1B382B] mb-1.5">
              No Active Listings Found
            </h3>
            <p className="text-xs text-[#5C645E] mb-5 leading-relaxed">
              There are currently no active lost or found reports. Report a lost item or submit a found article to start the registry.
            </p>
            <div className="flex justify-center gap-2">
              <Link
                to="/report"
                className="px-4 py-2 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded transition-colors"
              >
                Report an Item
              </Link>
              <button
                type="button"
                onClick={loadRecentItems}
                className="px-4 py-2 border border-[#E7E3DA] bg-[#FBF9F5] hover:bg-white text-[#1C201D] text-xs font-medium rounded transition-colors cursor-pointer"
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
                <div
                  key={item._id}
                  className="bg-white border border-[#E7E3DA] rounded-md overflow-hidden flex flex-col justify-between motion-safe:transition-all motion-safe:duration-150 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none hover:shadow-sm"
                >
                  {/* Photo or Clean Category Banner */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-44 w-full object-cover border-b border-[#E7E3DA]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-28 bg-[#F4F1EA] border-b border-[#E7E3DA] flex items-center justify-center text-[#5C645E] text-xs font-semibold tracking-wider uppercase">
                      <span>{item.category || 'Item Listing'}</span>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge & Category */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isLost
                              ? 'bg-[#C05634]/10 text-[#C05634] border border-[#C05634]/25'
                              : 'bg-[#1B382B]/10 text-[#1B382B] border border-[#1B382B]/25'
                          }`}
                        >
                          {item.type}
                        </span>

                        <span className="text-xs text-[#5C645E] font-medium">
                          {item.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-[#1B382B] leading-snug mb-2 line-clamp-1">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#5C645E] leading-relaxed mb-4 line-clamp-2">
                        {item.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-3 border-t border-[#E7E3DA] text-xs text-[#5C645E] flex items-center justify-between">
                      <span className="truncate max-w-[65%] font-medium text-[#1C201D]">
                        📍 {item.location}
                      </span>
                      <span>{formatDate(item.date || item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

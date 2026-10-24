import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getItems } from '../services/itemService';

/**
 * Items Listing Page
 *
 * Displays all active lost & found item listings from the backend.
 * Features:
 *  - Type filter: All / Lost / Found  (server-side via ?type=)
 *  - Keyword search (client-side, debounced)
 *  - Location filter (client-side from returned data)
 *  - Reset-filters action
 *  - Responsive premium card grid
 *  - Loading skeleton, error state with retry, and empty state
 *  - URL-driven filter sync (e.g. linking from Homepage with ?type=LOST)
 */

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ITEM_TYPES = [
  { label: 'All Items', value: '' },
  { label: 'Lost',      value: 'LOST' },
  { label: 'Found',     value: 'FOUND' },
];

const SKELETON_COUNT = 9;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Format a date string into a human-readable short form.
 * @param {string} dateString
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Collect unique, non-empty location values from a list of items.
 * @param {Array} items
 * @returns {string[]}
 */
function extractLocations(items) {
  const seen = new Set();
  return items
    .map((item) => item.location?.trim())
    .filter((loc) => loc && !seen.has(loc) && seen.add(loc));
}

/**
 * Case-insensitive keyword match against title, description, category, and location.
 * @param {Object} item
 * @param {string} keyword
 */
function itemMatchesKeyword(item, keyword) {
  if (!keyword) return true;
  const q = keyword.toLowerCase();
  return (
    item.title?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.category?.toLowerCase().includes(q) ||
    item.location?.toLowerCase().includes(q)
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/** Loading skeleton card */
function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E7E3DA] rounded-xl overflow-hidden skeleton">
      <div className="h-52 bg-[#F4F1EA]" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-[#E7E3DA] rounded-full" />
          <div className="h-5 w-20 bg-[#E7E3DA] rounded-full ml-auto" />
        </div>
        <div className="h-5 bg-[#E7E3DA] rounded w-3/4" />
        <div className="h-4 bg-[#E7E3DA] rounded w-full" />
        <div className="h-4 bg-[#E7E3DA] rounded w-5/6" />
        <div className="pt-3 border-t border-[#E7E3DA] flex justify-between">
          <div className="h-3.5 bg-[#E7E3DA] rounded w-2/5" />
          <div className="h-3.5 bg-[#E7E3DA] rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

/** Image fallback banner when no imageUrl */
function ImageFallback({ category, type }) {
  const isLost = type === 'LOST';
  return (
    <div
      className={`h-52 flex flex-col items-center justify-center gap-2 border-b border-[#E7E3DA] ${
        isLost ? 'bg-[#FDF5F2]' : 'bg-[#F2F7F4]'
      }`}
    >
      {/* Category label as visual fallback */}
      <span
        className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
          isLost
            ? 'text-[#C05634] border-[#C05634]/30 bg-[#C05634]/10'
            : 'text-[#1B382B] border-[#1B382B]/30 bg-[#1B382B]/10'
        }`}
      >
        {category || 'Uncategorised'}
      </span>
      <span className="text-[10px] text-[#5C645E] tracking-wide font-medium uppercase">
        No image provided
      </span>
    </div>
  );
}

/** Individual premium item card */
function ItemCard({ item }) {
  const isLost = item.type === 'LOST';

  return (
    <article className="card-lift bg-white border border-[#E7E3DA] rounded-xl overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="card-img-wrap relative">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-52 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageFallback category={item.category} type={item.type} />
        )}

        {/* Type badge — overlaid on image area */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${
            isLost
              ? 'bg-[#C05634] text-white'
              : 'bg-[#1B382B] text-[#FBF9F5]'
          }`}
        >
          {item.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category + Date row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C645E]">
              {item.category}
            </span>
            <span className="text-[11px] text-[#5C645E]">
              {formatDate(item.date || item.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-[15px] font-semibold text-[#1B382B] leading-snug mb-2 line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-[#5C645E] leading-relaxed line-clamp-3 mb-4">
            {item.description || 'No description provided.'}
          </p>
        </div>

        {/* Footer: location + view link */}
        <div className="pt-3 border-t border-[#E7E3DA] flex items-center justify-between gap-2">
          <span className="text-[12px] text-[#1C201D] font-medium truncate max-w-[60%] flex items-center gap-1">
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

          {/* View Details — links to /items/:id when that page is ready.
              Currently no detail page exists in this commit, so the link
              points to /items/:id as a placeholder consistent with the
              route convention. */}
          <Link
            to={`/items/${item._id}`}
            className={`text-[12px] font-semibold shrink-0 transition-colors ${
              isLost
                ? 'text-[#C05634] hover:text-[#A04529]'
                : 'text-[#1B382B] hover:text-[#142A20]'
            }`}
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Page Component ────────────────────────────────────────────────── */

function Items() {
  // Read initial filter state from URL query params (e.g. ?type=LOST from homepage links)
  const [searchParams, setSearchParams] = useSearchParams();

  const [allItems, setAllItems]       = useState([]);   // Raw items from API
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Filter state
  const [activeType, setActiveType]     = useState(searchParams.get('type') || '');
  const [searchInput, setSearchInput]   = useState(searchParams.get('search') || '');
  const [keyword, setKeyword]           = useState(searchParams.get('search') || '');
  const [activeLocation, setActiveLocation] = useState('');

  // Derived: unique locations from current allItems
  const [locationOptions, setLocationOptions] = useState([]);

  // Debounce ref
  const debounceRef = useRef(null);

  /* ── Fetch from API whenever activeType changes ── */
  const fetchItems = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (type) params.type = type;
      const data = await getItems(params);
      const items = Array.isArray(data) ? data : [];
      setAllItems(items);
      setLocationOptions(extractLocations(items));
      // Reset location filter whenever item set changes
      setActiveLocation('');
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to the ARGUS registry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(activeType);
  }, [activeType, fetchItems]);

  /* ── Debounce keyword search input ── */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setKeyword(value.trim());
    }, 280);
  };

  /* ── Apply type filter ── */
  const handleTypeChange = (type) => {
    setActiveType(type);
    // Reflect in URL
    const params = {};
    if (type) params.type = type;
    if (keyword) params.search = keyword;
    setSearchParams(params);
  };

  /* ── Reset all filters ── */
  const handleReset = () => {
    setActiveType('');
    setKeyword('');
    setSearchInput('');
    setActiveLocation('');
    setSearchParams({});
  };

  /* ── Client-side filtering (keyword + location) ── */
  const filteredItems = allItems.filter((item) => {
    const matchesKeyword  = itemMatchesKeyword(item, keyword);
    const matchesLocation = activeLocation
      ? item.location?.trim() === activeLocation
      : true;
    return matchesKeyword && matchesLocation;
  });

  /* ── Count helpers ── */
  const lostCount  = allItems.filter((i) => i.type === 'LOST').length;
  const foundCount = allItems.filter((i) => i.type === 'FOUND').length;

  const hasActiveFilters = activeType || keyword || activeLocation;

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C201D]">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="bg-[#1B382B] text-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {/* Breadcrumb */}
          <nav className="mb-4 text-xs text-[#FBF9F5]/50 flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#FBF9F5]/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#FBF9F5]/80">Registry</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FBF9F5] leading-tight mb-2">
                Item Registry
              </h1>
              <p className="text-[#FBF9F5]/65 text-sm leading-relaxed max-w-xl">
                Browse all active lost and found reports. Search by keyword,
                filter by type, or narrow by location to find a match.
              </p>
            </div>

            {/* Live count pills */}
            {!loading && !error && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#C05634]/20 text-[#F4B49A] border border-[#C05634]/30 px-2.5 py-1 rounded-full">
                  {lostCount} Lost
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#FBF9F5]/10 text-[#B4CBBF] border border-[#FBF9F5]/20 px-2.5 py-1 rounded-full">
                  {foundCount} Found
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Controls bar ────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-[#E7E3DA] shadow-[0_1px_0_0_#E7E3DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* Search field */}
            <div className="relative flex-1 min-w-0">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-[#5C645E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                id="items-search"
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search items, keywords, or descriptions…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E7E3DA] rounded-lg text-[#1C201D] placeholder-[#5C645E] focus:outline-none focus:ring-2 focus:ring-[#1B382B]/30 focus:border-[#1B382B] transition-colors"
              />
            </div>

            {/* Type filter tabs */}
            <div className="flex items-center gap-1 bg-white border border-[#E7E3DA] rounded-lg p-1 shrink-0">
              {ITEM_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeType === t.value
                      ? 'bg-[#1B382B] text-[#FBF9F5] shadow-sm'
                      : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Location filter */}
            {locationOptions.length > 0 && (
              <select
                id="items-location"
                value={activeLocation}
                onChange={(e) => setActiveLocation(e.target.value)}
                className="py-2.5 px-3 text-sm bg-white border border-[#E7E3DA] rounded-lg text-[#1C201D] focus:outline-none focus:ring-2 focus:ring-[#1B382B]/30 focus:border-[#1B382B] transition-colors shrink-0 cursor-pointer"
              >
                <option value="">All Locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}

            {/* Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-[#C05634] hover:text-[#A04529] border border-[#C05634]/30 hover:border-[#C05634]/60 px-3.5 py-2.5 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Active filter summary */}
          {(keyword || activeLocation) && !loading && (
            <p className="mt-2 text-xs text-[#5C645E]">
              Showing{' '}
              <span className="font-semibold text-[#1C201D]">{filteredItems.length}</span>{' '}
              {filteredItems.length === 1 ? 'result' : 'results'}
              {keyword && (
                <>
                  {' '}for <span className="font-semibold text-[#1C201D]">"{keyword}"</span>
                </>
              )}
              {activeLocation && (
                <>
                  {' '}in <span className="font-semibold text-[#1C201D]">{activeLocation}</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="max-w-md mx-auto mt-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-[#1B382B] mb-1">
              Could not load listings
            </h2>
            <p className="text-sm text-[#5C645E] mb-5 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => fetchItems(activeType)}
              className="px-5 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state — no items from API */}
        {!loading && !error && allItems.length === 0 && (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#F4F1EA] border border-[#E7E3DA] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#5C645E]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-[#1B382B] mb-2">
              No active listings yet
            </h2>
            <p className="text-sm text-[#5C645E] mb-6 leading-relaxed">
              {activeType === 'LOST'
                ? 'No lost item reports have been submitted yet.'
                : activeType === 'FOUND'
                ? 'No found item reports have been submitted yet.'
                : 'The registry is currently empty. Be the first to report a lost or found item.'}
            </p>
            <Link
              to="/report"
              className="inline-block px-5 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold rounded-lg transition-colors"
            >
              Report an Item
            </Link>
          </div>
        )}

        {/* Empty state — items exist but current filters produced no matches */}
        {!loading && !error && allItems.length > 0 && filteredItems.length === 0 && (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#F4F1EA] border border-[#E7E3DA] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#5C645E]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-[#1B382B] mb-2">
              No matching items
            </h2>
            <p className="text-sm text-[#5C645E] mb-5 leading-relaxed">
              Your search or filter combination didn't match any listings. Try
              broadening your search or clearing the filters.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-[#1B382B] text-[#1B382B] hover:bg-[#1B382B] hover:text-[#FBF9F5] text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Item grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <>
            {/* Result count */}
            <p className="text-xs text-[#5C645E] mb-6">
              {hasActiveFilters
                ? `${filteredItems.length} of ${allItems.length} listings match your filters`
                : `${allItems.length} active listing${allItems.length !== 1 ? 's' : ''}`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Items;

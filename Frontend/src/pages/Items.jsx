import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { getItems } from '../services/itemService';
import { formatShortDate } from '../utils/dateUtils';
import { ITEM_CATEGORIES } from '../constants/categories';

const ITEM_TYPES = [
  { label: 'All Items', value: '' },
  { label: 'Lost Items', value: 'LOST' },
  { label: 'Found Items', value: 'FOUND' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Item Name: A to Z', value: 'name_asc' },
  { label: 'Item Name: Z to A', value: 'name_desc' },
];

const SKELETON_COUNT = 9;

function formatDate(dateString) {
  return formatShortDate(dateString, '');
}

function extractLocations(items) {
  const seen = new Set();
  return items
    .map((item) => item.location?.trim())
    .filter((loc) => loc && !seen.has(loc) && seen.add(loc))
    .sort((a, b) => a.localeCompare(b));
}

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

function ImageFallback({ category, type }) {
  const isLost = type === 'LOST';
  return (
    <div
      className={`h-52 flex flex-col items-center justify-center gap-2 border-b border-[#E7E3DA] ${
        isLost ? 'bg-[#FDF5F2]' : 'bg-[#F2F7F4]'
      }`}
    >
      <span
        className={`text-[11px] uppercase tracking-wide font-bold px-3 py-1 rounded-full border ${
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

function ItemCard({ item }) {
  const isLost = item.type === 'LOST';

  return (
    <article className="card-lift bg-white border border-[#E7E3DA] rounded-xl overflow-hidden flex flex-col group">
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

        <span
          className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm ${
            isLost
              ? 'bg-[#C05634] text-white'
              : 'bg-[#1B382B] text-[#FBF9F5]'
          }`}
        >
          {item.type}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C645E]">
              {item.category}
            </span>
            <span className="text-[11px] text-[#5C645E]">
              {formatDate(item.date || item.createdAt)}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold text-[#1B382B] leading-snug mb-2 line-clamp-2">
            <Link to={`/items/${item._id}`} className="hover:text-[#C05634] transition-colors">
              {item.title}
            </Link>
          </h3>

          <p className="text-[13px] text-[#5C645E] leading-relaxed line-clamp-3 mb-4">
            {item.description || 'No description provided.'}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E7E3DA] flex items-center justify-between gap-2">
          <span className="text-[12px] text-[#1C201D] font-medium truncate max-w-[65%] flex items-center gap-1" title={item.location}>
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
            <span className="truncate">{item.location}</span>
          </span>

          <Link
            to={`/items/${item._id}`}
            className={`text-[12px] font-semibold shrink-0 transition-colors ${
              isLost
                ? 'text-[#C05634] hover:text-[#A04529]'
                : 'text-[#1B382B] hover:text-[#142A20]'
            }`}
          >
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
}

function Items() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [deletedBanner, setDeletedBanner] = useState(location.state?.deletedTitle || null);

  useEffect(() => {
    if (location.state?.deletedTitle) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setDeletedBanner(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [activeType, setActiveType] = useState(searchParams.get('type') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [activeLocation, setActiveLocation] = useState(searchParams.get('location') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || searchParams.get('from') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || searchParams.get('to') || '');
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'newest');

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchDebounceRef = useRef(null);
  const locationDebounceRef = useRef(null);

  /* ── Sync current filter state to URL search parameters ── */
  const updateUrlParams = useCallback((newFilters) => {
    const params = {};
    if (newFilters.type) params.type = newFilters.type;
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.location) params.location = newFilters.location;
    if (newFilters.startDate) params.startDate = newFilters.startDate;
    if (newFilters.endDate) params.endDate = newFilters.endDate;
    if (newFilters.sort && newFilters.sort !== 'newest') params.sort = newFilters.sort;

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  /* ── Initial global registry count and location suggestions ── */
  useEffect(() => {
    let isMounted = true;
    const fetchGlobalBaseline = async () => {
      try {
        const all = await getItems();
        if (isMounted && Array.isArray(all)) {
          setTotalCount(all.length);
          setLostCount(all.filter((i) => i.type === 'LOST').length);
          setFoundCount(all.filter((i) => i.type === 'FOUND').length);
          setLocationSuggestions(extractLocations(all));
        }
      } catch (err) {
        console.error('Failed to load baseline counts:', err);
      }
    };
    fetchGlobalBaseline();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchFilteredItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {};
      if (activeType) queryParams.type = activeType;
      if (activeCategory) queryParams.category = activeCategory;
      if (keyword) queryParams.search = keyword;
      if (activeLocation) queryParams.location = activeLocation;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      if (activeSort) queryParams.sort = activeSort;

      const data = await getItems(queryParams);
      const itemsList = Array.isArray(data) ? data : [];
      setItems(itemsList);

      const newLocs = extractLocations(itemsList);
      if (newLocs.length > 0) {
        setLocationSuggestions((prev) => {
          const combined = Array.from(new Set([...prev, ...newLocs])).sort((a, b) =>
            a.localeCompare(b)
          );
          return combined;
        });
      }
    } catch (err) {
      console.error('Failed to fetch filtered items:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to the ARGUS registry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeType, activeCategory, keyword, activeLocation, startDate, endDate, activeSort]);

  useEffect(() => {
    fetchFilteredItems();
  }, [fetchFilteredItems]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const trimmed = val.trim();
      setKeyword(trimmed);
      updateUrlParams({
        type: activeType,
        category: activeCategory,
        search: trimmed,
        location: activeLocation,
        startDate,
        endDate,
        sort: activeSort,
      });
    }, 320);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setKeyword('');
    clearTimeout(searchDebounceRef.current);
    updateUrlParams({
      type: activeType,
      category: activeCategory,
      search: '',
      location: activeLocation,
      startDate,
      endDate,
      sort: activeSort,
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchDebounceRef.current);
      const trimmed = searchInput.trim();
      setKeyword(trimmed);
      updateUrlParams({
        type: activeType,
        category: activeCategory,
        search: trimmed,
        location: activeLocation,
        startDate,
        endDate,
        sort: activeSort,
      });
    }
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocationInput(val);
    clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(() => {
      const trimmed = val.trim();
      setActiveLocation(trimmed);
      updateUrlParams({
        type: activeType,
        category: activeCategory,
        search: keyword,
        location: trimmed,
        startDate,
        endDate,
        sort: activeSort,
      });
    }, 350);
  };

  const handleClearLocation = () => {
    setLocationInput('');
    setActiveLocation('');
    clearTimeout(locationDebounceRef.current);
    updateUrlParams({
      type: activeType,
      category: activeCategory,
      search: keyword,
      location: '',
      startDate,
      endDate,
      sort: activeSort,
    });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setActiveCategory(val);
    updateUrlParams({
      type: activeType,
      category: val,
      search: keyword,
      location: activeLocation,
      startDate,
      endDate,
      sort: activeSort,
    });
  };

  const handleTypeChange = (typeVal) => {
    setActiveType(typeVal);
    updateUrlParams({
      type: typeVal,
      category: activeCategory,
      search: keyword,
      location: activeLocation,
      startDate,
      endDate,
      sort: activeSort,
    });
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    updateUrlParams({
      type: activeType,
      category: activeCategory,
      search: keyword,
      location: activeLocation,
      startDate: val,
      endDate,
      sort: activeSort,
    });
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    updateUrlParams({
      type: activeType,
      category: activeCategory,
      search: keyword,
      location: activeLocation,
      startDate,
      endDate: val,
      sort: activeSort,
    });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setActiveSort(val);
    updateUrlParams({
      type: activeType,
      category: activeCategory,
      search: keyword,
      location: activeLocation,
      startDate,
      endDate,
      sort: val,
    });
  };

  const handleReset = () => {
    clearTimeout(searchDebounceRef.current);
    clearTimeout(locationDebounceRef.current);

    setActiveType('');
    setActiveCategory('');
    setSearchInput('');
    setKeyword('');
    setLocationInput('');
    setActiveLocation('');
    setStartDate('');
    setEndDate('');
    setActiveSort('newest');

    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    activeType ||
    keyword ||
    activeCategory ||
    activeLocation ||
    startDate ||
    endDate ||
    (activeSort && activeSort !== 'newest')
  );

  const activeFilterCount = [
    activeType,
    keyword,
    activeCategory,
    activeLocation,
    startDate,
    endDate,
    activeSort !== 'newest' ? activeSort : '',
  ].filter(Boolean).length;

  const isInvalidDateRange = Boolean(startDate && endDate && startDate > endDate);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C201D]">
      {deletedBanner && (
        <div className="bg-emerald-700 text-white px-4 py-3 text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Report <strong>"{deletedBanner}"</strong> was permanently deleted.</span>
          </div>
          <button
            type="button"
            onClick={() => setDeletedBanner(null)}
            className="text-xs font-semibold underline cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-[#1B382B] text-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <nav className="mb-4 text-xs text-[#FBF9F5]/50 flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#FBF9F5]/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#FBF9F5]/80">Registry</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#FBF9F5] leading-tight mb-2">
                Item Registry
              </h1>
              <p className="text-[#FBF9F5]/70 text-sm leading-relaxed max-w-2xl">
                Browse, search, and filter all active lost and found reports. Search by keyword,
                filter by category, location, and date range, or sort to find matches quickly.
              </p>
            </div>

            {totalCount > 0 && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#C05634]/25 text-[#FAD2C3] border border-[#C05634]/40 px-2.5 py-1 rounded-full">
                  {lostCount} Lost
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#FBF9F5]/10 text-[#C4D9CD] border border-[#FBF9F5]/20 px-2.5 py-1 rounded-full">
                  {foundCount} Found
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-white/15 text-[#FAF8F5] border border-white/20 px-2.5 py-1 rounded-full">
                  {totalCount} Total
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-[#FBF9F5]/98 backdrop-blur-md border-b border-[#E7E3DA] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="relative flex-1 min-w-[260px]">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#5C645E]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
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
                onKeyDown={handleSearchKeyDown}
                placeholder="Search items by name, keywords, or description…"
                className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-[#E7E3DA] rounded-lg text-[#1C201D] placeholder-[#5C645E]/70 focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A928D] hover:text-[#1C201D] cursor-pointer"
                  aria-label="Clear search query"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-white border border-[#E7E3DA] rounded-lg p-1 shrink-0 shadow-2xs">
              {ITEM_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeType === t.value
                      ? 'bg-[#1B382B] text-[#FBF9F5] shadow-xs'
                      : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="items-sort" className="text-xs font-medium text-[#5C645E] hidden sm:inline-block">
                Sort:
              </label>
              <select
                id="items-sort"
                value={activeSort}
                onChange={handleSortChange}
                className="py-2 pl-3 pr-8 text-xs font-medium bg-white border border-[#E7E3DA] rounded-lg text-[#1C201D] focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors cursor-pointer shadow-2xs"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                className={`lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  mobileFiltersOpen || activeFilterCount > 0
                    ? 'bg-[#1B382B] text-[#FBF9F5] border-[#1B382B]'
                    : 'bg-white text-[#1C201D] border-[#E7E3DA] hover:bg-[#F4F1EA]'
                }`}
                aria-expanded={mobileFiltersOpen}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#C05634] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div
            className={`flex-col lg:flex-row flex-wrap gap-3 items-stretch lg:items-center pt-2 border-t border-[#E7E3DA]/70 ${
              mobileFiltersOpen ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex-1 min-w-[190px]">
              <label htmlFor="items-category" className="sr-only">Category</label>
              <select
                id="items-category"
                value={activeCategory}
                onChange={handleCategoryChange}
                className="w-full py-1.5 px-3 text-xs bg-white border border-[#E7E3DA] rounded-lg text-[#1C201D] focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors cursor-pointer shadow-2xs"
              >
                <option value="">All Categories</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-[#5C645E]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <input
                id="items-location-input"
                type="text"
                list="location-datalist"
                value={locationInput}
                onChange={handleLocationChange}
                placeholder="Filter by campus location…"
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#E7E3DA] rounded-lg text-[#1C201D] placeholder-[#5C645E]/70 focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors shadow-2xs"
              />
              <datalist id="location-datalist">
                {locationSuggestions.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
              {locationInput && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8A928D] hover:text-[#1C201D] cursor-pointer"
                  aria-label="Clear location filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 bg-white border border-[#E7E3DA] rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                <span className="text-[#5C645E] font-medium text-[11px]">From:</span>
                <input
                  id="items-date-from"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="text-xs text-[#1C201D] bg-transparent focus:outline-none cursor-pointer"
                  title="Filter items from this date"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-[#E7E3DA] rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                <span className="text-[#5C645E] font-medium text-[11px]">To:</span>
                <input
                  id="items-date-to"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="text-xs text-[#1C201D] bg-transparent focus:outline-none cursor-pointer"
                  title="Filter items up to this date"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#C05634] hover:text-[#A04529] bg-[#C05634]/10 hover:bg-[#C05634]/20 border border-[#C05634]/30 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                title="Reset all search queries and active filters"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Clear All</span>
              </button>
            )}
          </div>

          {isInvalidDateRange && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>The "From" date is set later than the "To" date. Please verify your selected date range.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#5C645E] text-[11px] font-medium">
                {loading ? 'Searching registry…' : `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'}:`}
              </span>

              {keyword && (
                <span className="inline-flex items-center gap-1 bg-[#1B382B]/10 text-[#1B382B] px-2 py-0.5 rounded-md text-[11px] font-medium">
                  Keyword: "{keyword}"
                  <button type="button" onClick={handleClearSearch} className="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              )}

              {activeType && (
                <span className="inline-flex items-center gap-1 bg-[#1B382B]/10 text-[#1B382B] px-2 py-0.5 rounded-md text-[11px] font-medium">
                  Type: {activeType === 'LOST' ? 'Lost' : 'Found'}
                  <button type="button" onClick={() => handleTypeChange('')} className="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              )}

              {activeCategory && (
                <span className="inline-flex items-center gap-1 bg-[#1B382B]/10 text-[#1B382B] px-2 py-0.5 rounded-md text-[11px] font-medium">
                  Category: {activeCategory}
                  <button type="button" onClick={() => handleCategoryChange({ target: { value: '' } })} className="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              )}

              {activeLocation && (
                <span className="inline-flex items-center gap-1 bg-[#1B382B]/10 text-[#1B382B] px-2 py-0.5 rounded-md text-[11px] font-medium">
                  Location: {activeLocation}
                  <button type="button" onClick={handleClearLocation} className="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              )}

              {(startDate || endDate) && (
                <span className="inline-flex items-center gap-1 bg-[#1B382B]/10 text-[#1B382B] px-2 py-0.5 rounded-md text-[11px] font-medium">
                  Date: {startDate || 'Start'} → {endDate || 'End'}
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      updateUrlParams({
                        type: activeType,
                        category: activeCategory,
                        search: keyword,
                        location: activeLocation,
                        startDate: '',
                        endDate: '',
                        sort: activeSort,
                      });
                    }}
                    className="hover:text-red-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeSort && activeSort !== 'newest' && (
                <span className="inline-flex items-center gap-1 bg-[#1B382B]/10 text-[#1B382B] px-2 py-0.5 rounded-md text-[11px] font-medium">
                  Sort: {SORT_OPTIONS.find((s) => s.value === activeSort)?.label}
                  <button type="button" onClick={() => handleSortChange({ target: { value: 'newest' } })} className="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-[#C05634] hover:underline cursor-pointer ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

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
            <h2 className="text-lg font-semibold text-[#1B382B] mb-1">
              Could not load listings
            </h2>
            <p className="text-sm text-[#5C645E] mb-5 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={fetchFilteredItems}
              className="px-5 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && totalCount === 0 && items.length === 0 && !hasActiveFilters && (
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
            <h2 className="text-lg font-semibold text-[#1B382B] mb-2">
              No active listings yet
            </h2>
            <p className="text-sm text-[#5C645E] mb-6 leading-relaxed">
              The registry is currently empty. Be the first to report a lost or found item.
            </p>
            <Link
              to="/report"
              className="inline-block px-5 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-sm font-semibold rounded-lg transition-colors"
            >
              Report an Item
            </Link>
          </div>
        )}

        {!loading && !error && items.length === 0 && (hasActiveFilters || totalCount > 0) && (
          <div className="max-w-md mx-auto mt-16 text-center">
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
            <h2 className="text-lg font-semibold text-[#1B382B] mb-2">
              No matching items found
            </h2>
            <p className="text-sm text-[#5C645E] mb-6 leading-relaxed">
              No active items match your current filter criteria. Try adjusting keywords, selecting another category or campus location, or expanding your date range.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
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

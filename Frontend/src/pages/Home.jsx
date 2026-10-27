import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getItems } from '../services/itemService';
import { formatShortDate } from '../utils/dateUtils';
import { ITEM_CATEGORIES } from '../constants/categories';

/**
 * Featured item categories with bespoke icons and quick filter links.
 */
const FEATURED_CATEGORIES = [
  {
    name: 'Keys & Cards',
    desc: 'Room keys, access tags, student ID cards',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    name: 'Electronics',
    desc: 'Laptops, chargers, headphones, phones',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Documents & IDs',
    desc: 'Passports, wallets, notebooks, licenses',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Bags & Backpacks',
    desc: 'Totes, bookbags, duffels, pouches',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    name: 'Books & Study Materials',
    desc: 'Textbooks, course binders, calculators',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    name: 'Wallets & Purses',
    desc: 'Coin purses, cardholders, money clips',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

/**
 * Home Page Component
 * Community Lost & Found platform redesigned with a bright, welcoming palette:
 * - Warm Ivory (#FAF8F2) for primary background
 * - Soft Beige (#F0E8D9) for alternating sections
 * - Forest Green (#244C3A) for buttons, icons, headings, and accents
 * - Charcoal (#292B28) for high-contrast readable typography
 * - Muted Sage (#DCE7DC) for soft green backgrounds and indicators
 * - White (#FFFFFF) for item cards and input surfaces
 * - Terracotta (#C05634) for primary calls to action and highlights
 */
function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load real active listings from backend and compute live totals
  const loadRecentItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems();
      if (Array.isArray(data)) {
        setTotalCount(data.length);
        setLostCount(data.filter((item) => item.type === 'LOST').length);
        setFoundCount(data.filter((item) => item.type === 'FOUND').length);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/items?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/items');
    }
  };

  const handleQuickKeyword = (keyword) => {
    navigate(`/items?search=${encodeURIComponent(keyword)}`);
  };

  const formatDate = formatShortDate;

  return (
    <div className="bg-[#FAF8F2] text-[#292B28] min-h-screen flex flex-col selection:bg-[#DCE7DC] selection:text-[#244C3A]">

      {/* ── 1. Hero Section: Bright, Welcoming & High-Contrast ── */}
      <section className="relative bg-[#FAF8F2] text-[#292B28] overflow-hidden border-b border-[#E7E3DA]">
        {/* Soft, airy ambient texture */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#DCE7DC]/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#F0E8D9]/70 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left Column: Mission, Search, and Primary Actions */}
            <div className="lg:col-span-7 text-left">

              {/* Headline */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#292B28] mb-5 leading-[1.14]">
                Reuniting people with <br />
                <span className="text-[#244C3A] italic font-normal">what matters most.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#5C645E] max-w-xl mb-8 leading-relaxed font-normal">
                A verified community platform to report misplaced belongings, return discovered articles, and securely verify rightful ownership.
              </p>

              {/* Functional Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl flex flex-col sm:flex-row gap-2 mb-4 bg-white p-2 rounded-xl shadow-sm border border-[#D8D3C8] focus-within:border-[#244C3A] focus-within:ring-2 focus-within:ring-[#244C3A]/20 transition-all"
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
                    placeholder="Search by item, location, or keyword (e.g. Student ID, Keys, Library)..."
                    className="w-full px-3 py-2.5 bg-transparent text-[#292B28] placeholder-[#5C645E]/80 text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#244C3A] hover:bg-[#1B382B] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Search Registry
                </button>
              </form>

              {/* Search Suggestions */}
              <div className="flex flex-wrap items-center gap-2 mb-8 text-xs text-[#5C645E]">
                <span className="text-[#244C3A] font-semibold">Common items:</span>
                {['Student ID', 'Car Keys', 'Backpack', 'Earphones', 'Water Bottle'].map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => handleQuickKeyword(keyword)}
                    className="px-2.5 py-1 rounded-md bg-[#F0E8D9] hover:bg-[#E4DCCB] text-[#292B28] border border-[#DCD3C1] transition-colors cursor-pointer font-medium"
                  >
                    {keyword}
                  </button>
                ))}
              </div>

              {/* Primary Dual Actions */}
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C05634] hover:bg-[#A04529] text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Report an Item</span>
                </Link>

                <Link
                  to="/items"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-[#F0E8D9] border border-[#D8D3C8] text-[#244C3A] text-sm font-semibold transition-colors shadow-2xs hover:border-[#244C3A]/40 cursor-pointer"
                >
                  <span>Browse All Items</span>
                  <span className="text-[#244C3A]">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Grounded Lost & Found Visual Composition */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-sm sm:max-w-md w-full">
                {/* Subtle soft ambient glow */}
                <div className="absolute -inset-2 bg-[#DCE7DC]/60 rounded-2xl blur-lg" />

                {/* Main Visual Container */}
                <div className="relative rounded-2xl overflow-hidden border border-[#D8D3C8] bg-white shadow-lg">
                  {/* Photo showcasing everyday belongings */}
                  <img
                    src="/hero-lost-items.jpg"
                    alt="Everyday lost belongings including keys, wallet, headphones, and backpack"
                    className="w-full h-auto object-cover aspect-4/3"
                    loading="eager"
                  />

                  {/* Overlaid Live Context Banner */}
                  <div className="p-4 bg-white border-t border-[#E7E3DA]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#244C3A] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#244C3A]" />
                          <span>Active Community Registry</span>
                        </p>
                        <p className="text-[11px] text-[#5C645E] mt-0.5">
                          {totalCount > 0 ? `${totalCount} active items currently listed` : 'Real-time community recovery network'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          to="/items?type=LOST"
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-[#FDF5F2] border border-[#C05634]/30 text-[#C05634] hover:bg-[#FBEBE5] transition-colors"
                        >
                          {lostCount} Lost
                        </Link>
                        <Link
                          to="/items?type=FOUND"
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-[#DCE7DC]/70 border border-[#244C3A]/30 text-[#244C3A] hover:bg-[#DCE7DC] transition-colors"
                        >
                          {foundCount} Found
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Live Registry Metrics Bar: Soft Beige Accent ── */}
      <section className="bg-[#F0E8D9] border-b border-[#E2DAC9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {/* Metric 1 */}
            <div className="bg-white border border-[#E2DAC9] rounded-xl p-5 flex items-center justify-between shadow-2xs hover:border-[#C05634]/30 transition-colors">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-[#5C645E]">Active Lost Reports</p>
                <h3 className="text-2xl font-bold font-display text-[#C05634] mt-1">{loading ? '—' : lostCount}</h3>
                <p className="text-xs text-[#5C645E] mt-0.5">Misplaced belongings reported</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FDF5F2] text-[#C05634] border border-[#C05634]/20 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-[#E2DAC9] rounded-xl p-5 flex items-center justify-between shadow-2xs hover:border-[#244C3A]/30 transition-colors">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-[#5C645E]">Items Found &amp; Reported</p>
                <h3 className="text-2xl font-bold font-display text-[#244C3A] mt-1">{loading ? '—' : foundCount}</h3>
                <p className="text-xs text-[#5C645E] mt-0.5">Awaiting rightful claimants</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#DCE7DC] text-[#244C3A] border border-[#244C3A]/20 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-[#E2DAC9] rounded-xl p-5 flex items-center justify-between shadow-2xs hover:border-[#244C3A]/30 transition-colors">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-[#5C645E]">Registry Coverage</p>
                <h3 className="text-2xl font-bold font-display text-[#292B28] mt-1">{ITEM_CATEGORIES.length} Categories</h3>
                <p className="text-xs text-[#5C645E] mt-0.5">Comprehensive coverage</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FAF8F2] text-[#244C3A] border border-[#D8D3C8] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Quick Category Directory: Clean Warm Ivory Surface ── */}
      <section className="py-14 border-b border-[#E7E3DA] bg-[#FAF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#E7E3DA]">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#244C3A]">Directory</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#292B28] mt-1">
                Browse by Item Category
              </h2>
            </div>
            <Link
              to="/items"
              className="text-xs sm:text-sm font-semibold text-[#244C3A] hover:text-[#C05634] transition-colors mt-2 sm:mt-0 flex items-center gap-1 group"
            >
              <span>View all categories</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/items?category=${encodeURIComponent(cat.name)}`}
                className="p-5 bg-white border border-[#E7E3DA] rounded-xl hover:border-[#244C3A] hover:shadow-xs transition-all flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#DCE7DC]/60 text-[#244C3A] group-hover:bg-[#244C3A] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#292B28] group-hover:text-[#244C3A] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#5C645E] mt-1 leading-snug">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. How ARGUS Works: Step-by-Step with Soft Beige Grounding ── */}
      <section className="py-16 border-b border-[#E2DAC9] bg-[#F0E8D9]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-[#C05634]">Safe &amp; Systematic</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#292B28] mt-1">
              How ARGUS Helps You Recover Belongings
            </h2>
            <p className="text-sm text-[#5C645E] mt-2">
              A structured 3-step community workflow designed to protect personal belongings and verify rightful ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#E2DAC9] flex flex-col justify-between shadow-2xs hover:border-[#C05634]/30 transition-colors">
              <div>
                <span className="font-display text-3xl font-extrabold text-[#C05634]">01</span>
                <h3 className="font-display text-lg font-bold text-[#292B28] mt-2 mb-2">
                  Submit a Detailed Report
                </h3>
                <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                  Log your lost possession or report an article you discovered. Provide the location, category, date, and identifying description.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E3DA]">
                <Link
                  to="/report"
                  className="text-xs font-bold text-[#C05634] hover:text-[#A04529] inline-flex items-center gap-1"
                >
                  Create report &rarr;
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#E2DAC9] flex flex-col justify-between shadow-2xs hover:border-[#244C3A]/30 transition-colors">
              <div>
                <span className="font-display text-3xl font-extrabold text-[#244C3A]">02</span>
                <h3 className="font-display text-lg font-bold text-[#292B28] mt-2 mb-2">
                  Search &amp; Narrow Results
                </h3>
                <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                  Search across active listings using keywords, locations, and specific categories to find an exact match for your article.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E3DA]">
                <Link
                  to="/items"
                  className="text-xs font-bold text-[#244C3A] hover:text-[#1B382B] inline-flex items-center gap-1"
                >
                  Explore registry &rarr;
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#E2DAC9] flex flex-col justify-between shadow-2xs hover:border-[#5C645E]/30 transition-colors">
              <div>
                <span className="font-display text-3xl font-extrabold text-[#5C645E]/70">03</span>
                <h3 className="font-display text-lg font-bold text-[#292B28] mt-2 mb-2">
                  Verify &amp; Recover Safely
                </h3>
                <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                  Confirm true ownership by answering the submitter's private verification challenge before meeting to safely recover your belongings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E3DA]">
                <span className="text-xs font-medium text-[#5C645E]">
                  Protected by security challenges
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Recent Community Listings Section (Live API Data) ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full bg-[#FAF8F2]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[#E7E3DA]">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#292B28] mt-1">
              Recently Reported Items
            </h2>
            <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
              The latest lost and found submissions across all locations and facilities.
            </p>
          </div>
          <Link
            to="/items"
            className="text-xs sm:text-sm font-semibold text-[#244C3A] hover:text-[#C05634] transition-colors mt-3 sm:mt-0 flex items-center gap-1 group"
          >
            <span>View all listings</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-white border border-[#E7E3DA] rounded-xl p-5 animate-pulse"
              >
                <div className="h-44 bg-[#E7E3DA] rounded-lg mb-4" />
                <div className="h-4 bg-[#E7E3DA] rounded w-1/4 mb-3" />
                <div className="h-5 bg-[#E7E3DA] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#E7E3DA] rounded w-full mb-1" />
                <div className="h-3 bg-[#E7E3DA] rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-xs">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Unable to load listings
            </h3>
            <p className="text-xs text-[#5C645E] mb-4">
              {error}. Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadRecentItems}
              className="px-4 py-2 bg-[#244C3A] text-white text-xs font-semibold rounded-lg hover:bg-[#1B382B] transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recentItems.length === 0 && (
          <div className="bg-white border border-[#E7E3DA] rounded-2xl p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#DCE7DC]/60 text-[#244C3A] mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-[#292B28] mb-1.5">
              No Active Listings Yet
            </h3>
            <p className="text-xs text-[#5C645E] mb-5 leading-relaxed">
              There are currently no active reports in the portal. Be the first to report a misplaced or discovered article.
            </p>
            <div className="flex justify-center gap-2.5">
              <Link
                to="/report"
                className="px-4 py-2 bg-[#244C3A] hover:bg-[#1B382B] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Report an Item
              </Link>
              <button
                type="button"
                onClick={loadRecentItems}
                className="px-4 py-2 border border-[#D8D3C8] bg-[#FAF8F2] hover:bg-white text-[#292B28] text-xs font-medium rounded-lg transition-colors cursor-pointer"
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
                  className="card-lift bg-white border border-[#E7E3DA] rounded-xl overflow-hidden flex flex-col justify-between group shadow-2xs hover:shadow-md transition-all"
                >
                  {/* Photo or Clean Category Fallback Banner */}
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
                        className={`h-40 border-b border-[#E7E3DA] flex flex-col items-center justify-center p-4 ${
                          isLost ? 'bg-[#FDF5F2]' : 'bg-[#DCE7DC]/40'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            isLost ? 'bg-[#C05634]/15 text-[#C05634]' : 'bg-[#244C3A]/15 text-[#244C3A]'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isLost
                              ? 'text-[#C05634] border-[#C05634]/30 bg-[#C05634]/10'
                              : 'text-[#244C3A] border-[#244C3A]/30 bg-[#DCE7DC]'
                          }`}
                        >
                          {item.category || 'Item Listing'}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs ${
                        isLost
                          ? 'bg-[#C05634] text-white'
                          : 'bg-[#244C3A] text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category & Date */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C645E]">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-[#5C645E]">
                          {formatDate(item.date || item.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-base font-bold text-[#292B28] leading-snug mb-2 line-clamp-1 group-hover:text-[#244C3A] transition-colors">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#5C645E] leading-relaxed mb-4 line-clamp-2">
                        {item.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-3 border-t border-[#E7E3DA] text-xs text-[#5C645E] flex items-center justify-between">
                      <span className="truncate max-w-[65%] font-medium text-[#292B28] flex items-center gap-1.5">
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
                      <span className="font-semibold text-xs text-[#244C3A] group-hover:text-[#C05634] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5">
                        <span>Details</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 6. Trust & Safety Notice: Grounded Soft Beige Surface ── */}
      <section className="bg-[#F0E8D9] border-t border-[#E2DAC9] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E2DAC9] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#DCE7DC] text-[#244C3A] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#292B28]">
                  Safe Item Recovery Guidelines
                </h3>
                <p className="text-xs sm:text-sm text-[#5C645E] mt-1 max-w-2xl leading-relaxed">
                  For everyone’s safety, coordinate item handovers in designated public areas such as security desks, information counters, or main reception offices.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
              <Link
                to="/items"
                className="w-full md:w-auto text-center px-4 py-2.5 rounded-lg border border-[#D8D3C8] bg-[#FAF8F2] hover:bg-white text-xs font-semibold text-[#292B28] transition-colors shadow-2xs"
              >
                Search Listings
              </Link>
              <Link
                to="/report"
                className="w-full md:w-auto text-center px-4 py-2.5 rounded-lg bg-[#244C3A] hover:bg-[#1B382B] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Report Item
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;

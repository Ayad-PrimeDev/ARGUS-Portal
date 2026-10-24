import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getItemById } from '../services/itemService';
import { createClaim } from '../services/claimService';
import { useAuth } from '../context/AuthContext';

/**
 * Format date string into human-friendly full display (e.g., "October 7, 2026").
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return 'Date not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Fallback visual when an item has no image uploaded.
 */
function ImageFallback({ category, type }) {
  const isLost = type === 'LOST';
  return (
    <div
      className={`h-72 sm:h-96 w-full flex flex-col items-center justify-center p-6 text-center select-none ${
        isLost ? 'bg-[#FDF5F2]' : 'bg-[#F2F7F4]'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
          isLost ? 'bg-[#C05634]/15 text-[#C05634]' : 'bg-[#1B382B]/15 text-[#1B382B]'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
      <span
        className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border mb-2 ${
          isLost
            ? 'text-[#C05634] border-[#C05634]/30 bg-[#C05634]/10'
            : 'text-[#1B382B] border-[#1B382B]/30 bg-[#1B382B]/10'
        }`}
      >
        {category || 'Item Listing'}
      </span>
      <p className="text-xs text-[#5C645E] max-w-xs leading-relaxed">
        No photograph was attached to this report. Please review the identifying description and location details below.
      </p>
    </div>
  );
}

/**
 * Skeleton loader representing item details page.
 */
function ItemDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 skeleton">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-[#E7E3DA] rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="h-80 sm:h-96 bg-[#F4F1EA] rounded-2xl border border-[#E7E3DA]" />
          <div className="bg-white border border-[#E7E3DA] rounded-xl p-6 space-y-4">
            <div className="h-7 bg-[#E7E3DA] rounded w-3/4" />
            <div className="flex gap-4">
              <div className="h-4 bg-[#E7E3DA] rounded w-24" />
              <div className="h-4 bg-[#E7E3DA] rounded w-32" />
            </div>
            <div className="h-4 bg-[#E7E3DA] rounded w-full pt-4" />
            <div className="h-4 bg-[#E7E3DA] rounded w-5/6" />
            <div className="h-4 bg-[#E7E3DA] rounded w-2/3" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E7E3DA] rounded-xl p-6 space-y-4">
            <div className="h-6 bg-[#E7E3DA] rounded w-1/2" />
            <div className="h-4 bg-[#E7E3DA] rounded w-full" />
            <div className="h-24 bg-[#F4F1EA] rounded" />
            <div className="h-10 bg-[#E7E3DA] rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Item Details & Claim Integration Page
 */
function ItemDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Item state
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Claim form state
  const [claimMessage, setClaimMessage] = useState('');
  const [providedAnswer, setProvidedAnswer] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [submittedClaim, setSubmittedClaim] = useState(null);

  // Fetch single item from backend
  const loadItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItemById(id);
      setItem(data);
    } catch (err) {
      console.error('Failed to load item:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to retrieve item details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  // Ownership verification check: Is logged in user the reporter of this item?
  const isSubmitter = Boolean(
    user &&
    item &&
    item.submitterId &&
    (user._id === item.submitterId._id || user._id === item.submitterId || user.id === item.submitterId._id)
  );

  // Status checks
  const isActive = item?.status === 'ACTIVE';
  const isFound = item?.type === 'FOUND';
  const isLost = item?.type === 'LOST';

  // Handle claim form submission
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');

    // Validation
    if (!claimMessage.trim()) {
      setClaimError('Please provide a message explaining your claim and identifying details.');
      return;
    }

    if (item.secretQuestion && !providedAnswer.trim()) {
      setClaimError('Please answer the security verification question so the finder can verify your ownership.');
      return;
    }

    setClaimSubmitting(true);
    try {
      const response = await createClaim({
        itemId: item._id,
        message: claimMessage.trim(),
        providedAnswer: providedAnswer.trim(),
      });
      setSubmittedClaim(response);
    } catch (err) {
      console.error('Claim submission failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit claim. Please try again.';
      setClaimError(msg);
    } finally {
      setClaimSubmitting(false);
    }
  };

  // Render: Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <ItemDetailsSkeleton />
      </div>
    );
  }

  // Render: Error / Not Found State
  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-[#E7E3DA] rounded-xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#C05634]/10 text-[#C05634] flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            !
          </div>
          <h2 className="font-display text-xl font-bold text-[#1B382B] mb-2">
            Item Listing Not Available
          </h2>
          <p className="text-sm text-[#5C645E] mb-6 leading-relaxed">
            {error || 'The requested item could not be found or has been removed from the registry.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={loadItem}
              className="px-5 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
            <Link
              to="/items"
              className="px-5 py-2.5 border border-[#E7E3DA] bg-[#FBF9F5] hover:bg-white text-[#1C201D] text-xs font-semibold rounded-lg transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C201D]">
      {/* ─── Top Breadcrumb Navigation ────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E7E3DA] py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[#5C645E]">
            <Link to="/" className="hover:text-[#1B382B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/items" className="hover:text-[#1B382B] transition-colors">
              Listings
            </Link>
            <span>/</span>
            <span className="text-[#1B382B] font-medium truncate max-w-[200px] sm:max-w-xs">
              {item.title}
            </span>
          </nav>

          <Link
            to="/items"
            className="inline-flex items-center gap-1.5 font-semibold text-[#1B382B] hover:text-[#C05634] transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to listings
          </Link>
        </div>
      </header>

      {/* ─── Main Content Container ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════ LEFT COLUMN: Item Presentation (7 cols on lg) ══════════════ */}
          <section className="lg:col-span-7 space-y-6">

            {/* Item Image Card */}
            <div className="bg-white border border-[#E7E3DA] rounded-2xl overflow-hidden shadow-xs">
              {item.imageUrl ? (
                <div className="relative bg-[#1C201D]/5 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="max-h-[460px] w-full object-contain"
                  />
                  {/* Subtle overlaid badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${
                        isLost
                          ? 'bg-[#C05634] text-white'
                          : 'bg-[#1B382B] text-[#FBF9F5]'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>
              ) : (
                <ImageFallback category={item.category} type={item.type} />
              )}
            </div>

            {/* Core Item Metadata Card */}
            <article className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-8 shadow-xs">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                {/* Type Badge (if not rendered on image) */}
                {!item.imageUrl && (
                  <span
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      isLost
                        ? 'bg-[#C05634] text-white'
                        : 'bg-[#1B382B] text-[#FBF9F5]'
                    }`}
                  >
                    {item.type}
                  </span>
                )}

                {/* Category Badge */}
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F4F1EA] text-[#5C645E] border border-[#E7E3DA]">
                  {item.category}
                </span>

                {/* Status Indicator */}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                    item.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.status === 'CLAIMED'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-600'
                        : item.status === 'CLAIMED'
                        ? 'bg-amber-600'
                        : 'bg-stone-500'
                    }`}
                  />
                  {item.status}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B382B] leading-tight mb-5">
                {item.title}
              </h1>

              {/* Metadata Highlights Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FBF9F5] border border-[#E7E3DA] rounded-xl mb-6 text-xs">
                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-white border border-[#E7E3DA] text-[#1B382B] shrink-0">
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
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[#5C645E] uppercase font-semibold text-[10px] tracking-wider">
                      Location {isLost ? 'Lost' : 'Found'}
                    </span>
                    <span className="font-medium text-[#1C201D] text-xs">
                      {item.location || 'Location not specified'}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-white border border-[#E7E3DA] text-[#1B382B] shrink-0">
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
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[#5C645E] uppercase font-semibold text-[10px] tracking-wider">
                      Date {isLost ? 'Misplaced' : 'Discovered'}
                    </span>
                    <span className="font-medium text-[#1C201D] text-xs">
                      {formatDate(item.date || item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#5C645E]">
                  Description & Identifying Characteristics
                </h2>
                <div className="text-sm sm:text-base text-[#1C201D] leading-relaxed whitespace-pre-line bg-white">
                  {item.description || 'No detailed description provided by the reporter.'}
                </div>
              </div>

              {/* Record Timeline & Reporter attribution */}
              <div className="mt-8 pt-5 border-t border-[#E7E3DA] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5C645E]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1B382B] text-[#FBF9F5] flex items-center justify-center font-bold text-xs uppercase">
                    {item.submitterId?.name ? item.submitterId.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <span className="text-[#1C201D] font-medium block">
                      {item.submitterId?.name || 'Registered Community Member'}
                    </span>
                    <span className="text-[11px] text-[#5C645E]">
                      Reported {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#5C645E]">
                  Listing ID: <span className="font-mono text-[#1C201D]">{item._id}</span>
                </div>
              </div>
            </article>

            {/* Contextual Guidance Box */}
            <div className="bg-[#F4F1EA] border border-[#E7E3DA] rounded-xl p-5 text-xs text-[#5C645E] flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#1B382B] shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div>
                <strong className="text-[#1C201D] block mb-1">ARGUS Safe Exchange Guidelines</strong>
                Always verify item ownership through identifying marks, passwords, or the security question.
                Never transfer funds for return rewards. If meeting in person, select a well-lit, public location.
              </div>
            </div>
          </section>

          {/* ════ RIGHT COLUMN: Actions & Claim Integration (5 cols on lg) ═══ */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">

            {/* ─── SCENARIO 1: FOUND Item — Claim System ─────────────────── */}
            {isFound && (
              <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs">
                
                {/* Case 1A: Success state after claim submission */}
                {submittedClaim ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#1B382B] mb-2">
                      Claim Submitted
                    </h3>
                    <p className="text-xs text-[#5C645E] leading-relaxed mb-6">
                      Your ownership claim has been recorded and submitted to the finder for verification.
                      You will be notified once they review your message and answer.
                    </p>
                    <div className="p-3.5 bg-[#FAF8F5] border border-[#E7E3DA] rounded-lg text-left text-xs mb-6 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#5C645E]">Status:</span>
                        <span className="font-semibold text-emerald-700 uppercase tracking-wider">
                          {submittedClaim.status || 'Pending Review'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5C645E]">Submitted:</span>
                        <span className="font-medium text-[#1C201D]">Just now</span>
                      </div>
                    </div>
                    <Link
                      to="/items"
                      className="block w-full py-2.5 px-4 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded-lg text-center transition-colors"
                    >
                      Browse Other Listings
                    </Link>
                  </div>
                ) : !isActive ? (
                  /* Case 1B: Item is no longer active (CLAIMED / CLOSED) */
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#1B382B] mb-1.5">
                      Item No Longer Available
                    </h3>
                    <p className="text-xs text-[#5C645E] leading-relaxed mb-6">
                      This found item listing has been marked as{' '}
                      <strong className="text-[#1C201D] font-semibold">{item.status}</strong>.
                      Claims are currently closed for this report.
                    </p>
                    <Link
                      to="/items"
                      className="inline-block w-full py-2.5 px-4 bg-[#FBF9F5] border border-[#E7E3DA] hover:bg-white text-[#1C201D] text-xs font-semibold rounded-lg text-center transition-colors"
                    >
                      Explore Active Items
                    </Link>
                  </div>
                ) : isSubmitter ? (
                  /* Case 1C: Logged in user reported this item */
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-3 text-[#1B382B]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-[#1B382B]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="16" y2="12" />
                        <line x1="12" x2="12.01" y1="8" y2="8" />
                      </svg>
                      <h3 className="font-display text-base font-bold">Your Found Report</h3>
                    </div>
                    <p className="text-xs text-[#5C645E] leading-relaxed mb-5">
                      You submitted this listing. Per platform rules, reporters cannot claim items they reported.
                      You can manage and approve incoming ownership claims from community members in your dashboard.
                    </p>
                    <Link
                      to="/dashboard"
                      className="block w-full py-2.5 px-4 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded-lg text-center transition-colors"
                    >
                      Open User Dashboard
                    </Link>
                  </div>
                ) : !isAuthenticated ? (
                  /* Case 1D: Unauthenticated user — prompt login to claim */
                  <div className="py-2">
                    <div className="w-10 h-10 rounded-full bg-[#1B382B]/10 text-[#1B382B] flex items-center justify-center mb-3">
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
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#1B382B] mb-1.5">
                      Is this your belonging?
                    </h3>
                    <p className="text-xs text-[#5C645E] leading-relaxed mb-5">
                      To safeguard possessions and verify ownership, you must be signed in to submit a claim for this item.
                    </p>

                    {item.secretQuestion && (
                      <div className="p-3 bg-[#F4F1EA] border border-[#E7E3DA] rounded-lg text-xs mb-5">
                        <span className="block font-semibold text-[#1C201D] mb-0.5">
                          Verification Required:
                        </span>
                        <span className="text-[#5C645E]">
                          The finder has provided a security verification question to confirm ownership upon signing in.
                        </span>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <Link
                        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                        className="block w-full py-2.5 px-4 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded-lg text-center transition-colors shadow-xs"
                      >
                        Sign In to Claim Item
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full py-2.5 px-4 border border-[#E7E3DA] bg-[#FBF9F5] hover:bg-white text-[#1C201D] text-xs font-semibold rounded-lg text-center transition-colors"
                      >
                        Create New Account
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Case 1E: Authenticated Eligible User — Active Claim Form */
                  <div>
                    <div className="border-b border-[#E7E3DA] pb-4 mb-5">
                      <h3 className="font-display text-lg font-bold text-[#1B382B] mb-1">
                        Submit Ownership Claim
                      </h3>
                      <p className="text-xs text-[#5C645E] leading-relaxed">
                        Provide proof of ownership. The finder will review your information to coordinate safe return.
                      </p>
                    </div>

                    {/* Secret Verification Question (if item has one) */}
                    {item.secretQuestion && (
                      <div className="mb-5 p-4 bg-[#F2F7F4] border border-[#1B382B]/20 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B382B] mb-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Verification Question
                        </div>
                        <p className="text-xs font-semibold text-[#1C201D] mb-1 italic">
                          "{item.secretQuestion}"
                        </p>
                        <p className="text-[11px] text-[#5C645E]">
                          Answer this question below to confirm you are the true owner.
                        </p>
                      </div>
                    )}

                    {/* Claim Form */}
                    <form onSubmit={handleClaimSubmit} className="space-y-4">
                      {/* Secret Question Answer Input (if question exists) */}
                      {item.secretQuestion && (
                        <div>
                          <label
                            htmlFor="providedAnswer"
                            className="block text-xs font-semibold text-[#1C201D] mb-1"
                          >
                            Your Answer to Security Question <span className="text-[#C05634]">*</span>
                          </label>
                          <input
                            type="text"
                            id="providedAnswer"
                            name="providedAnswer"
                            value={providedAnswer}
                            onChange={(e) => setProvidedAnswer(e.target.value)}
                            placeholder="Enter the correct answer..."
                            disabled={claimSubmitting}
                            className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors"
                            required
                          />
                        </div>
                      )}

                      {/* Claim Message / Explanation */}
                      <div>
                        <label
                          htmlFor="claimMessage"
                          className="block text-xs font-semibold text-[#1C201D] mb-1"
                        >
                          Identifying Proof & Explanation <span className="text-[#C05634]">*</span>
                        </label>
                        <textarea
                          id="claimMessage"
                          name="claimMessage"
                          rows={4}
                          value={claimMessage}
                          onChange={(e) => setClaimMessage(e.target.value)}
                          placeholder="Describe specific features (e.g. markings, serial number, background picture, contents, or where/when you misplaced it)..."
                          disabled={claimSubmitting}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors resize-y"
                          required
                        />
                        <span className="block text-[11px] text-[#5C645E] mt-1">
                          Be as descriptive as possible to assist the finder.
                        </span>
                      </div>

                      {/* Error Alert */}
                      {claimError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs leading-relaxed">
                          {claimError}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={claimSubmitting}
                        className="w-full py-3 px-4 bg-[#1B382B] hover:bg-[#142A20] disabled:bg-[#1B382B]/60 text-[#FBF9F5] text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {claimSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            Submitting Claim...
                          </>
                        ) : (
                          'Submit Ownership Claim'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ─── SCENARIO 2: LOST Item — Contact Reporter Card ─────────── */}
            {isLost && (
              <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="border-b border-[#E7E3DA] pb-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C05634] mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#C05634]" />
                    Lost Belonging
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1B382B]">
                    Have you found this item?
                  </h3>
                  <p className="text-xs text-[#5C645E] mt-1 leading-relaxed">
                    The owner is searching for this possession. If you have located it or have pertinent details, please reach out directly.
                  </p>
                </div>

                {/* Contact Information Display */}
                <div className="p-4 bg-[#FBF9F5] border border-[#E7E3DA] rounded-xl space-y-2">
                  <span className="block text-[11px] font-semibold text-[#5C645E] uppercase tracking-wider">
                    Reporter Contact Information
                  </span>
                  <div className="text-sm font-semibold text-[#1B382B] break-all select-all flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-[#C05634] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {item.contactInformation || 'Contact info not publicly listed'}
                  </div>
                </div>

                {/* Submitter Note if user is submitter */}
                {isSubmitter && (
                  <div className="p-3 bg-[#F4F1EA] border border-[#E7E3DA] rounded-lg text-xs text-[#5C645E]">
                    <span className="font-semibold text-[#1C201D] block mb-0.5">Your Report:</span>
                    You created this lost report. If you have recovered your item, you can update its status in your dashboard.
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  <Link
                    to="/items"
                    className="block w-full py-2.5 px-4 bg-[#1B382B] hover:bg-[#142A20] text-[#FBF9F5] text-xs font-semibold rounded-lg text-center transition-colors"
                  >
                    Back to All Listings
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Summary Card */}
            <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                Registry Details
              </h4>
              <dl className="space-y-2 text-[#5C645E]">
                <div className="flex justify-between">
                  <dt>Category</dt>
                  <dd className="font-medium text-[#1C201D]">{item.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Type</dt>
                  <dd className="font-medium text-[#1C201D]">{item.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Status</dt>
                  <dd className="font-medium text-[#1C201D]">{item.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Verification</dt>
                  <dd className="font-medium text-[#1C201D]">
                    {item.secretQuestion ? 'Question Configured' : 'Direct Message'}
                  </dd>
                </div>
              </dl>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}

export default ItemDetails;

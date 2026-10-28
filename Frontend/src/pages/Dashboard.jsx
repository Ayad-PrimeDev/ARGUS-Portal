import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyItems, deleteItem } from '../services/itemService';
import { getClaims, getMyClaims, updateClaimStatus } from '../services/claimService';
import { formatShortDate } from '../utils/dateUtils';
import EditItemModal from '../components/EditItemModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ClaimTimelineModal from '../components/ClaimTimelineModal';

/**
 * Dashboard Page Component
 * Unified personal control center for the logged-in user.
 * Displays:
 * - Personalized greeting and quick action buttons
 * - 4 Key Statistics cards (Total Lost, Total Found, Active Listings, Resolved Items)
 * - Navigation tabs (Overview, My Lost Items, My Found Items, Incoming Claims, My Submitted Claims)
 * - Detailed listings with clickable cards, status badges, and claim approval/rejection workflows
 * - Responsive layout with polished loading, empty, and error states
 */
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [items, setItems] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The item currently being edited in the modal (null = modal closed)
  const [editingItem, setEditingItem] = useState(null);

  // Delete state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState('');

  // Active View Filter Tab: 'overview' | 'lost' | 'found' | 'incoming' | 'my-claims'
  const [activeTab, setActiveTab] = useState('overview');

  // Claim Timeline Modal State (null = closed)
  const [activeTimelineClaim, setActiveTimelineClaim] = useState(null);

  // Claim Action State (approving/rejecting claim)
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Load all user data simultaneously
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, incomingData, sentData] = await Promise.all([
        getMyItems(),
        getClaims(),
        getMyClaims(),
      ]);

      setItems(Array.isArray(itemsData) ? itemsData : []);
      setIncomingClaims(Array.isArray(incomingData) ? incomingData : []);
      setMyClaims(Array.isArray(sentData) ? sentData : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(
        err.response?.data?.message || err.message || 'Unable to connect to dashboard services'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Approve / Reject / Review Incoming Claim
  const handleClaimStatusUpdate = async (claimId, newStatus, note = '') => {
    setActionLoadingId(claimId);
    setActionMessage(null);
    try {
      const updated = await updateClaimStatus(claimId, newStatus, note);
      setActionMessage({
        type: 'success',
        text: `Claim successfully moved to ${newStatus.replace('_', ' ').toLowerCase()}.`,
      });
      // Refresh dashboard data to sync item status and claim lists
      await loadDashboardData();
      if (activeTimelineClaim && activeTimelineClaim._id === claimId) {
        setActiveTimelineClaim(updated);
      }
    } catch (err) {
      console.error('Error updating claim status:', err);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update claim status.',
      });
    } finally {
      setActionLoadingId(null);
      // Clear temporary notice after 4 seconds
      setTimeout(() => {
        setActionMessage(null);
      }, 4000);
    }
  };

  // Handle Delete Report Confirmation
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setDeletingItem(true);
    setDeleteModalError('');
    try {
      await deleteItem(itemToDelete._id);
      const deletedTitle = itemToDelete.title;
      // Remove item from state immediately
      setItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
      // Remove any incoming claims on this item
      setIncomingClaims((prev) =>
        prev.filter((c) => (c.itemId?._id || c.itemId) !== itemToDelete._id)
      );
      setItemToDelete(null);
      setActionMessage({
        type: 'success',
        text: `Report "${deletedTitle}" was successfully deleted.`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteModalError(
        err.response?.data?.message || err.message || 'Unable to delete report. Please try again.'
      );
    } finally {
      setDeletingItem(false);
    }
  };

  // Filter items by type
  const lostItems = items.filter((item) => item.type === 'LOST');
  const foundItems = items.filter((item) => item.type === 'FOUND');
  const activeReportsCount = items.filter((item) => item.status === 'ACTIVE').length;
  const resolvedItemsCount = items.filter((item) => item.status === 'CLAIMED').length;
  const pendingIncomingCount = incomingClaims.filter(
    (c) => c.status === 'PENDING' || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  ).length;

  // Date formatting helper using shared utility
  const formatDate = formatShortDate;

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'RETURNED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Returned & Recovered
          </span>
        );
      case 'CLAIMED':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B382B]/10 text-[#1B382B] border border-[#1B382B]/20">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>
            {status === 'CLAIMED' ? 'Resolved' : 'Approved (Awaiting Handover)'}
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <svg className="w-3 h-3 mr-1 animate-pulse text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path strokeWidth="2" d="M12 7v5l3 3" />
            </svg>
            Under Review
          </span>
        );
      case 'SUBMITTED':
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <svg className="w-3 h-3 mr-1 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4" />
            </svg>
            Submitted
          </span>
        );
      case 'REJECTED':
      case 'DECLINED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            Declined
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Closed
          </span>
        );
      case 'ACTIVE':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
    }
  };

  // Reusable Item Card Component
  const renderItemCard = (item) => (
    <div
      key={item._id}
      onClick={() => navigate(`/items/${item._id}`)}
      className="bg-white border border-[#E7E3DA] hover:border-[#1B382B]/40 rounded-xl p-4 transition-all duration-200 hover:shadow-sm cursor-pointer group flex flex-col justify-between"
    >
      <div className="flex gap-4">
        {/* Thumbnail or Fallback Icon */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E7E3DA] shrink-0 flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                e.target.parentElement.innerHTML = `
                  <div class="text-[#8A928D] text-xs font-medium text-center p-1">No Image</div>
                `;
              }}
            />
          ) : (
            <div className="text-center p-2">
              <svg
                className="w-6 h-6 mx-auto text-[#8A928D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                item.type === 'LOST'
                  ? 'bg-amber-100/70 text-[#C05634]'
                  : 'bg-[#1B382B]/10 text-[#1B382B]'
              }`}
            >
              {item.type}
            </span>
            {renderStatusBadge(item.status)}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#1C201D] group-hover:text-[#1B382B] transition-colors mt-1 truncate">
            {item.title}
          </h3>

          <p className="text-xs text-[#5C645E] mt-1 line-clamp-1">
            <span className="font-medium text-[#1C201D]">{item.category}</span> · {item.location}
          </p>

          <p className="text-[11px] text-[#8A928D] mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(item.date || item.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#F4F1EA] flex items-center justify-between text-xs text-[#5C645E]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id={`edit-item-${item._id}`}
            onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
            className="inline-flex items-center gap-1 text-[#1B382B] hover:text-[#C05634] font-semibold text-[11px] transition-colors cursor-pointer px-2 py-1 rounded hover:bg-[#F4F1EA]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            id={`delete-item-${item._id}`}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModalError('');
              setItemToDelete(item);
            }}
            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-[11px] transition-colors cursor-pointer px-2 py-1 rounded hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
        <span className="text-[#1B382B] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
          View Details →
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="h-32 bg-white border border-[#E7E3DA] rounded-2xl p-6"></div>
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
          </div>
          {/* Content Skeleton */}
          <div className="h-64 bg-white border border-[#E7E3DA] rounded-2xl"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-[#E7E3DA] rounded-2xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#C05634] mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1C201D] mb-2">Unable to Load Dashboard</h2>
          <p className="text-sm text-[#5C645E] mb-6">
            {error || 'An unexpected error occurred while fetching your personal records.'}
          </p>
          <button
            type="button"
            onClick={loadDashboardData}
            className="px-5 py-2.5 bg-[#1B382B] text-white rounded-lg text-sm font-medium hover:bg-[#142A20] transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs underline font-semibold ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Welcome Section & Quick Actions Header */}
      <section className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-[#1B382B]/5 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#5C645E]">
                Personal Command Center
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1B382B]/10 text-[#1B382B] font-semibold">

              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201D] tracking-tight">
              Welcome back, {user?.name || 'Member'}
            </h1>
            <p className="text-sm text-[#5C645E] mt-1 max-w-xl">
              Track your reported lost possessions, coordinate found belongings, and review community ownership claims.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Link
              to="/report/lost"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-[#C05634] hover:bg-[#A8482A] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Report Lost Item
            </Link>

            <Link
              to="/report/found"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-[#1B382B] hover:bg-[#142A20] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Report Found Item
            </Link>

            <Link
              to="/items"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-white border border-[#DCD7CD] hover:bg-[#F4F1EA] text-[#1C201D] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Browse Registry
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Lost Reports */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">My Lost Reports</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#C05634] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1C201D]">
            {lostItems.length}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Missing belongings registered for community search
          </p>
        </div>

        {/* Stat 2: Total Found Reports */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">My Found Reports</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1B382B] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1C201D]">
            {foundItems.length}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Found possessions held in custody awaiting owner
          </p>
        </div>

        {/* Stat 3: Active Listings */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Active Listings</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1C201D]">
            {activeReportsCount}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Currently published and discoverable in the directory
          </p>
        </div>

        {/* Stat 4: Successfully Resolved */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Resolved Returns</span>
            <div className="w-7 h-7 rounded-lg bg-[#1B382B]/10 text-[#1B382B] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1C201D]">
            {resolvedItemsCount}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Successfully reunited items (+150 pts awarded each)
          </p>
        </div>
      </section>

      {/* 3. Navigation Filter Tabs */}
      <section className="border-b border-[#E7E3DA]">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            All Activity Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lost')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lost'
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            <span>My Lost Items</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'lost' ? 'bg-white/20 text-white' : 'bg-[#E7E3DA] text-[#5C645E]'
              }`}
            >
              {lostItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('found')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'found'
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            <span>My Found Items</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'found' ? 'bg-white/20 text-white' : 'bg-[#E7E3DA] text-[#5C645E]'
              }`}
            >
              {foundItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incoming')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'incoming'
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            <span>Incoming Claims</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                pendingIncomingCount > 0
                  ? activeTab === 'incoming'
                    ? 'bg-amber-400 text-[#1C201D]'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                  : activeTab === 'incoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E7E3DA] text-[#5C645E]'
              }`}
            >
              {incomingClaims.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-claims')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'my-claims'
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            <span>My Submitted Claims</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'my-claims' ? 'bg-white/20 text-white' : 'bg-[#E7E3DA] text-[#5C645E]'
              }`}
            >
              {myClaims.length}
            </span>
          </button>
        </div>
      </section>

      {/* 4. Tab Views Content */}

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Incoming Claims Attention Banner (if pending claims exist) */}
          {pendingIncomingCount > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                <div>
                  <h3 className="text-sm font-bold text-[#1C201D]">
                    {pendingIncomingCount} Incoming {pendingIncomingCount === 1 ? 'Claim' : 'Claims'} Requiring Review
                  </h3>
                  <p className="text-xs text-[#5C645E] mt-0.5">
                    Community members have submitted verification answers on items you reported finding.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('incoming')}
                className="px-4 py-2 bg-[#1B382B] hover:bg-[#142A20] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Review Claims Now →
              </button>
            </div>
          )}

          {/* Subsection: Recent Lost Items */}
          <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA]">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201D]">
                  My Lost Items ({lostItems.length})
                </h2>
                <p className="text-xs text-[#5C645E]">Recent reports of missing belongings</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/report/lost"
                  className="text-xs font-semibold text-[#C05634] hover:underline"
                >
                  + Report Lost
                </Link>
                {lostItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('lost')}
                    className="text-xs font-semibold text-[#1B382B] hover:underline cursor-pointer"
                  >
                    View All ({lostItems.length}) →
                  </button>
                )}
              </div>
            </div>

            {lostItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lostItems.slice(0, 6).map(renderItemCard)}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#1C201D]">No Lost Items Reported</p>
                <p className="text-xs text-[#5C645E] mt-1 mb-4">
                  Have you misplaced something? Register a lost report to notify the community.
                </p>
                <Link
                  to="/report/lost"
                  className="inline-flex items-center px-3.5 py-1.5 bg-[#C05634] text-white rounded-lg text-xs font-semibold hover:bg-[#A8482A] transition-colors"
                >
                  Report a Lost Item
                </Link>
              </div>
            )}
          </div>

          {/* Subsection: Recent Found Items */}
          <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA]">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201D]">
                  My Found Items ({foundItems.length})
                </h2>
                <p className="text-xs text-[#5C645E]">Items you discovered and reported to the registry</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/report/found"
                  className="text-xs font-semibold text-[#1B382B] hover:underline"
                >
                  + Report Found
                </Link>
                {foundItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('found')}
                    className="text-xs font-semibold text-[#1B382B] hover:underline cursor-pointer"
                  >
                    View All ({foundItems.length}) →
                  </button>
                )}
              </div>
            </div>

            {foundItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foundItems.slice(0, 6).map(renderItemCard)}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#1C201D]">No Found Items Reported</p>
                <p className="text-xs text-[#5C645E] mt-1 mb-4">
                  Found someone's property? Report it to help return it to its rightful owner and earn reputation points.
                </p>
                <Link
                  to="/report/found"
                  className="inline-flex items-center px-3.5 py-1.5 bg-[#1B382B] text-white rounded-lg text-xs font-semibold hover:bg-[#142A20] transition-colors"
                >
                  Report a Found Item
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: MY LOST ITEMS */}
      {activeTab === 'lost' && (
        <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1C201D]">
                My Lost Belongings
              </h2>
              <p className="text-xs text-[#5C645E]">
                All lost-item reports submitted by your account
              </p>
            </div>
            <Link
              to="/report/lost"
              className="inline-flex items-center px-4 py-2 bg-[#C05634] text-white text-xs font-semibold rounded-lg hover:bg-[#A8482A] transition-colors cursor-pointer self-start sm:self-auto"
            >
              + File New Lost Report
            </Link>
          </div>

          {lostItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lostItems.map(renderItemCard)}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#1C201D] mb-1">No Lost Reports</h3>
              <p className="text-xs text-[#5C645E] max-w-sm mx-auto mb-5 leading-relaxed">
                You haven't filed any lost-item reports yet. If you have lost an item, submit a report so finders can reach you.
              </p>
              <Link
                to="/report/lost"
                className="inline-flex items-center px-4 py-2 bg-[#C05634] text-white rounded-lg text-xs font-semibold hover:bg-[#A8482A] transition-colors"
              >
                Report Lost Belonging
              </Link>
            </div>
          )}
        </div>
      )}

      {/* VIEW: MY FOUND ITEMS */}
      {activeTab === 'found' && (
        <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1C201D]">
                My Found Belongings
              </h2>
              <p className="text-xs text-[#5C645E]">
                All found-item reports you registered with custody and verification questions
              </p>
            </div>
            <Link
              to="/report/found"
              className="inline-flex items-center px-4 py-2 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] transition-colors cursor-pointer self-start sm:self-auto"
            >
              + File New Found Report
            </Link>
          </div>

          {foundItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {foundItems.map(renderItemCard)}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#1C201D] mb-1">No Found Reports</h3>
              <p className="text-xs text-[#5C645E] max-w-sm mx-auto mb-5 leading-relaxed">
                You haven't reported finding any belongings. Reporting found items awards +150 reputation points upon completed recovery!
              </p>
              <Link
                to="/report/found"
                className="inline-flex items-center px-4 py-2 bg-[#1B382B] text-white rounded-lg text-xs font-semibold hover:bg-[#142A20] transition-colors"
              >
                Report a Found Item
              </Link>
            </div>
          )}
        </div>
      )}

      {/* VIEW: INCOMING CLAIMS */}
      {activeTab === 'incoming' && (
        <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#E7E3DA]">
            <h2 className="text-xl font-serif font-bold text-[#1C201D]">
              Incoming Ownership Claims
            </h2>
            <p className="text-xs text-[#5C645E]">
              Verification requests submitted by community members claiming items you reported finding
            </p>
          </div>

          {incomingClaims.length > 0 ? (
            <div className="space-y-4">
              {incomingClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="border border-[#E7E3DA] hover:border-[#1B382B]/30 rounded-xl p-5 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Item and Claimant Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3">
                        <span className="font-mono text-xs font-bold text-[#1B382B] bg-[#1B382B]/5 px-2 py-0.5 rounded border border-[#1B382B]/10">
                          #CLM-{claim._id.slice(-6).toUpperCase()}
                        </span>
                        {renderStatusBadge(claim.status)}
                        <span className="text-xs text-[#8A928D]">
                          Submitted {formatDate(claim.createdAt)}
                        </span>
                      </div>

                      {/* Associated Item */}
                      {claim.itemId ? (
                        <div className="flex items-center gap-3">
                          {claim.itemId.imageUrl && (
                            <img
                              src={claim.itemId.imageUrl}
                              alt={claim.itemId.title}
                              className="w-12 h-12 object-cover rounded-lg border border-[#E7E3DA] shrink-0"
                            />
                          )}
                          <div>
                            <span className="text-[11px] font-semibold uppercase text-[#5C645E]">
                              Target Item:
                            </span>
                            <Link
                              to={`/items/${claim.itemId._id}`}
                              className="text-base font-bold text-[#1C201D] hover:text-[#1B382B] block hover:underline transition-colors mt-0.5"
                            >
                              {claim.itemId.title}
                            </Link>
                            <p className="text-xs text-[#5C645E]">
                              Location: {claim.itemId.location} · Status: {claim.itemId.status}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#8A928D] italic">Associated item was deleted</p>
                      )}

                      {/* Claimant Identity & Message */}
                      <div className="p-3 bg-white rounded-lg border border-[#E7E3DA] text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#5C645E] font-medium">Claimant:</span>
                          <span className="font-bold text-[#1C201D]">
                            {claim.requesterId?.name || 'Verified Member'}
                          </span>
                          {claim.requesterId?.email && (
                            <span className="text-[#8A928D]">({claim.requesterId.email})</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[#5C645E] font-medium">Message:</span>{' '}
                          <span className="text-[#1C201D]">“{claim.message}”</span>
                        </div>

                        {claim.providedAnswer && (
                          <div className="pt-1 border-t border-[#F4F1EA]">
                            <span className="text-[#5C645E] font-medium">Verification Answer:</span>{' '}
                            <span className="font-semibold text-[#1B382B] bg-[#1B382B]/5 px-2 py-0.5 rounded">
                              {claim.providedAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Claim Decision & Timeline Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => setActiveTimelineClaim(claim)}
                        className="px-3.5 py-2 bg-white border border-[#1B382B] text-[#1B382B] text-xs font-semibold rounded-lg hover:bg-[#1B382B]/5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Track Timeline
                      </button>

                      {/* Status quick triggers */}
                      {(claim.status === 'PENDING' || claim.status === 'SUBMITTED') && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === claim._id}
                            onClick={() => handleClaimStatusUpdate(claim._id, 'UNDER_REVIEW', 'Authorized reviewer is examining ownership verification details.')}
                            className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Start Review
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === claim._id}
                            onClick={() => handleClaimStatusUpdate(claim._id, 'APPROVED', 'Ownership verification confirmed. Ready for item handover.')}
                            className="px-3.5 py-1.5 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                          >
                            {actionLoadingId === claim._id ? 'Processing...' : 'Approve Claim'}
                          </button>
                        </>
                      )}

                      {claim.status === 'UNDER_REVIEW' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === claim._id}
                          onClick={() => handleClaimStatusUpdate(claim._id, 'APPROVED', 'Verification review completed successfully. Item approved for handover.')}
                          className="px-3.5 py-1.5 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                        >
                          {actionLoadingId === claim._id ? 'Processing...' : 'Approve Claim'}
                        </button>
                      )}

                      {claim.status === 'APPROVED' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === claim._id}
                          onClick={() => handleClaimStatusUpdate(claim._id, 'RETURNED', 'Physical item handover successfully completed to the verified owner.')}
                          className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Record Handover (Returned)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#1C201D] mb-1">No Incoming Claims</h3>
              <p className="text-xs text-[#5C645E] max-w-sm mx-auto leading-relaxed">
                When other users spot their lost possessions among your found listings, their ownership verification claims will appear here for your review.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: MY SUBMITTED CLAIMS */}
      {activeTab === 'my-claims' && (
        <div className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E3DA]">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1C201D]">
                My Submitted Claims
              </h2>
              <p className="text-xs text-[#5C645E]">
                Claims you filed for items reported found by other members
              </p>
            </div>
            <Link
              to="/items"
              className="inline-flex items-center px-4 py-2 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] transition-colors cursor-pointer self-start sm:self-auto"
            >
              Search Found Registry
            </Link>
          </div>

          {myClaims.length > 0 ? (
            <div className="space-y-4">
              {myClaims.map((claim) => {
                const normStatus = claim.status === 'PENDING' ? 'SUBMITTED' : claim.status;
                const isRejected = normStatus === 'REJECTED';
                const isApproved = normStatus === 'APPROVED';
                const isReturned = normStatus === 'RETURNED';
                const isUnderReview = normStatus === 'UNDER_REVIEW';

                return (
                  <div
                    key={claim._id}
                    className="border border-[#E7E3DA] hover:border-[#1B382B]/30 rounded-xl p-5 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#1B382B] bg-[#1B382B]/5 px-2 py-0.5 rounded border border-[#1B382B]/10">
                            #CLM-{claim._id.slice(-6).toUpperCase()}
                          </span>
                          {renderStatusBadge(claim.status)}
                          <span className="text-xs text-[#8A928D]">
                            Filed {formatDate(claim.createdAt)}
                          </span>
                        </div>

                        {claim.itemId ? (
                          <div className="flex items-center gap-3 pt-1">
                            {claim.itemId.imageUrl && (
                              <img
                                src={claim.itemId.imageUrl}
                                alt={claim.itemId.title}
                                className="w-12 h-12 object-cover rounded-lg border border-[#E7E3DA] shrink-0"
                              />
                            )}
                            <div>
                              <Link
                                to={`/items/${claim.itemId._id}`}
                                className="text-base font-bold text-[#1C201D] hover:text-[#1B382B] hover:underline transition-colors block"
                              >
                                {claim.itemId.title}
                              </Link>
                              <p className="text-xs text-[#5C645E]">
                                Found in: {claim.itemId.location} · Category: {claim.itemId.category}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#8A928D] italic">Item record was removed</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setActiveTimelineClaim(claim)}
                          className="px-3.5 py-2 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Track Timeline →
                        </button>
                      </div>
                    </div>

                    {/* Step Progress Tracker Bar */}
                    <div className="bg-white rounded-lg p-3 border border-[#E7E3DA]/80">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {/* Step 1: Submitted */}
                        <div className="flex flex-col items-center">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-1">
                            ✓
                          </span>
                          <span className="font-semibold text-[#1C201D] text-[11px]">Submitted</span>
                        </div>

                        {/* Step 2: Under Review */}
                        <div className="flex flex-col items-center">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                            isUnderReview
                              ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-400'
                              : isApproved || isReturned || isRejected
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isApproved || isReturned || isRejected ? '✓' : '2'}
                          </span>
                          <span className="font-semibold text-[#1C201D] text-[11px]">Under Review</span>
                        </div>

                        {/* Step 3: Decision */}
                        <div className="flex flex-col items-center">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                            isRejected
                              ? 'bg-rose-100 text-rose-700'
                              : isApproved || isReturned
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isRejected ? '✕' : isApproved || isReturned ? '✓' : '3'}
                          </span>
                          <span className="font-semibold text-[#1C201D] text-[11px]">
                            {isRejected ? 'Declined' : 'Approved'}
                          </span>
                        </div>

                        {/* Step 4: Returned */}
                        <div className="flex flex-col items-center">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                            isReturned
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isReturned ? '✓' : '4'}
                          </span>
                          <span className="font-semibold text-[#1C201D] text-[11px]">Returned</span>
                        </div>
                      </div>
                    </div>

                    {/* Context Notice / Banners */}
                    {isApproved && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                        <svg className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-bold">Claim Approved — Awaiting Handover</p>
                          <p className="mt-0.5 text-emerald-800">
                            Your claim has been accepted! Please coordinate with the finder or campus administrator to complete the physical handover of your item. Once handed over, the claim will be marked Returned.
                          </p>
                        </div>
                      </div>
                    )}

                    {isReturned && (
                      <div className="p-3 bg-emerald-100/60 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
                        <svg className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-bold">Recovery Complete — Item Returned</p>
                          <p className="mt-0.5 text-emerald-900">
                            The physical handover of your property was recorded and successfully verified. Thank you for using ARGUS Portal!
                          </p>
                        </div>
                      </div>
                    )}

                    {isRejected && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2">
                        <svg className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-bold">Claim Declined</p>
                          <p className="mt-0.5 text-rose-800">
                            {claim.rejectionReason
                              ? `Reason: “${claim.rejectionReason}”`
                              : "The provided verification information did not match the finder's records."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#1C201D] mb-1">No Claims Submitted</h3>
              <p className="text-xs text-[#5C645E] max-w-sm mx-auto mb-5 leading-relaxed">
                If you recognize a found item in the registry as your belonging, you can submit an ownership claim with verification proof.
              </p>
              <Link
                to="/items"
                className="inline-flex items-center px-4 py-2 bg-[#1B382B] text-white rounded-lg text-xs font-semibold hover:bg-[#142A20] transition-colors"
              >
                Browse Found Registry
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Edit Item Modal — opens when user clicks Edit on any item card */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(updatedItem) => {
            // Update the item in local state so the card reflects new data immediately
            setItems((prev) =>
              prev.map((i) => (i._id === updatedItem._id ? { ...i, ...updatedItem } : i))
            );
            setEditingItem(null);
          }}
        />
      )}

      {/* Delete Item Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        itemName={itemToDelete?.title}
        onClose={() => {
          setItemToDelete(null);
          setDeleteModalError('');
        }}
        onConfirm={handleDeleteItem}
        deleting={deletingItem}
        error={deleteModalError}
      />

      {/* Claim Timeline Tracking Modal */}
      {activeTimelineClaim && (
        <ClaimTimelineModal
          claim={activeTimelineClaim}
          onClose={() => setActiveTimelineClaim(null)}
          onStatusUpdated={(updated) => {
            loadDashboardData();
            setActiveTimelineClaim(updated);
          }}
        />
      )}
    </main>
  );
}

export default Dashboard;

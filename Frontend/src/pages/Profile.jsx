import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, submitRating } from '../services/userService';
import { formatShortDate } from '../utils/dateUtils';

/**
 * Achievement Tier Metadata & Visual Themes
 */
const TIER_CONFIG = {
  Bronze: {
    label: 'Bronze',
    min: 0,
    max: 99,
    badgeBg: 'bg-[#8C5D39]/10',
    badgeText: 'text-[#734320]',
    badgeBorder: 'border-[#8C5D39]/30',
    barColor: 'bg-[#8C5D39]',
    iconColor: '#8C5D39',
    description: 'Entry Tier · Building community standing',
  },
  Silver: {
    label: 'Silver',
    min: 100,
    max: 299,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    barColor: 'bg-slate-500',
    iconColor: '#64748B',
    description: 'Active Contributor · Verified returns completed',
  },
  Gold: {
    label: 'Gold',
    min: 300,
    max: 599,
    badgeBg: 'bg-[#E5B53B]/15',
    badgeText: 'text-[#966E0C]',
    badgeBorder: 'border-[#E5B53B]/40',
    barColor: 'bg-[#C9971E]',
    iconColor: '#C9971E',
    description: 'Trusted Guardian · High volume of verified recoveries',
  },
  Platinum: {
    label: 'Platinum',
    min: 600,
    max: 999,
    badgeBg: 'bg-[#4A6572]/15',
    badgeText: 'text-[#2C414D]',
    badgeBorder: 'border-[#4A6572]/40',
    barColor: 'bg-[#4A6572]',
    iconColor: '#4A6572',
    description: 'Exemplary Partner · Pillar of community lost & found',
  },
  Diamond: {
    label: 'Diamond',
    min: 1000,
    max: Infinity,
    badgeBg: 'bg-[#0D7377]/15',
    badgeText: 'text-[#0A575A]',
    badgeBorder: 'border-[#0D7377]/40',
    barColor: 'bg-[#0D7377]',
    iconColor: '#0D7377',
    description: 'Master Custodian · Highest verified community tier',
  },
};

/**
 * Profile Page Component
 * Displays user identity, server-verified reputation metrics, achievement tiers,
 * trust reviews, rateable returns, recent report history, and editable profile details.
 */
function Profile() {
  const { user: authUser, updateUser } = useAuth();

  // State Management
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
    phoneNumber: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Rate Counterparty Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [activeReturnForRating, setActiveReturnForRating] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(null);

  // Fetch full profile and reputation data
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile();
      setProfileData(data);
      if (data.user) {
        setEditFormData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          profileImage: data.user.profileImage || '',
          phoneNumber: data.user.phoneNumber || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || err.message || 'Unable to retrieve profile information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (profileData?.user) {
      setEditFormData({
        name: profileData.user.name || '',
        bio: profileData.user.bio || '',
        profileImage: profileData.user.profileImage || '',
        phoneNumber: profileData.user.phoneNumber || '',
      });
    }
    setEditError(null);
    setEditSuccess(false);
    setEditModalOpen(true);
  };

  // Submit Edit Form
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setEditError('Full Name cannot be empty');
      return;
    }

    setEditSaving(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const updated = await updateUserProfile(editFormData);
      updateUser({
        name: updated.name,
        profileImage: updated.profileImage,
        bio: updated.bio,
        phoneNumber: updated.phoneNumber,
      });

      // Update local profile state
      setProfileData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          name: updated.name,
          profileImage: updated.profileImage,
          bio: updated.bio,
          phoneNumber: updated.phoneNumber,
        },
      }));

      setEditSuccess(true);
      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setEditSaving(false);
    }
  };

  // Open Rating Modal
  const handleOpenRating = (ret) => {
    setActiveReturnForRating(ret);
    setSelectedScore(5);
    setHoverScore(0);
    setReviewComment('');
    setRatingError(null);
    setRatingModalOpen(true);
  };

  // Submit Rating
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!activeReturnForRating) return;

    setRatingSubmitting(true);
    setRatingError(null);

    try {
      await submitRating({
        itemId: activeReturnForRating.itemId,
        rating: selectedScore,
        review: reviewComment.trim(),
      });

      setRatingModalOpen(false);
      setActiveReturnForRating(null);
      // Reload profile to refresh ratings and metrics
      await fetchProfile();
    } catch (err) {
      setRatingError(err.response?.data?.message || err.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Helper for star visualization
  const renderStars = (ratingValue, max = 5, sizeClasses = 'w-4 h-4') => {
    const stars = [];
    const normalized = Math.max(0, Math.min(max, ratingValue));

    for (let i = 1; i <= max; i++) {
      const isFull = i <= normalized;
      const isHalf = !isFull && i - 0.5 <= normalized;

      stars.push(
        <svg
          key={i}
          className={`${sizeClasses} ${
            isFull
              ? 'text-amber-400 fill-amber-400'
              : isHalf
              ? 'text-amber-400 fill-amber-300'
              : 'text-[#DCD7CD] fill-transparent'
          }`}
          viewBox="0 0 20 20"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    }
    return <div className="flex items-center space-x-0.5">{stars}</div>;
  };

  // Helper for date formatting using shared utility
  const formatDate = (dateString) => formatShortDate(dateString, 'Recent');

  // Status Chip helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'CLAIMED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1B382B]/10 text-[#1B382B] border border-[#1B382B]/20">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
            Returned
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Closed
          </span>
        );
      case 'ACTIVE':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-44 bg-white border border-[#E7E3DA] rounded-2xl p-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
            <div className="h-28 bg-white border border-[#E7E3DA] rounded-xl"></div>
          </div>
          <div className="h-64 bg-white border border-[#E7E3DA] rounded-2xl"></div>
        </div>
      </main>
    );
  }

  if (error || !profileData) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-[#E7E3DA] rounded-2xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#C05634] mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1C201D] mb-2">Unable to Load Profile</h2>
          <p className="text-sm text-[#5C645E] mb-6">{error || 'An unexpected error occurred while fetching your user profile.'}</p>
          <button
            type="button"
            onClick={fetchProfile}
            className="px-5 py-2.5 bg-[#1B382B] text-white rounded-lg text-sm font-medium hover:bg-[#142A20] transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  const { user, reputation, recentReports = [], rateableReturns = [] } = profileData;
  const currentTierConfig = TIER_CONFIG[reputation.tier] || TIER_CONFIG.Bronze;
  const initials = (user.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Profile Header & Identity Card */}
      <section className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#1B382B]/5 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            {/* Avatar or Monogram */}
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#E7E3DA] shadow-xs"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#1B382B] text-[#FAF8F5] flex items-center justify-center text-2xl font-serif font-bold shadow-xs">
                {initials}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201D] tracking-tight">
                  {user.name}
                </h1>
                {/* Achievement Tier Badge in Header */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentTierConfig.badgeBg} ${currentTierConfig.badgeText} ${currentTierConfig.badgeBorder}`}
                >
                  <svg
                    className="w-3.5 h-3.5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 01.894.553l1.618 3.279 3.619.526a1 1 0 01.554 1.706l-2.618 2.552.618 3.604a1 1 0 01-1.451 1.054L10 13.577l-3.234 1.7a1 1 0 01-1.451-1.054l.618-3.604-2.618-2.552a1 1 0 01.554-1.706l3.619-.526L9.106 2.553A1 1 0 0110 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {reputation.tier} Member
                </span>
              </div>

              <p className="text-sm text-[#5C645E] flex items-center gap-2 flex-wrap">
                <span>{user.email}</span>
                <span className="text-[#DCD7CD]">·</span>
                <span>Member since {formatDate(user.createdAt)}</span>
                {user.phoneNumber && (
                  <>
                    <span className="text-[#DCD7CD]">·</span>
                    <span>{user.phoneNumber}</span>
                  </>
                )}
              </p>

              {user.bio ? (
                <p className="text-sm text-[#1C201D] mt-2 max-w-xl italic text-[#5C645E]">
                  “{user.bio}”
                </p>
              ) : (
                <p className="text-xs text-[#8A928D] mt-1.5 italic">
                  No public bio provided. Click edit profile to add a brief introduction.
                </p>
              )}
            </div>
          </div>

          {/* Action Button: Edit Profile */}
          <div className="self-end sm:self-center">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center px-4 py-2 border border-[#DCD7CD] hover:border-[#1B382B] text-xs sm:text-sm font-semibold rounded-lg text-[#1C201D] bg-white hover:bg-[#F4F1EA] transition-colors cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 mr-1.5 text-[#5C645E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* 2. Achievement Tier & Contribution Points Progression */}
      <section className="bg-white border border-[#E7E3DA] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E7E3DA]">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#5C645E]">
              Contribution Standing
            </span>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl sm:text-4xl font-serif font-black text-[#1C201D]">
                {reputation.points}
              </span>
              <span className="text-sm font-semibold text-[#5C645E]">
                Verified Contribution Points
              </span>
            </div>
            <p className="text-xs text-[#5C645E] mt-1">
              {currentTierConfig.description}
            </p>
          </div>

          {/* Current Tier Badge & Next Tier Target */}
          <div className="flex items-center gap-4 bg-[#FAF8F5] border border-[#E7E3DA] p-3.5 rounded-xl">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${currentTierConfig.badgeBg} ${currentTierConfig.badgeText} ${currentTierConfig.badgeBorder}`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#5C645E] font-medium">Current Status</p>
              <p className="text-base font-bold text-[#1C201D]">{reputation.tier} Tier</p>
              {reputation.nextTier ? (
                <p className="text-[11px] text-[#5C645E]">
                  <span className="font-semibold text-[#1C201D]">{reputation.pointsToNextTier} pts</span> to reach {reputation.nextTier}
                </p>
              ) : (
                <p className="text-[11px] text-[#0A575A] font-semibold">Maximum Distinction Achieved</p>
              )}
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="pt-6">
          <div className="flex justify-between items-center text-xs font-medium text-[#5C645E] mb-2">
            <span>{reputation.tier} ({reputation.points} pts)</span>
            <span>
              {reputation.nextTier
                ? `${reputation.progressPercent}% to ${reputation.nextTier}`
                : 'Diamond Pinnacle (100%)'}
            </span>
          </div>
          <div className="w-full bg-[#E7E3DA] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${currentTierConfig.barColor} transition-all duration-700 ease-out`}
              style={{ width: `${reputation.progressPercent}%` }}
            ></div>
          </div>

          {/* Tier Milestones Reference Guide */}
          <div className="grid grid-cols-5 text-center mt-3 pt-3 border-t border-[#F4F1EA] text-[11px] text-[#5C645E]">
            <div>
              <span className={reputation.tier === 'Bronze' ? 'font-bold text-[#734320]' : ''}>Bronze</span>
              <span className="block text-[10px] text-[#8A928D]">0–99 pts</span>
            </div>
            <div>
              <span className={reputation.tier === 'Silver' ? 'font-bold text-slate-800' : ''}>Silver</span>
              <span className="block text-[10px] text-[#8A928D]">100–299 pts</span>
            </div>
            <div>
              <span className={reputation.tier === 'Gold' ? 'font-bold text-[#966E0C]' : ''}>Gold</span>
              <span className="block text-[10px] text-[#8A928D]">300–599 pts</span>
            </div>
            <div>
              <span className={reputation.tier === 'Platinum' ? 'font-bold text-[#2C414D]' : ''}>Platinum</span>
              <span className="block text-[10px] text-[#8A928D]">600–999 pts</span>
            </div>
            <div>
              <span className={reputation.tier === 'Diamond' ? 'font-bold text-[#0A575A]' : ''}>Diamond</span>
              <span className="block text-[10px] text-[#8A928D]">1,000+ pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Reputation Statistics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Trust Rating */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Trust Rating</span>
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#1C201D]">
              {reputation.totalRatings > 0 ? reputation.averageRating.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-[#5C645E]">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            {reputation.totalRatings > 0 ? (
              renderStars(reputation.averageRating, 5, 'w-3.5 h-3.5')
            ) : (
              <span className="text-[11px] text-[#8A928D] italic">No ratings yet</span>
            )}
            <span className="text-[11px] font-medium text-[#5C645E]">
              {reputation.totalRatings} {reputation.totalRatings === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {/* Metric 2: Completed Returns */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Items Returned</span>
            <svg className="w-4 h-4 text-[#1B382B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1C201D]">
            {reputation.itemsReturned}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Successful recoveries to rightful owners (+150 pts each)
          </p>
        </div>

        {/* Metric 3: Lost Reports */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Lost Reports</span>
            <svg className="w-4 h-4 text-[#C05634]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1C201D]">
            {reputation.lostReportsCount}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Lost item listings registered in portal (+10 pts each)
          </p>
        </div>

        {/* Metric 4: Found Reports */}
        <div className="bg-white border border-[#E7E3DA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5C645E] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Found Reports</span>
            <svg className="w-4 h-4 text-[#1B382B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1C201D]">
            {reputation.foundReportsCount}
          </div>
          <p className="text-xs text-[#5C645E] mt-2">
            Found belongings published to community registry
          </p>
        </div>
      </section>

      {/* 4. Actionable Rateable Returns (If any completed return awaits feedback) */}
      {rateableReturns && rateableReturns.length > 0 && (
        <section className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-base font-bold text-[#1C201D]">
              Completed Return Awaiting Feedback
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5C645E] mb-4">
            You recently had an approved claim on an item. Leave a trust review for the finder to help build their community standing.
          </p>

          <div className="space-y-3">
            {rateableReturns.map((itemReturn) => (
              <div
                key={itemReturn.claimId}
                className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#1C201D]">
                    {itemReturn.itemTitle}
                  </h3>
                  <p className="text-xs text-[#5C645E] mt-0.5">
                    Found and returned by <span className="font-semibold text-[#1C201D]">{itemReturn.finder?.name || 'Community Member'}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenRating(itemReturn)}
                  className="px-3.5 py-1.5 bg-[#1B382B] text-white hover:bg-[#142A20] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Rate Experience ★
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Two-Column Layout: Trust Reviews & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Five-Star Trust Ratings & Reviews */}
        <section className="bg-white border border-[#E7E3DA] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E3DA] mb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201D]">
                  Community Trust Reviews
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Verified ratings submitted by return counterparties
                </p>
              </div>
              <span className="text-xs font-semibold bg-[#FAF8F5] border border-[#E7E3DA] text-[#1C201D] px-2.5 py-1 rounded-md">
                {reputation.totalRatings} Verified
              </span>
            </div>

            {reputation.ratings && reputation.ratings.length > 0 ? (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {reputation.ratings.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3.5 rounded-xl border border-[#F4F1EA] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#1B382B]/10 text-[#1B382B] font-semibold text-[10px] flex items-center justify-center">
                          {rev.raterId?.name ? rev.raterId.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-xs font-bold text-[#1C201D]">
                          {rev.raterId?.name || 'Verified Member'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8A928D]">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      {renderStars(rev.rating, 5, 'w-3 h-3')}
                      {rev.itemId?.title && (
                        <span className="text-[11px] text-[#5C645E] truncate">
                          for <span className="font-medium text-[#1C201D]">{rev.itemId.title}</span>
                        </span>
                      )}
                    </div>

                    {rev.review ? (
                      <p className="text-xs text-[#1C201D] mt-1 italic">
                        “{rev.review}”
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#8A928D] italic">
                        No written comment provided.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Clean Empty State for Ratings */
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#1C201D] mb-1">
                  No Trust Ratings Yet
                </h3>
                <p className="text-xs text-[#5C645E] max-w-sm mx-auto leading-relaxed">
                  Ratings are awarded after verified returns. Complete returns to build your community trust score.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F4F1EA] text-[11px] text-[#8A928D] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#5C645E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ratings cannot be self-submitted or fabricated. Strict server validation prevents duplicates.</span>
          </div>
        </section>

        {/* Right Column: User's Recent Reports & Statuses */}
        <section className="bg-white border border-[#E7E3DA] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E3DA] mb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201D]">
                  My Recent Reports
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Your submitted lost and found activity
                </p>
              </div>
              <Link
                to="/report"
                className="text-xs font-semibold text-[#1B382B] hover:text-[#142A20] hover:underline"
              >
                + New Report
              </Link>
            </div>

            {recentReports && recentReports.length > 0 ? (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {recentReports.map((report) => (
                  <Link
                    key={report._id}
                    to={`/items/${report._id}`}
                    className="block p-3.5 rounded-xl border border-[#F4F1EA] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] hover:border-[#E7E3DA] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                              report.type === 'LOST'
                                ? 'bg-amber-100/70 text-[#C05634]'
                                : 'bg-[#1B382B]/10 text-[#1B382B]'
                            }`}
                          >
                            {report.type}
                          </span>
                          <span className="text-xs text-[#8A928D]">
                            {formatDate(report.date || report.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1C201D] group-hover:text-[#1B382B] transition-colors">
                          {report.title}
                        </h3>
                        <p className="text-xs text-[#5C645E] mt-0.5 line-clamp-1">
                          {report.location} · {report.category}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        {renderStatusBadge(report.status)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Clean Empty State for Reports */
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#8A928D] mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#8A928D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#1C201D] mb-1">
                  No Reports Submitted Yet
                </h3>
                <p className="text-xs text-[#5C645E] max-w-sm mx-auto mb-4 leading-relaxed">
                  Lost an item or found someone's belonging? File a report to earn contribution points and help the community.
                </p>
                <Link
                  to="/report"
                  className="inline-flex items-center px-4 py-2 bg-[#1B382B] text-white rounded-lg text-xs font-semibold hover:bg-[#142A20] transition-colors"
                >
                  Submit a Report
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F4F1EA] text-[11px] text-[#8A928D] flex items-center justify-between">
            <span>Showing recent submissions</span>
            <Link to="/items" className="text-[#1B382B] font-semibold hover:underline">
              Browse All Listings →
            </Link>
          </div>
        </section>
      </div>

      {/* 6. Edit Profile Modal Dialog */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl border border-[#E7E3DA] shadow-xl max-w-lg w-full p-6 sm:p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E3DA] mb-5">
              <div>
                <h2 id="edit-profile-title" className="text-lg font-serif font-bold text-[#1C201D]">
                  Edit Profile Information
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Update your personal details. Protected attributes are read-only.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-[#8A928D] hover:text-[#1C201D] p-1 rounded-md"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="edit-name" className="block text-xs font-bold text-[#1C201D] mb-1">
                  Full Name <span className="text-[#C05634]">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#DCD7CD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B]"
                  placeholder="Enter your name"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="edit-bio" className="block text-xs font-bold text-[#1C201D]">
                    Bio
                  </label>
                  <span className="text-[10px] text-[#8A928D]">
                    {editFormData.bio.length}/300
                  </span>
                </div>
                <textarea
                  id="edit-bio"
                  rows="3"
                  maxLength={300}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#DCD7CD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B] resize-none"
                  placeholder="Tell the community a little about yourself..."
                />
              </div>

              {/* Profile Image URL */}
              <div>
                <label htmlFor="edit-image" className="block text-xs font-bold text-[#1C201D] mb-1">
                  Profile Avatar Image URL
                </label>
                <input
                  id="edit-image"
                  type="url"
                  value={editFormData.profileImage}
                  onChange={(e) => setEditFormData({ ...editFormData, profileImage: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#DCD7CD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B]"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="edit-phone" className="block text-xs font-bold text-[#1C201D] mb-1">
                  Contact Phone Number
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#DCD7CD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Protected Read-Only Notice Box */}
              <div className="p-3 bg-[#FAF8F5] border border-[#E7E3DA] rounded-lg space-y-1.5 text-[11px] text-[#5C645E]">
                <div className="flex items-center gap-1.5 font-semibold text-[#1C201D]">
                  <svg className="w-3.5 h-3.5 text-[#1B382B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  <span>Protected Fields (Server Governed)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[#8A928D]">Email:</span>{' '}
                    <span className="font-medium text-[#1C201D]">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-[#8A928D]">Tier:</span>{' '}
                    <span className="font-medium text-[#1C201D]">{reputation.tier}</span>
                  </div>
                  <div>
                    <span className="text-[#8A928D]">Points:</span>{' '}
                    <span className="font-medium text-[#1C201D]">{reputation.points}</span>
                  </div>
                  <div>
                    <span className="text-[#8A928D]">Role:</span>{' '}
                    <span className="font-medium text-[#1C201D]">{authUser?.role || 'User'}</span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E3DA]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-[#DCD7CD] text-[#1C201D] text-xs font-semibold rounded-lg hover:bg-[#F4F1EA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Rating Modal Dialog (For Completed Returns) */}
      {ratingModalOpen && activeReturnForRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl border border-[#E7E3DA] shadow-xl max-w-md w-full p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-dialog-title"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA] mb-4">
              <div>
                <h2 id="rating-dialog-title" className="text-base font-serif font-bold text-[#1C201D]">
                  Rate Return Experience
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Item: <span className="font-semibold text-[#1C201D]">{activeReturnForRating.itemTitle}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingModalOpen(false)}
                className="text-[#8A928D] hover:text-[#1C201D] p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {ratingError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {ratingError}
              </div>
            )}

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              {/* Star Selection Control */}
              <div className="text-center py-2 bg-[#FAF8F5] border border-[#E7E3DA] rounded-xl">
                <p className="text-xs text-[#5C645E] mb-2 font-medium">Select Trust Rating</p>
                <div className="flex justify-center items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverScore || selectedScore);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedScore(star)}
                        onMouseEnter={() => setHoverScore(star)}
                        onMouseLeave={() => setHoverScore(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        aria-label={`${star} star`}
                      >
                        <svg
                          className={`w-7 h-7 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-[#DCD7CD] fill-transparent'
                          } transition-colors`}
                          viewBox="0 0 20 20"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-bold text-[#1C201D] mt-1.5">
                  {selectedScore} of 5 Stars
                </p>
              </div>

              {/* Written Review */}
              <div>
                <label htmlFor="rating-review" className="block text-xs font-bold text-[#1C201D] mb-1">
                  Optional Feedback
                </label>
                <textarea
                  id="rating-review"
                  rows="3"
                  maxLength={500}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#DCD7CD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B382B] focus:border-[#1B382B] resize-none"
                  placeholder="Share details about the return (e.g., prompt coordination, item condition, helpful communication)..."
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E3DA]">
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(false)}
                  className="px-4 py-2 border border-[#DCD7CD] text-[#1C201D] text-xs font-semibold rounded-lg hover:bg-[#F4F1EA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ratingSubmitting}
                  className="px-5 py-2 bg-[#1B382B] text-white text-xs font-semibold rounded-lg hover:bg-[#142A20] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;

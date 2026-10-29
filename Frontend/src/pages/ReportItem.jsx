import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation, Link } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import { ITEM_CATEGORIES } from '../constants/categories';
import { getTodayDateString } from '../utils/dateUtils';

const CATEGORIES = ITEM_CATEGORIES;
const getTodayString = getTodayDateString;

/**
 * ReportItem Component
 * Provides reporting forms for both Lost and Found items.
 * Integrates directly with the backend POST /api/items endpoint.
 */
function ReportItem() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { type: pathType } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const resolveType = () => {
    if (pathType?.toUpperCase() === 'FOUND' || location.pathname.endsWith('/found')) return 'FOUND';
    if (pathType?.toUpperCase() === 'LOST' || location.pathname.endsWith('/lost')) return 'LOST';
    if (searchParams.get('type')?.toUpperCase() === 'FOUND') return 'FOUND';
    return 'LOST';
  };

  const [itemType, setItemType] = useState(resolveType);

  // Sync state if navigation occurs via external links or back/forward
  useEffect(() => {
    const currentResolved = resolveType();
    if (currentResolved !== itemType) {
      setItemType(currentResolved);
    }
  }, [searchParams, pathType, location.pathname]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    date: getTodayString(),
    contactInformation: user?.email || '',
    description: '',
    imageUrl: '',
    secretQuestion: '',
    secretAnswer: '',
  });

  useEffect(() => {
    if (user?.email && !formData.contactInformation) {
      setFormData((prev) => ({ ...prev, contactInformation: user.email }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTypeSwitch = (type) => {
    setItemType(type);
    if (location.pathname.startsWith('/report/')) {
      navigate(`/report/${type.toLowerCase()}`, { replace: true });
    } else {
      setSearchParams({ type: type.toLowerCase() }, { replace: true });
    }

    // Clear verification question errors when switching modes
    if (errors.secretQuestion || errors.secretAnswer) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.secretQuestion;
        delete next.secretAnswer;
        return next;
      });
    }
    setServerError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.contactInformation.trim()) {
      newErrors.contactInformation = 'Contact information is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Found items validation for security question/answer pair
    if (itemType === 'FOUND') {
      if (formData.secretQuestion.trim() && !formData.secretAnswer.trim()) {
        newErrors.secretAnswer = 'Secret answer is required when a question is provided';
      }
      if (!formData.secretQuestion.trim() && formData.secretAnswer.trim()) {
        newErrors.secretQuestion = 'Secret question is required when an answer is provided';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        type: itemType,
        location: formData.location.trim(),
        date: formData.date,
        imageUrl: formData.imageUrl.trim(),
        contactInformation: formData.contactInformation.trim(),
        secretQuestion: itemType === 'FOUND' ? formData.secretQuestion.trim() : '',
        secretAnswer: itemType === 'FOUND' ? formData.secretAnswer.trim() : '',
      };

      const newItem = await createItem(payload);

      setSuccessMessage(
        itemType === 'LOST'
          ? 'Lost item report submitted successfully.'
          : 'Found item report submitted successfully.'
      );

      setTimeout(() => {
        if (newItem && newItem._id) {
          navigate(`/items/${newItem._id}`);
        } else {
          navigate('/items');
        }
      }, 500);
    } catch (err) {
      console.error('Submission failed:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to submit report. Please try again.';
      setServerError(message);

      // Map backend validation errors to fields if returned
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendFieldErrors = {};
        err.response.data.errors.forEach((eObj) => {
          if (eObj.field) {
            backendFieldErrors[eObj.field] = eObj.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...backendFieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLost = itemType === 'LOST';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C201D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[#5C645E] flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1B382B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/items" className="hover:text-[#1B382B] transition-colors">
            All Listings
          </Link>
          <span>/</span>
          <span className="text-[#1B382B] font-medium">Report</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B382B] tracking-tight">
            {isLost ? 'Report a Lost Item' : 'Report a Found Item'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1.5 leading-relaxed">
            {isLost
              ? 'Provide details of your missing belonging to coordinate recovery with community members.'
              : 'Log an article you discovered to help the rightful owner identify and claim their property.'}
          </p>
        </div>

        <div className="flex items-center p-1 bg-white border border-[#E7E3DA] rounded-lg mb-6 shadow-2xs">
          <button
            type="button"
            id="report-lost-tab"
            onClick={() => handleTypeSwitch('LOST')}
            disabled={isSubmitting}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              isLost
                ? 'bg-[#C05634] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            Lost Item
          </button>
          <button
            type="button"
            id="report-found-tab"
            onClick={() => handleTypeSwitch('FOUND')}
            disabled={isSubmitting}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              !isLost
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'text-[#5C645E] hover:text-[#1C201D] hover:bg-[#F4F1EA]'
            }`}
          >
            Found Item
          </button>
        </div>

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-emerald-600 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{successMessage} Redirecting...</span>
          </div>
        )}

        {serverError && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-red-600 shrink-0"
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
            <span>{serverError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-[#E7E3DA] rounded-xl p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-[#1C201D] mb-1">
              Item Title <span className="text-[#C05634]">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder={isLost ? 'e.g. Black Leather Bi-Fold Wallet' : 'e.g. Blue Hydro Flask Water Bottle'}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                errors.title
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                  : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-[#1C201D] mb-1">
              Category <span className="text-[#C05634]">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors cursor-pointer ${
                errors.category
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                  : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-xs font-semibold text-[#1C201D] mb-1">
                {isLost ? 'Last Seen Location' : 'Location Found'} <span className="text-[#C05634]">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder={isLost ? 'e.g. Library 2nd Floor' : 'e.g. Student Center Cafeteria'}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                  errors.location
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                    : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-xs font-semibold text-[#1C201D] mb-1">
                {isLost ? 'Date Misplaced' : 'Date Discovered'} <span className="text-[#C05634]">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                max={getTodayString()}
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                  errors.date
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                    : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-[#1C201D] mb-1">
              Description <span className="text-[#C05634]">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder={
                isLost
                  ? 'Describe distinctive features, brand, color, or condition...'
                  : 'Describe general physical appearance. Avoid disclosing details used in the verification question.'
              }
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors resize-y ${
                errors.description
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                  : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactInformation" className="block text-xs font-semibold text-[#1C201D] mb-1">
              Contact Information <span className="text-[#C05634]">*</span>
            </label>
            <input
              id="contactInformation"
              name="contactInformation"
              type="text"
              value={formData.contactInformation}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Email or Phone Number"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                errors.contactInformation
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                  : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
              }`}
            />
            {errors.contactInformation ? (
              <p className="mt-1 text-xs text-red-600">{errors.contactInformation}</p>
            ) : (
              <span className="block text-[11px] text-[#5C645E] mt-1">
                How other users or finders can reach you.
              </span>
            )}
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-xs font-semibold text-[#1C201D] mb-1">
              Image URL <span className="text-[#5C645E] font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors"
            />
          </div>

          {!isLost && (
            <div className="pt-2 border-t border-[#E7E3DA] space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#1B382B]">
                  Ownership Verification (Optional)
                </span>
                <p className="text-xs text-[#5C645E] mt-0.5">
                  Set a question only the true owner can answer to verify ownership before claiming.
                </p>
              </div>

              <div>
                <label htmlFor="secretQuestion" className="block text-xs font-semibold text-[#1C201D] mb-1">
                  Secret Question
                </label>
                <input
                  id="secretQuestion"
                  name="secretQuestion"
                  type="text"
                  value={formData.secretQuestion}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder='e.g. "What sticker is on the back?"'
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                    errors.secretQuestion
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                      : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
                  }`}
                />
                {errors.secretQuestion && (
                  <p className="mt-1 text-xs text-red-600">{errors.secretQuestion}</p>
                )}
              </div>

              <div>
                <label htmlFor="secretAnswer" className="block text-xs font-semibold text-[#1C201D] mb-1">
                  Expected Answer
                </label>
                <input
                  id="secretAnswer"
                  name="secretAnswer"
                  type="text"
                  value={formData.secretAnswer}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder='e.g. "NASA logo"'
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                    errors.secretAnswer
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                      : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
                  }`}
                />
                {errors.secretAnswer ? (
                  <p className="mt-1 text-xs text-red-600">{errors.secretAnswer}</p>
                ) : (
                  <span className="block text-[11px] text-[#5C645E] mt-1">
                    Stored securely on the server to verify claims.
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#E7E3DA] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/items')}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#E7E3DA] bg-[#FBF9F5] hover:bg-white text-[#1C201D] text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                isLost
                  ? 'bg-[#C05634] hover:bg-[#A04529]'
                  : 'bg-[#1B382B] hover:bg-[#142A20]'
              }`}
            >
              {isSubmitting
                ? 'Submitting...'
                : isLost
                ? 'Submit Lost Report'
                : 'Submit Found Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportItem;

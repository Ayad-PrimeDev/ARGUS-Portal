import React, { useState, useEffect } from 'react';
import { updateItem } from '../services/itemService';
import { ITEM_CATEGORIES } from '../constants/categories';
import { toDateInputValue } from '../utils/dateUtils';

function EditItemModal({ item, onClose, onSaved }) {
  if (!item) return null;

  const isLost = item.type === 'LOST';

  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    category: item.category || '',
    location: item.location || '',
    date: toDateInputValue(item.date),
    imageUrl: item.imageUrl || '',
    contactInformation: item.contactInformation || '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        date: formData.date,
        imageUrl: formData.imageUrl.trim(),
        contactInformation: formData.contactInformation.trim(),
      };

      const updated = await updateItem(item._id, payload);
      setSuccessMsg('Report updated successfully!');
      setTimeout(() => {
        onSaved(updated);
      }, 800);
    } catch (err) {
      console.error('Edit failed:', err);
      setServerError(
        err.response?.data?.message || err.message || 'Unable to save changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
        : 'border-[#E7E3DA] focus:border-[#1B382B] focus:ring-2 focus:ring-[#1B382B]/20'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28,32,29,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E7E3DA] flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E3DA] shrink-0">
          <div>
            <h2 id="edit-modal-title" className="text-lg font-bold text-[#1B382B]">
              Edit {isLost ? 'Lost' : 'Found'} Report
            </h2>
            <p className="text-xs text-[#5C645E] mt-0.5">Update the details of your item report.</p>
          </div>
          <button
            type="button"
            id="edit-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close edit form"
            className="p-2 rounded-lg text-[#5C645E] hover:bg-[#F4F1EA] hover:text-[#1C201D] transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {successMsg}
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {serverError}
            </div>
          )}

          <form id="edit-item-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Item Title <span className="text-[#C05634]">*</span>
              </label>
              <input
                id="edit-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                disabled={saving}
                className={inputClass('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Category <span className="text-[#C05634]">*</span>
              </label>
              <select
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={saving}
                className={`${inputClass('category')} cursor-pointer`}
              >
                <option value="">Select a category</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-location" className="block text-xs font-semibold text-[#1C201D] mb-1">
                  {isLost ? 'Last Seen Location' : 'Location Found'} <span className="text-[#C05634]">*</span>
                </label>
                <input
                  id="edit-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('location')}
                />
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
              </div>
              <div>
                <label htmlFor="edit-date" className="block text-xs font-semibold text-[#1C201D] mb-1">
                  {isLost ? 'Date Misplaced' : 'Date Discovered'} <span className="text-[#C05634]">*</span>
                </label>
                <input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={saving}
                  max={toDateInputValue(new Date())}
                  className={inputClass('date')}
                />
                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Description <span className="text-[#C05634]">*</span>
              </label>
              <textarea
                id="edit-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                className={`${inputClass('description')} resize-y`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="edit-contact" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Contact Information <span className="text-[#C05634]">*</span>
              </label>
              <input
                id="edit-contact"
                name="contactInformation"
                type="text"
                value={formData.contactInformation}
                onChange={handleChange}
                disabled={saving}
                className={inputClass('contactInformation')}
              />
              {errors.contactInformation && (
                <p className="mt-1 text-xs text-red-600">{errors.contactInformation}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-imageUrl" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Image URL <span className="text-[#5C645E] font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                id="edit-imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                disabled={saving}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] transition-colors"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-[#E7E3DA] flex items-center justify-end gap-3 shrink-0 bg-[#FAFAF8]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold border border-[#E7E3DA] bg-white hover:bg-[#F4F1EA] text-[#1C201D] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-item-form"
            disabled={saving}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isLost ? 'bg-[#C05634] hover:bg-[#A04529]' : 'bg-[#1B382B] hover:bg-[#142A20]'
            }`}
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditItemModal;

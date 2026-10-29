import React, { useState, useEffect } from 'react';
import { getAdminItems, updateItemStatus, moderateItem } from '../../services/adminService';

function AdminItems() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState('');

  // Status Change Modal
  const [statusModalItem, setStatusModalItem] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusReason, setStatusReason] = useState('');

  // Moderation Action Modal (HIDE / UNHIDE / REMOVE / RESOLVE)
  const [moderateModalItem, setModerateModalItem] = useState(null);
  const [moderationAction, setModerationAction] = useState('HIDE');
  const [moderationReason, setModerationReason] = useState('');

  // Inspect Item Details Modal
  const [inspectItem, setInspectItem] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        search: search.trim() || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        isHidden: hiddenFilter || undefined
      };
      const data = await getAdminItems(params);
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [typeFilter, statusFilter, hiddenFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  // Submit Status Change
  const handleConfirmStatus = async () => {
    if (!statusModalItem) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateItemStatus(statusModalItem._id, {
        status: newStatus,
        reason: statusReason.trim()
      });

      setSuccessMessage(`Item "${statusModalItem.title}" status changed to ${newStatus}.`);
      setStatusModalItem(null);
      setStatusReason('');
      fetchItems(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update item status');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Moderation Action
  const handleConfirmModeration = async () => {
    if (!moderateModalItem) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await moderateItem(moderateModalItem._id, {
        action: moderationAction,
        reason: moderationReason.trim()
      });

      setSuccessMessage(`Moderation action [${moderationAction}] applied to "${moderateModalItem.title}".`);
      setModerateModalItem(null);
      setModerationReason('');
      fetchItems(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to apply moderation action');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C201D] tracking-tight">
            Lost &amp; Found Report Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
            Review all items, moderate content, hide fraudulent listings, and verify statuses across the platform.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E3DA] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report by title, description, or location..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
          />
          <svg className="w-4 h-4 text-[#8A928D] absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
          >
            <option value="">All Types</option>
            <option value="LOST">Lost Only</option>
            <option value="FOUND">Found Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLAIMED">CLAIMED (Returned)</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <select
            value={hiddenFilter}
            onChange={(e) => setHiddenFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
          >
            <option value="">Visibility</option>
            <option value="false">Visible Only</option>
            <option value="true">Hidden / Moderated</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTypeFilter('');
              setStatusFilter('');
              setHiddenFilter('');
            }}
            className="py-2 px-3 text-xs text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-[#E7E3DA]">
          <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#5C645E]">Loading reports...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-xs text-[#8A928D] bg-white rounded-xl border border-[#E7E3DA]">
          No reports found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl border shadow-xs flex flex-col justify-between overflow-hidden transition-all ${
                item.isHidden
                  ? 'border-red-300 bg-red-50/20'
                  : item.isFlagged
                  ? 'border-amber-300'
                  : 'border-[#E7E3DA]'
              }`}
            >
              <div>
                {/* Image / Header bar */}
                <div className="relative h-40 bg-[#FAF8F5] border-b border-[#E7E3DA] overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-10 h-10 mx-auto text-[#DCD7CD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] text-[#8A928D] mt-1 block">No Image Provided</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        item.type === 'FOUND'
                          ? 'bg-[#1B382B] text-white'
                          : 'bg-[#C05634] text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-[#1C201D] shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {item.isHidden && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-xs">
                        HIDDEN
                      </span>
                    )}
                    {item.isFlagged && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                        FLAGGED ({item.flags?.length || 1})
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#1C201D] line-clamp-1">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'CLAIMED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#5C645E] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 text-[11px] text-[#8A928D] space-y-1 border-t border-[#F4F1EA]">
                    <div className="flex items-center gap-1.5 truncate">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Submitter: <strong>{item.submitterId?.name || 'Unknown User'}</strong> ({item.submitterId?.email || 'N/A'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-[#FAF8F5] border-t border-[#E7E3DA] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setInspectItem(item)}
                  className="font-semibold text-[#1B382B] hover:text-[#142A20]"
                >
                  Inspect
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalItem(item);
                      setNewStatus(item.status);
                      setStatusReason('');
                    }}
                    className="px-2 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] text-[#1C201D] font-medium"
                  >
                    Status
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModerateModalItem(item);
                      setModerationAction(item.isHidden ? 'UNHIDE' : 'HIDE');
                      setModerationReason('');
                    }}
                    className="px-2 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-red-50 text-red-700 font-medium"
                  >
                    Moderate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.pages > 1 && (
        <div className="p-4 bg-white rounded-xl border border-[#E7E3DA] shadow-xs flex items-center justify-between text-xs text-[#5C645E]">
          <span>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total reports)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchItems(pagination.page - 1)}
              className="px-3 py-1.5 border border-[#E7E3DA] rounded-lg bg-white hover:bg-[#FAF8F5] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchItems(pagination.page + 1)}
              className="px-3 py-1.5 border border-[#E7E3DA] rounded-lg bg-white hover:bg-[#FAF8F5] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E7E3DA] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B382B] text-white">
                  {inspectItem.type}
                </span>
                <h3 className="text-base font-bold text-[#1C201D] mt-1.5">
                  {inspectItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="p-1 rounded text-[#5C645E] hover:text-[#1C201D]"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {inspectItem.imageUrl && (
                <div className="h-56 rounded-lg overflow-hidden bg-black/5 border border-[#E7E3DA]">
                  <img src={inspectItem.imageUrl} alt={inspectItem.title} className="w-full h-full object-contain" />
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-[#5C645E] uppercase block mb-1">Description</span>
                <p className="text-xs text-[#1C201D] bg-[#FAF8F5] p-3 rounded border border-[#E7E3DA] leading-relaxed">
                  {inspectItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#5C645E] block">Category:</span>
                  <strong className="text-[#1C201D]">{inspectItem.category}</strong>
                </div>
                <div>
                  <span className="text-[#5C645E] block">Location:</span>
                  <strong className="text-[#1C201D]">{inspectItem.location}</strong>
                </div>
                <div>
                  <span className="text-[#5C645E] block">Reported Date:</span>
                  <strong className="text-[#1C201D]">{new Date(inspectItem.date).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-[#5C645E] block">Status:</span>
                  <strong className="text-[#1C201D]">{inspectItem.status}</strong>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E7E3DA] space-y-1 text-xs">
                <span className="font-semibold text-[#1C201D] block">Submitter Contact Information:</span>
                <p className="text-[#5C645E]">{inspectItem.contactInformation}</p>
                <p className="text-[#8A928D] text-[11px]">Account: {inspectItem.submitterId?.name} ({inspectItem.submitterId?.email})</p>
              </div>

              {inspectItem.secretQuestion && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <span className="font-semibold text-amber-900 block">Verification Challenge Question:</span>
                  <p className="text-amber-800">{inspectItem.secretQuestion}</p>
                </div>
              )}

              {inspectItem.moderationReason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800">
                  <strong>Moderation History Note:</strong> {inspectItem.moderationReason}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E7E3DA] bg-[#FAF8F5] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#1C201D]">
              Update Report Status
            </h3>
            <p className="text-xs text-[#5C645E]">
              Modifying status for item <strong>"{statusModalItem.title}"</strong>.
            </p>

            <div>
              <label htmlFor="newStatusSelect" className="block text-xs font-semibold text-[#1C201D] mb-1">Status</label>
              <select
                id="newStatusSelect"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
              >
                <option value="ACTIVE">ACTIVE (Listed on Public Portal)</option>
                <option value="CLAIMED">CLAIMED (Successfully Returned)</option>
                <option value="ARCHIVED">ARCHIVED (Closed / Expired)</option>
              </select>
            </div>

            <div>
              <label htmlFor="statusReasonInput" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Reason for Status Change (Required for Audit Log)
              </label>
              <input
                id="statusReasonInput"
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. Verified item handover at security desk..."
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !statusReason.trim()}
                onClick={handleConfirmStatus}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1B382B] hover:bg-[#142A20] rounded-lg transition-colors disabled:opacity-40"
              >
                {actionLoading ? 'Updating...' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Action Modal */}
      {moderateModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#1C201D]">
              Moderate Content: "{moderateModalItem.title}"
            </h3>

            <div>
              <label htmlFor="moderationActionSelect" className="block text-xs font-semibold text-[#1C201D] mb-1">Moderation Action</label>
              <select
                id="moderationActionSelect"
                value={moderationAction}
                onChange={(e) => setModerationAction(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
              >
                <option value="HIDE">HIDE (Conceal from public catalog)</option>
                <option value="UNHIDE">UNHIDE (Restore to public catalog)</option>
                <option value="REMOVE">REMOVE (Archive and mark removed for rules violation)</option>
                <option value="RESOLVE">RESOLVE (Clear flags and mark clean)</option>
              </select>
            </div>

            <div>
              <label htmlFor="moderationReasonInput" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Administrative Reason (Required for Audit Log)
              </label>
              <textarea
                id="moderationReasonInput"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="e.g. Inappropriate language, suspected fraudulent report, spam..."
                rows="3"
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModerateModalItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !moderationReason.trim()}
                onClick={handleConfirmModeration}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors disabled:opacity-40"
              >
                {actionLoading ? 'Applying...' : 'Apply Moderation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminItems;

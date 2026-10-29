import React, { useState, useEffect } from 'react';
import { getModerationQueue, dismissFlags, moderateItem } from '../../services/adminService';

function AdminModeration() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Moderation Action State
  const [activeItem, setActiveItem] = useState(null);
  const [actionType, setActionType] = useState('DISMISS'); // DISMISS | HIDE | REMOVE
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getModerationQueue();
      setQueue(data.queue || []);
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleConfirmAction = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (actionType === 'DISMISS') {
        await dismissFlags(activeItem._id, { reason: actionReason.trim() });
        setSuccessMessage(`Flags dismissed for "${activeItem.title}".`);
      } else {
        await moderateItem(activeItem._id, {
          action: actionType,
          reason: actionReason.trim()
        });
        setSuccessMessage(`Item "${activeItem.title}" has been ${actionType === 'HIDE' ? 'hidden' : 'removed'}.`);
      }

      setActiveItem(null);
      setActionReason('');
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process moderation action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C201D] tracking-tight">
            Content Moderation Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
            Review listings flagged by users, examine reporting rationale, dismiss false alarms, or remove violating content.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-lg border border-[#E7E3DA] text-xs font-semibold text-[#1C201D] hover:bg-white transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-[#5C645E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Queue ({queue.length})</span>
        </button>
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

      {/* Queue List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-[#E7E3DA]">
          <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#5C645E]">Loading moderation queue...</span>
        </div>
      ) : queue.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl border border-[#E7E3DA] p-6 space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-[#1C201D]">Moderation Queue Clean</h3>
          <p className="text-xs text-[#5C645E] max-w-sm mx-auto">
            There are currently no flagged reports awaiting administrative review. The platform is healthy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col lg:flex-row gap-5 justify-between ${
                item.isHidden ? 'border-red-300 bg-red-50/20' : 'border-amber-300'
              }`}
            >
              {/* Item Info */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.type === 'FOUND' ? 'bg-[#1B382B] text-white' : 'bg-[#C05634] text-white'
                  }`}>
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF8F5] text-[#1C201D] border border-[#E7E3DA]">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Flagged ({item.flags?.length || 1} report{item.flags?.length !== 1 ? 's' : ''})
                  </span>
                  {item.isHidden && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      Currently Hidden
                    </span>
                  )}
                  {item.moderationStatus === 'REMOVED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-white">
                      Removed
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#1C201D]">{item.title}</h3>
                  <p className="text-xs text-[#5C645E] mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="text-[11px] text-[#8A928D] flex flex-wrap gap-4 pt-1">
                  <span>Location: <strong className="text-[#1C201D]">{item.location}</strong></span>
                  <span>Reported by: <strong className="text-[#1C201D]">{item.submitterId?.name || 'Unknown'}</strong> ({item.submitterId?.email})</span>
                  <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Flags Breakdown */}
                {item.flags && item.flags.length > 0 && (
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E7E3DA] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#5C645E] block">
                      Submitted Flag Reports
                    </span>
                    <div className="space-y-1.5">
                      {item.flags.map((f, i) => (
                        <div key={i} className="text-xs flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-[#1C201D]">
                          <div>
                            <span className="font-semibold text-red-700">[{f.reason}]</span>{' '}
                            <span>{f.details || 'No additional comment'}</span>
                          </div>
                          <span className="text-[10px] text-[#8A928D] shrink-0">
                            {f.reportedBy?.name ? `Reported by ${f.reportedBy.name}` : ''} &bull; {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="lg:w-48 shrink-0 flex flex-col justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#E7E3DA] lg:pl-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(item);
                    setActionType('DISMISS');
                    setActionReason('Flags reviewed by administrator; no policy violation found.');
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                >
                  Dismiss Flags
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(item);
                    setActionType(item.isHidden ? 'UNHIDE' : 'HIDE');
                    setActionReason('');
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-[#E7E3DA] bg-white hover:bg-[#FAF8F5] text-[#1C201D] transition-colors"
                >
                  {item.isHidden ? 'Unhide Listing' : 'Hide from Public'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(item);
                    setActionType('REMOVE');
                    setActionReason('Removed for violation of Lost & Found terms of service.');
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors"
                >
                  Remove Violation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#1C201D]">
              Confirm Action: {actionType}
            </h3>
            <p className="text-xs text-[#5C645E] leading-relaxed">
              Applying moderation action <strong>{actionType}</strong> to "{activeItem.title}".
            </p>

            <div>
              <label htmlFor="moderationReasonTextarea" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Administrative Reason (Required for Audit Trail)
              </label>
              <textarea
                id="moderationReasonTextarea"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain the justification for this determination..."
                rows="3"
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !actionReason.trim()}
                onClick={handleConfirmAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1B382B] hover:bg-[#142A20] rounded-lg transition-colors disabled:opacity-40"
              >
                {submitting ? 'Applying...' : 'Confirm Determination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminModeration;

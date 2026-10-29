import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/dateUtils';
import { updateClaimStatus } from '../services/claimService';

function ClaimTimelineModal({ claim, onClose, onStatusUpdated, canReview }) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [rejectingOpen, setRejectingOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverConfirmOpen, setHandoverConfirmOpen] = useState(false);

  if (!claim) return null;

  // Normalized current status (treating legacy PENDING as SUBMITTED)
  const currentStatus = claim.status === 'PENDING' ? 'SUBMITTED' : (claim.status || 'SUBMITTED');
  const claimRef = `#CLM-${claim._id.slice(-6).toUpperCase()}`;
  const timelineEvents = Array.isArray(claim.timeline) ? claim.timeline : [];

  const getEventForStatus = (statusName) => {
    return timelineEvents.find(
      (ev) => ev.status === statusName || (statusName === 'SUBMITTED' && ev.status === 'PENDING')
    );
  };

  const submittedEvent = getEventForStatus('SUBMITTED');
  const underReviewEvent = getEventForStatus('UNDER_REVIEW');
  const approvedEvent = getEventForStatus('APPROVED');
  const rejectedEvent = getEventForStatus('REJECTED');
  const returnedEvent = getEventForStatus('RETURNED');

  const isUnderReviewDone = Boolean(underReviewEvent || approvedEvent || rejectedEvent || returnedEvent);
  const isUnderReviewCurrent = currentStatus === 'UNDER_REVIEW';

  const isDecided = ['APPROVED', 'REJECTED', 'RETURNED'].includes(currentStatus);
  const isApproved = ['APPROVED', 'RETURNED'].includes(currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  const isReturnedDone = currentStatus === 'RETURNED';
  const isAwaitingHandover = currentStatus === 'APPROVED';

  const handlePerformTransition = async (newStatus, noteText = '') => {
    setLoadingAction(true);
    setActionError(null);
    try {
      const updated = await updateClaimStatus(claim._id, newStatus, noteText);
      setRejectingOpen(false);
      setHandoverConfirmOpen(false);
      setRejectionNote('');
      setHandoverNote('');
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update claim status:', err);
      setActionError(
        err.response?.data?.message || err.message || 'Failed to update claim status. Please try again.'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl border border-[#E7E3DA] shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-modal-title"
      >
        <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E7E3DA] flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-[#1B382B] bg-[#1B382B]/10 px-2.5 py-0.5 rounded-md border border-[#1B382B]/20">
                {claimRef}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  currentStatus === 'RETURNED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : currentStatus === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentStatus === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : currentStatus === 'UNDER_REVIEW'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {currentStatus === 'UNDER_REVIEW'
                  ? 'Under Review'
                  : currentStatus === 'RETURNED'
                  ? 'Returned & Recovered'
                  : currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()}
              </span>
            </div>
            <h2 id="timeline-modal-title" className="text-xl font-bold text-[#1C201D]">
              Claim Tracking Timeline
            </h2>
            <p className="text-xs text-[#5C645E] mt-0.5">
              Real-time progression from initial submission to item handover
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#8A928D] hover:text-[#1C201D] p-1.5 rounded-lg hover:bg-[#E7E3DA]/50 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {claim.itemId ? (
            <div className="flex items-center gap-4 p-3.5 bg-[#FAF8F5] border border-[#E7E3DA] rounded-xl">
              {claim.itemId.imageUrl ? (
                <img
                  src={claim.itemId.imageUrl}
                  alt={claim.itemId.title}
                  className="w-16 h-16 rounded-lg object-cover border border-[#E7E3DA] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[#E7E3DA] flex items-center justify-center text-xs font-bold text-[#5C645E] shrink-0 uppercase tracking-wider text-center p-1">
                  {claim.itemId.category || 'Item'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C645E]">
                  Claimed Target Item
                </span>
                <h3 className="text-sm font-bold text-[#1C201D] truncate">
                  <Link
                    to={`/items/${claim.itemId._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#C05634] hover:underline"
                  >
                    {claim.itemId.title} ↗
                  </Link>
                </h3>
                <p className="text-xs text-[#5C645E] truncate mt-0.5">
                  {claim.itemId.location} · {claim.itemId.category}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#FAF8F5] border border-[#E7E3DA] rounded-lg text-xs text-[#8A928D] italic">
              Associated item record has been removed.
            </div>
          )}

          {actionError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{actionError}</span>
            </div>
          )}

          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              currentStatus === 'RETURNED'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : currentStatus === 'APPROVED'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : currentStatus === 'REJECTED'
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : currentStatus === 'UNDER_REVIEW'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
            }`}
          >
            <div className="text-lg shrink-0 mt-0.5">
              {currentStatus === 'RETURNED'
                ? '🎉'
                : currentStatus === 'APPROVED'
                ? '✅'
                : currentStatus === 'REJECTED'
                ? '❌'
                : currentStatus === 'UNDER_REVIEW'
                ? '🔍'
                : '📋'}
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">
                {currentStatus === 'RETURNED'
                  ? 'Item Handed Over & Case Resolved'
                  : currentStatus === 'APPROVED'
                  ? 'Claim Approved — Awaiting Physical Handover'
                  : currentStatus === 'REJECTED'
                  ? 'Claim Declined'
                  : currentStatus === 'UNDER_REVIEW'
                  ? 'Claim is Under Active Review'
                  : 'Claim Submitted & Awaiting Examination'}
              </p>
              <p className="leading-relaxed opacity-90">
                {currentStatus === 'RETURNED'
                  ? 'The physical handover has taken place and been confirmed. This recovery is complete!'
                  : currentStatus === 'APPROVED'
                  ? 'Your ownership claim was verified. Coordinate with the finder or campus desk to collect your item.'
                  : currentStatus === 'REJECTED'
                  ? (claim.rejectionReason
                      ? `Reason: “${claim.rejectionReason}”`
                      : 'The provided verification proof did not sufficiently match the item.')
                  : currentStatus === 'UNDER_REVIEW'
                  ? 'The reporter is currently cross-referencing your security answer and item description.'
                  : 'Your claim has been recorded and placed in the review queue.'}
              </p>
            </div>
          </div>

          <div className="space-y-0 relative pl-2 pt-2">
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-[#E7E3DA]" />

            <div className="relative flex items-start gap-4 pb-8 group">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs ring-4 ring-white">
                ✓
              </div>
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-[#E7E3DA] shadow-2xs space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#1C201D] flex items-center gap-1.5">
                    <span>1. Claim Submitted</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Completed</span>
                  </h4>
                  <span className="text-[11px] text-[#8A928D]">
                    {formatDateTime(submittedEvent?.changedAt || claim.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#5C645E]">
                  Claimant submitted ownership message and verification answer.
                </p>
                {claim.message && (
                  <div className="mt-2 p-2 bg-[#FAF8F5] rounded border border-[#E7E3DA] text-[11px] text-[#5C645E]">
                    <span className="font-semibold text-[#1C201D]">Claim Note:</span> “{claim.message}”
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex items-start gap-4 pb-8 group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs ring-4 ring-white ${
                  isUnderReviewDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F4F1EA] text-[#8A928D] border border-[#DCD7CD]'
                }`}
              >
                {isUnderReviewDone ? '✓' : '2'}
              </div>
              <div
                className={`flex-1 p-3.5 rounded-xl border shadow-2xs space-y-1 ${
                  isUnderReviewCurrent
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white border-[#E7E3DA]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#1C201D] flex items-center gap-1.5">
                    <span>2. Under Review</span>
                    {isUnderReviewCurrent && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded animate-pulse">
                        In Progress
                      </span>
                    )}
                    {isUnderReviewDone && !isUnderReviewCurrent && (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        Reviewed
                      </span>
                    )}
                  </h4>
                  {underReviewEvent && (
                    <span className="text-[11px] text-[#8A928D]">
                      {formatDateTime(underReviewEvent.changedAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C645E]">
                  {underReviewEvent?.note ||
                    'Reviewer evaluates matching identifiers and secret verification answers.'}
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 pb-8 group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs ring-4 ring-white ${
                  isApproved
                    ? 'bg-emerald-600 text-white'
                    : isRejected
                    ? 'bg-red-600 text-white'
                    : 'bg-[#F4F1EA] text-[#8A928D] border border-[#DCD7CD]'
                }`}
              >
                {isApproved ? '✓' : isRejected ? '✕' : '3'}
              </div>
              <div
                className={`flex-1 p-3.5 rounded-xl border shadow-2xs space-y-1 ${
                  isRejected
                    ? 'bg-red-50/50 border-red-200'
                    : isApproved
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-[#E7E3DA]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#1C201D] flex items-center gap-1.5">
                    <span>3. Review Decision</span>
                    {isApproved && (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                        Declined
                      </span>
                    )}
                    {!isDecided && (
                      <span className="text-[10px] font-medium text-[#8A928D]">
                        Pending
                      </span>
                    )}
                  </h4>
                  {(approvedEvent || rejectedEvent) && (
                    <span className="text-[11px] text-[#8A928D]">
                      {formatDateTime((approvedEvent || rejectedEvent).changedAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C645E]">
                  {isApproved
                    ? (approvedEvent?.note || 'Ownership proof accepted. Item is ready for physical return.')
                    : isRejected
                    ? (rejectedEvent?.note || claim.rejectionReason || 'Claim declined by reviewer.')
                    : 'Awaiting decision after reviewing verification proof.'}
                </p>
                {isRejected && claim.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200 text-[11px] text-red-900">
                    <span className="font-semibold">Reason:</span> {claim.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex items-start gap-4 group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs ring-4 ring-white ${
                  isReturnedDone
                    ? 'bg-[#1B382B] text-white'
                    : isAwaitingHandover
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#F4F1EA] text-[#8A928D] border border-[#DCD7CD]'
                }`}
              >
                {isReturnedDone ? '★' : isAwaitingHandover ? '⏳' : '4'}
              </div>
              <div
                className={`flex-1 p-3.5 rounded-xl border shadow-2xs space-y-1 ${
                  isReturnedDone
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : isAwaitingHandover
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-[#E7E3DA]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#1C201D] flex items-center gap-1.5">
                    <span>4. Item Handover &amp; Return</span>
                    {isReturnedDone && (
                      <span className="text-[10px] font-semibold bg-[#1B382B] text-white px-2 py-0.2 rounded">
                        Returned
                      </span>
                    )}
                    {isAwaitingHandover && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                        Awaiting Handover
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-[10px] font-medium text-[#8A928D]">
                        Closed
                      </span>
                    )}
                  </h4>
                  {returnedEvent && (
                    <span className="text-[11px] text-[#8A928D]">
                      {formatDateTime(returnedEvent.changedAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C645E]">
                  {isReturnedDone
                    ? (returnedEvent?.note || 'Item safely returned to claimant. Case marked completed.')
                    : isAwaitingHandover
                    ? 'Item is approved and waiting for physical handover coordination between parties.'
                    : isRejected
                    ? 'Not applicable (claim was declined).'
                    : 'Handover will occur once ownership proof is verified and approved.'}
                </p>
              </div>
            </div>
          </div>

          {canReview && (
            <div className="p-4 bg-[#FAF8F5] border border-[#E7E3DA] rounded-xl space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C201D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1B382B]" />
                  <span>Reviewer Actions</span>
                </span>
                <span className="text-[11px] text-[#5C645E]">Authorized Reporter</span>
              </div>

              {currentStatus === 'SUBMITTED' && !rejectingOpen && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() => handlePerformTransition('UNDER_REVIEW')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Start Review (Under Review)
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() => handlePerformTransition('APPROVED')}
                    className="px-3.5 py-2 bg-[#1B382B] hover:bg-[#142A20] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Approve Claim
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() => setRejectingOpen(true)}
                    className="px-3.5 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Decline Claim…
                  </button>
                </div>
              )}

              {currentStatus === 'UNDER_REVIEW' && !rejectingOpen && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() => handlePerformTransition('APPROVED')}
                    className="px-3.5 py-2 bg-[#1B382B] hover:bg-[#142A20] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Approve Claim
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() => setRejectingOpen(true)}
                    className="px-3.5 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Decline Claim…
                  </button>
                </div>
              )}

              {currentStatus === 'APPROVED' && !handoverConfirmOpen && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                    Handover pending. When the claimant has collected the item, record the handover below.
                  </div>
                  <button
                    type="button"
                    onClick={() => setHandoverConfirmOpen(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Record Handover (Mark Returned) ✓
                  </button>
                </div>
              )}

              {handoverConfirmOpen && (
                <div className="p-3 bg-white border border-[#E7E3DA] rounded-lg space-y-2">
                  <p className="text-xs font-bold text-[#1C201D]">
                    Confirm Physical Handover to Claimant
                  </p>
                  <input
                    type="text"
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    placeholder="Optional handover details (e.g. handed over at Student Desk)"
                    className="w-full text-xs p-2 border border-[#E7E3DA] rounded focus:outline-none focus:ring-1 focus:ring-[#1B382B]"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setHandoverConfirmOpen(false)}
                      className="px-3 py-1.5 text-xs text-[#5C645E] hover:text-[#1C201D]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={() => handlePerformTransition('RETURNED', handoverNote)}
                      className="px-3 py-1.5 bg-[#1B382B] text-white text-xs font-semibold rounded hover:bg-[#142A20]"
                    >
                      {loadingAction ? 'Recording…' : 'Confirm Return'}
                    </button>
                  </div>
                </div>
              )}

              {rejectingOpen && (
                <div className="p-3 bg-white border border-red-200 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-red-950">
                    Decline Claim Verification
                  </p>
                  <textarea
                    rows="2"
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Provide a clear reason for declining this claim (e.g. secret answer did not match, conflicting description)…"
                    className="w-full text-xs p-2 border border-[#E7E3DA] rounded focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingOpen(false);
                        setRejectionNote('');
                      }}
                      className="px-3 py-1.5 text-xs text-[#5C645E] hover:text-[#1C201D]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={() => handlePerformTransition('REJECTED', rejectionNote)}
                      className="px-3 py-1.5 bg-red-700 text-white text-xs font-semibold rounded hover:bg-red-800"
                    >
                      {loadingAction ? 'Declining…' : 'Confirm Decline'}
                    </button>
                  </div>
                </div>
              )}

              {currentStatus === 'RETURNED' && (
                <p className="text-xs text-emerald-800 font-medium">
                  ✓ Handover completed. Case is permanently closed.
                </p>
              )}

              {currentStatus === 'REJECTED' && (
                <p className="text-xs text-red-700 font-medium">
                  Claim was declined and is permanently closed.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#FAF8F5] border-t border-[#E7E3DA] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#DCD7CD] text-[#1C201D] text-xs font-semibold rounded-lg hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClaimTimelineModal;

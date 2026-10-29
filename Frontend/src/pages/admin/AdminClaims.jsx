import React, { useState, useEffect } from 'react';
import { getAdminClaims, resolveClaimByAdmin } from '../../services/adminService';

function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Investigation & Resolution Modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState('APPROVED');
  const [decisionReason, setDecisionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        status: statusFilter || undefined,
        search: search.trim() || undefined
      };
      const data = await getAdminClaims(params);
      setClaims(data.claims || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load claims:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClaims(1);
  };

  // Submit Claim Resolution
  const handleConfirmDecision = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await resolveClaimByAdmin(selectedClaim._id, {
        status: decisionStatus,
        decisionReason: decisionReason.trim()
      });

      setSuccessMessage(`Claim status updated to ${decisionStatus} successfully.`);
      setSelectedClaim(null);
      setDecisionReason('');
      fetchClaims(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resolve claim');
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
            Claim Management &amp; Dispute Resolution
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
            Examine ownership evidence, investigate competing claims, and record administrative determinations.
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
            placeholder="Search claim by item title, claimant name, or email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
          />
          <svg className="w-4 h-4 text-[#8A928D] absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
          >
            <option value="">All Claim Statuses</option>
            <option value="PENDING">PENDING (Awaiting Review)</option>
            <option value="APPROVED">APPROVED (Verified)</option>
            <option value="REJECTED">REJECTED</option>
            <option value="DISPUTED">DISPUTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="py-2 px-3 text-xs text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-[#E7E3DA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#5C645E]">Loading claims...</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A928D]">
            No claims found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] border-b border-[#E7E3DA] text-[#5C645E]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Associated Item</th>
                  <th className="py-3 px-4 font-semibold">Claimant</th>
                  <th className="py-3 px-4 font-semibold">Evidence / Answer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date Filed</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EA]">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4">
                      {claim.itemId ? (
                        <div>
                          <p className="font-semibold text-[#1C201D]">{claim.itemId.title}</p>
                          <p className="text-[11px] text-[#5C645E]">
                            {claim.itemId.type} &bull; {claim.itemId.location}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#8A928D] italic">Item record removed</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {claim.requesterId ? (
                        <div>
                          <p className="font-semibold text-[#1C201D]">{claim.requesterId.name}</p>
                          <p className="text-[11px] text-[#5C645E]">{claim.requesterId.email}</p>
                        </div>
                      ) : (
                        <span className="text-[#8A928D] italic">Unknown user</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-xs text-[#1C201D] truncate">
                        {claim.verificationAnswer || 'No specific answer submitted'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          claim.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : claim.status === 'DISPUTED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8A928D] text-xs">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setDecisionStatus(claim.status === 'PENDING' ? 'APPROVED' : claim.status);
                          setDecisionReason('');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-[#1B382B] hover:bg-[#1B382B]/10 rounded transition-colors"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E7E3DA] flex items-center justify-between text-xs text-[#5C645E]">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} claims)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchClaims(pagination.page - 1)}
                className="px-2.5 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchClaims(pagination.page + 1)}
                className="px-2.5 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Investigate & Dispute Resolution Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E7E3DA] flex items-center justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedClaim.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedClaim.status}
                </span>
                <h3 className="text-base font-bold text-[#1C201D] mt-1">
                  Claim Investigation &amp; Resolution
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded text-[#5C645E] hover:text-[#1C201D]"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Item Summary */}
              {selectedClaim.itemId && (
                <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E7E3DA] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#5C645E]">Reported Item</span>
                  <h4 className="font-bold text-[#1C201D] text-sm">{selectedClaim.itemId.title}</h4>
                  <p className="text-xs text-[#5C645E]">
                    Location: {selectedClaim.itemId.location} &bull; Status: {selectedClaim.itemId.status}
                  </p>
                </div>
              )}

              {/* Claimant Details */}
              {selectedClaim.requesterId && (
                <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E7E3DA] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#5C645E]">Claimant</span>
                  <p className="font-semibold text-[#1C201D]">{selectedClaim.requesterId.name}</p>
                  <p className="text-xs text-[#5C645E]">Email: {selectedClaim.requesterId.email}</p>
                  {selectedClaim.requesterId.phoneNumber && (
                    <p className="text-xs text-[#5C645E]">Phone: {selectedClaim.requesterId.phoneNumber}</p>
                  )}
                </div>
              )}

              {/* Evidence / Verification */}
              <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-900">Submitted Ownership Proof / Answer</span>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  {selectedClaim.verificationAnswer || 'No specific answer provided.'}
                </p>
              </div>

              {/* Timeline History */}
              {selectedClaim.statusHistory && selectedClaim.statusHistory.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C645E] block mb-2">
                    Claim Status History
                  </span>
                  <div className="space-y-2 border-l-2 border-[#1B382B]/30 pl-3">
                    {selectedClaim.statusHistory.map((h, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-semibold text-[#1C201D]">{h.status}</span>
                        <span className="text-[#8A928D] text-[11px] ml-2">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                        {h.note && <p className="text-[#5C645E] mt-0.5">{h.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Administrative Resolution Form */}
              <div className="pt-3 border-t border-[#E7E3DA] space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C201D]">
                  Administrative Decision
                </h4>

                <div>
                  <label htmlFor="decisionStatusSelect" className="block text-xs font-semibold text-[#1C201D] mb-1">Set Claim Status</label>
                  <select
                    id="decisionStatusSelect"
                    value={decisionStatus}
                    onChange={(e) => setDecisionStatus(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
                  >
                    <option value="APPROVED">APPROVE (Accept ownership, mark item claimed)</option>
                    <option value="REJECTED">REJECT (Evidence insufficient or invalid)</option>
                    <option value="DISPUTED">DISPUTED (Investigate competing claimant)</option>
                    <option value="CANCELLED">CANCELLED (Claim withdrawn or duplicate)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="decisionReasonInput" className="block text-xs font-semibold text-[#1C201D] mb-1">
                    Administrative Reason (Required for Audit Log &amp; Timeline)
                  </label>
                  <textarea
                    id="decisionReasonInput"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="e.g. Ownership verified via serial number proof at security office..."
                    rows="3"
                    className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E7E3DA] bg-[#FAF8F5] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !decisionReason.trim()}
                onClick={handleConfirmDecision}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1B382B] hover:bg-[#142A20] rounded-lg transition-colors disabled:opacity-40"
              >
                {actionLoading ? 'Recording...' : 'Submit Official Determination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminClaims;

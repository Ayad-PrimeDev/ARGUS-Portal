import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminService';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        targetType: targetTypeFilter || undefined,
        action: actionFilter || undefined
      };
      const data = await getAuditLogs(params);
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [targetTypeFilter, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C201D] tracking-tight">
            System Activity &amp; Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
            Immutable records of all administrative actions, user role modifications, status alterations, and dispute decisions.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E3DA] shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filterTargetTypeSelect" className="text-xs font-semibold text-[#5C645E]">Filter Target:</label>
          <select
            id="filterTargetTypeSelect"
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
          >
            <option value="">All Targets</option>
            <option value="USER">User</option>
            <option value="ITEM">Item Report</option>
            <option value="CLAIM">Claim</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filterActionSelect" className="text-xs font-semibold text-[#5C645E]">Filter Action:</label>
          <select
            id="filterActionSelect"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-1.5 px-3 text-xs border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
          >
            <option value="">All Actions</option>
            <option value="USER_SUSPEND">USER_SUSPEND</option>
            <option value="USER_REACTIVATE">USER_REACTIVATE</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="ITEM_STATUS_CHANGE">ITEM_STATUS_CHANGE</option>
            <option value="ITEM_MODERATED">ITEM_MODERATED</option>
            <option value="CLAIM_DECISION">CLAIM_DECISION</option>
            <option value="MODERATION_FLAGS_DISMISSED">MODERATION_FLAGS_DISMISSED</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setTargetTypeFilter('');
            setActionFilter('');
          }}
          className="py-1.5 px-3 text-xs text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
        >
          Reset Filters
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E7E3DA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#5C645E]">Loading audit log events...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A928D]">
            No audit logs recorded matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] border-b border-[#E7E3DA] text-[#5C645E]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Administrator</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EA]">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log._id;
                  return (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-3 px-4 text-[#8A928D] whitespace-nowrap text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#E7E3DA] text-[#1B382B]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1C201D]">
                            {log.adminId?.name || 'Administrator'}
                          </div>
                          <div className="text-[11px] text-[#5C645E]">
                            {log.adminId?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FAF8F5] text-[#5C645E] border border-[#E7E3DA] mr-1.5">
                            {log.targetType}
                          </span>
                          <span className="text-xs text-[#1C201D] font-mono truncate">
                            {log.targetId ? String(log.targetId).slice(-6) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-xs text-[#5C645E] truncate">
                          {log.reason || 'No recorded note'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                            className="text-xs font-semibold text-[#1B382B] hover:text-[#142A20]"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[#FAF8F5]/80">
                          <td colSpan="6" className="p-4 text-xs">
                            <div className="bg-white p-3.5 rounded-lg border border-[#E7E3DA] space-y-2">
                              <div>
                                <strong className="text-[#1C201D] block">Event Description:</strong>
                                <p className="text-[#5C645E] mt-0.5">{log.details}</p>
                              </div>
                              <div>
                                <strong className="text-[#1C201D] block">Reason / Justification:</strong>
                                <p className="text-[#5C645E] mt-0.5">{log.reason || 'None provided'}</p>
                              </div>
                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div>
                                  <strong className="text-[#1C201D] block">Captured Metadata:</strong>
                                  <pre className="mt-1 p-2 rounded bg-[#FAF8F5] text-[11px] font-mono text-[#1C201D] overflow-x-auto border border-[#E7E3DA]">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                              <div className="text-[11px] text-[#8A928D] pt-1 border-t border-[#F4F1EA]">
                                Log ID: <span className="font-mono">{log._id}</span> &bull; Target ID: <span className="font-mono">{log.targetId}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E7E3DA] flex items-center justify-between text-xs text-[#5C645E]">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} audit records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="px-2.5 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="px-2.5 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogs;

import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminUserDetails, updateUserStatus, updateUserRole } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

function AdminUsers() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal / Drawer State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status Action Modal (Suspend / Reactivate)
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Role Action Modal (Role Change)
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [targetRole, setTargetRole] = useState('USER');
  const [roleReason, setRoleReason] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      };
      const data = await getAdminUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch registered users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // Inspect User History Drawer
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const data = await getAdminUserDetails(user._id);
      setUserDetails(data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Suspend / Reactivate Confirmation
  const handleConfirmStatus = async () => {
    if (!statusModalUser) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const newSuspendedState = !statusModalUser.isSuspended;
      await updateUserStatus(statusModalUser._id, {
        isSuspended: newSuspendedState,
        reason: suspensionReason.trim()
      });

      setSuccessMessage(
        `User ${statusModalUser.name} has been ${newSuspendedState ? 'suspended' : 'reactivated'}.`
      );
      setStatusModalUser(null);
      setSuspensionReason('');
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Role Change Confirmation
  const handleConfirmRole = async () => {
    if (!roleModalUser) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateUserRole(roleModalUser._id, {
        role: targetRole,
        reason: roleReason.trim()
      });

      setSuccessMessage(`Role for ${roleModalUser.name} updated to ${targetRole}.`);
      setRoleModalUser(null);
      setRoleReason('');
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user role');
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
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
            Review registered users and administrators, manage roles, and review report/claim history.
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
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] text-[#1C201D]"
          />
          <svg className="w-4 h-4 text-[#8A928D] absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] bg-white text-[#1C201D]"
          >
            <option value="">All Roles</option>
            <option value="USER">User (USER)</option>
            <option value="ADMIN">Administrator (ADMIN)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 focus:border-[#1B382B] bg-white text-[#1C201D]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setStatusFilter('');
            }}
            className="py-2 px-3 text-xs text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#E7E3DA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#5C645E]">Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A928D]">
            No users match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] border-b border-[#E7E3DA] text-[#5C645E]">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold">Registered</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EA]">
                {users.map((u) => {
                  const isSelf = currentAdmin?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1B382B]/10 text-[#1B382B] font-bold text-xs flex items-center justify-center shrink-0">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C201D] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#5C645E]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-[#1B382B] text-white'
                              : 'bg-[#F4F1EA] text-[#5C645E]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#8A928D] text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(u)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#1B382B] hover:bg-[#1B382B]/10 rounded transition-colors"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => {
                              setRoleModalUser(u);
                              setTargetRole(u.role === 'ADMIN' ? 'USER' : 'ADMIN');
                              setRoleReason('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-[#5C645E] hover:bg-[#F4F1EA] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isSelf ? 'Cannot change your own role' : 'Change Role'}
                          >
                            Role
                          </button>

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => {
                              setStatusModalUser(u);
                              setSuspensionReason('');
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.isSuspended
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-red-700 hover:bg-red-50'
                            }`}
                            title={isSelf ? 'Cannot suspend yourself' : (u.isSuspended ? 'Reactivate account' : 'Suspend account')}
                          >
                            {u.isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
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
              Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total users)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
                className="px-2.5 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchUsers(pagination.page + 1)}
                className="px-2.5 py-1 border border-[#E7E3DA] rounded bg-white hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details & History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E7E3DA] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1C201D]">
                  User Profile &amp; Activity History
                </h3>
                <p className="text-xs text-[#5C645E] mt-0.5">{selectedUser.name} &bull; {selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="p-1 rounded text-[#5C645E] hover:text-[#1C201D]"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {detailsLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E7E3DA]">
                    <div>
                      <span className="text-[11px] text-[#5C645E] block">Role</span>
                      <span className="font-semibold text-[#1C201D]">{selectedUser.role}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5C645E] block">Status</span>
                      <span className={`font-semibold ${selectedUser.isSuspended ? 'text-red-700' : 'text-emerald-700'}`}>
                        {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5C645E] block">Items Reported</span>
                      <span className="font-semibold text-[#1C201D]">{userDetails?.items?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5C645E] block">Claims Submitted</span>
                      <span className="font-semibold text-[#1C201D]">{userDetails?.claims?.length || 0}</span>
                    </div>
                  </div>

                  {selectedUser.suspensionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                      <strong>Suspension Reason:</strong> {selectedUser.suspensionReason}
                    </div>
                  )}

                  {/* Reports List */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C201D] mb-2">
                      Reported Items ({userDetails?.items?.length || 0})
                    </h4>
                    {userDetails?.items?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {userDetails.items.map((item) => (
                          <div key={item._id} className="p-2.5 rounded border border-[#E7E3DA] flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-[#1C201D]">{item.title}</p>
                              <p className="text-[11px] text-[#5C645E]">{item.type} &bull; {item.category} &bull; {item.location}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] text-[#1B382B]">
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A928D]">No items reported by this user.</p>
                    )}
                  </div>

                  {/* Claims List */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C201D] mb-2">
                      Submitted Claims ({userDetails?.claims?.length || 0})
                    </h4>
                    {userDetails?.claims?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {userDetails.claims.map((claim) => (
                          <div key={claim._id} className="p-2.5 rounded border border-[#E7E3DA] flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-[#1C201D]">{claim.itemId?.title || 'Item'}</p>
                              <p className="text-[11px] text-[#5C645E]">Submitted: {new Date(claim.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] text-[#1B382B]">
                              {claim.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A928D]">No claims filed by this user.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-[#E7E3DA] bg-[#FAF8F5] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Reactivate Confirmation Dialog */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#1C201D]">
              {statusModalUser.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
            </h3>
            <p className="text-xs text-[#5C645E] leading-relaxed">
              Are you sure you want to {statusModalUser.isSuspended ? 'reactivate' : 'suspend'} the account of{' '}
              <strong>{statusModalUser.name}</strong> ({statusModalUser.email})?
              {!statusModalUser.isSuspended && ' Suspended users will be blocked from logging in and accessing ARGUS.'}
            </p>

            <div>
              <label htmlFor="suspensionReasonInput" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Reason for this administrative action (Required)
              </label>
              <textarea
                id="suspensionReasonInput"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Violation of platform Lost & Found terms, fraudulent activity..."
                rows="3"
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !suspensionReason.trim()}
                onClick={handleConfirmStatus}
                className={`px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  statusModalUser.isSuspended ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {actionLoading ? 'Processing...' : statusModalUser.isSuspended ? 'Confirm Reactivation' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Dialog */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-[#E7E3DA] max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#1C201D]">
              Change User Role
            </h3>
            <p className="text-xs text-[#5C645E] leading-relaxed">
              Updating role for <strong>{roleModalUser.name}</strong> ({roleModalUser.email}).
              Granting ADMIN privileges provides full system access to all user records, moderation queues, and disputes.
            </p>

            <div>
              <label htmlFor="targetRoleSelect" className="block text-xs font-semibold text-[#1C201D] mb-1">Select New Role</label>
              <select
                id="targetRoleSelect"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg bg-white text-[#1C201D]"
              >
                <option value="USER">User (USER)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
            </div>

            <div>
              <label htmlFor="roleReasonInput" className="block text-xs font-semibold text-[#1C201D] mb-1">
                Reason for Role Modification (Required)
              </label>
              <input
                id="roleReasonInput"
                type="text"
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                placeholder="e.g. Appointed as platform administrator..."
                className="w-full p-2.5 text-xs border border-[#E7E3DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B382B]/20 text-[#1C201D]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#5C645E] hover:text-[#1C201D] border border-[#E7E3DA] rounded-lg hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !roleReason.trim()}
                onClick={handleConfirmRole}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1B382B] hover:bg-[#142A20] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Updating...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;

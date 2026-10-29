import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch platform statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#1B382B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#5C645E]">Aggregating platform metrics from MongoDB Atlas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-semibold text-sm">Failed to load platform statistics</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { users, items, claims, moderation, recentActivity } = stats;

  const cards = [
    {
      title: 'Total Registered Users',
      value: users.total,
      subtitle: `${users.active} active · ${users.suspended} suspended · ${users.admins} admin${users.admins !== 1 ? 's' : ''}`,
      link: '/admin/users',
      linkText: 'Manage Users',
      color: 'border-l-4 border-l-[#1B382B]'
    },
    {
      title: 'Active Reports',
      value: items.active,
      subtitle: `${items.totalLost} lost items · ${items.totalFound} found items`,
      link: '/admin/items',
      linkText: 'Inspect Reports',
      color: 'border-l-4 border-l-emerald-600'
    },
    {
      title: 'Pending Claims',
      value: claims.pending,
      subtitle: `${claims.approved} claims approved to date`,
      link: '/admin/claims',
      linkText: 'Resolve Claims',
      color: 'border-l-4 border-l-amber-600'
    },
    {
      title: 'Successfully Returned',
      value: items.returned,
      subtitle: 'Items safely recovered by rightful owners',
      link: '/admin/items?status=CLAIMED',
      linkText: 'View Returns',
      color: 'border-l-4 border-l-blue-600'
    },
    {
      title: 'Moderation Flags',
      value: moderation.flagged,
      subtitle: 'Reports flagged by users awaiting review',
      link: '/admin/moderation',
      linkText: 'Open Queue',
      color: moderation.flagged > 0 ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-gray-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#E7E3DA] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C201D] tracking-tight">
            Administrative Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-[#5C645E] mt-1">
            Real-time platform lost and found metrics, user registry status, and moderation queue.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-lg border border-[#E7E3DA] text-xs font-semibold text-[#1C201D] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-[#5C645E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl p-5 border border-[#E7E3DA] shadow-xs flex flex-col justify-between ${card.color}`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C645E]">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-[#1C201D] mt-2">
                {card.value}
              </p>
              <p className="text-xs text-[#8A928D] mt-1.5 leading-relaxed">
                {card.subtitle}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F4F1EA] flex justify-end">
              <Link
                to={card.link}
                className="text-xs font-semibold text-[#1B382B] hover:text-[#C05634] flex items-center gap-1 transition-colors"
              >
                <span>{card.linkText}</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Quick Actions & Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Guide */}
        <div className="bg-white rounded-xl p-5 border border-[#E7E3DA] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#1C201D] uppercase tracking-wider">
            Quick Operations
          </h2>
          <div className="space-y-2.5">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 rounded-lg border border-[#E7E3DA] hover:border-[#1B382B] hover:bg-[#FAF8F5] transition-all group"
            >
              <div>
                <p className="text-xs font-semibold text-[#1C201D] group-hover:text-[#1B382B]">User Management</p>
                <p className="text-[11px] text-[#5C645E]">Inspect accounts, suspend, or update roles</p>
              </div>
              <svg className="w-4 h-4 text-[#8A928D] group-hover:text-[#1B382B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/admin/claims"
              className="flex items-center justify-between p-3 rounded-lg border border-[#E7E3DA] hover:border-[#1B382B] hover:bg-[#FAF8F5] transition-all group"
            >
              <div>
                <p className="text-xs font-semibold text-[#1C201D] group-hover:text-[#1B382B]">Claims &amp; Disputes</p>
                <p className="text-[11px] text-[#5C645E]">Review ownership evidence &amp; resolve disputes</p>
              </div>
              <svg className="w-4 h-4 text-[#8A928D] group-hover:text-[#1B382B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/admin/moderation"
              className="flex items-center justify-between p-3 rounded-lg border border-[#E7E3DA] hover:border-[#1B382B] hover:bg-[#FAF8F5] transition-all group"
            >
              <div>
                <p className="text-xs font-semibold text-[#1C201D] group-hover:text-[#1B382B]">Content Moderation</p>
                <p className="text-[11px] text-[#5C645E]">Review reported items and dismiss or hide</p>
              </div>
              <svg className="w-4 h-4 text-[#8A928D] group-hover:text-[#1B382B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/admin/logs"
              className="flex items-center justify-between p-3 rounded-lg border border-[#E7E3DA] hover:border-[#1B382B] hover:bg-[#FAF8F5] transition-all group"
            >
              <div>
                <p className="text-xs font-semibold text-[#1C201D] group-hover:text-[#1B382B]">System Audit Logs</p>
                <p className="text-[11px] text-[#5C645E]">Inspect immutable records of administrative actions</p>
              </div>
              <svg className="w-4 h-4 text-[#8A928D] group-hover:text-[#1B382B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Administrative Activity Log Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#E7E3DA] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#1C201D] uppercase tracking-wider">
              Recent Administrative Activity
            </h2>
            <Link
              to="/admin/logs"
              className="text-xs font-semibold text-[#1B382B] hover:text-[#C05634] transition-colors"
            >
              View Full Audit Log &rarr;
            </Link>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E3DA] text-[#5C645E]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Action</th>
                    <th className="py-2.5 px-3 font-semibold">Administrator</th>
                    <th className="py-2.5 px-3 font-semibold">Target</th>
                    <th className="py-2.5 px-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F1EA]">
                  {recentActivity.map((log) => (
                    <tr key={log._id} className="hover:bg-[#FAF8F5]/60">
                      <td className="py-2.5 px-3 font-semibold text-[#1C201D]">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#E7E3DA] text-[#1B382B]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#1C201D]">
                        {log.adminId?.name || 'Administrator'}
                      </td>
                      <td className="py-2.5 px-3 text-[#5C645E] truncate max-w-xs">
                        {log.details}
                      </td>
                      <td className="py-2.5 px-3 text-[#8A928D] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#8A928D]">
              <svg className="w-8 h-8 mx-auto text-[#DCD7CD] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No administrative events recorded in the audit log yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;

import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssueContext';
import { IssueCategory, IssuePriority, IssueStatus } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  ThumbsUp,
  Clock,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  AlertCircle,
  Building,
} from 'lucide-react';

const CATEGORY_NAMES: Record<IssueCategory, string> = {
  electrical: 'Electrical & Power',
  plumbing: 'Plumbing & Water',
  hvac: 'HVAC & Cooling',
  civil: 'Civil & Furniture',
  it_smart_class: 'Smart Class & IT',
  sanitation: 'Sanitation',
  safety: 'Safety Hazard',
};

export const IncidentDirectory: React.FC = () => {
  const {
    issues,
    upvoteIssue,
    setSelectedIssueId,
    setIsReportModalOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBlockFilter,
    setSelectedBlockFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    currentUser,
  } = useIssues();

  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'priority'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtering and sorting logic
  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        // Search query matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = issue.id.toLowerCase().includes(q);
          const matchTitle = issue.title.toLowerCase().includes(q);
          const matchDesc = issue.description.toLowerCase().includes(q);
          const matchBlock = issue.block.toLowerCase().includes(q);
          const matchLoc = issue.specificLocation.toLowerCase().includes(q);
          const matchReporter = issue.reporterName.toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchDesc && !matchBlock && !matchLoc && !matchReporter) {
            return false;
          }
        }

        // Status filter
        if (selectedStatusFilter !== 'all') {
          if (selectedStatusFilter === 'active') {
            if (issue.status === 'resolved' || issue.status === 'closed') return false;
          } else if (issue.status !== selectedStatusFilter) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
          return false;
        }

        // Block filter
        if (selectedBlockFilter !== 'all') {
          if (!issue.block.toLowerCase().includes(selectedBlockFilter.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          return b.upvotes - a.upvotes;
        }
        if (sortBy === 'priority') {
          const priorityWeights: Record<IssuePriority, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [issues, searchQuery, selectedStatusFilter, selectedCategory, selectedBlockFilter, sortBy]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getPriorityStyle = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return 'text-rose-700 font-semibold';
      case 'high':
        return 'text-amber-700 font-medium';
      case 'medium':
        return 'text-slate-700 font-normal';
      case 'low':
        return 'text-slate-500 font-normal';
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case 'reported':
        return 'Reported (Pending Triage)';
      case 'triaged':
        return 'Triaged & Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'parts_pending':
        return 'Awaiting Spare Parts';
      case 'resolved':
        return 'Resolved & Verified';
      case 'closed':
        return 'Archived / Closed';
    }
  };

  const getStatusIndicator = (status: IssueStatus) => {
    switch (status) {
      case 'reported':
        return 'text-slate-600';
      case 'triaged':
        return 'text-blue-700 font-medium';
      case 'in_progress':
        return 'text-amber-700 font-semibold';
      case 'parts_pending':
        return 'text-purple-700 font-medium';
      case 'resolved':
        return 'text-emerald-700 font-semibold';
      case 'closed':
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Directory Header with natural editorial title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Campus Facility Incident Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time tracking of all reported breakdowns across academic blocks, research labs, and student hostels.
          </p>
        </div>

        {/* View switcher & counter */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 tabular-nums">
            Showing <span className="font-semibold text-slate-900">{filteredIssues.length}</span> of {issues.length} records
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dense Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Detail Cards
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar (Segmented Controls) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 mr-2 shrink-0">Status:</span>
          {(
            [
              { id: 'all', label: 'All Incidents' },
              { id: 'active', label: 'Active & Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'parts_pending', label: 'Parts Pending' },
              { id: 'resolved', label: 'Resolved' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedStatusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-rose-900"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Block Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Campus Location
            </label>
            <select
              value={selectedBlockFilter}
              onChange={(e) => setSelectedBlockFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-rose-900"
            >
              <option value="all">All Campus Blocks</option>
              <option value="Kalam">Dr. APJ Abdul Kalam Block</option>
              <option value="Raman">Sir C.V. Raman Science Block</option>
              <option value="Krishnan">Dr. K.S. Krishnan Block</option>
              <option value="Ramanujan">Ramanujan Block</option>
              <option value="Library">Central Library</option>
              <option value="Bharathi">Bharathi Men's Hostel</option>
              <option value="Teresa">Mother Teresa Hostel</option>
              <option value="Valluvar">Valluvar Hostel</option>
              <option value="Food Court">Dining & Food Court</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-rose-900"
            >
              <option value="newest">Most Recent First</option>
              <option value="upvotes">Highest Impact (Most Upvoted)</option>
              <option value="priority">Urgency / Severity First</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBlockFilter('all');
                setSelectedStatusFilter('all');
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredIssues.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No facility incidents match your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting the active filters or search terms. If you noticed an unreported breakdown, log it now.
            </p>
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-900 rounded-lg hover:bg-rose-950 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report This Issue</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Data Grid (Tabular discipline) */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Problem Summary & Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Affected</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                      {issue.id}
                    </td>

                    {/* Problem Summary & Location */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-semibold text-slate-900 truncate">
                        {issue.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                        <span className="font-medium text-slate-700">{issue.block}</span>
                        <span aria-hidden="true">·</span>
                        <span>{issue.floor}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{issue.specificLocation}</span>
                      </div>
                    </td>

                    {/* Category (unboxed text) */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {CATEGORY_NAMES[issue.category]}
                    </td>

                    {/* Urgency */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={getPriorityStyle(issue.priority)}>
                        {issue.priority.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5 tabular-nums">
                        ({issue.targetSlaHours}h SLA)
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={getStatusIndicator(issue.status)}>
                        {getStatusText(issue.status)}
                      </span>
                    </td>

                    {/* Affected Upvote Button */}
                    <td
                      className="py-3 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => upvoteIssue(issue.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                          issue.upvotedByUser
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to confirm you are also affected by this issue"
                      >
                        <ThumbsUp className={`w-3 h-3 ${issue.upvotedByUser ? 'fill-rose-900' : ''}`} />
                        <span className="tabular-nums">+{issue.upvotes}</span>
                      </button>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      {issue.assignedTechnician ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {issue.assignedTechnician.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {issue.assignedTechnician.trade}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Action */}
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssueId(issue.id)}
              className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header with clean unboxed metadata */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {issue.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700">
                      {CATEGORY_NAMES[issue.category]}
                    </span>
                  </div>
                  <span className="font-mono text-[11px]">
                    {formatTimeAgo(issue.createdAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {issue.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                  {issue.description}
                </p>

                {/* Location unboxed string */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{issue.block}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{issue.specificLocation}</span>
                </div>
              </div>

              {/* Card Footer: Priority, Status, and Upvotes */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className={getPriorityStyle(issue.priority)}>
                    {issue.priority.toUpperCase()}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className={getStatusIndicator(issue.status)}>
                    {getStatusText(issue.status)}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => upvoteIssue(issue.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      issue.upvotedByUser
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${issue.upvotedByUser ? 'fill-rose-900' : ''}`} />
                    <span className="tabular-nums">+{issue.upvotes}</span>
                  </button>

                  <button
                    onClick={() => setSelectedIssueId(issue.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

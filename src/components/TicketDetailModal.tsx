import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { IssuePriority, IssueStatus } from '../types';
import {
  X,
  ThumbsUp,
  Clock,
  Phone,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Send,
  Star,
  ExternalLink,
} from 'lucide-react';

export const TicketDetailModal: React.FC = () => {
  const {
    issues,
    selectedIssueId,
    setSelectedIssueId,
    upvoteIssue,
    updateStatus,
    assignTechnician,
    submitFeedback,
    technicians,
    currentUser,
  } = useIssues();

  const issue = issues.find((i) => i.id === selectedIssueId);

  const [techNote, setTechNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<IssueStatus>('in_progress');
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);

  if (!issue) return null;

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techNote.trim()) return;
    updateStatus(issue.id, targetStatus, techNote.trim());
    setTechNote('');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    assignTechnician(issue.id, selectedTechId);
    setSelectedTechId('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(issue.id, feedbackRating, feedbackText.trim());
    setShowFeedbackForm(false);
    setFeedbackText('');
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {issue.id}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {issue.category.replace('_', ' ')}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Target SLA: {issue.targetSlaHours}h
            </span>
          </div>

          <button
            onClick={() => setSelectedIssueId(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Main Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {issue.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{issue.block}</span>
                <span aria-hidden="true">·</span>
                <span>{issue.floor}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-800 font-medium">{issue.specificLocation}</span>
              </div>
            </div>

            {/* Upvote counter button */}
            <button
              onClick={() => upvoteIssue(issue.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors shrink-0 ${
                issue.upvotedByUser
                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${issue.upvotedByUser ? 'fill-rose-900' : ''}`} />
              <span className="tabular-nums">+{issue.upvotes} Affected Users</span>
            </button>
          </div>

          {/* Issue Description */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Problem Description
            </div>
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {/* Photo attachment if available */}
          {issue.imageUrl && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Attached Incident Verification Photo
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100">
                <img
                  src={issue.imageUrl}
                  alt="Incident evidence photo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover max-h-64"
                />
              </div>
            </div>
          )}

          {/* Reporter & Assignee 2-column info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reporter details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reported By
              </div>
              <div className="font-semibold text-slate-900 text-sm">
                {issue.reporterName}
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>
                  <span className="text-slate-400">Role:</span> {issue.reporterRole} ({issue.reporterDepartment})
                </div>
                <div>
                  <span className="text-slate-400">ID:</span> <span className="font-mono">{issue.reporterRegNo}</span>
                </div>
                <div>
                  <span className="text-slate-400">Contact:</span> {issue.reporterContact}
                </div>
              </div>
            </div>

            {/* Assigned Technician */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Maintenance Staff
              </div>
              {issue.assignedTechnician ? (
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {issue.assignedTechnician.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {issue.assignedTechnician.trade}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-900 font-mono font-medium mt-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{issue.assignedTechnician.phone}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  No technician currently assigned to this ticket.
                </div>
              )}
            </div>
          </div>

          {/* Resolution Notes if Resolved */}
          {issue.resolutionNotes && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Work Completed & Resolution Summary</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {issue.resolutionNotes}
              </p>
            </div>
          )}

          {/* User Feedback / Rating Section */}
          {issue.feedback ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Student / Reporter Feedback</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: issue.feedback.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              {issue.feedback.comment && (
                <p className="text-xs text-slate-600 italic">
                  "{issue.feedback.comment}"
                </p>
              )}
            </div>
          ) : issue.status === 'resolved' ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              {!showFeedbackForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Has this problem been resolved satisfactorily?
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Please provide verification so the Estate Office can close the work order.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Rate & Confirm
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 text-slate-300 hover:text-amber-500 focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= feedbackRating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Optional feedback comment for Estate Office..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-3 py-1 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold text-white bg-rose-900 rounded-lg hover:bg-rose-950"
                    >
                      Submit Verification
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Role-Specific Work Actions */}
          {currentUser.role === 'estate_admin' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Estate Directorate Actions (Admin Controls)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form onSubmit={handleAssignSubmit} className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Dispatch Technician:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTechId}
                      onChange={(e) => setSelectedTechId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="">Select Technician...</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.trade} · {t.activeOrders} active)
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!selectedTechId}
                      className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 disabled:bg-slate-300 rounded-lg shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Quick Status Change:
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['triaged', 'in_progress', 'parts_pending', 'resolved', 'closed'] as IssueStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => updateStatus(issue.id, st, `Status changed by Estate Admin (${currentUser.name})`)}
                          className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                            issue.status === st
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentUser.role === 'technician' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Technician Work Order Update
              </div>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['in_progress', 'parts_pending', 'resolved'] as IssueStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTargetStatus(st)}
                      className={`p-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        targetStatus === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {st === 'in_progress'
                        ? 'Work In Progress'
                        : st === 'parts_pending'
                        ? 'Need Spare Parts'
                        : 'Mark Resolved'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Technician Action Note / Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Replaced capacitor, tested voltage, clean..."
                    value={techNote}
                    onChange={(e) => setTechNote(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-lg shadow-xs"
                  >
                    Submit Work Log
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Activity Audit Log */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Incident Audit Timeline ({issue.activityLog.length} events)
            </div>
            <div className="space-y-3 pl-2 border-l border-slate-200">
              {issue.activityLog.map((act) => (
                <div key={act.id} className="relative pl-4 space-y-0.5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{act.action}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatTimestamp(act.timestamp)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    By <span className="font-medium text-slate-800">{act.author}</span> ({act.authorRole})
                  </div>
                  {act.note && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                      {act.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            KARE Estate & Facilities Central Registry
          </div>
          <button
            onClick={() => setSelectedIssueId(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

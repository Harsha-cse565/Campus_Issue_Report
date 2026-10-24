import React from 'react';
import { useIssues } from '../context/IssueContext';
import { Search, Plus, CheckCircle2, Clock, ShieldAlert, ArrowRight, Building2 } from 'lucide-react';

interface HeroSectionProps {
  onQuickReportClick: () => void;
  onExploreMapClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onQuickReportClick,
  onExploreMapClick,
}) => {
  const { stats, searchQuery, setSearchQuery, setSelectedIssueId, issues } = useIssues();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if user entered an exact ticket ID
    const found = issues.find(
      (i) => i.id.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (found) {
      setSelectedIssueId(found.id);
    }
  };

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* 2-column hero split with balanced stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Context & Core Solution */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-wider text-rose-800 uppercase">
                Estate & Campus Infrastructure Directorate
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
                Centralized Campus Facility Operations & Issue Resolution
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                Ensuring uninterrupted classrooms, research labs, hostels, and campus utilities at Kalasalingam University through real-time transparent reporting, collective impact upvoting, and verified SLA dispatch.
              </p>
            </div>

            {/* Quick Search & Ticket Tracker */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl">
              <div className="relative flex items-center shadow-xs rounded-xl border border-slate-300 bg-white focus-within:border-rose-900 focus-within:ring-2 focus-within:ring-rose-900/10 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Track Ticket ID (e.g. KARE-2026-0842) or search block/issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-3 pr-24 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                >
                  Lookup
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>Recent examples:</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('KARE-2026-0842')}
                  className="underline hover:text-slate-800 font-mono text-[11px]"
                >
                  KARE-2026-0842
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Kalam Block')}
                  className="underline hover:text-slate-800"
                >
                  Kalam Block
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Projector')}
                  className="underline hover:text-slate-800"
                >
                  Projectors
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onQuickReportClick}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-900 rounded-lg hover:bg-rose-950 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Report Campus Problem</span>
              </button>
              <button
                onClick={onExploreMapClick}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Explore Block Status</span>
              </button>
            </div>
          </div>

          {/* Right Column: Campus Visual Anchor */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg aspect-16/10 lg:aspect-4/3 bg-slate-100">
              <img
                src="/assets/aistudio/kalasalingam_university_770000d2.webp"
                alt="Kalasalingam Academy of Research and Education Main Campus Complex"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  Campus Facilities Management
                </span>
                <p className="text-sm font-medium text-slate-100 mt-1">
                  KARE Main Academic & Research Enclave · Krishnankoil
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <span>Estate Response SLA: Active</span>
                  <span aria-hidden="true">·</span>
                  <span>11 Campus Blocks Monitored</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-column KPI strip placed in a full-width row below the hero split */}
        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Active Open Incidents</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.open}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.inProgress} currently with technicians
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Hazard / Critical Tasks</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-900 font-mono tabular-nums">
              {stats.critical}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Dispatched within 2 hours
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Mean Resolution Time</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.avgResolutionHours}h
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Campus average turnaround
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">SLA Adherence Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
              {stats.slaAdherenceRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.resolved} incidents completed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

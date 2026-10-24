import React from 'react';
import { useIssues } from '../context/IssueContext';
import { UserRole } from '../types';
import { AlertCircle, User, Wrench, ShieldCheck, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: 'incidents' | 'map' | 'analytics' | 'emergency';
  setActiveTab: (tab: 'incidents' | 'map' | 'analytics' | 'emergency') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, setCurrentRole, setIsReportModalOpen, stats } = useIssues();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Strict 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark, whitespace-nowrap shrink-0) */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/aistudio/kare_logo_ac7ccab6.png"
            alt="Kalasalingam Academy of Research and Education Logo"
            className="w-9 h-9 object-contain shrink-0"
          />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('incidents');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-rose-900 transition-colors"
          >
            KARE Campus Operations
          </a>
        </div>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'incidents'
                ? 'text-rose-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Live Incidents
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'map'
                ? 'text-rose-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Campus Map
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'analytics'
                ? 'text-rose-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Operations & SLA
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'emergency'
                ? 'text-rose-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Emergency Desk
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-900 rounded-lg hover:bg-rose-950 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Facility Issue</span>
          </button>
        </div>
      </div>

      {/* Role & Persona Switcher Strip below top bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-slate-700">Kalasalingam Academy of Research and Education</span>
            <span aria-hidden="true">·</span>
            <span>Accredited NAAC 'A+'</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-rose-800 font-medium">
              {stats.critical} Critical Attention Req.
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-slate-500 font-medium whitespace-nowrap">View as:</span>
            <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-md">
              <button
                onClick={() => setCurrentRole('student')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  currentUser.role === 'student'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Reporter view: Student / Faculty can file complaints and upvote"
              >
                <User className="w-3 h-3" />
                <span className="whitespace-nowrap">Student / Faculty</span>
              </button>

              <button
                onClick={() => setCurrentRole('technician')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  currentUser.role === 'technician'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Technician view: Update status, resolve work orders"
              >
                <Wrench className="w-3 h-3" />
                <span className="whitespace-nowrap">Technician</span>
              </button>

              <button
                onClick={() => setCurrentRole('estate_admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  currentUser.role === 'estate_admin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Estate Admin view: Dispatch, assign technicians, monitor SLAs"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="whitespace-nowrap">Estate Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

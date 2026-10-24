import React from 'react';
import { useIssues } from '../context/IssueContext';
import { RotateCcw, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetToDefaults } = useIssues();

  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: University Identity */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <img
                src="/assets/aistudio/kare_logo_ac7ccab6.png"
                alt="KARE Emblem"
                className="w-6 h-6 object-contain shrink-0"
              />
              <span>Kalasalingam Academy of Research and Education</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs max-w-md">
              (Deemed to be University under Sec. 3 of UGC Act 1956) · Accredited by NAAC with 'A+' Grade. Dedicated to engineering, technological innovation, research, and inclusive campus life.
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 pt-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>Anand Nagar, Krishnankoil, Srivilliputtur, Tamil Nadu 626126, India</span>
            </div>
          </div>

          {/* Col 2: Directorate of Facilities */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-900">
              Estate & Maintenance Office
            </div>
            <ul className="space-y-1 text-slate-500 text-xs">
              <li>Central Maintenance Workshop</li>
              <li>HT Substation & Solar Operations</li>
              <li>Campus Water Treatment & RO Plants</li>
              <li>Smart Classroom AV Engineering</li>
              <li>Hostel Facilities Coordination</li>
            </ul>
          </div>

          {/* Col 3: Portal Governance & Data */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-900">
              System Administration
            </div>
            <div className="text-slate-500 space-y-1">
              <div>Central Incident Dispatch v2.6</div>
              <div>Estate Helpdesk: helpdesk.estate@klu.ac.in</div>
            </div>
            <div className="pt-2">
              <button
                onClick={resetToDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Restore default mock campus issues"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset Demo Records</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Kalasalingam Academy of Research and Education (KARE). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Facility SLA Policy</span>
            <span aria-hidden="true">·</span>
            <span>Campus Safety Guidelines</span>
            <span aria-hidden="true">·</span>
            <span>Estate Directorate</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

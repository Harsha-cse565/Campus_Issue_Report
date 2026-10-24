import React from 'react';
import { EMERGENCY_CONTACTS } from '../data/mockData';
import { Phone, ShieldAlert, AlertTriangle, Flame, Zap, Droplet, Plus } from 'lucide-react';
import { useIssues } from '../context/IssueContext';

export const EmergencySection: React.FC = () => {
  const { setIsReportModalOpen } = useIssues();

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner */}
      <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-900 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-950">
              Campus Critical Breakdown or Safety Emergency?
            </h3>
            <p className="text-xs text-rose-800 mt-1 max-w-xl leading-relaxed">
              If an incident presents immediate bodily hazard (exposed high-voltage cables, chemical spill, structural damage, water mains burst, elevator entrapment), contact the 24/7 Estate Duty Officer immediately.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-lg shadow-xs transition-colors shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Emergency Hazard Ticket</span>
        </button>
      </div>

      {/* Emergency Contacts Directory */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            24/7 Estate & Campus Security Emergency Directory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct landline and mobile emergency numbers for Kalasalingam University Campus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Desk #{idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400">24/7 Manned</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                  {contact.title}
                </h4>
                <div className="text-xs text-slate-600 mt-0.5">
                  {contact.role}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Location: {contact.location}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-slate-500 text-[10px]">Landline Ext.</div>
                  <div className="font-semibold text-slate-800">{contact.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[10px]">Mobile Hotline</div>
                  <div className="font-bold text-rose-900">{contact.mobile}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Escalation Guidelines */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Estate Response Protocol & Safety Invariants
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Electrical Isolation First</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Never attempt to touch sparked equipment in laboratories. Maintenance teams follow strict Lockout/Tagout (LOTO) protocols at local distribution boards.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-blue-600" />
              <span>Water Ingress & Floor Safety</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Severe pipeline bursts require isolation at riser ball-valves. Wet corridors must have yellow safety warning boards deployed immediately by housekeeping.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Hostel Maintenance Cutoff</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Routine hostel plumbing or carpentry requests are batched 09:00 - 18:00 hrs. Night emergency calls are routed directly through the Resident Warden desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

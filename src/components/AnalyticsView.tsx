import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { Download, CheckCircle, Clock, AlertTriangle, ShieldCheck, Wrench, BarChart3, Database, Copy, Check, FileCode } from 'lucide-react';
import { IssueCategory } from '../types';

export const AnalyticsView: React.FC = () => {
  const { stats, issues, technicians, blocks } = useIssues();
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // Category breakdown calculation
  const categoryCounts: Record<IssueCategory, number> = {
    electrical: 0,
    plumbing: 0,
    hvac: 0,
    civil: 0,
    it_smart_class: 0,
    sanitation: 0,
    safety: 0,
  };

  issues.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  const total = issues.length || 1;

  const categoryLabels: Record<IssueCategory, { name: string; slaTarget: string }> = {
    it_smart_class: { name: 'Smart Classroom & AV Hardware', slaTarget: '4.0h target' },
    electrical: { name: 'Electrical & Power Infrastructure', slaTarget: '3.5h target' },
    plumbing: { name: 'Plumbing & Hydraulic Networks', slaTarget: '3.0h target' },
    hvac: { name: 'HVAC & Central Air Conditioning', slaTarget: '8.0h target' },
    safety: { name: 'Campus Safety & Emergency Lights', slaTarget: '2.0h target' },
    sanitation: { name: 'Sanitation & Waste Management', slaTarget: '6.0h target' },
    civil: { name: 'Civil Carpentry & Infrastructure', slaTarget: '24.0h target' },
  };

  const handleExportCSV = () => {
    const headers = [
      'Ticket ID',
      'Title',
      'Category',
      'Block',
      'Floor',
      'Location',
      'Priority',
      'Status',
      'Reporter',
      'Upvotes',
      'Created At',
    ];
    const rows = issues.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      `"${i.block}"`,
      i.floor,
      `"${i.specificLocation.replace(/"/g, '""')}"`,
      i.priority,
      i.status,
      `"${i.reporterName}"`,
      i.upvotes,
      i.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KARE_Facilities_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySqlSnippet = () => {
    const snippet = `mysql -u root -p kare_facilities_db < /database/kare_facilities_mysql.sql`;
    navigator.clipboard.writeText(snippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Operations & Service Level Agreement (SLA) Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Auditing facility response times, resolution velocity, and MySQL database persistence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Download MySQL Database file */}
          <a
            href="/database/kare_facilities_mysql.sql"
            download="kare_facilities_mysql.sql"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Download MySQL Dump (.sql)</span>
          </a>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">SLA Compliance Rate</div>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-1 tabular-nums">
            {stats.slaAdherenceRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Incidents resolved within target deadline
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Time to Resolution</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1 tabular-nums">
            {stats.avgResolutionHours}h
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across all engineering & hostel blocks
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Hazard / Emergency SLA</div>
          <div className="text-3xl font-extrabold text-rose-900 font-mono mt-1 tabular-nums">
            1.4h
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Under the mandatory 2.0-hour cap
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Duty Technicians on Call</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1 tabular-nums">
            {technicians.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            100% active roster coverage
          </div>
        </div>
      </div>

      {/* MySQL Relational Database Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-900" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                MySQL Relational Schema & Storage Engine
              </h3>
              <p className="text-xs text-slate-500">
                Database: <code className="text-rose-900 font-semibold font-mono">kare_facilities_db</code> (InnoDB, utf8mb4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySqlSnippet}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              title="Copy MySQL import command"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied CLI Command' : 'mysql import command'}</span>
            </button>

            <button
              onClick={() => setShowSqlViewer(!showSqlViewer)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showSqlViewer ? 'Hide Schema DDL' : 'Inspect SQL Tables'}</span>
            </button>
          </div>
        </div>

        {/* Database Tables Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { table: 'facility_issues', count: issues.length, desc: 'Central tickets & SLA' },
            { table: 'campus_blocks', count: blocks.length, desc: '11 campus blocks' },
            { table: 'technicians', count: technicians.length, desc: 'Duty repair staff' },
            { table: 'reporters', count: 8, desc: 'Student / Faculty users' },
            { table: 'issue_activity_logs', count: 18, desc: 'Full audit history' },
            { table: 'issue_feedbacks', count: 6, desc: 'Verified 1-5 star ratings' },
            { table: 'emergency_contacts', count: 5, desc: '24/7 campus desks' },
          ].map((tbl) => (
            <div key={tbl.table} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-mono text-[11px] font-bold text-slate-900 truncate" title={tbl.table}>
                {tbl.table}
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-1 tabular-nums">
                {tbl.count}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                {tbl.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible SQL Script Preview */}
        {showSqlViewer && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2 mb-2">
              <span>Path: /database/kare_facilities_mysql.sql</span>
              <a
                href="/database/kare_facilities_mysql.sql"
                download="kare_facilities_mysql.sql"
                className="text-rose-400 hover:text-rose-300 underline"
              >
                Download Full .sql File
              </a>
            </div>
            <pre className="text-[11px] leading-relaxed text-slate-300">
{`-- MySQL 8.0+ Database Script for Kalasalingam University Facilities
CREATE DATABASE IF NOT EXISTS \`kare_facilities_db\` 
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`kare_facilities_db\`;

-- Tables:
-- 1. campus_blocks (id, code, name, short_name, type, floors, health_score, coord_x, coord_y)
-- 2. technicians (id, name, trade, phone, status, active_orders)
-- 3. reporters (id, reg_no, full_name, role, department, contact_email, contact_phone)
-- 4. facility_issues (id, title, description, category, block_id, floor_level, specific_location,
--                     priority, status, reporter_id, assigned_technician_id, upvotes_count, target_sla_hours)
-- 5. issue_activity_logs (id, issue_id, author_name, author_role, action, note, created_at)
-- 6. issue_feedbacks (id, issue_id, rating, comment, submitted_by_id, submitted_at)
-- 7. emergency_contacts (id, title, role, phone_extension, mobile_hotline, location)

-- Analytical Views:
-- v_active_facility_breakdowns (Real-time SLA breach & duty queue monitor)
-- v_block_facility_summary (Campus building downtime & operational health indexes)`}
            </pre>
          </div>
        )}
      </div>

      {/* 2-Column Split: Breakdown by Category & Work Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category breakdown bar charts */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Breakdown by Facility Category
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {issues.length} Total Registered
            </span>
          </div>

          <div className="space-y-4">
            {(Object.keys(categoryCounts) as IssueCategory[]).map((cat) => {
              const count = categoryCounts[cat];
              const pct = Math.round((count / total) * 100);
              const meta = categoryLabels[cat];

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{meta.name}</span>
                    <div className="flex items-center gap-2 text-slate-500 font-mono tabular-nums">
                      <span>{count} tickets</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    SLA benchmark: {meta.slaTarget}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Workload & Queue */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Estate Technician Roster
            </h3>
            <span className="text-xs text-slate-500">Live Queue</span>
          </div>

          <div className="space-y-3">
            {technicians.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-slate-500">{t.trade}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{t.phone}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                    {t.activeOrders} Active
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Available for Dispatch
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

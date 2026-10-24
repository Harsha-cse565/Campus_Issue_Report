import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CampusBlock } from '../types';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface CampusMapExplorerProps {
  onSelectBlockForFilter: (blockName: string) => void;
}

export const CampusMapExplorer: React.FC<CampusMapExplorerProps> = ({
  onSelectBlockForFilter,
}) => {
  const { blocks, issues, setSelectedIssueId } = useIssues();
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0].id);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];

  const blockIssues = issues.filter(
    (i) => i.block.toLowerCase().includes(selectedBlock.shortName.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Interactive Campus Facility Map & Infrastructure Health
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Spatial monitoring across 11 major academic, research, residence, and utility facilities at Kalasalingam University.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Click any block to inspect active breakdown logs and room-level tickets.
        </div>
      </div>

      {/* Main Grid: Interactive Map Grid + Block Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campus Spatial Grid */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Compass className="w-4 h-4 text-rose-900" />
              <span>KARE Main Campus Enclave Map</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;90% Optimal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &lt;90% Attention
              </span>
            </div>
          </div>

          {/* Architectural Layout Representation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {blocks.map((b) => {
              const isSelected = b.id === selectedBlockId;
              const hasCritical = issues.some(
                (i) =>
                  i.block.toLowerCase().includes(b.shortName.toLowerCase()) &&
                  (i.priority === 'critical' || i.priority === 'high') &&
                  i.status !== 'resolved'
              );

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-900 bg-rose-50/40 ring-2 ring-rose-900/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wide">
                        {b.code}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold tabular-nums ${
                          b.healthScore >= 90 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {b.healthScore}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {b.shortName}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {b.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {b.floors} Floors
                    </span>
                    <span
                      className={`font-semibold tabular-nums text-xs ${
                        b.activeIssuesCount > 0 ? (hasCritical ? 'text-rose-700' : 'text-amber-700') : 'text-emerald-700'
                      }`}
                    >
                      {b.activeIssuesCount > 0 ? `${b.activeIssuesCount} Active Issues` : 'All Clear'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Block Deep-Dive Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono">{selectedBlock.code}</span>
              <span className="capitalize">{selectedBlock.type} facility</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedBlock.name}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {selectedBlock.description}
            </p>
          </div>

          {/* Health & Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500">Facility Health</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                {selectedBlock.healthScore}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Calculated from active breakdown duration
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500">Open Tickets</div>
              <div className="text-2xl font-bold font-mono text-rose-900 mt-0.5 tabular-nums">
                {selectedBlock.activeIssuesCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Pending maintenance
              </div>
            </div>
          </div>

          {/* Active Incidents in this Block */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              <span>Block Maintenance Log</span>
              <span className="font-mono text-slate-500 text-[11px]">
                {blockIssues.length} Total
              </span>
            </div>

            {blockIssues.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
                No active or historical issues reported in this block.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {blockIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {issue.id}
                      </span>
                      <span
                        className={`font-semibold ${
                          issue.priority === 'critical' ? 'text-rose-700' : 'text-slate-600'
                        }`}
                      >
                        {issue.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-900 line-clamp-1">
                      {issue.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {issue.floor} · {issue.specificLocation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action button: filter main incident list */}
          <button
            onClick={() => onSelectBlockForFilter(selectedBlock.shortName)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <span>View All Issues in {selectedBlock.shortName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { IssueCategory, IssuePriority } from '../types';
import { CAMPUS_BLOCKS } from '../data/mockData';
import { X, CheckCircle, AlertTriangle, Camera, Upload, ShieldAlert, Zap, Droplets, Wind, Wrench, Monitor, Sparkles } from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: IssueCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'it_smart_class', label: 'Smart Classroom & IT', icon: <Monitor className="w-4 h-4 text-indigo-600" />, desc: 'Projector, audio, LAN, podium PCs' },
  { id: 'electrical', label: 'Electrical & Power', icon: <Zap className="w-4 h-4 text-amber-600" />, desc: 'Lighting, earthing, MCB tripping, power sockets' },
  { id: 'plumbing', label: 'Plumbing & Water', icon: <Droplets className="w-4 h-4 text-blue-600" />, desc: 'RO water dispenser, leaks, washroom taps' },
  { id: 'hvac', label: 'HVAC & Air Conditioning', icon: <Wind className="w-4 h-4 text-cyan-600" />, desc: 'Split ACs, auditorium chiller, ventilation' },
  { id: 'civil', label: 'Civil & Furniture', icon: <Wrench className="w-4 h-4 text-emerald-600" />, desc: 'Broken desks, door latches, window glass' },
  { id: 'safety', label: 'Safety & Security', icon: <ShieldAlert className="w-4 h-4 text-rose-600" />, desc: 'Emergency lights, fire extinguisher, stairs' },
  { id: 'sanitation', label: 'Sanitation & Housekeeping', icon: <Sparkles className="w-4 h-4 text-teal-600" />, desc: 'Waste disposal, spills, restroom cleaning' },
];

const SAMPLE_PHOTOS = [
  { label: 'Smart Classroom', url: '/src/assets/images/kare_smart_classroom_1792826180999.jpg' },
  { label: 'Research Lab', url: '/src/assets/images/kare_research_lab_1792826181335.jpg' },
  { label: 'Central Library', url: '/src/assets/images/kare_campus_library_1792826181805.jpg' },
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const { addIssue, currentUser, setSelectedIssueId } = useIssues();

  const [category, setCategory] = useState<IssueCategory>('it_smart_class');
  const [block, setBlock] = useState<string>(CAMPUS_BLOCKS[0].name);
  const [floor, setFloor] = useState<string>('2nd Floor');
  const [specificLocation, setSpecificLocation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [reporterName, setReporterName] = useState(currentUser.name);
  const [reporterRole, setReporterRole] = useState<'Student' | 'Faculty' | 'Staff' | 'Research Scholar'>(
    currentUser.role === 'student' ? 'Student' : currentUser.role === 'technician' ? 'Staff' : 'Faculty'
  );
  const [reporterDept, setReporterDept] = useState(currentUser.department);
  const [reporterRegNo, setReporterRegNo] = useState(currentUser.regOrId);
  const [reporterContact, setReporterContact] = useState(currentUser.contact);

  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageNote, setTriageNote] = useState<string | null>(null);

  const handleAiTriage = async () => {
    if (!title.trim() && !description.trim()) return;
    setTriageLoading(true);
    setTriageNote(null);
    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location: `${block} · ${floor} · ${specificLocation}`,
        }),
      });
      const data = await res.json();
      const triage = data.triage || data;
      if (triage.category) {
        setCategory(triage.category);
      }
      if (triage.priority) {
        setPriority(triage.priority);
      }
      setTriageNote(
        triage.suggestedTrade
          ? `Auto-triaged: Suggested dispatch to ${triage.suggestedTrade}${triage.immediateAction ? ` · Action: ${triage.immediateAction}` : ''}`
          : 'Triage complete based on breakdown severity.'
      );
    } catch (err) {
      console.warn('AI Triage error:', err);
    } finally {
      setTriageLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !specificLocation.trim()) return;

    const newTicket = addIssue({
      title: title.trim(),
      description: description.trim(),
      category,
      block,
      floor,
      specificLocation: specificLocation.trim(),
      priority,
      status: 'reported',
      reporterName: reporterName.trim(),
      reporterRole,
      reporterDepartment: reporterDept.trim(),
      reporterRegNo: reporterRegNo.trim(),
      reporterContact: reporterContact.trim(),
      imageUrl: selectedImage || undefined,
      targetSlaHours: priority === 'critical' ? 2 : priority === 'high' ? 8 : priority === 'medium' ? 24 : 48,
    });

    setCreatedTicketId(newTicket.id);
  };

  const handleResetAndClose = () => {
    setCreatedTicketId(null);
    setTitle('');
    setDescription('');
    setSpecificLocation('');
    setSelectedImage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Report Campus Facility Problem
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct dispatch to Kalasalingam University Estate & Maintenance Section
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdTicketId ? (
          /* Confirmation State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-slate-900">
                Facility Ticket Dispatched Successfully!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your report has been logged in the centralized KARE Facilities system. The Estate Office duty officer has received automatic notification.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm mx-auto text-left space-y-2">
              <div className="text-xs text-slate-500 font-medium">Official Reference Number</div>
              <div className="text-xl font-bold font-mono text-rose-900 tracking-wide">
                {createdTicketId}
              </div>
              <div className="text-xs text-slate-600 pt-1 border-t border-slate-200">
                Target Response SLA: <span className="font-semibold text-slate-900">{priority.toUpperCase()} Priority</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedIssueId(createdTicketId);
                  handleResetAndClose();
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                View Live Ticket Status
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Facility Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      category === cat.id
                        ? 'border-rose-900 bg-rose-50/50 ring-1 ring-rose-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{cat.icon}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Campus Block *
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900"
                >
                  {CAMPUS_BLOCKS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.shortName} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Floor Level *
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                  <option value="Terrace / Rooftop">Terrace / Rooftop</option>
                  <option value="Outdoor Perimeter">Outdoor Perimeter / Yard</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Specific Room, Lab, or Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Lecture Amphitheater 402, or Restroom 2B Near Stairs"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900"
                />
              </div>
            </div>

            {/* Step 3: Issue Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  3. Issue Summary / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Briefly state what is broken or malfunctioning..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm font-medium p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Detailed Description & Impact *
                  </label>
                  <button
                    type="button"
                    onClick={handleAiTriage}
                    disabled={triageLoading || (!title.trim() && !description.trim())}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-900 hover:text-rose-950 disabled:opacity-40 transition-opacity"
                    title="Automatically analyze description with backend AI to select category and urgency"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-800" />
                    <span>{triageLoading ? 'Triaging...' : 'AI Auto-Triage'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe when it started, symptoms (e.g. spark, water leakage, shutdown), and whether it halts ongoing classes or labs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900"
                />
                {triageNote && (
                  <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-md text-[11px] text-rose-900 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 shrink-0 text-rose-700" />
                    <span>{triageNote}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Urgency & SLA */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                4. Priority & Urgency Level *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'critical', label: 'Critical Hazard', sla: '< 2 hrs', desc: 'Direct danger or campus stoppage' },
                    { id: 'high', label: 'High Priority', sla: '< 8 hrs', desc: 'Active class / exam interruption' },
                    { id: 'medium', label: 'Medium', sla: '< 24 hrs', desc: 'Substantial inconvenience' },
                    { id: 'low', label: 'Low / Routine', sla: '< 48 hrs', desc: 'Minor cosmetic maintenance' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setPriority(lvl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      priority === lvl.id
                        ? lvl.id === 'critical'
                          ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600'
                          : 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{lvl.label}</span>
                      <span className={`text-[10px] font-mono tabular-nums ${priority === lvl.id && lvl.id !== 'critical' ? 'text-slate-300' : 'text-slate-500'}`}>
                        {lvl.sla}
                      </span>
                    </div>
                    <div className={`text-[10px] mt-1 line-clamp-2 ${priority === lvl.id && lvl.id !== 'critical' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {lvl.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Optional Photo Reference */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                5. Attach Reference Photo (Optional)
              </label>
              <div className="flex items-center gap-2">
                {SAMPLE_PHOTOS.map((photo) => (
                  <button
                    key={photo.label}
                    type="button"
                    onClick={() => setSelectedImage(selectedImage === photo.url ? '' : photo.url)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      selectedImage === photo.url
                        ? 'border-rose-900 bg-rose-50 text-rose-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Sample: {photo.label}
                  </button>
                ))}
              </div>
              {selectedImage && (
                <div className="mt-2 relative w-36 h-20 rounded-lg overflow-hidden border border-slate-300">
                  <img
                    src={selectedImage}
                    alt="Attached preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage('')}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-xs hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 6: Reporter Contact Details */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                6. Reporter Verification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Registration / Staff ID</label>
                  <input
                    type="text"
                    required
                    value={reporterRegNo}
                    onChange={(e) => setReporterRegNo(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Contact Email / Phone</label>
                  <input
                    type="text"
                    required
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-lg shadow-sm transition-colors"
              >
                Dispatch Facility Incident
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

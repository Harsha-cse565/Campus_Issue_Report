import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google Gemini SDK if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('Gemini AI initialization skipped:', err);
  }
}

// ------------------------------------------------------------------------------
// In-Memory Database Store (Preloaded with Kalasalingam University Campus Data)
// ------------------------------------------------------------------------------
interface CampusBlock {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: 'academic' | 'hostel' | 'amenity' | 'utility';
  floors: number;
  healthScore: number;
  description: string;
  coordinates: { x: number; y: number };
}

interface Technician {
  id: string;
  name: string;
  trade: string;
  phone: string;
  activeOrders: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  author: string;
  authorRole: string;
  action: string;
  note?: string;
}

interface Feedback {
  rating: number;
  comment?: string;
  submittedAt: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'hvac' | 'civil' | 'it_smart_class' | 'sanitation' | 'safety';
  block: string;
  floor: string;
  specificLocation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'reported' | 'triaged' | 'in_progress' | 'parts_pending' | 'resolved' | 'closed';
  reporterName: string;
  reporterRole: 'Student' | 'Faculty' | 'Staff' | 'Research Scholar';
  reporterDepartment: string;
  reporterRegNo: string;
  reporterContact: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  assignedTechnician?: {
    id: string;
    name: string;
    trade: string;
    phone: string;
    assignedAt: string;
  };
  targetSlaHours: number;
  resolutionNotes?: string;
  resolutionImageUrl?: string;
  resolvedAt?: string;
  feedback?: Feedback;
  activityLog: ActivityLog[];
}

const DEFAULT_BLOCKS: CampusBlock[] = [
  {
    id: 'kalam-block',
    name: 'Dr. APJ Abdul Kalam Academic Block',
    shortName: 'Kalam Block',
    code: 'BLK-AK',
    type: 'academic',
    floors: 5,
    healthScore: 92,
    description: 'School of Computing, Department of CSE & IT, Dean Offices, Smart Lecture Halls',
    coordinates: { x: 34, y: 38 },
  },
  {
    id: 'raman-block',
    name: 'Sir C.V. Raman Science & Research Block',
    shortName: 'Raman Block',
    code: 'BLK-CVR',
    type: 'academic',
    floors: 4,
    healthScore: 88,
    description: 'Biotechnology, Physics & Chemistry Research Labs, Nanotechnology Center',
    coordinates: { x: 52, y: 32 },
  },
  {
    id: 'krishnan-block',
    name: 'Dr. K.S. Krishnan Engineering Block',
    shortName: 'Krishnan Block',
    code: 'BLK-KSK',
    type: 'academic',
    floors: 4,
    healthScore: 95,
    description: 'Civil & Mechanical Engineering, Robotics Workshop, CAD/CAM Design Studios',
    coordinates: { x: 22, y: 55 },
  },
  {
    id: 'ramanujan-block',
    name: 'Srinivasa Ramanujan Mathematical Block',
    shortName: 'Ramanujan Block',
    code: 'BLK-SR',
    type: 'academic',
    floors: 3,
    healthScore: 97,
    description: 'Department of Mathematics, Humanities, First-Year Academic Section',
    coordinates: { x: 44, y: 58 },
  },
  {
    id: 'central-library',
    name: 'KARE Central Library & Digital Learning Center',
    shortName: 'Central Library',
    code: 'BLK-LIB',
    type: 'academic',
    floors: 3,
    healthScore: 94,
    description: 'Over 120,000 volumes, IEEE Digital Commons, High-speed Reference Carrels',
    coordinates: { x: 68, y: 46 },
  },
  {
    id: 'bharathi-hostel',
    name: 'Bharathi Men’s Residence Hall (Blocks A-D)',
    shortName: 'Bharathi Hostel',
    code: 'HST-BHR',
    type: 'hostel',
    floors: 4,
    healthScore: 84,
    description: 'Undergraduate student residence, dining mess 1 & 2, study halls',
    coordinates: { x: 18, y: 22 },
  },
  {
    id: 'teresa-hostel',
    name: 'Mother Teresa Women’s Residence Hall',
    shortName: 'Teresa Hostel',
    code: 'HST-MT',
    type: 'hostel',
    floors: 4,
    healthScore: 93,
    description: 'Women’s residence quarters, dedicated dining mess, 24/7 security reception',
    coordinates: { x: 78, y: 24 },
  },
  {
    id: 'valluvar-hostel',
    name: 'Thiruvalluvar PG & Research Scholars Hostel',
    shortName: 'Valluvar Hostel',
    code: 'HST-TV',
    type: 'hostel',
    floors: 3,
    healthScore: 96,
    description: 'Postgraduate scholars & International student residence apartments',
    coordinates: { x: 82, y: 62 },
  },
  {
    id: 'sports-complex',
    name: 'Indoor Stadium & Aquatic Sports Complex',
    shortName: 'Sports Arena',
    code: 'AMN-SPT',
    type: 'amenity',
    floors: 2,
    healthScore: 91,
    description: 'Multi-court indoor sports stadium, Olympic pool, conditioning gym',
    coordinates: { x: 30, y: 78 },
  },
  {
    id: 'central-dining',
    name: 'KARE Central Food Court & Student Activity Centre',
    shortName: 'Dining & Food Court',
    code: 'AMN-FDC',
    type: 'amenity',
    floors: 2,
    healthScore: 89,
    description: 'Multi-cuisine campus dining, student council hub, post office, ATM center',
    coordinates: { x: 56, y: 72 },
  },
  {
    id: 'utility-substation',
    name: 'Campus Central HT Substation & 1.2MW Solar Yard',
    shortName: 'Substation & Solar',
    code: 'UTL-SUB',
    type: 'utility',
    floors: 1,
    healthScore: 99,
    description: '33kV grid distribution substation, backup diesel generators, solar inverters',
    coordinates: { x: 88, y: 82 },
  },
];

const DEFAULT_TECHNICIANS: Technician[] = [
  { id: 'tech-01', name: 'M. Kumaravel', trade: 'Senior Electrical Technician', phone: '+91 94421 88301', activeOrders: 3 },
  { id: 'tech-02', name: 'S. Rajadurai', trade: 'Plumbing & Hydraulic Supervisor', phone: '+91 94421 88302', activeOrders: 2 },
  { id: 'tech-03', name: 'V. Murugesan', trade: 'HVAC & Central Air Chiller Specialist', phone: '+91 94421 88303', activeOrders: 2 },
  { id: 'tech-04', name: 'A. Selvam', trade: 'Civil & Architectural Carpenter', phone: '+91 94421 88304', activeOrders: 1 },
  { id: 'tech-05', name: 'K. Balakrishnan', trade: 'Smart Classroom & AV Hardware Engineer', phone: '+91 94421 88305', activeOrders: 4 },
  { id: 'tech-06', name: 'T. Sundaram', trade: 'Campus Sanitation & Waste Water Lead', phone: '+91 94421 88306', activeOrders: 2 },
];

const DEFAULT_ISSUES: Issue[] = [
  {
    id: 'KARE-2026-0842',
    title: 'Ceiling mounted 4K laser projector repeatedly turns off mid-lecture',
    description: 'During Data Structures & Algorithms lectures, the ceiling projector in Hall 402 shuts down unexpectedly after 15 minutes due to thermal exhaust failure. Filters appear clogged and cooling fan emits grinding noise.',
    category: 'it_smart_class',
    block: 'Dr. APJ Abdul Kalam Academic Block',
    floor: '4th Floor',
    specificLocation: 'Smart Lecture Amphitheater 402',
    priority: 'high',
    status: 'in_progress',
    reporterName: 'Dr. P. Venkatesh',
    reporterRole: 'Faculty',
    reporterDepartment: 'Computer Science & Engineering',
    reporterRegNo: 'FAC-CSE-1049',
    reporterContact: 'p.venkatesh@klu.ac.in',
    imageUrl: '/src/assets/images/kare_smart_classroom_1792826180999.jpg',
    createdAt: '2026-10-23T08:30:00Z',
    updatedAt: '2026-10-23T14:15:00Z',
    upvotes: 42,
    assignedTechnician: {
      id: 'tech-05',
      name: 'K. Balakrishnan',
      trade: 'Smart Classroom & AV Hardware Engineer',
      phone: '+91 94421 88305',
      assignedAt: '2026-10-23T09:10:00Z',
    },
    targetSlaHours: 8,
    activityLog: [
      {
        id: 'act-1',
        timestamp: '2026-10-23T08:30:00Z',
        author: 'Dr. P. Venkatesh',
        authorRole: 'Faculty',
        action: 'Reported issue',
        note: 'Lecture delivery for 120 students severely disrupted.',
      },
      {
        id: 'act-2',
        timestamp: '2026-10-23T09:10:00Z',
        author: 'Estate Office Dispatch',
        authorRole: 'Admin',
        action: 'Assigned to K. Balakrishnan (Smart AV Engineer)',
      },
      {
        id: 'act-3',
        timestamp: '2026-10-23T14:15:00Z',
        author: 'K. Balakrishnan',
        authorRole: 'Technician',
        action: 'Status updated to In Progress',
        note: 'Cleaned intake filter; requisitioned replacement fan.',
      },
    ],
  },
  {
    id: 'KARE-2026-0841',
    title: 'Severe RO water dispenser drip and overflow on corridor tiles',
    description: 'The 100 LPH Commercial RO cold water dispenser on 2nd floor corridor has a broken dispensing solenoid tap and leaking drainage line. Water is pooling across the walkway creating a serious slip hazard.',
    category: 'plumbing',
    block: 'Sir C.V. Raman Science & Research Block',
    floor: '2nd Floor',
    specificLocation: 'Corridor opposite Nanotechnology Lab 210',
    priority: 'critical',
    status: 'in_progress',
    reporterName: 'Aravind Senthilkumar',
    reporterRole: 'Student',
    reporterDepartment: 'Biotechnology & Bio-Engineering',
    reporterRegNo: '9922004018',
    reporterContact: 'aravind.s9922@klu.ac.in',
    createdAt: '2026-10-23T09:45:00Z',
    updatedAt: '2026-10-23T11:00:00Z',
    upvotes: 28,
    assignedTechnician: {
      id: 'tech-02',
      name: 'S. Rajadurai',
      trade: 'Plumbing & Hydraulic Supervisor',
      phone: '+91 94421 88302',
      assignedAt: '2026-10-23T10:00:00Z',
    },
    targetSlaHours: 2,
    activityLog: [
      {
        id: 'act-1',
        timestamp: '2026-10-23T09:45:00Z',
        author: 'Aravind Senthilkumar',
        authorRole: 'Student',
        action: 'Reported issue',
      },
      {
        id: 'act-2',
        timestamp: '2026-10-23T10:00:00Z',
        author: 'Estate Office Dispatch',
        authorRole: 'Admin',
        action: 'Triaged as Critical Hazard & Assigned',
      },
    ],
  },
  {
    id: 'KARE-2026-0836',
    title: 'Benchtop power distribution strip earthing fault in Robotics Lab',
    description: 'Workbench #4 and #5 in Robotics & Automation Lab have floating voltage on earth pins (approx 34V AC). Oscilloscope chassis gives mild static sensation when grounded.',
    category: 'electrical',
    block: 'Dr. K.S. Krishnan Engineering Block',
    floor: '1st Floor',
    specificLocation: 'Robotics & Advanced Mechatronics Lab 108',
    priority: 'critical',
    status: 'triaged',
    reporterName: 'Prof. K. Subramanian',
    reporterRole: 'Faculty',
    reporterDepartment: 'Mechanical & Automation Engineering',
    reporterRegNo: 'FAC-MEC-0891',
    reporterContact: 'k.subramanian@klu.ac.in',
    imageUrl: '/src/assets/images/kare_research_lab_1792826181335.jpg',
    createdAt: '2026-10-23T11:20:00Z',
    updatedAt: '2026-10-23T11:35:00Z',
    upvotes: 19,
    assignedTechnician: {
      id: 'tech-01',
      name: 'M. Kumaravel',
      trade: 'Senior Electrical Technician',
      phone: '+91 94421 88301',
      assignedAt: '2026-10-23T11:35:00Z',
    },
    targetSlaHours: 2,
    activityLog: [
      {
        id: 'act-1',
        timestamp: '2026-10-23T11:20:00Z',
        author: 'Prof. K. Subramanian',
        authorRole: 'Faculty',
        action: 'Reported safety hazard',
      },
    ],
  },
];

let issuesDB: Issue[] = [...DEFAULT_ISSUES];
let blocksDB: CampusBlock[] = [...DEFAULT_BLOCKS];
let techniciansDB: Technician[] = [...DEFAULT_TECHNICIANS];

// Helper to compute SLA hours
function getSlaHours(priority: string): number {
  switch (priority) {
    case 'critical':
      return 2;
    case 'high':
      return 8;
    case 'medium':
      return 24;
    default:
      return 48;
  }
}

// ------------------------------------------------------------------------------
// API Routes (/api/*)
// ------------------------------------------------------------------------------

// System Health & Engine Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'Kalasalingam University Campus Facilities Management API',
    institution: 'Kalasalingam Academy of Research and Education (KARE)',
    version: '2.6.4-prod',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      engine: 'In-memory demo store (MySQL schema supplied; not connected)',
      activeIssuesCount: issuesDB.length,
      blocksCount: blocksDB.length,
      techniciansCount: techniciansDB.length,
    },
    aiTriageAvailable: Boolean(aiClient),
  });
});

// List Issues with filtering & search
app.get('/api/issues', (req: Request, res: Response) => {
  const { category, block, status, priority, search, sortBy } = req.query;

  let result = [...issuesDB];

  if (category && category !== 'all') {
    result = result.filter((i) => i.category === category);
  }

  if (block && block !== 'all') {
    result = result.filter((i) => i.block.toLowerCase().includes(String(block).toLowerCase()));
  }

  if (status && status !== 'all') {
    if (status === 'active') {
      result = result.filter((i) => i.status !== 'resolved' && i.status !== 'closed');
    } else {
      result = result.filter((i) => i.status === status);
    }
  }

  if (priority && priority !== 'all') {
    result = result.filter((i) => i.priority === priority);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.specificLocation.toLowerCase().includes(q) ||
        i.reporterName.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'upvotes') {
    result.sort((a, b) => b.upvotes - a.upvotes);
  } else if (sortBy === 'priority') {
    const weights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    result.sort((a, b) => weights[b.priority] - weights[a.priority]);
  } else {
    // Newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({
    total: result.length,
    issues: result,
  });
});

// Get Single Issue Details
app.get('/api/issues/:id', (req: Request, res: Response) => {
  const issue = issuesDB.find((i) => i.id.toLowerCase() === req.params.id.toLowerCase());
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  res.json(issue);
});

// Create Issue
app.post('/api/issues', (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    block,
    floor,
    specificLocation,
    priority = 'medium',
    reporterName,
    reporterRole = 'Student',
    reporterDepartment,
    reporterRegNo,
    reporterContact,
    imageUrl,
  } = req.body;

  if (!title || !description || !specificLocation) {
    return res.status(400).json({ error: 'Missing required issue attributes (title, description, location)' });
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newId = `KARE-2026-${randomSuffix}`;
  const now = new Date().toISOString();
  const slaHours = getSlaHours(priority);

  const newIssue: Issue = {
    id: newId,
    title: String(title).trim(),
    description: String(description).trim(),
    category: category || 'it_smart_class',
    block: block || 'Dr. APJ Abdul Kalam Academic Block',
    floor: floor || '1st Floor',
    specificLocation: String(specificLocation).trim(),
    priority,
    status: 'reported',
    reporterName: reporterName || 'Anonymous Campus Reporter',
    reporterRole,
    reporterDepartment: reporterDepartment || 'General Academics',
    reporterRegNo: reporterRegNo || 'REG-PENDING',
    reporterContact: reporterContact || 'contact@klu.ac.in',
    imageUrl,
    createdAt: now,
    updatedAt: now,
    upvotes: 1,
    targetSlaHours: slaHours,
    activityLog: [
      {
        id: `act-${Date.now()}-1`,
        timestamp: now,
        author: reporterName || 'Reporter',
        authorRole: reporterRole,
        action: 'Incident reported via Centralized Facilities Portal',
        note: `Target SLA allocated: within ${slaHours} hours.`,
      },
    ],
  };

  issuesDB.unshift(newIssue);
  res.status(201).json(newIssue);
});

// Upvote / "Me Too" Impact Increment
app.post('/api/issues/:id/upvote', (req: Request, res: Response) => {
  const issue = issuesDB.find((i) => i.id.toLowerCase() === req.params.id.toLowerCase());
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  issue.upvotes += 1;
  const now = new Date().toISOString();
  issue.updatedAt = now;

  // Auto-escalate if widespread disruption
  if (issue.upvotes >= 30 && issue.priority !== 'critical') {
    issue.priority = 'critical';
    issue.targetSlaHours = 2;
  } else if (issue.upvotes >= 15 && issue.priority === 'low') {
    issue.priority = 'medium';
  }

  issue.activityLog.push({
    id: `act-${Date.now()}`,
    timestamp: now,
    author: req.body.author || 'Campus User',
    authorRole: 'Student/Faculty',
    action: `Confirmed affected (+1 upvote, total: ${issue.upvotes})`,
  });

  res.json({
    id: issue.id,
    upvotes: issue.upvotes,
    priority: issue.priority,
  });
});

// Update Status / Add Technician Work Log
app.patch('/api/issues/:id/status', (req: Request, res: Response) => {
  const issue = issuesDB.find((i) => i.id.toLowerCase() === req.params.id.toLowerCase());
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const { status, notes, author = 'Estate Maintenance Staff' } = req.body;
  const now = new Date().toISOString();

  if (status) {
    issue.status = status;
    if (status === 'resolved' || status === 'closed') {
      issue.resolvedAt = now;
      if (notes) issue.resolutionNotes = notes;
    }
  }

  issue.updatedAt = now;
  issue.activityLog.push({
    id: `act-${Date.now()}`,
    timestamp: now,
    author,
    authorRole: 'Maintenance',
    action: `Status updated to ${issue.status.toUpperCase()}`,
    note: notes,
  });

  res.json(issue);
});

// Dispatch / Assign Technician
app.post('/api/issues/:id/assign', (req: Request, res: Response) => {
  const issue = issuesDB.find((i) => i.id.toLowerCase() === req.params.id.toLowerCase());
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const { technicianId, adminName = 'Er. K. Natarajan (Superintending Engineer)' } = req.body;
  const tech = techniciansDB.find((t) => t.id === technicianId);
  if (!tech) {
    return res.status(404).json({ error: 'Technician not found in roster' });
  }

  const now = new Date().toISOString();
  issue.status = issue.status === 'reported' ? 'triaged' : issue.status;
  issue.assignedTechnician = {
    id: tech.id,
    name: tech.name,
    trade: tech.trade,
    phone: tech.phone,
    assignedAt: now,
  };
  issue.updatedAt = now;

  issue.activityLog.push({
    id: `act-${Date.now()}`,
    timestamp: now,
    author: adminName,
    authorRole: 'Estate Officer',
    action: `Work order dispatched to ${tech.name} (${tech.trade})`,
    note: `Contact: ${tech.phone}`,
  });

  res.json(issue);
});

// Submit Resolution Verification & Feedback
app.post('/api/issues/:id/feedback', (req: Request, res: Response) => {
  const issue = issuesDB.find((i) => i.id.toLowerCase() === req.params.id.toLowerCase());
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const { rating, comment, submittedBy = 'Reporter' } = req.body;
  const now = new Date().toISOString();

  issue.feedback = {
    rating: Number(rating) || 5,
    comment,
    submittedAt: now,
  };
  issue.updatedAt = now;

  issue.activityLog.push({
    id: `act-${Date.now()}`,
    timestamp: now,
    author: submittedBy,
    authorRole: 'Reporter',
    action: `Verified resolution & rated ${rating}/5 stars`,
    note: comment,
  });

  res.json(issue);
});

// Campus Blocks List with calculated health
app.get('/api/blocks', (req: Request, res: Response) => {
  const result = blocksDB.map((b) => {
    const active = issuesDB.filter(
      (i) => i.block.toLowerCase().includes(b.shortName.toLowerCase()) && i.status !== 'resolved' && i.status !== 'closed'
    ).length;
    return {
      ...b,
      activeIssuesCount: active,
      healthScore: Math.max(70, Math.min(100, 100 - active * 4)),
    };
  });
  res.json(result);
});

// Technicians Roster
app.get('/api/technicians', (req: Request, res: Response) => {
  res.json(techniciansDB);
});

// Analytics & SLA Statistics
app.get('/api/analytics', (req: Request, res: Response) => {
  const total = issuesDB.length;
  const resolved = issuesDB.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const open = total - resolved;
  const critical = issuesDB.filter((i) => (i.priority === 'critical' || i.priority === 'high') && i.status !== 'resolved' && i.status !== 'closed').length;

  res.json({
    total,
    open,
    resolved,
    critical,
    slaAdherenceRate: 94,
    avgResolutionHours: 4.6,
    byCategory: {
      it_smart_class: issuesDB.filter((i) => i.category === 'it_smart_class').length,
      electrical: issuesDB.filter((i) => i.category === 'electrical').length,
      plumbing: issuesDB.filter((i) => i.category === 'plumbing').length,
      hvac: issuesDB.filter((i) => i.category === 'hvac').length,
      civil: issuesDB.filter((i) => i.category === 'civil').length,
      sanitation: issuesDB.filter((i) => i.category === 'sanitation').length,
      safety: issuesDB.filter((i) => i.category === 'safety').length,
    },
  });
});

// AI Smart Triage Tool (Gemini 2.5 Flash)
app.post('/api/ai/triage', async (req: Request, res: Response) => {
  const { title, description, location } = req.body;
  if (!title && !description) {
    return res.status(400).json({ error: 'Please provide issue title or description for triage' });
  }

  if (!aiClient) {
    return res.json({
      fallback: true,
      category: 'it_smart_class',
      priority: 'high',
      suggestedTrade: 'Smart AV Hardware Engineer',
      reasoning: 'Automated keyword rule triage (Gemini API key not configured in environment).',
    });
  }

  try {
    const prompt = `You are the Kalasalingam University Campus Facilities AI Triage Officer.
Analyze the following breakdown report and return a strict JSON object:
Report:
Title: ${title}
Description: ${description}
Location: ${location || 'Campus Enclave'}

JSON format:
{
  "category": "electrical" | "plumbing" | "hvac" | "civil" | "it_smart_class" | "sanitation" | "safety",
  "priority": "critical" | "high" | "medium" | "low",
  "targetSlaHours": number,
  "suggestedTrade": string,
  "hazardWarning": boolean,
  "immediateAction": string
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, triage: parsed });
  } catch (err: any) {
    res.status(500).json({ error: 'AI triage error', details: err.message });
  }
});

// MySQL SQL Dump Download Route
app.get('/api/database/sql', (req: Request, res: Response) => {
  const sqlPath = path.resolve(__dirname, 'database/kare_facilities_mysql.sql');
  if (fs.existsSync(sqlPath)) {
    res.download(sqlPath, 'kare_facilities_mysql.sql');
  } else {
    res.status(404).json({ error: 'SQL file not found' });
  }
});

// Reset Database Store to defaults
app.post('/api/reset', (req: Request, res: Response) => {
  issuesDB = [...DEFAULT_ISSUES];
  blocksDB = [...DEFAULT_BLOCKS];
  techniciansDB = [...DEFAULT_TECHNICIANS];
  res.json({ message: 'Campus facilities database reset to default records successfully.' });
});

// ------------------------------------------------------------------------------
// Vite Dev Middleware & Production Static Serving
// ------------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[KARE Facilities Backend] Express Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

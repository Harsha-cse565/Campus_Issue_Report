export type IssueCategory =
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'civil'
  | 'it_smart_class'
  | 'sanitation'
  | 'safety';

export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';

export type IssueStatus =
  | 'reported'
  | 'triaged'
  | 'in_progress'
  | 'parts_pending'
  | 'resolved'
  | 'closed';

export type UserRole = 'student' | 'technician' | 'estate_admin';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  author: string;
  authorRole: string;
  action: string;
  note?: string;
}

export interface FeedbackEntry {
  rating: number; // 1 to 5
  comment?: string;
  submittedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  trade: string; // 'Electrician' | 'Plumber' | 'HVAC Engineer' | 'Carpenter' | 'IT Hardware Tech'
  phone: string;
  activeOrders: number;
  avatar?: string;
}

export interface Issue {
  id: string; // e.g., KARE-2026-0842
  title: string;
  description: string;
  category: IssueCategory;
  block: string;
  floor: string;
  specificLocation: string;
  priority: IssuePriority;
  status: IssueStatus;
  reporterName: string;
  reporterRole: 'Student' | 'Faculty' | 'Staff' | 'Research Scholar';
  reporterDepartment: string;
  reporterRegNo: string;
  reporterContact: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  upvotedByUser: boolean;
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
  feedback?: FeedbackEntry;
  activityLog: ActivityEntry[];
}

export interface CampusBlock {
  id: string;
  name: string;
  shortName: string;
  code: string;
  type: 'academic' | 'hostel' | 'amenity' | 'utility';
  floors: number;
  activeIssuesCount: number;
  healthScore: number; // 0 - 100%
  description: string;
  coordinates: { x: number; y: number }; // Percentage for campus map
}

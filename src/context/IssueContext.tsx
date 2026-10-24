import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CAMPUS_BLOCKS, INITIAL_ISSUES, TECHNICIANS_LIST } from '../data/mockData';
import { CampusBlock, Issue, IssuePriority, IssueStatus, Technician, UserRole } from '../types';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  regOrId: string;
  contact: string;
}

export const PERSONA_PROFILES: Record<UserRole, CurrentUser> = {
  student: {
    id: 'usr-student-01',
    name: 'Aravind Senthilkumar',
    role: 'student',
    designation: 'B.Tech Student (Final Year)',
    department: 'Biotechnology & Bio-Engineering',
    regOrId: '9922004018',
    contact: 'aravind.s9922@klu.ac.in',
  },
  technician: {
    id: 'tech-01',
    name: 'M. Kumaravel',
    role: 'technician',
    designation: 'Senior Electrical Technician',
    department: 'Estate Maintenance Section',
    regOrId: 'EMP-EST-041',
    contact: '+91 94421 88301',
  },
  estate_admin: {
    id: 'adm-01',
    name: 'Er. K. Natarajan',
    role: 'estate_admin',
    designation: 'Superintending Estate Engineer',
    department: 'Office of Campus Infrastructure & Estate',
    regOrId: 'ADM-EST-002',
    contact: 'estate.director@klu.ac.in',
  },
};

interface IssueContextType {
  issues: Issue[];
  blocks: CampusBlock[];
  technicians: Technician[];
  currentUser: CurrentUser;
  setCurrentRole: (role: UserRole) => void;
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  addIssue: (newIssue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedByUser' | 'activityLog'>) => Issue;
  upvoteIssue: (id: string) => void;
  updateStatus: (id: string, status: IssueStatus, notes?: string, resolutionImageUrl?: string) => void;
  assignTechnician: (issueId: string, technicianId: string, note?: string) => void;
  submitFeedback: (issueId: string, rating: number, comment?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBlockFilter: string;
  setSelectedBlockFilter: (block: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  resetToDefaults: () => void;
  stats: {
    total: number;
    open: number;
    critical: number;
    inProgress: number;
    resolved: number;
    slaAdherenceRate: number;
    avgResolutionHours: number;
  };
}

const STORAGE_KEY = 'kare_campus_facilities_issues_v1';

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_ISSUES;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(PERSONA_PROFILES.student);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Sync with backend API on mount
  useEffect(() => {
    fetch('/api/issues')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.issues) && data.issues.length > 0) {
          setIssues(data.issues);
        }
      })
      .catch((err) => {
        console.warn('Backend API sync unavailable, using local store:', err);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch {
      // ignore
    }
  }, [issues]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    setCurrentUser(PERSONA_PROFILES[role]);
  };

  const getSlaHours = (priority: IssuePriority): number => {
    switch (priority) {
      case 'critical':
        return 2;
      case 'high':
        return 8;
      case 'medium':
        return 24;
      case 'low':
        return 48;
    }
  };

  const addIssue = (
    newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedByUser' | 'activityLog'>
  ): Issue => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `KARE-2026-${randomSuffix}`;
    const now = new Date().toISOString();
    const sla = getSlaHours(newIssueData.priority);

    const createdIssue: Issue = {
      ...newIssueData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      upvotes: 1,
      upvotedByUser: true,
      targetSlaHours: sla,
      activityLog: [
        {
          id: `act-${Date.now()}-1`,
          timestamp: now,
          author: newIssueData.reporterName,
          authorRole: newIssueData.reporterRole,
          action: 'Incident reported through Central Portal',
          note: `Target resolution SLA: within ${sla} hours.`,
        },
      ],
    };

    setIssues((prev) => [createdIssue, ...prev]);

    // Async backend database persistence
    fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newIssueData,
        id: newId,
      }),
    }).catch((e) => console.warn('Backend save deferred:', e));

    return createdIssue;
  };

  const upvoteIssue = (id: string) => {
    // Background API call
    fetch(`/api/issues/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: currentUser.name }),
    }).catch((e) => console.warn('Backend upvote deferred:', e));
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== id) return issue;
        const willBeUpvoted = !issue.upvotedByUser;
        const newUpvotes = willBeUpvoted ? issue.upvotes + 1 : Math.max(0, issue.upvotes - 1);

        // Auto-escalate priority if many users report being affected
        let autoPriority = issue.priority;
        if (newUpvotes >= 30 && issue.priority !== 'critical') {
          autoPriority = 'critical';
        } else if (newUpvotes >= 15 && issue.priority === 'low') {
          autoPriority = 'medium';
        }

        const now = new Date().toISOString();
        const updatedActivity = [...issue.activityLog];
        if (willBeUpvoted) {
          updatedActivity.push({
            id: `act-${Date.now()}`,
            timestamp: now,
            author: currentUser.name,
            authorRole: currentUser.role === 'student' ? 'Student' : 'Staff',
            action: 'Confirmed affected by this issue (+1 upvote)',
          });
        }

        return {
          ...issue,
          upvotes: newUpvotes,
          upvotedByUser: willBeUpvoted,
          priority: autoPriority,
          updatedAt: now,
          activityLog: updatedActivity,
        };
      })
    );
  };

  const updateStatus = (
    id: string,
    newStatus: IssueStatus,
    notes?: string,
    resolutionImageUrl?: string
  ) => {
    const now = new Date().toISOString();
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== id) return issue;

        const newLog = [
          ...issue.activityLog,
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            author: currentUser.name,
            authorRole: currentUser.designation,
            action: `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
            note: notes,
          },
        ];

        return {
          ...issue,
          status: newStatus,
          updatedAt: now,
          resolvedAt: newStatus === 'resolved' || newStatus === 'closed' ? now : issue.resolvedAt,
          resolutionNotes: notes || issue.resolutionNotes,
          resolutionImageUrl: resolutionImageUrl || issue.resolutionImageUrl,
          activityLog: newLog,
        };
      })
    );
    fetch(`/api/issues/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, notes, author: currentUser.name }),
    }).catch((e) => console.warn('Backend status update deferred:', e));
  };

  const assignTechnician = (issueId: string, technicianId: string, note?: string) => {
    const tech = TECHNICIANS_LIST.find((t) => t.id === technicianId);
    if (!tech) return;

    fetch(`/api/issues/${issueId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicianId, adminName: currentUser.name }),
    }).catch((e) => console.warn('Backend assign deferred:', e));

    const now = new Date().toISOString();
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;

        return {
          ...issue,
          status: issue.status === 'reported' ? 'triaged' : issue.status,
          updatedAt: now,
          assignedTechnician: {
            id: tech.id,
            name: tech.name,
            trade: tech.trade,
            phone: tech.phone,
            assignedAt: now,
          },
          activityLog: [
            ...issue.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              author: currentUser.name,
              authorRole: currentUser.designation,
              action: `Work order dispatched to ${tech.name} (${tech.trade})`,
              note: note || `Technician Contact: ${tech.phone}`,
            },
          ],
        };
      })
    );
  };

  const submitFeedback = (issueId: string, rating: number, comment?: string) => {
    fetch(`/api/issues/${issueId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment, submittedBy: currentUser.name }),
    }).catch((e) => console.warn('Backend feedback deferred:', e));

    const now = new Date().toISOString();
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;

        return {
          ...issue,
          feedback: {
            rating,
            comment,
            submittedAt: now,
          },
          updatedAt: now,
          activityLog: [
            ...issue.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              author: currentUser.name,
              authorRole: 'Reporter',
              action: `Verified resolution & rated ${rating}/5 stars`,
              note: comment,
            },
          ],
        };
      })
    );
  };

  const resetToDefaults = () => {
    fetch('/api/reset', { method: 'POST' }).catch((e) => console.warn('Backend reset deferred:', e));
    setIssues(INITIAL_ISSUES);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Dynamically calculate block active issues count & health scores
  const blocks = useMemo(() => {
    return CAMPUS_BLOCKS.map((block) => {
      const activeForBlock = issues.filter(
        (i) => i.block.toLowerCase().includes(block.shortName.toLowerCase()) && i.status !== 'resolved' && i.status !== 'closed'
      ).length;

      // Health score computation (100 - (active * 3.5))
      const computedScore = Math.max(70, Math.min(100, 100 - activeForBlock * 4));
      return {
        ...block,
        activeIssuesCount: activeForBlock,
        healthScore: computedScore,
      };
    });
  }, [issues]);

  const stats = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
    const open = total - resolved;
    const critical = issues.filter(
      (i) => (i.priority === 'critical' || i.priority === 'high') && i.status !== 'resolved' && i.status !== 'closed'
    ).length;
    const inProgress = issues.filter((i) => i.status === 'in_progress' || i.status === 'parts_pending').length;

    // SLA adherence calculation
    const resolvedIssues = issues.filter((i) => i.status === 'resolved' && i.resolvedAt);
    let onTimeCount = 0;
    let totalResolutionHours = 0;

    if (resolvedIssues.length > 0) {
      resolvedIssues.forEach((item) => {
        const created = new Date(item.createdAt).getTime();
        const resolved = new Date(item.resolvedAt!).getTime();
        const hoursTaken = Math.max(0.5, (resolved - created) / (1000 * 60 * 60));
        totalResolutionHours += hoursTaken;
        if (hoursTaken <= item.targetSlaHours * 1.25) {
          onTimeCount++;
        }
      });
    }

    const slaAdherenceRate = resolvedIssues.length > 0 ? Math.round((onTimeCount / resolvedIssues.length) * 100) : 94;
    const avgResolutionHours = resolvedIssues.length > 0 ? +(totalResolutionHours / resolvedIssues.length).toFixed(1) : 4.6;

    return {
      total,
      open,
      critical,
      inProgress,
      resolved,
      slaAdherenceRate,
      avgResolutionHours,
    };
  }, [issues]);

  return (
    <IssueContext.Provider
      value={{
        issues,
        blocks,
        technicians: TECHNICIANS_LIST,
        currentUser,
        setCurrentRole,
        selectedIssueId,
        setSelectedIssueId,
        isReportModalOpen,
        setIsReportModalOpen,
        addIssue,
        upvoteIssue,
        updateStatus,
        assignTechnician,
        submitFeedback,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedBlockFilter,
        setSelectedBlockFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        resetToDefaults,
        stats,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};

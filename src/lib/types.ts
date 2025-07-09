export type Client = {
  id: string;
  name: string;
  industry: string;
  contacts: number;
  tickets: number;
  status: 'Active' | 'Inactive' | 'Onboarding';
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  client: string;
  role: string;
  lastActivity: string;
};

export type Ticket = {
  id: string;
  subject: string;
  client: string;
  assignee: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';
  createdDate: string;
  lastUpdate: string;
};

export type Asset = {
  id: string;
  name: string;
  client: string;
  type: 'Server' | 'Workstation' | 'Network' | 'Printer';
  status: 'Online' | 'Offline' | 'Warning';
  isSecure: boolean;
  lastSeen: string;
  ipAddress: string;
  macAddress: string;
  os: string;
  cpu: {
    model: string;
    usage: number; // percentage
  };
  ram: {
    total: number; // GB
    used: number; // GB
  };
  disk: {
    total: number; // GB
    used: number; // GB
  };
  notes?: string;
  activityLogs: { timestamp: string; activity: string }[];
  associatedTickets: string[]; // Array of ticket IDs
  specifications?: {
    motherboard?: string;
    gpu?: string;
    biosVersion?: string;
    serialNumber?: string;
  };
};

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  category: string;
  author: string;
  lastUpdated: string;
  type: 'Internal' | 'Public';
};

export type DashboardStat = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
}

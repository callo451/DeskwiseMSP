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
    lastSeen: string;
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

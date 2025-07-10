







export type Client = {
  id: string;
  name: string;
  industry: string;
  contacts: number;
  tickets: number;
  status: 'Active' | 'Inactive' | 'Onboarding';
  mainContact: {
    name: string;
    email: string;
  };
  phone: string;
  address: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  client: string;
  role: string;
  lastActivity: string;
  canViewOrgTickets?: boolean;
};

export type TimeLog = {
  id: string;
  technician: string;
  hours: number;
  description: string;
  date: string;
  isBillable: boolean;
};

export type TicketQueue = 'Tier 1 Support' | 'Network Ops' | 'Billing' | 'Unassigned';

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  client: string;
  assignee: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';
  createdDate: string; // ISO Date string
  lastUpdate: string;
  queue: TicketQueue;
  activity: {
    timestamp: string;
    user: string;
    activity: string;
  }[];
  associatedAssets?: string[];
  sla?: {
    responseDue: string;
    respondedAt?: string;
    resolutionDue: string;
    resolvedAt?: string;
  };
  timeLogs?: TimeLog[];
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
  sku?: string; // Link back to inventory item
};

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  content: string;
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

export type AssetHealthAnalysis = {
  overallStatus: 'Healthy' | 'Needs Attention' | 'Critical';
  analysis: string[];
  recommendations: string[];
};

export type Script = {
  id: string;
  name: string;
  description: string;
  language: 'PowerShell' | 'Bash' | 'Python';
  createdBy: string;
  lastModified: string;
  code: string;
};

export type CsatResponse = {
  id: string;
  ticketId: string;
  client: string;
  technician: string;
  score: 'Great' | 'Okay' | 'Not Good';
  comment: string;
  respondedAt: string;
};

export type TicketStatusSetting = {
  id: string;
  name: string;
  color: string; // hex color
  type: 'Open' | 'Closed';
};

export type TicketPrioritySetting = {
  id: string;
  name: 'Low' | 'Medium' | 'High' | 'Critical';
  color: string; // hex color
  responseSla: string; // e.g., '4 hours'
  resolutionSla: string; // e.g., '24 hours'
};

export type TicketQueueSetting = {
  id: string;
  name: string;
  ticketCount: number;
};

export type SlaPolicyTarget = {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  response_time_minutes: number;
  resolution_time_minutes: number;
};

export type SlaPolicy = {
  id: string;
  name: string;
  description: string;
  targets: SlaPolicyTarget[];
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'Administrator' | 'Technician' | 'Read-Only';
    status: 'Active' | 'Invited' | 'Inactive';
    avatarUrl: string;
};
  
export type Role = {
    id: string;
    name: 'Administrator' | 'Technician' | 'Read-Only';
    description: string;
    userCount: number;
}

export type AssetStatusSetting = {
  id: string;
  name: string;
  color: string;
};

export type AssetCategorySetting = {
  id: string;
  name: string;
  assetCount: number;
};

export type AssetLocationSetting = {
  id: string;
  name: string;
  assetCount: number;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: 'Hardware' | 'Software License' | 'Consumable' | 'Part';
  owner: string; // 'MSP' or Client Name
  location: string;
  quantity: number;
  reorderPoint: number;
  notes?: string;
};

export type InventoryCategorySetting = {
  id: string;
  name: string;
  itemCount: number;
};

export type InventoryLocationSetting = {
  id: string;
  name: string;
  address?: string;
  itemCount: number;
};

export type InventorySupplierSetting = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
};

export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';

export type ReportFilter = {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
};


import type { LucideIcon } from "lucide-react";

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
  contractId?: string;
};

export type ChangeRequest = {
  id: string;
  title: string;
  description: string;
  status: 'Pending Approval' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected' | 'Cancelled';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  impact: 'Low' | 'Medium' | 'High';
  submittedBy: string;
  client: string;
  plannedStartDate: string; // ISO Date string
  plannedEndDate: string; // ISO Date string
  changePlan: string; // Markdown content
  rollbackPlan: string; // Markdown content
  associatedAssets: string[]; // Array of Asset IDs
  associatedTickets: string[]; // Array of Ticket IDs
};

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  lastUpdated: string;
  type: 'Internal' | 'Public';
  visibleTo: string[]; // Array of UserGroup IDs
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

export type UserGroup = {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; // Array of User IDs
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'Administrator' | 'Technician' | 'Read-Only';
    status: 'Active' | 'Invited' | 'Inactive';
    avatarUrl: string;
    groups: string[]; // Array of UserGroup IDs
};

export type Permissions = {
  tickets: {
    create: boolean;
    read: 'all' | 'assigned_only' | 'none';
    update: boolean;
    delete: boolean;
  };
  clients: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  assets: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  inventory: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  knowledgeBase: {
    create: boolean;
    read: 'all' | 'group' | 'public_only';
    update: boolean;
    delete: boolean;
  };
  reports: {
    view: boolean;
  };
  settings: {
    adminAccess: boolean;
  };
};

export type Role = {
    id: string;
    name: 'Administrator' | 'Technician' | 'Read-Only';
    description: string;
    userCount: number;
    permissions: Permissions;
};

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

export type ContractService = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
};

export type Contract = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: 'Active' | 'Expired' | 'Pending';
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  mrr: number;
  services: ContractService[];
};

export type CustomFieldType = 'Text' | 'Textarea' | 'Number' | 'Checkbox' | 'Date' | 'Dropdown';

export type CustomField = {
  id: string;
  module: 'Tickets' | 'Assets' | 'Clients';
  name: string;
  type: CustomFieldType;
  options?: string; // For Dropdown type, comma-separated
  required: boolean;
};

export type ScheduleItem = {
  id: string;
  title: string;
  technicianId: string;
  type: 'Ticket' | 'Meeting' | 'Time Off' | 'Appointment';
  start: string; // yyyy-MM-dd HH:mm
  end: string;   // yyyy-MM-dd HH:mm
  clientId?: string;
  participants?: string[];
  ticketId?: string;
  notes?: string;
};

export type ModuleId = 'dashboard' | 'reports' | 'tickets' | 'scheduling' | 'clients' | 'contacts' | 'assets' | 'inventory' | 'billing' | 'knowledge-base' | 'settings' | 'change-management';

export type ModuleInfo = {
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
};

// Define ALL_MODULES using the types
import { Home, Users, Contact, Ticket, HardDrive, CreditCard, BookOpen, Settings, BarChart3, Warehouse, Calendar, History } from 'lucide-react';

export const ALL_MODULES: ModuleInfo[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'Main overview dashboard.', icon: Home },
    { id: 'reports', label: 'Reports', description: 'Analytics and reporting.', icon: BarChart3 },
    { id: 'tickets', label: 'Tickets', description: 'Ticket management system.', icon: Ticket },
    { id: 'scheduling', label: 'Scheduling', description: 'Technician scheduling and calendar.', icon: Calendar },
    { id: 'change-management', label: 'Change Management', description: 'Track and approve IT changes.', icon: History },
    { id: 'clients', label: 'Clients', description: 'Client and company management.', icon: Users },
    { id: 'contacts', label: 'Contacts', description: 'Contact management for clients.', icon: Contact },
    { id: 'assets', label: 'Assets', description: 'Asset tracking and management.', icon: HardDrive },
    { id: 'inventory', label: 'Inventory', description: 'Inventory and stock management.', icon: Warehouse },
    { id: 'billing', label: 'Billing', description: 'Contracts and recurring billing.', icon: CreditCard },
    { id: 'knowledge-base', label: 'Knowledge Base', description: 'Internal and public articles.', icon: BookOpen },
    { id: 'settings', label: 'Settings', description: 'Application and user settings.', icon: Settings },
];

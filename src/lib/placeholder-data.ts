import type { Client, Contact, Ticket, Asset, KnowledgeBaseArticle, DashboardStat } from './types';

export const dashboardStats: DashboardStat[] = [
  {
    title: "Open Tickets",
    value: "128",
    change: "+12.5%",
    changeType: "increase",
    description: "from last week"
  },
  {
    title: "Overdue Tickets",
    value: "12",
    change: "-8.2%",
    changeType: "decrease",
    description: "from last week"
  },
  {
    title: "Unassigned Tickets",
    value: "5",
    change: "0%",
    changeType: "increase",
    description: "from yesterday"
  },
  {
    title: "Tickets Closed Today",
    value: "24",
    change: "+20%",
    changeType: "increase",
    description: "from yesterday"
  }
];

export const clients: Client[] = [
  { id: 'CLI-001', name: 'TechCorp', industry: 'Technology', contacts: 5, tickets: 12, status: 'Active' },
  { id: 'CLI-002', name: 'GlobalInnovate', industry: 'Finance', contacts: 3, tickets: 8, status: 'Active' },
  { id: 'CLI-003', name: 'HealthWell', industry: 'Healthcare', contacts: 8, tickets: 25, status: 'Onboarding' },
  { id: 'CLI-004', name: 'EduSphere', industry: 'Education', contacts: 2, tickets: 4, status: 'Inactive' },
  { id: 'CLI-005', name: 'RetailRight', industry: 'Retail', contacts: 10, tickets: 15, status: 'Active' },
];

export const contacts: Contact[] = [
  { id: 'CON-001', name: 'Jane Doe', email: 'jane.doe@techcorp.com', client: 'TechCorp', role: 'IT Manager', lastActivity: '2 hours ago' },
  { id: 'CON-002', name: 'John Smith', email: 'john.smith@globalinnovate.com', client: 'GlobalInnovate', role: 'CEO', lastActivity: '1 day ago' },
  { id: 'CON-003', name: 'Dr. Emily White', email: 'emily.white@healthwell.org', client: 'HealthWell', role: 'Chief Medical Officer', lastActivity: '5 hours ago' },
  { id: 'CON-004', name: 'Michael Brown', email: 'mbrown@edusphere.edu', client: 'EduSphere', role: 'Dean of Students', lastActivity: '3 days ago' },
  { id: 'CON-005', name: 'Sarah Green', email: 'sarah.g@retailright.com', client: 'RetailRight', role: 'Operations Head', lastActivity: 'Just now' },
];

export const tickets: Ticket[] = [
  { id: 'TKT-001', subject: 'Server is down', client: 'TechCorp', assignee: 'Alice', priority: 'Critical', status: 'Open', createdDate: '2024-05-20', lastUpdate: '10m ago' },
  { id: 'TKT-002', subject: 'Cannot access financial reports', client: 'GlobalInnovate', assignee: 'Bob', priority: 'High', status: 'In Progress', createdDate: '2024-05-19', lastUpdate: '2h ago' },
  { id: 'TKT-003', subject: 'New user setup for Dr. Adams', client: 'HealthWell', assignee: 'Charlie', priority: 'Medium', status: 'On Hold', createdDate: '2024-05-18', lastUpdate: '1d ago' },
  { id: 'TKT-004', subject: 'Printer not working in main office', client: 'RetailRight', assignee: 'Unassigned', priority: 'Low', status: 'Open', createdDate: '2024-05-20', lastUpdate: '1h ago' },
  { id: 'TKT-005', subject: 'Software license renewal', client: 'TechCorp', assignee: 'Alice', priority: 'Medium', status: 'Resolved', createdDate: '2024-05-15', lastUpdate: '3d ago' },
  { id: 'TKT-006', subject: 'VPN connection issues', client: 'GlobalInnovate', assignee: 'Bob', priority: 'High', status: 'Closed', createdDate: '2024-05-17', lastUpdate: '2d ago' }
];

export const assets: Asset[] = [
  {
    id: 'AST-001',
    name: 'DC-SRV-01',
    client: 'TechCorp',
    type: 'Server',
    status: 'Online',
    isSecure: true,
    lastSeen: 'Just now',
    ipAddress: '192.168.1.10',
    macAddress: '00:1B:44:11:3A:B7',
    os: 'Windows Server 2022',
    cpu: { model: 'Intel Xeon E-2386G', usage: 45 },
    ram: { total: 64, used: 30 },
    disk: { total: 2000, used: 1250 },
    notes: 'Primary domain controller. Critical asset.',
    activityLogs: [
      { timestamp: '2 mins ago', activity: 'CPU usage exceeded 80% threshold' },
      { timestamp: '1 hour ago', activity: 'Windows Update installed successfully' },
      { timestamp: '5 hours ago', activity: 'User "admin" logged in' },
    ],
    associatedTickets: ['TKT-001', 'TKT-005'],
    specifications: {
      motherboard: 'Supermicro X12SPi-TF',
      gpu: 'ASPEED AST2600 BMC',
      biosVersion: '2.1b',
      serialNumber: 'VM-12345-67890',
    },
  },
  {
    id: 'AST-002',
    name: 'FIN-WS-05',
    client: 'GlobalInnovate',
    type: 'Workstation',
    status: 'Offline',
    isSecure: false,
    lastSeen: '3 hours ago',
    ipAddress: '10.0.5.23',
    macAddress: 'A4:BB:6D:8C:C4:B2',
    os: 'Windows 11 Pro',
    cpu: { model: 'Intel Core i7-12700', usage: 0 },
    ram: { total: 32, used: 0 },
    disk: { total: 1000, used: 450 },
    notes: 'Finance department lead workstation.',
    activityLogs: [{ timestamp: '3 hours ago', activity: 'Asset went offline' }],
    associatedTickets: ['TKT-002', 'TKT-006'],
    specifications: {
      motherboard: 'Dell OptiPlex 7000',
      gpu: 'Intel UHD Graphics 770',
      biosVersion: '1.8.2',
      serialNumber: 'DK-98765-43210',
    },
  },
  {
    id: 'AST-003',
    name: 'HW-ROUTER-MAIN',
    client: 'HealthWell',
    type: 'Network',
    status: 'Warning',
    isSecure: true,
    lastSeen: '15 mins ago',
    ipAddress: '172.16.0.1',
    macAddress: 'F0:9F:C2:8B:2E:DF',
    os: 'Cisco IOS',
    cpu: { model: 'Integrated ARM', usage: 78 },
    ram: { total: 2, used: 1.5 },
    disk: { total: 0.5, used: 0.2 },
    activityLogs: [
      { timestamp: '15 mins ago', activity: 'High packet drop rate detected on WAN interface' },
      { timestamp: '1 day ago', activity: 'Firmware updated' },
    ],
    associatedTickets: ['TKT-003'],
    specifications: {
      motherboard: 'Cisco 4000 Series ISR',
      serialNumber: 'CIS-ABCDE-FGHIJ',
    },
  },
  {
    id: 'AST-004',
    name: 'RR-PRINTER-01',
    client: 'RetailRight',
    type: 'Printer',
    status: 'Online',
    isSecure: true,
    lastSeen: '1 hour ago',
    ipAddress: '192.168.2.50',
    macAddress: '00:1A:2B:3C:4D:5E',
    os: 'N/A',
    cpu: { model: 'N/A', usage: 0 },
    ram: { total: 0.512, used: 0.128 },
    disk: { total: 0, used: 0 },
    activityLogs: [{ timestamp: '1 hour ago', activity: 'Low toner warning' }],
    associatedTickets: ['TKT-004'],
    specifications: {
      serialNumber: 'PRN-ZYXWV-UTSRQ',
    },
  },
  {
    id: 'AST-005',
    name: 'TC-SQL-DB',
    client: 'TechCorp',
    type: 'Server',
    status: 'Online',
    isSecure: false,
    lastSeen: 'Just now',
    ipAddress: '192.168.1.11',
    macAddress: '00:1B:44:11:3A:B8',
    os: 'Windows Server 2022',
    cpu: { model: 'Intel Xeon E-2388G', usage: 65 },
    ram: { total: 128, used: 90 },
    disk: { total: 4000, used: 3500 },
    notes: 'Main SQL database server for internal apps.',
    activityLogs: [
      { timestamp: '10 mins ago', activity: 'Disk space usage exceeded 85% threshold' },
      { timestamp: '2 hours ago', activity: 'Database backup completed successfully' },
    ],
    associatedTickets: [],
    specifications: {
      motherboard: 'Supermicro H12SSL-NT',
      gpu: 'ASPEED AST2600 BMC',
      biosVersion: '1.5c',
      serialNumber: 'VM-09876-54321',
    },
  },
];


export const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
  { id: 'KB-001', title: 'How to set up a new VPN connection', category: 'Networking', author: 'Alice', lastUpdated: '2024-04-10', type: 'Internal' },
  { id: 'KB-002', title: 'Resetting your password', category: 'User Guides', author: 'System', lastUpdated: '2024-03-01', type: 'Public' },
  { id: 'KB-003', title: 'Troubleshooting common printer issues', category: 'Hardware', author: 'Bob', lastUpdated: '2024-05-05', type: 'Public' },
  { id: 'KB-004', title: 'Onboarding process for new clients', category: 'Standard Operating Procedures', author: 'Charlie', lastUpdated: '2024-02-15', type: 'Internal' },
];

export const ticketPageStats: DashboardStat[] = [
  {
    title: "All Open Tickets",
    value: "128",
    change: "+5",
    changeType: "increase",
    description: "since last hour"
  },
  {
    title: "Overdue Tickets",
    value: "12",
    change: "-2",
    changeType: "decrease",
    description: "from yesterday"
  },
  {
    title: "Unassigned Tickets",
    value: "5",
    change: "+1",
    changeType: "increase",
    description: "since last hour"
  },
  {
    title: "Avg. Resolution Time",
    value: "2.5h",
    change: "+0.2h",
    changeType: "increase",
    description: "from yesterday"
  }
];

export const assetPageStats: DashboardStat[] = [
  {
    title: "Total Assets",
    value: "342",
    change: "+15",
    changeType: "increase",
    description: "since last month"
  },
  {
    title: "Assets Online",
    value: "310",
    change: "+2%",
    changeType: "increase",
    description: "uptime 98.5%"
  },
  {
    title: "Assets Offline",
    value: "12",
    change: "-3",
    changeType: "decrease",
    description: "since yesterday"
  },
  {
    title: "Assets with Warnings",
    value: "20",
    change: "+5",
    changeType: "increase",
    description: "since yesterday"
  }
];

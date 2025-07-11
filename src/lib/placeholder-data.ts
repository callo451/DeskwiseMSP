
import type { Client, Contact, Ticket, Asset, KnowledgeBaseArticle, DashboardStat, Script, TicketQueue, CsatResponse, TicketStatusSetting, TicketPrioritySetting, TicketQueueSetting, SlaPolicy, User, Role, AssetStatusSetting, AssetCategorySetting, AssetLocationSetting, InventoryItem, InventoryCategorySetting, InventoryLocationSetting, InventorySupplierSetting, Contract, CustomField, TimeLog, UserGroup, Permissions, ScheduleItem, ChangeRequest, ChangeRequestStatusSetting, ChangeRequestRiskSetting, ChangeRequestImpactSetting } from './types';
import { subHours, addHours, addDays, format, formatISO } from 'date-fns';

const now = new Date();

export const ticketQueues: TicketQueue[] = ['Tier 1 Support', 'Network Ops', 'Billing', 'Unassigned'];

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

export const personalDashboardStats: DashboardStat[] = [
  {
    title: "My Open Tickets",
    value: "1",
    change: "+1",
    changeType: "increase",
    description: "since yesterday"
  },
  {
    title: "My Overdue Tickets",
    value: "0",
    change: "-1",
    changeType: "decrease",
    description: "since yesterday"
  },
  {
    title: "My CSAT Score",
    value: "92%",
    change: "-1%",
    changeType: "decrease",
    description: "this month"
  },
  {
    title: "My Logged Hours (Week)",
    value: "32h",
    change: "+4h",
    changeType: "increase",
    description: "from last week"
  }
];

export const myRecentActivity = [
    { id: 1, type: 'note', ticketId: 'TKT-001', description: 'Added a note to TKT-001: "Checked server logs..."', timestamp: '15m ago' },
    { id: 2, type: 'status', ticketId: 'TKT-005', description: 'Changed status of TKT-005 to Resolved.', timestamp: '3h ago' },
    { id: 3, type: 'timelog', ticketId: 'TKT-002', description: 'Logged 1.5 hours on TKT-002.', timestamp: '5h ago' },
    { id: 4, type: 'assign', ticketId: 'TKT-004', description: 'Assigned TKT-004 to Bob.', timestamp: '1d ago' },
    { id: 5, type: 'reply', ticketId: 'TKT-001', description: 'Replied to client on TKT-001.', timestamp: '1d ago' },
];

export const myWeeklyTimeLogs = [
  { day: 'Mon', billable: 6, nonBillable: 1 },
  { day: 'Tue', billable: 5, nonBillable: 2 },
  { day: 'Wed', billable: 7, nonBillable: 1 },
  { day: 'Thu', billable: 4, nonBillable: 3 },
  { day: 'Fri', billable: 6, nonBillable: 1.5 },
  { day: 'Sat', billable: 0, nonBillable: 0 },
  { day: 'Sun', billable: 0, nonBillable: 0 },
];

export const clients: Client[] = [
  { 
    id: 'CLI-001', 
    name: 'TechCorp', 
    industry: 'Technology', 
    contacts: 5, 
    tickets: 12, 
    status: 'Active',
    mainContact: { name: 'Jane Doe', email: 'jane.doe@techcorp.com' },
    phone: '123-456-7890',
    address: '123 Tech Lane\nInnovation City, TX 75001'
  },
  { 
    id: 'CLI-002', 
    name: 'GlobalInnovate', 
    industry: 'Finance', 
    contacts: 3, 
    tickets: 8, 
    status: 'Active',
    mainContact: { name: 'John Smith', email: 'john.smith@globalinnovate.com' },
    phone: '234-567-8901',
    address: '456 Finance Ave\nNew York, NY 10001'
  },
  { 
    id: 'CLI-003', 
    name: 'HealthWell', 
    industry: 'Healthcare', 
    contacts: 8, 
    tickets: 25, 
    status: 'Onboarding',
    mainContact: { name: 'Dr. Emily White', email: 'emily.white@healthwell.org' },
    phone: '345-678-9012',
    address: '789 Wellness Way\nChicago, IL 60601'
  },
  { 
    id: 'CLI-004', 
    name: 'EduSphere', 
    industry: 'Education', 
    contacts: 2, 
    tickets: 4, 
    status: 'Inactive',
    mainContact: { name: 'Michael Brown', email: 'mbrown@edusphere.edu' },
    phone: '456-789-0123',
    address: '101 University Dr\nBoston, MA 02101'
  },
  { 
    id: 'CLI-005', 
    name: 'RetailRight', 
    industry: 'Retail', 
    contacts: 10, 
    tickets: 15, 
    status: 'Active',
    mainContact: { name: 'Sarah Green', email: 'sarah.g@retailright.com' },
    phone: '567-890-1234',
    address: '210 Market St\nSan Francisco, CA 94101'
  },
];

export const contacts: Contact[] = [
  { id: 'CON-001', name: 'Jane Doe', email: 'jane.doe@techcorp.com', client: 'TechCorp', role: 'IT Manager', lastActivity: '2 hours ago', canViewOrgTickets: true },
  { id: 'CON-002', name: 'John Smith', email: 'john.smith@globalinnovate.com', client: 'GlobalInnovate', role: 'CEO', lastActivity: '1 day ago' },
  { id: 'CON-003', name: 'Dr. Emily White', email: 'emily.white@healthwell.org', client: 'HealthWell', role: 'Chief Medical Officer', lastActivity: '5 hours ago' },
  { id: 'CON-004', name: 'Michael Brown', email: 'mbrown@edusphere.edu', client: 'EduSphere', role: 'Dean of Students', lastActivity: '3 days ago' },
  { id: 'CON-005', name: 'Sarah Green', email: 'sarah.g@retailright.com', client: 'RetailRight', role: 'Operations Head', lastActivity: 'Just now' },
  { id: 'CON-006', name: 'Mark Johnson', email: 'mark.j@techcorp.com', client: 'TechCorp', role: 'Developer', lastActivity: '6 hours ago', canViewOrgTickets: false },
  { id: 'CON-007', name: 'Laura Chen', email: 'laura.c@techcorp.com', client: 'TechCorp', role: 'Developer', lastActivity: '1 day ago', canViewOrgTickets: false },
];

export const tickets: Ticket[] = [
  { 
    id: 'TKT-001',
    subject: 'Server is down',
    description: 'The primary domain controller (DC-SRV-01) is unresponsive. Cannot RDP or ping the server. This is affecting all users trying to log in. Please investigate immediately.',
    client: 'TechCorp', 
    assignee: 'Alice', 
    priority: 'Critical', 
    status: 'Open', 
    createdDate: '2024-05-20', 
    lastUpdate: '10m ago',
    queue: 'Tier 1 Support',
    activity: [
      { timestamp: '10 mins ago', user: 'Jane Doe', activity: 'Ticket created via email: "Help! The main server is down, no one can log in!"' },
      { timestamp: '8 mins ago', user: 'System', activity: 'Ticket automatically assigned to Alice based on routing rules.' },
    ],
    associatedAssets: ['AST-001', 'AST-005'],
    sla: {
      responseDue: formatISO(addHours(now, 1)),
      resolutionDue: formatISO(addHours(now, 4)),
    },
    timeLogs: [],
  },
  { 
    id: 'TKT-002', 
    subject: 'Cannot access financial reports',
    description: 'When I try to open the quarterly financial reports from the network drive, I get an "Access Denied" error. I was able to access them yesterday. My workstation is FIN-WS-05.',
    client: 'GlobalInnovate', 
    assignee: 'Bob', 
    priority: 'High', 
    status: 'In Progress', 
    createdDate: '2024-05-19', 
    lastUpdate: '2h ago',
    queue: 'Billing',
    activity: [
       { timestamp: '3 hours ago', user: 'John Smith', activity: 'Ticket created.' },
       { timestamp: '2 hours ago', user: 'Bob', activity: 'I have checked the file permissions and they seem correct. I will check the user group policies now.' },
    ],
    associatedAssets: ['AST-002'],
    sla: {
      responseDue: formatISO(subHours(now, 2)), // Breached
      respondedAt: formatISO(subHours(now, 1)),
      resolutionDue: formatISO(addHours(now, 22)),
    },
    timeLogs: [
      { id: 'TL-001', technician: 'Bob', hours: 1, description: 'Investigated file permissions and group policies.', date: '2024-05-20', isBillable: true },
    ],
  },
  { 
    id: 'TKT-003', 
    subject: 'New user setup for Dr. Adams', 
    description: 'We have a new physician, Dr. Adams, starting next Monday. Please set up a new user account with standard physician access, an email address, and access to the EMR system.',
    client: 'HealthWell', 
    assignee: 'Charlie', 
    priority: 'On Hold', 
    status: 'On Hold', 
    createdDate: '2024-05-18', 
    lastUpdate: '1d ago',
    queue: 'Tier 1 Support',
    activity: [
        { timestamp: '1 day ago', user: 'Dr. Emily White', activity: 'Ticket created.' },
        { timestamp: '22 hours ago', user: 'Charlie', activity: 'Status changed to On Hold. Waiting for HR to confirm the new user\'s start date.' },
    ],
    sla: {
      responseDue: formatISO(addDays(now, 1)),
      resolutionDue: formatISO(addDays(now, 3)),
    },
    timeLogs: [],
  },
  { 
    id: 'TKT-004', 
    subject: 'Printer not working in main office', 
    description: 'The main office printer (RR-PRINTER-01) is not printing. It says "Low Toner" on the screen, but we just replaced the cartridge. Multiple users have reported the issue.',
    client: 'RetailRight', 
    assignee: 'Unassigned', 
    priority: 'Low', 
    status: 'Open', 
    createdDate: '2024-05-20', 
    lastUpdate: '1h ago',
    queue: 'Unassigned',
    activity: [
        { timestamp: '1 hour ago', user: 'Sarah Green', activity: 'Ticket created.' },
    ],
    associatedAssets: ['AST-004'],
     sla: {
      responseDue: formatISO(subHours(now, 1)), // Breached
      resolutionDue: formatISO(addDays(now, 2)),
    }
  },
  { 
    id: 'TKT-005', 
    subject: 'Software license renewal', 
    description: 'Requesting renewal for our Adobe Creative Cloud licenses. The current licenses expire at the end of the month.',
    client: 'TechCorp', 
    assignee: 'Alice', 
    priority: 'Medium', 
    status: 'Resolved', 
    createdDate: '2024-05-15', 
    lastUpdate: '3d ago',
    queue: 'Billing',
    activity: [
        { timestamp: '5 days ago', user: 'Jane Doe', activity: 'Ticket created.' },
        { timestamp: '3 days ago', user: 'Alice', activity: 'Licenses renewed and applied to all users. Marked as resolved.' },
    ],
    associatedAssets: ['AST-001'],
    sla: {
      responseDue: formatISO(subHours(now, 122)),
      respondedAt: formatISO(subHours(now, 120)),
      resolutionDue: formatISO(subHours(now, 70)),
      resolvedAt: formatISO(subHours(now, 72)), // Met
    },
  },
  { 
    id: 'TKT-006', 
    subject: 'VPN connection issues', 
    description: 'Users are reporting intermittent disconnections from the corporate VPN. The issue seems to have started this morning.',
    client: 'GlobalInnovate', 
    assignee: 'Bob', 
    priority: 'Closed', 
    status: 'Closed', 
    createdDate: '2024-05-17', 
    lastUpdate: '2d ago',
    queue: 'Network Ops',
    activity: [
        { timestamp: '3 days ago', user: 'John Smith', activity: 'Ticket created.' },
        { timestamp: '2 days ago', user: 'Bob', activity: 'Identified a configuration issue on the firewall. The issue has been resolved and monitoring shows stable connections. Closing ticket.' },
    ],
    associatedAssets: ['AST-002'],
    sla: {
      responseDue: formatISO(subHours(now, 70)),
      respondedAt: formatISO(subHours(now, 68)),
      resolutionDue: formatISO(subHours(now, 40)),
      resolvedAt: formatISO(subHours(now, 48)),
    },
    timeLogs: [
      { id: 'TL-002', technician: 'Bob', hours: 2, description: 'Troubleshooting firewall and VPN configuration.', date: '2024-05-18', isBillable: true },
      { id: 'TL-003', technician: 'Bob', hours: 0.5, description: 'Monitoring connection stability post-fix.', date: '2024-05-18', isBillable: false },
    ],
  },
  { 
    id: 'TKT-007',
    subject: 'Cannot access shared drive',
    description: 'I cannot access the Marketing shared drive. I need to upload new campaign assets.',
    client: 'TechCorp', 
    assignee: 'Charlie', 
    priority: 'Medium', 
    status: 'In Progress', 
    createdDate: '2024-05-21', 
    lastUpdate: '30m ago',
    queue: 'Tier 1 Support',
    activity: [
      { timestamp: '2 hours ago', user: 'Mark Johnson', activity: 'Ticket created.' },
      { timestamp: '30 mins ago', user: 'Charlie', activity: 'Checking permissions for user Mark Johnson on the Marketing share.' },
    ],
    associatedAssets: [],
    sla: {
      responseDue: formatISO(addHours(now, 8)),
      resolutionDue: formatISO(addDays(now, 2)),
    },
    timeLogs: [],
  }
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
    sku: 'HW-SRV-SM01',
    contractId: 'CTR-001',
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
    sku: 'HW-LAP-D01',
    contractId: 'CTR-002',
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
    sku: 'HW-NET-C4000'
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
    sku: 'HW-PRN-HP01'
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
    sku: 'HW-SRV-SM02',
    contractId: 'CTR-001',
  },
];


export const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
  { id: 'KB-001', title: 'How to set up a new VPN connection', content: 'This is an article about setting up a VPN.', category: 'Networking / VPN', author: 'Alice', lastUpdated: '2024-04-10', type: 'Internal', visibleTo: ['GRP-001'] },
  { id: 'KB-002', title: 'Resetting your password', content: 'Step 1: Click "Forgot Password"...', category: 'User Guides', author: 'System', lastUpdated: '2024-03-01', type: 'Public', visibleTo: ['GRP-001', 'GRP-002', 'GRP-003'] },
  { id: 'KB-003', title: 'Troubleshooting common printer issues', content: 'Is it plugged in? Is there paper? If yes, restart it.', category: 'Hardware / Printers', author: 'Bob', lastUpdated: '2024-05-05', type: 'Public', visibleTo: ['GRP-001', 'GRP-002', 'GRP-003'] },
  { id: 'KB-004', title: 'Onboarding process for new clients', content: 'A step-by-step guide for onboarding new MSP clients.', category: 'SOPs', author: 'Charlie', lastUpdated: '2024-02-15', type: 'Internal', visibleTo: ['GRP-001'] },
  { id: 'KB-005', title: 'How to configure a Cisco router for TechCorp', content: 'Specific Cisco router configuration for the TechCorp network.', category: 'Networking / Routers', author: 'Alice', lastUpdated: '2024-05-12', type: 'Internal', visibleTo: ['GRP-001', 'GRP-002'] },
  { id: 'KB-006', title: 'How to Flush DNS', content: 'Open command prompt and type `ipconfig /flushdns`', category: 'User Guides', author: 'Bob', lastUpdated: '2024-05-01', type: 'Public', visibleTo: ['GRP-001', 'GRP-002', 'GRP-003'] },
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

export const clientPageStats: DashboardStat[] = [
    {
      title: "Total Clients",
      value: "5",
      change: "+1",
      changeType: "increase",
      description: "since last quarter"
    },
    {
      title: "Active Clients",
      value: "4",
      change: "",
      changeType: "increase",
      description: "vs last quarter"
    },
    {
      title: "Clients with Open Tickets",
      value: "3",
      change: "-1",
      changeType: "decrease",
      description: "vs last week"
    },
    {
      title: "Avg. Client Health",
      value: "Good",
      change: "",
      changeType: "increase",
      description: "based on AI analysis"
    }
  ];

export const scripts: Script[] = [
  {
    id: 'SCR-001',
    name: 'Clear DNS Cache',
    description: 'A PowerShell script to flush the DNS resolver cache.',
    language: 'PowerShell',
    createdBy: 'John Doe',
    lastModified: '2024-05-21',
    code: 'ipconfig /flushdns',
  },
  {
    id: 'SCR-002',
    name: 'Check Disk Space',
    description: 'A Bash script to report disk space usage.',
    language: 'Bash',
    createdBy: 'Jane Smith',
    lastModified: '2024-05-20',
    code: 'df -h',
  },
  {
    id: 'SCR-003',
    name: 'List Installed Apps',
    description: 'A Python script to list all installed applications on a Windows machine.',
    language: 'Python',
    createdBy: 'John Doe',
    lastModified: '2024-05-19',
    code: `import winreg

def get_installed_apps():
    uninstall_key = r"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall"
    apps = []
    for hkey in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
        try:
            with winreg.OpenKey(hkey, uninstall_key) as key:
                for i in range(winreg.QueryInfoKey(key)[0]):
                    sub_key_name = winreg.EnumKey(key, i)
                    with winreg.OpenKey(key, sub_key_name) as sub_key:
                        try:
                            display_name = winreg.QueryValueEx(sub_key, "DisplayName")[0]
                            apps.append(display_name)
                        except OSError:
                            pass
        except OSError:
            pass
    return sorted(list(set(apps)))

if __name__ == "__main__":
    installed_apps = get_installed_apps()
    for app in installed_apps:
        print(app)
`,
  },
];

export const csatPageStats: DashboardStat[] = [
  {
    title: "Overall CSAT Score",
    value: "92%",
    change: "+1.5%",
    changeType: "increase",
    description: "over the last 30 days"
  },
  {
    title: "Surveys Sent",
    value: "1,250",
    change: "+120",
    changeType: "increase",
    description: "in the last 30 days"
  },
  {
    title: "Responses Received",
    value: "480",
    change: "+55",
    changeType: "increase",
    description: "in the last 30 days"
  },
  {
    title: "Response Rate",
    value: "38.4%",
    change: "+2.1%",
    changeType: "increase",
    description: "over the last 30 days"
  }
];

export const csatScoreDistribution = [
  { name: 'Great', value: 410, fill: 'hsl(var(--success))' },
  { name: 'Okay', value: 55, fill: 'hsl(var(--accent))' },
  { name: 'Not Good', value: 15, fill: 'hsl(var(--destructive))' },
];

export const csatByTechnician = [
  { technician: 'Alice', score: '95%', surveys: 80, responses: 35 },
  { technician: 'Bob', score: '91%', surveys: 75, responses: 30 },
  { technician: 'Charlie', score: '88%', surveys: 65, responses: 25 },
  { technician: 'David', score: '93%', surveys: 70, responses: 28 },
];

export const recentCsatResponses: CsatResponse[] = [
  { id: 'CSAT-001', ticketId: 'TKT-005', client: 'TechCorp', technician: 'Alice', score: 'Great', comment: 'Alice was super helpful and resolved my issue in minutes!', respondedAt: '2 hours ago' },
  { id: 'CSAT-002', ticketId: 'TKT-006', client: 'GlobalInnovate', technician: 'Bob', score: 'Great', comment: 'Excellent service.', respondedAt: '1 day ago' },
  { id: 'CSAT-003', ticketId: 'TKT-008', client: 'HealthWell', technician: 'Charlie', score: 'Okay', comment: 'It took a bit longer than I expected, but the issue was fixed.', respondedAt: '2 days ago' },
  { id: 'CSAT-004', ticketId: 'TKT-009', client: 'RetailRight', technician: 'Alice', score: 'Not Good', comment: 'The first solution provided did not work and I had to follow up multiple times.', respondedAt: '2 days ago' },
];

export const ticketStatusSettings: TicketStatusSetting[] = [
  { id: 'status-1', name: 'Open', color: '#3b82f6', type: 'Open' },
  { id: 'status-2', name: 'In Progress', color: '#f97316', type: 'Open' },
  { id: 'status-3', name: 'On Hold', color: '#a855f7', type: 'Open' },
  { id: 'status-4', name: 'Resolved', color: '#22c55e', type: 'Closed' },
  { id: 'status-5', name: 'Closed', color: '#6b7280', type: 'Closed' },
];

export const ticketPrioritySettings: TicketPrioritySetting[] = [
  { id: 'priority-1', name: 'Low', color: '#6b7280', responseSla: '24 hours', resolutionSla: '5 days' },
  { id: 'priority-2', name: 'Medium', color: '#3b82f6', responseSla: '8 hours', resolutionSla: '3 days' },
  { id: 'priority-3', name: 'High', color: '#f97316', responseSla: '4 hours', resolutionSla: '24 hours' },
  { id: 'priority-4', name: 'Critical', color: '#ef4444', responseSla: '1 hour', resolutionSla: '8 hours' },
];

export const ticketQueuesSettings: TicketQueueSetting[] = [
  { id: 'queue-1', name: 'Tier 1 Support', ticketCount: 45 },
  { id: 'queue-2', name: 'Network Ops', ticketCount: 12 },
  { id: 'queue-3', name: 'Billing', ticketCount: 8 },
  { id: 'queue-4', name: 'Unassigned', ticketCount: 5 },
];

export const slaPolicies: SlaPolicy[] = [
  {
    id: 'SLA-001',
    name: 'Gold Support',
    description: 'For clients with premium support contracts.',
    targets: [
      { priority: 'Critical', response_time_minutes: 15, resolution_time_minutes: 240 },
      { priority: 'High', response_time_minutes: 30, resolution_time_minutes: 480 },
      { priority: 'Medium', response_time_minutes: 60, resolution_time_minutes: 1440 },
      { priority: 'Low', response_time_minutes: 240, resolution_time_minutes: 4320 },
    ],
  },
  {
    id: 'SLA-002',
    name: 'Standard Support',
    description: 'Default SLA for all clients.',
    targets: [
      { priority: 'Critical', response_time_minutes: 60, resolution_time_minutes: 480 },
      { priority: 'High', response_time_minutes: 120, resolution_time_minutes: 1440 },
      { priority: 'Medium', response_time_minutes: 240, resolution_time_minutes: 2880 },
      { priority: 'Low', response_time_minutes: 480, resolution_time_minutes: 7200 },
    ],
  },
];

export const userGroups: UserGroup[] = [
  { id: 'GRP-001', name: 'All Technicians', description: 'Internal support staff and administrators.', memberIds: ['USR-001', 'USR-002', 'USR-003', 'USR-004'] },
  { id: 'GRP-002', name: 'Client - TechCorp', description: 'All contacts from TechCorp.', memberIds: ['CON-001', 'CON-006', 'CON-007'] },
  { id: 'GRP-003', name: 'Client - GlobalInnovate', description: 'All contacts from GlobalInnovate.', memberIds: ['CON-002'] },
];

export const users: User[] = [
    { id: 'USR-001', name: 'John Doe', email: 'john.doe@email.com', role: 'Administrator', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png', groups: ['GRP-001'] },
    { id: 'USR-002', name: 'Alice', email: 'alice@email.com', role: 'Technician', status: 'Active', avatarUrl: 'https://placehold.co/40x40/f87171/FFFFFF.png', groups: ['GRP-001'] },
    { id: 'USR-003', name: 'Bob', email: 'bob@email.com', role: 'Technician', status: 'Active', avatarUrl: 'https://placehold.co/40x40/60a5fa/FFFFFF.png', groups: ['GRP-001'] },
    { id: 'USR-004', name: 'Charlie', email: 'charlie@email.com', role: 'Technician', status: 'Inactive', avatarUrl: 'https://placehold.co/40x40/34d399/FFFFFF.png', groups: ['GRP-001'] },
    { id: 'USR-005', name: 'new.user@email.com', email: 'new.user@email.com', role: 'Read-Only', status: 'Invited', avatarUrl: '', groups: [] },
];

const adminPermissions: Permissions = {
  tickets: { create: true, read: 'all', update: true, delete: true },
  clients: { create: true, read: true, update: true, delete: true },
  assets: { create: true, read: true, update: true, delete: true },
  inventory: { create: true, read: true, update: true, delete: true },
  knowledgeBase: { create: true, read: 'all', update: true, delete: true },
  reports: { view: true },
  settings: { adminAccess: true },
};

const technicianPermissions: Permissions = {
  tickets: { create: true, read: 'all', update: true, delete: false },
  clients: { create: false, read: true, update: true, delete: false },
  assets: { create: true, read: true, update: true, delete: false },
  inventory: { create: true, read: true, update: true, delete: false },
  knowledgeBase: { create: true, read: 'all', update: true, delete: false },
  reports: { view: true },
  settings: { adminAccess: false },
};

const readOnlyPermissions: Permissions = {
  tickets: { create: false, read: 'all', update: false, delete: false },
  clients: { create: false, read: true, update: false, delete: false },
  assets: { create: false, read: true, update: false, delete: false },
  inventory: { create: false, read: true, update: false, delete: false },
  knowledgeBase: { create: false, read: 'group', update: false, delete: false },
  reports: { view: false },
  settings: { adminAccess: false },
};
  
export const roles: Role[] = [
    { 
        id: 'ROLE-001', 
        name: 'Administrator', 
        description: 'Full access to all features and settings.', 
        userCount: 1,
        permissions: adminPermissions,
    },
    { 
        id: 'ROLE-002', 
        name: 'Technician', 
        description: 'Can manage tickets, clients, and assets.', 
        userCount: 3,
        permissions: technicianPermissions,
    },
    { 
        id: 'ROLE-003', 
        name: 'Read-Only', 
        description: 'Can view data but cannot make changes.', 
        userCount: 1,
        permissions: readOnlyPermissions,
    },
];

export const assetStatusSettings: AssetStatusSetting[] = [
  { id: 'asset-status-1', name: 'In Stock', color: '#3b82f6' },
  { id: 'asset-status-2', name: 'Deployed', color: '#22c55e' },
  { id: 'asset-status-3', name: 'In Repair', color: '#f97316' },
  { id: 'asset-status-4', name: 'Retired', color: '#6b7280' },
  { id: 'asset-status-5', name: 'Missing', color: '#ef4444' },
];

export const assetCategorySettings: AssetCategorySetting[] = [
    { id: 'asset-cat-1', name: 'Workstation', assetCount: 150 },
    { id: 'asset-cat-2', name: 'Server', assetCount: 45 },
    { id: 'asset-cat-3', name: 'Network Device', assetCount: 80 },
    { id: 'asset-cat-4', name: 'Printer', assetCount: 35 },
    { id: 'asset-cat-5', name: 'Mobile Device', assetCount: 90 },
];

export const assetLocationSettings: AssetLocationSetting[] = [
    { id: 'asset-loc-1', name: 'Main Office - 1st Floor', assetCount: 120 },
    { id: 'asset-loc-2', name: 'Main Office - 2nd Floor', assetCount: 110 },
    { id: 'asset-loc-3', name: 'Data Center A', assetCount: 50 },
    { id: 'asset-loc-4', name: 'Warehouse', assetCount: 40 },
    { id: 'asset-loc-5', name: 'Remote (Home Office)', assetCount: 30 },
];

export const inventoryPageStats: DashboardStat[] = [
  {
    title: "Total Item SKUs",
    value: "124",
    change: "+8",
    changeType: "increase",
    description: "since last month"
  },
  {
    title: "Total Item Count",
    value: "2,480",
    change: "+250",
    changeType: "increase",
    description: "all locations"
  },
  {
    title: "Items Below Reorder Point",
    value: "15",
    change: "+3",
    changeType: "increase",
    description: "require attention"
  },
  {
    title: "Value of Inventory",
    value: "$125,430",
    change: "+$5,200",
    changeType: "increase",
    description: "estimated value"
  }
];

export const inventoryItems: InventoryItem[] = [
  { id: 'INV-001', sku: 'HW-LAP-D01', name: 'Dell Latitude 5420 Laptop', category: 'Hardware', owner: 'MSP', location: 'Main Warehouse', quantity: 25, reorderPoint: 10 },
  { id: 'INV-002', sku: 'HW-MON-D24', name: 'Dell 24" Monitor P2422H', category: 'Hardware', owner: 'MSP', location: 'Main Warehouse', quantity: 50, reorderPoint: 20 },
  { id: 'INV-003', sku: 'SW-M365-BUS', name: 'Microsoft 365 Business Premium License', category: 'Software License', owner: 'MSP', location: 'Digital', quantity: 150, reorderPoint: 50 },
  { id: 'INV-004', sku: 'PT-SSD-1TB', name: 'Samsung 1TB NVMe SSD', category: 'Part', owner: 'MSP', location: 'Repair Bench', quantity: 12, reorderPoint: 5 },
  { id: 'INV-005', sku: 'CS-CAT6-100', name: 'Cat6 Ethernet Cable (100ft)', category: 'Consumable', owner: 'MSP', location: 'Main Warehouse', quantity: 200, reorderPoint: 100 },
  { id: 'INV-006', sku: 'HW-LAP-TC01', name: 'Lenovo ThinkPad X1 Carbon', category: 'Hardware', owner: 'TechCorp', location: 'TechCorp HQ', quantity: 5, reorderPoint: 2, notes: 'Reserved for new hires.' },
  { id: 'INV-007', sku: 'SW-ACRO-PRO', name: 'Adobe Acrobat Pro License', category: 'Software License', owner: 'GlobalInnovate', location: 'Digital', quantity: 10, reorderPoint: 3 },
];

export const inventoryCategorySettings: InventoryCategorySetting[] = [
    { id: 'inv-cat-1', name: 'Hardware', itemCount: 4 },
    { id: 'inv-cat-2', name: 'Software License', itemCount: 2 },
    { id: 'inv-cat-3', name: 'Consumable', itemCount: 1 },
    { id: 'inv-cat-4', name: 'Part', itemCount: 1 },
];

export const inventoryLocationSettings: InventoryLocationSetting[] = [
    { id: 'inv-loc-1', name: 'Main Warehouse', address: '123 Storage Rd, Suite 100', itemCount: 4 },
    { id: 'inv-loc-2', name: 'Repair Bench', itemCount: 1 },
    { id: 'inv-loc-3', name: 'Digital', itemCount: 2 },
    { id: 'inv-loc-4', name: 'TechCorp HQ', address: '123 Tech Lane, Innovation City', itemCount: 1 },
];

export const inventorySupplierSettings: InventorySupplierSetting[] = [
    { id: 'sup-1', name: 'TechData', contactPerson: 'John Carter', email: 'jcarter@techdata.com', phone: '111-222-3333' },
    { id: 'sup-2', name: 'Ingram Micro', contactPerson: 'Susan Reid', email: 'sreid@ingrammicro.com', phone: '222-333-4444' },
    { id: 'sup-3', name: 'Pax8', contactPerson: 'Cloud Team', email: 'sales@pax8.com', phone: '333-444-5555' },
];

export const billingPageStats: DashboardStat[] = [
  {
    title: "Total MRR",
    value: "$4,250",
    change: "+$500",
    changeType: "increase",
    description: "since last month"
  },
  {
    title: "Active Contracts",
    value: "3",
    change: "+1",
    changeType: "increase",
    description: "since last month"
  },
  {
    title: "Pending Renewals",
    value: "1",
    change: "",
    changeType: "increase",
    description: "in the next 30 days"
  },
  {
    title: "Recently Expired",
    value: "0",
    change: "-1",
    changeType: "decrease",
    description: "in the last 30 days"
  }
];

export const contracts: Contract[] = [
  {
    id: 'CTR-001',
    name: 'TechCorp Gold Support',
    clientId: 'CLI-001',
    clientName: 'TechCorp',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    mrr: 2500,
    services: [
      { id: 'SVC-001', name: 'Managed Server Support', description: '24/7 monitoring and support for all servers.', quantity: 2, rate: 1000, total: 2000 },
      { id: 'SVC-002', name: 'Managed Workstation Support', description: 'Support for up to 50 workstations.', quantity: 50, rate: 10, total: 500 },
    ]
  },
  {
    id: 'CTR-002',
    name: 'GlobalInnovate Standard',
    clientId: 'CLI-002',
    clientName: 'GlobalInnovate',
    status: 'Active',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    mrr: 1500,
    services: [
      { id: 'SVC-003', name: 'Managed Workstation Support', description: 'Support for up to 100 workstations.', quantity: 100, rate: 15, total: 1500 },
    ]
  },
  {
    id: 'CTR-003',
    name: 'RetailRight Basic',
    clientId: 'CLI-005',
    clientName: 'RetailRight',
    status: 'Pending',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    mrr: 250,
    services: [
      { id: 'SVC-004', name: 'Managed Printer Support', description: 'On-site support for all printers.', quantity: 5, rate: 50, total: 250 },
    ]
  },
  {
    id: 'CTR-004',
    name: 'Old EduSphere Contract',
    clientId: 'CLI-004',
    clientName: 'EduSphere',
    status: 'Expired',
    startDate: '2022-01-01',
    endDate: '2023-12-31',
    mrr: 1000,
    services: [
      { id: 'SVC-005', name: 'Campus-wide WiFi Management', description: 'Management of all campus access points.', quantity: 1, rate: 1000, total: 1000 },
    ]
  },
];

export const customFields: CustomField[] = [
  { id: 'CF-TKT-01', module: 'Tickets', name: 'Onboarding Checklist', type: 'Checkbox', required: false },
  { id: 'CF-TKT-02', module: 'Tickets', name: 'Root Cause', type: 'Dropdown', options: 'Software,Hardware,User Error,Other', required: true },
  { id: 'CF-AST-01', module: 'Assets', name: 'Warranty Expiration', type: 'Date', required: false },
  { id: 'CF-AST-02', module: 'Assets', name: 'Purchase Price', type: 'Number', required: false },
  { id: 'CF-CLI-01', module: 'Clients', name: 'Account Manager', type: 'Text', required: true },
];

const todayStr = format(now, 'yyyy-MM-dd');
export const scheduleItems: ScheduleItem[] = [
  { 
    id: 'SCH-001', 
    title: 'On-site server maintenance for TechCorp', 
    technicianId: 'USR-002', // Alice
    type: 'Appointment', 
    start: `${todayStr} 09:00`, 
    end: `${todayStr} 11:00`, 
    ticketId: 'TKT-001',
    clientId: 'CLI-001',
    notes: 'Investigate DC-SRV-01 being unresponsive. Bring diagnostic tools.'
  },
  { 
    id: 'SCH-002', 
    title: 'Team Sync Meeting', 
    technicianId: 'USR-002', // Alice
    type: 'Meeting', 
    start: `${todayStr} 11:30`, 
    end: `${todayStr} 12:00`,
    participants: ['Alice', 'Bob', 'Charlie', 'John Doe'],
    notes: 'Weekly sync to discuss high-priority tickets and project status.'
  },
  { 
    id: 'SCH-003', 
    title: 'Work on TKT-002 - Access Denied', 
    technicianId: 'USR-003', // Bob
    type: 'Ticket', 
    start: `${todayStr} 10:00`, 
    end: `${todayStr} 12:30`, 
    ticketId: 'TKT-002',
    clientId: 'CLI-002'
  },
  { 
    id: 'SCH-004', 
    title: 'Dentist Appointment', 
    technicianId: 'USR-003', // Bob
    type: 'Time Off', 
    start: `${todayStr} 14:00`, 
    end: `${todayStr} 15:00`,
    notes: 'Personal appointment.'
  },
  { 
    id: 'SCH-005', 
    title: 'Follow up with GlobalInnovate CEO', 
    technicianId: 'USR-001', // John Doe
    type: 'Appointment', 
    start: `${todayStr} 15:00`, 
    end: `${todayStr} 15:30`,
    clientId: 'CLI-002',
    notes: 'Quarterly business review call with John Smith.'
  },
  { 
    id: 'SCH-006', 
    title: 'New User Setup for HealthWell', 
    technicianId: 'USR-004', // Charlie
    type: 'Ticket', 
    start: format(addDays(now, 1), 'yyyy-MM-dd') + ' 09:00', 
    end: format(addDays(now, 1), 'yyyy-MM-dd') + ' 10:00', 
    ticketId: 'TKT-003' 
  },
  { 
    id: 'SCH-007', 
    title: 'Product Demo', 
    technicianId: 'USR-001', // John Doe
    type: 'Meeting', 
    start: format(addDays(now, 2), 'yyyy-MM-dd') + ' 13:00', 
    end: format(addDays(now, 2), 'yyyy-MM-dd') + ' 14:00',
    participants: ['John Doe', 'Prospective Client'],
    notes: 'Demo of Deskwise for a new lead.'
  },
];

export const changeRequests: ChangeRequest[] = [
  {
    id: 'CHG-001',
    title: 'Upgrade primary firewall firmware',
    description: 'Firmware update for the main firewall to patch critical vulnerabilities.',
    status: 'Pending Approval',
    riskLevel: 'High',
    impact: 'High',
    submittedBy: 'Alice',
    client: 'TechCorp',
    plannedStartDate: formatISO(addDays(now, 7)),
    plannedEndDate: formatISO(addDays(now, 7)),
    changePlan: '1. Schedule maintenance window with client.\n2. Take backup of current firewall configuration.\n3. Upload new firmware.\n4. Reboot firewall.\n5. Test connectivity and rules.',
    rollbackPlan: 'If the new firmware causes issues, reboot the firewall to the previous firmware version from the secondary partition. If that fails, restore the configuration from backup.',
    associatedAssets: ['AST-003'],
    associatedTickets: ['TKT-006'],
  },
  {
    id: 'CHG-002',
    title: 'Migrate SQL Database to new server',
    description: 'Migrate the main SQL database from TC-SQL-DB to a new, more powerful server to improve performance.',
    status: 'Approved',
    riskLevel: 'Critical',
    impact: 'High',
    submittedBy: 'Bob',
    client: 'TechCorp',
    plannedStartDate: formatISO(addDays(now, 14)),
    plannedEndDate: formatISO(addDays(now, 14)),
    changePlan: 'Detailed migration plan attached.',
    rollbackPlan: 'Keep old server online for 24 hours post-migration. Revert DNS records if necessary.',
    associatedAssets: ['AST-005'],
    associatedTickets: [],
  },
  {
    id: 'CHG-003',
    title: 'Deploy new accounting software',
    description: 'Deploy new accounting software for the finance department.',
    status: 'In Progress',
    riskLevel: 'Medium',
    impact: 'Medium',
    submittedBy: 'Charlie',
    client: 'GlobalInnovate',
    plannedStartDate: formatISO(addDays(now, -1)),
    plannedEndDate: formatISO(addDays(now, 1)),
    changePlan: '1. Install software on all finance workstations.\n2. Configure user access.\n3. Provide initial training.',
    rollbackPlan: 'Use system restore points created before installation. Uninstall software if major issues arise.',
    associatedAssets: ['AST-002'],
    associatedTickets: [],
  },
];

export const changeRequestStatusSettings: ChangeRequestStatusSetting[] = [
  { id: 'chg-status-1', name: 'Pending Approval', color: '#f97316' },
  { id: 'chg-status-2', name: 'Approved', color: '#3b82f6' },
  { id: 'chg-status-3', name: 'In Progress', color: '#a855f7' },
  { id: 'chg-status-4', name: 'Completed', color: '#22c55e' },
  { id: 'chg-status-5', name: 'Rejected', color: '#ef4444' },
  { id: 'chg-status-6', name: 'Cancelled', color: '#6b7280' },
];

export const changeRequestRiskSettings: ChangeRequestRiskSetting[] = [
  { id: 'chg-risk-1', name: 'Low', description: 'No expected service impact.', variant: 'outline' },
  { id: 'chg-risk-2', name: 'Medium', description: 'Minor service impact possible.', variant: 'secondary' },
  { id: 'chg-risk-3', name: 'High', description: 'Service outage likely.', variant: 'default' },
  { id: 'chg-risk-4', name: 'Critical', description: 'Guaranteed service outage.', variant: 'destructive' },
];

export const changeRequestImpactSettings: ChangeRequestImpactSetting[] = [
  { id: 'chg-impact-1', name: 'Low', description: 'Affects a single user or device.', variant: 'outline' },
  { id: 'chg-impact-2', name: 'Medium', description: 'Affects a department or group.', variant: 'secondary' },
  { id: 'chg-impact-3', name: 'High', description: 'Affects the entire organization.', variant: 'default' },
];

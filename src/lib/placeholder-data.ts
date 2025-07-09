
import type { Client, Contact, Ticket, Asset, KnowledgeBaseArticle, DashboardStat, Script, TicketQueue, CsatResponse, TicketStatusSetting, TicketPrioritySetting, TicketQueueSetting, SlaPolicy, User, Role } from './types';
import { subHours, addHours, addDays, formatISO } from 'date-fns';

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
  { id: 'CON-001', name: 'Jane Doe', email: 'jane.doe@techcorp.com', client: 'TechCorp', role: 'IT Manager', lastActivity: '2 hours ago' },
  { id: 'CON-002', name: 'John Smith', email: 'john.smith@globalinnovate.com', client: 'GlobalInnovate', role: 'CEO', lastActivity: '1 day ago' },
  { id: 'CON-003', name: 'Dr. Emily White', email: 'emily.white@healthwell.org', client: 'HealthWell', role: 'Chief Medical Officer', lastActivity: '5 hours ago' },
  { id: 'CON-004', name: 'Michael Brown', email: 'mbrown@edusphere.edu', client: 'EduSphere', role: 'Dean of Students', lastActivity: '3 days ago' },
  { id: 'CON-005', name: 'Sarah Green', email: 'sarah.g@retailright.com', client: 'RetailRight', role: 'Operations Head', lastActivity: 'Just now' },
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
    priority: 'Medium', 
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
    priority: 'High', 
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
  { id: 'KB-001', title: 'How to set up a new VPN connection', content: '...', category: 'Networking', author: 'Alice', lastUpdated: '2024-04-10', type: 'Internal' },
  { id: 'KB-002', title: 'Resetting your password', content: '...', category: 'User Guides', author: 'System', lastUpdated: '2024-03-01', type: 'Public' },
  { id: 'KB-003', title: 'Troubleshooting common printer issues', content: '...', category: 'Hardware', author: 'Bob', lastUpdated: '2024-05-05', type: 'Public' },
  { id: 'KB-004', title: 'Onboarding process for new clients', content: '...', category: 'SOPs', author: 'Charlie', lastUpdated: '2024-02-15', type: 'Internal' },
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

export const users: User[] = [
    { id: 'USR-001', name: 'John Doe', email: 'john.doe@email.com', role: 'Administrator', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'USR-002', name: 'Alice', email: 'alice@email.com', role: 'Technician', status: 'Active', avatarUrl: 'https://placehold.co/40x40/f87171/FFFFFF.png' },
    { id: 'USR-003', name: 'Bob', email: 'bob@email.com', role: 'Technician', status: 'Active', avatarUrl: 'https://placehold.co/40x40/60a5fa/FFFFFF.png' },
    { id: 'USR-004', name: 'Charlie', email: 'charlie@email.com', role: 'Technician', status: 'Inactive', avatarUrl: 'https://placehold.co/40x40/34d399/FFFFFF.png' },
    { id: 'USR-005', name: 'new.user@email.com', email: 'new.user@email.com', role: 'Read-Only', status: 'Invited', avatarUrl: '' },
];
  
export const roles: Role[] = [
    { id: 'ROLE-001', name: 'Administrator', description: 'Full access to all features and settings.', userCount: 1 },
    { id: 'ROLE-002', name: 'Technician', description: 'Can manage tickets, clients, and assets. Limited settings access.', userCount: 3 },
    { id: 'ROLE-003', name: 'Read-Only', description: 'Can view data but cannot make changes.', userCount: 1 },
];

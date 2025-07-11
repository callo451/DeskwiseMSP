
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboardStats, personalDashboardStats, myRecentActivity, myWeeklyTimeLogs, tickets } from '@/lib/placeholder-data';
import type { DashboardStat, Ticket } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, Activity, MessageSquare, Clock, UserPlus, Reply, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const companyChartData = [
  { date: 'Mon', created: 12, resolved: 10 },
  { date: 'Tue', created: 15, resolved: 13 },
  { date: 'Wed', created: 18, resolved: 16 },
  { date: 'Thu', created: 14, resolved: 14 },
  { date: 'Fri', created: 20, resolved: 18 },
  { date: 'Sat', created: 8, resolved: 9 },
  { date: 'Sun', created: 5, resolved: 5 },
];

const companyChartConfig = {
  created: {
    label: 'Created',
    color: 'hsl(var(--primary))',
  },
  resolved: {
    label: 'Resolved',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

const timeChartConfig = {
  billable: {
    label: 'Billable',
    color: 'hsl(var(--primary))',
  },
  nonBillable: {
    label: 'Non-Billable',
    color: 'hsl(var(--secondary))',
  },
} satisfies ChartConfig;


const StatCard = ({ stat }: { stat: DashboardStat }) => {
  const isIncrease = stat.changeType === 'increase';
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span className={`flex items-center mr-1 ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
            {isIncrease ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {stat.change}
          </span>
          {stat.description}
        </p>
      </CardContent>
    </Card>
  );
};

const CompanyTicketRow = ({ ticket, isInternalITMode }: { ticket: Ticket, isInternalITMode: boolean }) => {
  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'Open':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Resolved':
      case 'Closed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{ticket.id}</div>
        {!isInternalITMode && <div className="hidden text-sm text-muted-foreground md:inline">{ticket.client}</div>}
      </TableCell>
      <TableCell>
        <div className="font-medium">{ticket.subject}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{ticket.assignee}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
      </TableCell>
      <TableCell className="text-right">{ticket.lastUpdate}</TableCell>
    </TableRow>
  );
};

const MyTicketRow = ({ ticket, isInternalITMode }: { ticket: Ticket, isInternalITMode: boolean }) => {
    const getPriorityVariant = (priority: Ticket['priority']) => {
        switch (priority) {
        case 'Critical': return 'destructive';
        case 'High': return 'default';
        case 'Medium': return 'secondary';
        case 'Low': return 'outline';
        }
    };
    return (
        <TableRow>
            <TableCell>
                <Link href={`/tickets/${ticket.id}`} className="font-medium text-primary hover:underline">{ticket.id}</Link>
                {!isInternalITMode && <div className="text-sm text-muted-foreground">{ticket.client}</div>}
            </TableCell>
            <TableCell>{ticket.subject}</TableCell>
            <TableCell>
                <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
            </TableCell>
            <TableCell className="text-right">{ticket.lastUpdate}</TableCell>
        </TableRow>
    );
};

const ActivityIcon = ({ type }: { type: string }) => {
    const iconMap: { [key: string]: React.ElementType } = {
        note: MessageSquare,
        status: CheckCircle2,
        timelog: Clock,
        assign: UserPlus,
        reply: Reply,
    };
    const Icon = iconMap[type] || MessageSquare;
    return <Icon className="h-4 w-4 text-muted-foreground" />;
};

export default function DashboardPage() {
  const { isInternalITMode } = useSidebar();
  const recentCompanyTickets = tickets.slice(0, 5);
  // Assuming the logged-in user is 'Alice' for the personal dashboard
  const myOpenTickets = tickets.filter(t => t.assignee === 'Alice' && t.status !== 'Resolved' && t.status !== 'Closed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Dashboard</h1>
        <Link href="/tickets/new">
          <Button>New Ticket</Button>
        </Link>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {personalDashboardStats.map(stat => (
                <StatCard key={stat.title} stat={stat} />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>My Open Tickets</CardTitle>
                        <CardDescription>Tickets assigned to you that are currently open.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID {isInternalITMode ? '' : '/ Client'}</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Last Update</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myOpenTickets.length > 0 ? (
                                    myOpenTickets.map(ticket => <MyTicketRow key={ticket.id} ticket={ticket} isInternalITMode={isInternalITMode}/>)
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">You have no open tickets. Great job!</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>A log of your recent actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {myRecentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <ActivityIcon type={activity.type} />
                          <div className="text-sm flex-1">
                            <p>{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                </Card>
            </div>

             <Card>
              <CardHeader>
                <CardTitle>My Time Logs (This Week)</CardTitle>
                <CardDescription>Your billable vs. non-billable hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={timeChartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={myWeeklyTimeLogs} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis unit="h" tickLine={false} axisLine={false} tickMargin={8} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="billable" stackId="a" fill="var(--color-billable)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="nonBillable" stackId="a" fill="var(--color-nonBillable)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="company" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map(stat => (
              <StatCard key={stat.title} stat={stat} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Ticket Trends</CardTitle>
                <CardDescription>Created vs. Resolved tickets this week.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={companyChartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="created" fill="var(--color-created)" radius={4} />
                      <Bar dataKey="resolved" fill="var(--color-resolved)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>A summary of the latest tickets.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID {isInternalITMode ? '' : '/ Client'}</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden sm:table-cell">Assignee</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCompanyTickets.map(ticket => (
                      <CompanyTicketRow key={ticket.id} ticket={ticket} isInternalITMode={isInternalITMode} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

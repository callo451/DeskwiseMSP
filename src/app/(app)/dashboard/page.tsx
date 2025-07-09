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
import { dashboardStats, tickets } from '@/lib/placeholder-data';
import type { DashboardStat, Ticket } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
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

const chartData = [
  { date: 'Mon', created: 12, resolved: 10 },
  { date: 'Tue', created: 15, resolved: 13 },
  { date: 'Wed', created: 18, resolved: 16 },
  { date: 'Thu', created: 14, resolved: 14 },
  { date: 'Fri', created: 20, resolved: 18 },
  { date: 'Sat', created: 8, resolved: 9 },
  { date: 'Sun', created: 5, resolved: 5 },
];

const chartConfig = {
  created: {
    label: 'Created',
    color: 'hsl(var(--primary))',
  },
  resolved: {
    label: 'Resolved',
    color: 'hsl(var(--accent))',
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

const TicketRow = ({ ticket }: { ticket: Ticket }) => {
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
        <div className="hidden text-sm text-muted-foreground md:inline">
          {ticket.client}
        </div>
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

export default function DashboardPage() {
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Dashboard</h1>
        <Link href="/tickets/new">
          <Button>New Ticket</Button>
        </Link>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <p className="text-muted-foreground p-6 text-center">Personal dashboard coming soon.</p>
        </TabsContent>
        <TabsContent value="company">
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
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
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
                      <TableHead>ID / Client</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden sm:table-cell">Assignee</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTickets.map(ticket => (
                      <TicketRow key={ticket.id} ticket={ticket} />
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

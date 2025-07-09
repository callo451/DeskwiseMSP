'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { assets, tickets as allTickets } from '@/lib/placeholder-data';
import type { Asset, Ticket } from '@/lib/types';
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Copy,
  Cpu,
  FileClock,
  HardDrive,
  Info,
  MemoryStick,
  Power,
  Terminal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import Link from 'next/link';
import React from 'react';
import { useParams } from 'next/navigation';

const monitoringData = {
  cpu: [
    { time: '10:00', usage: 30 }, { time: '10:05', usage: 45 }, { time: '10:10', usage: 50 },
    { time: '10:15', usage: 48 }, { time: '10:20', usage: 60 }, { time: '10:25', usage: 85 },
    { time: '10:30', usage: 55 },
  ],
  memory: [
    { time: '10:00', usage: 40 }, { time: '10:05', usage: 42 }, { time: '10:10', usage: 41 },
    { time: '10:15', usage: 45 }, { time: '10:20', usage: 47 }, { time: '10:25', usage: 48 },
    { time: '10:30', usage: 46 },
  ],
};

const chartConfig = {
  usage: {
    label: 'Usage (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const ResourceProgress = ({
  icon: Icon,
  title,
  used,
  total,
  unit,
}: {
  icon: React.ElementType;
  title: string;
  used: number;
  total: number;
  unit: string;
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span>{title}</span>
      </div>
      <Progress value={percentage} aria-label={`${title} usage`} />
      <div className="text-xs text-muted-foreground text-right">
        {used.toFixed(1)} {unit} / {total.toFixed(1)} {unit}
      </div>
    </div>
  );
};

const TicketRow = ({ ticket }: { ticket: Ticket }) => {
    const getStatusVariant = (status: Ticket['status']) => {
      switch (status) {
        case 'Open': return 'default';
        case 'In Progress': return 'secondary';
        case 'Resolved': return 'default'; 
        case 'Closed': return 'outline';
        default: return 'default';
      }
    };
  
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
        <TableCell className="font-medium">{ticket.id}</TableCell>
        <TableCell>{ticket.subject}</TableCell>
        <TableCell>
          <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(ticket.status)}
           style={
            ticket.status === 'Resolved'
              ? {
                  backgroundColor: 'hsl(var(--success))',
                  color: 'hsl(var(--success-foreground))',
                }
              : {}
          }>{ticket.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/tickets/${ticket.id}`}><ChevronRight className="h-4 w-4" /></Link>
          </Button>
        </TableCell>
      </TableRow>
    );
};

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-sm text-right">{value}</span>
    </div>
  );
};


export default function AssetDetailsPage() {
  const params = useParams<{ id: string }>();
  const asset = assets.find(a => a.id === params.id);
  const associatedTickets = allTickets.filter(t => asset?.associatedTickets.includes(t.id));

  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Asset Not Found</CardTitle>
            <CardDescription>The requested asset could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/assets">
              <Button>Back to Assets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'Online': return 'text-green-500';
      case 'Offline': return 'text-red-500';
      case 'Warning': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Asset['status']) => {
    const className = "h-4 w-4";
    switch (status) {
      case 'Online': return <Power className={className} />;
      case 'Offline': return <Power className={className} />;
      case 'Warning': return <AlertTriangle className={className} />;
      default: return <Info className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">{asset.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className={`flex items-center gap-1 ${getStatusColor(asset.status)}`}>
              {getStatusIcon(asset.status)}
              {asset.status}
            </span>
            &bull;
            <span>Last seen: {asset.lastSeen}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Terminal className="mr-2 h-4 w-4" />
            Run Script
          </Button>
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Remote Session
          </Button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client</span>
                <span className="font-medium">{asset.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{asset.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operating System</span>
                <span className="font-medium">{asset.os}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-medium flex items-center gap-2">{asset.ipAddress} <Copy className="h-3 w-3 cursor-pointer hover:text-primary" /></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">MAC Address</span>
                <span className="font-medium flex items-center gap-2">{asset.macAddress} <Copy className="h-3 w-3 cursor-pointer hover:text-primary" /></span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add notes about this asset..." defaultValue={asset.notes} rows={4} />
            </CardContent>
            <CardFooter>
              <Button size="sm" className="ml-auto">Save Notes</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Resources</CardTitle>
                  <CardDescription>Real-time performance metrics for the asset.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ResourceProgress icon={Cpu} title={asset.cpu.model} used={asset.cpu.usage} total={100} unit="%" />
                  <ResourceProgress icon={MemoryStick} title="Memory" used={asset.ram.used} total={asset.ram.total} unit="GB" />
                  <ResourceProgress icon={HardDrive} title="Disk" used={asset.disk.used} total={asset.disk.total} unit="GB" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance History</CardTitle>
                  <CardDescription>Resource usage over the last 30 minutes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <div>
                        <h3 className="font-medium mb-2 text-sm">CPU Usage (%)</h3>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monitoringData.cpu} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} />
                                    <Tooltip content={<ChartTooltipContent hideIndicator />} />
                                    <Line type="monotone" dataKey="usage" stroke="var(--color-usage)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                     <div>
                        <h3 className="font-medium mb-2 text-sm">Memory Usage (%)</h3>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monitoringData.memory} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} />
                                    <Tooltip content={<ChartTooltipContent hideIndicator />} />
                                    <Line type="monotone" dataKey="usage" stroke="var(--color-usage)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tickets" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Associated Tickets</CardTitle>
                  <CardDescription>Service tickets related to this asset.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">View</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {associatedTickets.length > 0 ? (
                        associatedTickets.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)
                      ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No associated tickets.
                            </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>Recent events and activities for this asset.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {asset.activityLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <FileClock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.activity}</p>
                          <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hardware & OS Specifications</CardTitle>
                  <CardDescription>Detailed technical specifications for this asset.</CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-border pt-4">
                  <DetailRow label="CPU Model" value={asset.cpu.model} />
                  <DetailRow label="Total Memory (RAM)" value={`${asset.ram.total} GB`} />
                  <DetailRow label="Total Disk Space" value={`${asset.disk.total} GB`} />
                  <DetailRow label="Operating System" value={asset.os} />
                  <DetailRow label="Motherboard" value={asset.specifications?.motherboard} />
                  <DetailRow label="Graphics Card (GPU)" value={asset.specifications?.gpu} />
                  <DetailRow label="BIOS Version" value={asset.specifications?.biosVersion} />
                  <DetailRow label="Serial Number" value={asset.specifications?.serialNumber} />
                  <DetailRow label="IP Address" value={asset.ipAddress} />
                  <DetailRow label="MAC Address" value={asset.macAddress} />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}

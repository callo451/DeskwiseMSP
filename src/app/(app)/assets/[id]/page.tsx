
'use client';

import { useState, useEffect } from 'react';
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
import type { Asset, Ticket, AssetHealthAnalysis } from '@/lib/types';
import type { AssetExtended } from '@/lib/services/assets';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { checkAssetHealth, type AssetHealthCheckOutput } from '@/ai/flows/asset-health-check';
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Copy,
  Cpu,
  FileClock,
  HardDrive,
  Info,
  MemoryStick,
  Power,
  RefreshCw,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import Link from 'next/link';
import React from 'react';
import { useParams } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';

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

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="font-medium text-sm text-right">{value}</div>
    </div>
  );
};


export default function AssetDetailsPage() {
  const params = useParams<{ id: string }>();
  const { isInternalITMode } = useSidebar();
  
  const [asset, setAsset] = useState<AssetExtended | null>(null);
  const [associatedTickets, setAssociatedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AssetHealthCheckOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAsset();
    }
  }, [params.id]);

  useEffect(() => {
    if (asset) {
      setNotes(asset.notes || '');
      fetchAssociatedTickets();
    }
  }, [asset]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assets/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Asset not found');
        } else {
          throw new Error('Failed to fetch asset');
        }
        return;
      }
      const data = await response.json();
      setAsset(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedTickets = async () => {
    if (!asset?.associatedTickets?.length) {
      setAssociatedTickets([]);
      return;
    }
    
    try {
      // Fetch tickets by IDs - this would need a ticket API endpoint that accepts multiple IDs
      const ticketPromises = asset.associatedTickets.map(async (ticketId) => {
        const response = await fetch(`/api/tickets/${ticketId}`);
        if (response.ok) {
          return response.json();
        }
        return null;
      });
      
      const tickets = await Promise.all(ticketPromises);
      setAssociatedTickets(tickets.filter(Boolean));
    } catch (err) {
      console.error('Failed to fetch associated tickets:', err);
    }
  };

  const saveNotes = async () => {
    if (!asset) return;
    
    try {
      setSavingNotes(true);
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save notes');
      }
      
      const updatedAsset = await response.json();
      setAsset(updatedAsset);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Loading asset details...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Asset Not Found</CardTitle>
            <CardDescription>{error || 'The requested asset could not be found.'}</CardDescription>
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

  const handleHealthCheck = async () => {
    if (!asset) return;
    setIsAnalysisDialogOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const ramUsage = asset.ram.total > 0 ? (asset.ram.used / asset.ram.total) * 100 : 0;
      const diskUsage = asset.disk.total > 0 ? (asset.disk.used / asset.disk.total) * 100 : 0;

      const result = await checkAssetHealth({
        name: asset.name,
        status: asset.status,
        isSecure: asset.isSecure,
        cpuUsage: asset.cpu.usage,
        ramUsage,
        diskUsage,
        activityLogs: asset.activityLogs,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("AI Health Check failed:", error);
      // You could add a toast notification here for the user
      setAnalysisResult({
        overallStatus: 'Critical',
        analysis: ['Failed to retrieve AI analysis.'],
        recommendations: ['Please try again later. If the issue persists, contact support.'],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getStatusColor = (status: AssetExtended['status']) => {
    switch (status) {
      case 'Online': return 'text-green-500';
      case 'Offline': return 'text-red-500';
      case 'Warning': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: AssetExtended['status']) => {
    const className = "h-4 w-4";
    switch (status) {
      case 'Online': return <Power className={className} />;
      case 'Offline': return <Power className={className} />;
      case 'Warning': return <AlertTriangle className={className} />;
      default: return <Info className={className} />;
    }
  };

  const getAnalysisStatusVariant = (status: AssetHealthCheckOutput['overallStatus']) => {
    switch (status) {
      case 'Healthy': return 'default';
      case 'Needs Attention': return 'secondary';
      case 'Critical': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">{asset.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1 ${getStatusColor(asset.status)}`}>
                {getStatusIcon(asset.status)}
                {asset.status}
              </span>
              <span className='text-muted-foreground/50'>&bull;</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`flex items-center gap-1 ${asset.isSecure ? 'text-green-600' : 'text-amber-600'}`}>
                      {asset.isSecure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      {asset.isSecure ? 'Secured' : 'At Risk'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{asset.isSecure ? 'Antivirus is active and up-to-date.' : 'Security software not detected or out-of-date.'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className='text-muted-foreground/50'>&bull;</span>
              <span>Last seen: {asset.lastSeen}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Remote Session
            </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>RMM Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleHealthCheck} disabled={isAnalyzing}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>AI Health Check</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem>
                    <Terminal className="mr-2 h-4 w-4" />
                    <span>Run Script</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Reboot Device</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Power className="mr-2 h-4 w-4" />
                    <span>Shutdown Device</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {!isInternalITMode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{asset.client}</span>
                  </div>
                )}
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
                <Textarea 
                  placeholder="Add notes about this asset..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4} 
                />
              </CardContent>
              <CardFooter>
                <Button 
                  size="sm" 
                  className="ml-auto" 
                  onClick={saveNotes}
                  disabled={savingNotes || notes === asset.notes}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
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
                                      <RechartsTooltip content={<ChartTooltipContent hideIndicator />} />
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
                                      <RechartsTooltip content={<ChartTooltipContent hideIndicator />} />
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
                      {asset.activityLogs && asset.activityLogs.length > 0 ? (
                        asset.activityLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 pt-1">
                              <FileClock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{log.activity}</p>
                              <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No activity logs available
                        </div>
                      )}
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
                     <DetailRow 
                      label="Antivirus Status" 
                      value={
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className={`flex items-center justify-end gap-1.5 ${asset.isSecure ? 'text-green-600' : 'text-amber-600'}`}>
                                        {asset.isSecure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                        {asset.isSecure ? 'Secured' : 'At Risk'}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{asset.isSecure ? 'Antivirus is active and up-to-date.' : 'Security software not detected or out-of-date.'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      } 
                    />
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
      
      <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <AlertDialogContent className="max-w-xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI Health Analysis for {asset?.name}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {isAnalyzing
                        ? "Gemini is analyzing the asset's health... Please wait."
                        : "Here is the health analysis based on the latest data."}
                </AlertDialogDescription>
            </AlertDialogHeader>
            {isAnalyzing ? (
                <div className="flex justify-center items-center h-48">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                       <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                       <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                </div>
            ) : analysisResult && (
                <div className="text-sm space-y-4 max-h-[60vh] overflow-y-auto pr-4 -mr-2">
                    <div>
                        <h3 className="font-semibold mb-2">Overall Status</h3>
                        <Badge 
                          variant={getAnalysisStatusVariant(analysisResult.overallStatus)}
                          className={analysisResult.overallStatus === 'Healthy' ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}
                        >
                            {analysisResult.overallStatus}
                        </Badge>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Analysis</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                            {analysisResult.analysis.map((item, index) => <li key={`analysis-${index}`}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Recommendations</h3>
                        <ul className="space-y-3">
                            {analysisResult.recommendations.map((item, index) => (
                                <li key={`rec-${index}`} className="flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                        <span className="text-muted-foreground">{item}</span>
                                    </div>
                                    <Button asChild variant="secondary" size="sm" className="shrink-0">
                                        <Link href={`/tickets/new?subject=${encodeURIComponent(`Issue with ${asset.name}`)}&description=${encodeURIComponent(item)}&clientId=${client?.id || ''}`}>
                                            Create Ticket
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsAnalysisDialogOpen(false)}>Close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

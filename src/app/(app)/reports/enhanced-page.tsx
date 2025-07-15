'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  Activity,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Shield,
  Wrench,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  Calendar,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

interface MSPMetrics {
  totalTickets: number;
  openTickets: number;
  criticalTickets: number;
  avgResolutionTime: number;
  slaBreaches: number;
  clientSatisfaction: number;
  recurringRevenue: number;
  activeAssets: number;
  securityIncidents: number;
  changeSuccess: number;
}

interface ClientMetrics {
  clientId: string;
  clientName: string;
  ticketCount: number;
  openTickets: number;
  avgResolutionTime: number;
  slaCompliance: number;
  assetCount: number;
  monthlyRevenue: number;
  satisfaction: number;
  lastActivity: Date;
}

interface TechnicianMetrics {
  technicianId: string;
  technicianName: string;
  assignedTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  workloadHours: number;
  utilizationRate: number;
  clientRating: number;
}

interface ServiceMetrics {
  serviceType: string;
  ticketCount: number;
  avgResolutionTime: number;
  successRate: number;
  revenue: number;
  clientCount: number;
}

const COLORS = ['#2563eb', '#f97316', '#22c55e', '#a855f7', '#ef4444', '#84cc16'];

export default function EnhancedReportsPage() {
  const { toast } = useToast();
  
  const [mspMetrics, setMspMetrics] = useState<MSPMetrics | null>(null);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics[]>([]);
  const [technicianMetrics, setTechnicianMetrics] = useState<TechnicianMetrics[]>([]);
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics[]>([]);
  const [trendingData, setTrendingData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [selectedTrendMetric, setSelectedTrendMetric] = useState('tickets_by_day');

  const dateRange = useMemo(() => {
    const days = parseInt(selectedDateRange);
    const to = new Date();
    const from = subDays(to, days);
    return { from, to };
  }, [selectedDateRange]);

  useEffect(() => {
    loadMetrics();
    loadTrendingData();
  }, [dateRange, selectedTrendMetric]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Load all metrics in parallel
      const [mspRes, clientsRes, techniciansRes, servicesRes] = await Promise.all([
        fetch(`/api/reports/metrics?type=msp&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`),
        fetch(`/api/reports/metrics?type=clients&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`),
        fetch(`/api/reports/metrics?type=technicians&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`),
        fetch(`/api/reports/metrics?type=services&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`)
      ]);

      if (mspRes.ok) setMspMetrics(await mspRes.json());
      if (clientsRes.ok) setClientMetrics(await clientsRes.json());
      if (techniciansRes.ok) setTechnicianMetrics(await techniciansRes.json());
      if (servicesRes.ok) setServiceMetrics(await servicesRes.json());

    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingData = async () => {
    try {
      const response = await fetch(`/api/reports/trending?metric=${selectedTrendMetric}&days=${selectedDateRange}`);
      if (response.ok) {
        setTrendingData(await response.json());
      }
    } catch (error) {
      console.error('Error loading trending data:', error);
    }
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    trend?: number,
    description?: string
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <Badge variant={trend >= 0 ? 'default' : 'destructive'} className="text-xs">
                {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend)}%
              </Badge>
            )}
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getSLAStatus = (compliance: number) => {
    if (compliance >= 95) return { color: 'bg-green-500', label: 'Excellent' };
    if (compliance >= 90) return { color: 'bg-blue-500', label: 'Good' };
    if (compliance >= 80) return { color: 'bg-yellow-500', label: 'Fair' };
    return { color: 'bg-red-500', label: 'Poor' };
  };

  const getUtilizationStatus = (rate: number) => {
    if (rate >= 90) return { color: 'bg-red-500', label: 'Overloaded' };
    if (rate >= 70) return { color: 'bg-green-500', label: 'Optimal' };
    if (rate >= 50) return { color: 'bg-yellow-500', label: 'Underutilized' };
    return { color: 'bg-gray-500', label: 'Idle' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">MSP Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your MSP operations and performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadMetrics} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          <TabsTrigger value="technicians">Technician Performance</TabsTrigger>
          <TabsTrigger value="services">Service Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {mspMetrics && (
              <>
                {renderMetricCard(
                  'Total Tickets',
                  mspMetrics.totalTickets,
                  <FileText className="h-5 w-5 text-primary" />
                )}
                {renderMetricCard(
                  'Open Tickets',
                  mspMetrics.openTickets,
                  <Activity className="h-5 w-5 text-orange-500" />
                )}
                {renderMetricCard(
                  'Avg Resolution',
                  `${mspMetrics.avgResolutionTime}h`,
                  <Clock className="h-5 w-5 text-blue-500" />,
                  undefined,
                  'Average time to resolve'
                )}
                {renderMetricCard(
                  'SLA Compliance',
                  `${Math.round(((mspMetrics.totalTickets - mspMetrics.slaBreaches) / mspMetrics.totalTickets) * 100)}%`,
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {renderMetricCard(
                  'Active Assets',
                  mspMetrics.activeAssets,
                  <Wrench className="h-5 w-5 text-purple-500" />
                )}
              </>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Critical Metrics</CardTitle>
                <CardDescription>Key performance indicators overview</CardDescription>
              </CardHeader>
              <CardContent>
                {mspMetrics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical Tickets</span>
                      <Badge variant={mspMetrics.criticalTickets > 5 ? 'destructive' : 'default'}>
                        {mspMetrics.criticalTickets}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security Incidents</span>
                      <Badge variant={mspMetrics.securityIncidents > 0 ? 'destructive' : 'secondary'}>
                        {mspMetrics.securityIncidents}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Change Success Rate</span>
                      <Badge variant={mspMetrics.changeSuccess >= 90 ? 'default' : 'secondary'}>
                        {mspMetrics.changeSuccess}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Client Satisfaction</span>
                      <Badge variant="default">
                        {mspMetrics.clientSatisfaction}/5.0
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>Tickets by service type</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceMetrics.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceMetrics}
                        dataKey="ticketCount"
                        nameKey="serviceType"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceMetrics.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Performance Metrics</CardTitle>
              <CardDescription>Overview of client engagement and satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Open</TableHead>
                      <TableHead>Avg Resolution</TableHead>
                      <TableHead>SLA Compliance</TableHead>
                      <TableHead>Assets</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientMetrics.map((client) => {
                      const slaStatus = getSLAStatus(client.slaCompliance);
                      return (
                        <TableRow key={client.clientId}>
                          <TableCell className="font-medium">{client.clientName}</TableCell>
                          <TableCell>{client.ticketCount}</TableCell>
                          <TableCell>
                            <Badge variant={client.openTickets > 5 ? 'destructive' : 'secondary'}>
                              {client.openTickets}
                            </Badge>
                          </TableCell>
                          <TableCell>{client.avgResolutionTime}h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${slaStatus.color}`} />
                              {client.slaCompliance}%
                            </div>
                          </TableCell>
                          <TableCell>{client.assetCount}</TableCell>
                          <TableCell>{format(new Date(client.lastActivity), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance</CardTitle>
              <CardDescription>Individual technician metrics and workload analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Technician</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Resolution Rate</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Workload</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicianMetrics.map((tech) => {
                      const resolutionRate = tech.assignedTickets > 0 ? 
                        Math.round((tech.resolvedTickets / tech.assignedTickets) * 100) : 0;
                      const utilizationStatus = getUtilizationStatus(tech.utilizationRate);
                      
                      return (
                        <TableRow key={tech.technicianId}>
                          <TableCell className="font-medium">{tech.technicianName}</TableCell>
                          <TableCell>{tech.assignedTickets}</TableCell>
                          <TableCell>{tech.resolvedTickets}</TableCell>
                          <TableCell>
                            <Badge variant={resolutionRate >= 80 ? 'default' : 'secondary'}>
                              {resolutionRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>{tech.avgResolutionTime}h</TableCell>
                          <TableCell>{tech.workloadHours}h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${utilizationStatus.color}`} />
                              {tech.utilizationRate}%
                            </div>
                          </TableCell>
                          <TableCell>{tech.clientRating}/5.0</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Type Analysis</CardTitle>
              <CardDescription>Performance metrics by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Tickets</TableHead>
                        <TableHead>Avg Resolution</TableHead>
                        <TableHead>Success Rate</TableHead>
                        <TableHead>Clients</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceMetrics.map((service) => (
                        <TableRow key={service.serviceType}>
                          <TableCell className="font-medium">{service.serviceType}</TableCell>
                          <TableCell>{service.ticketCount}</TableCell>
                          <TableCell>{service.avgResolutionTime}h</TableCell>
                          <TableCell>
                            <Badge variant={service.successRate >= 90 ? 'default' : 'secondary'}>
                              {service.successRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>{service.clientCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Resolution Time by Service</h4>
                  {serviceMetrics.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={serviceMetrics} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="serviceType" width={100} />
                        <Tooltip />
                        <Bar dataKey="avgResolutionTime" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trending Analytics</CardTitle>
                  <CardDescription>Historical trends and patterns</CardDescription>
                </div>
                <Select value={selectedTrendMetric} onValueChange={setSelectedTrendMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tickets_by_day">Tickets by Day</SelectItem>
                    <SelectItem value="tickets_by_priority">Tickets by Priority</SelectItem>
                    <SelectItem value="tickets_by_status">Tickets by Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {trendingData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                  {selectedTrendMetric === 'tickets_by_day' ? (
                    <AreaChart data={trendingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#2563eb" 
                        fill="#2563eb" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={trendingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedTrendMetric.includes('priority') ? 'priority' : 'status'} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
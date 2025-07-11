
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
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
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { tickets as allTickets, assets as allAssets, clients as allClients, changeRequests as allChangeRequests } from '@/lib/placeholder-data';
import type { Ticket, Asset, Client, ReportFilter, FilterOperator, ChangeRequest } from '@/lib/types';
import { generateReportConfig, type ReportConfig } from '@/ai/flows/report-generation';
import { generateReportInsights } from '@/ai/flows/report-insights';
import { useToast } from '@/hooks/use-toast';
import { Bot, ChevronDown, FileText, Lightbulb, Settings, Sparkles, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';

type ReportData = Record<string, any>[];
type ReportModule = 'Tickets' | 'Assets' | 'Clients' | 'Change Management';

const MODULE_CONFIG = {
    Tickets: {
        columns: ['id', 'subject', 'client', 'assignee', 'priority', 'status', 'createdDate', 'queue'],
        groupable: ['client', 'assignee', 'priority', 'status', 'queue'],
        dateField: 'createdDate',
        data: allTickets,
    },
    Assets: {
        columns: ['id', 'name', 'client', 'type', 'status', 'isSecure', 'lastSeen', 'os'],
        groupable: ['client', 'type', 'status', 'isSecure', 'os'],
        dateField: 'lastSeen',
        data: allAssets,
    },
    Clients: {
        columns: ['id', 'name', 'industry', 'status', 'contacts', 'tickets'],
        groupable: ['industry', 'status'],
        dateField: null,
        data: allClients,
    },
    'Change Management': {
        columns: ['id', 'title', 'client', 'status', 'riskLevel', 'impact', 'submittedBy', 'plannedStartDate'],
        groupable: ['client', 'status', 'riskLevel', 'impact', 'submittedBy'],
        dateField: 'plannedStartDate',
        data: allChangeRequests,
    }
}

const FILTER_OPERATORS: { value: FilterOperator, label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
];
const PIE_CHART_COLORS = ["#2563eb", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#84cc16"];

export default function ReportsPage() {
  const { toast } = useToast();

  const [aiQuery, setAiQuery] = useState('');
  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);
  
  const [selectedModule, setSelectedModule] = useState<ReportModule>('Tickets');
  const [reportTitle, setReportTitle] = useState('All Tickets');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(MODULE_CONFIG.Tickets.columns);
  const [groupBy, setGroupBy] = useState('');
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'table_only'>('table_only');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: addDays(new Date(), -30), to: new Date() });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  const handleModuleChange = (module: ReportModule) => {
    setSelectedModule(module);
    setReportTitle(`All ${module}`);
    setSelectedColumns(MODULE_CONFIG[module].columns);
    setGroupBy('');
    setFilters([]);
    setChartType('table_only');
    setReportData(null);
    setInsights([]);
  }

  const handleGenerateConfig = async () => {
    if (!aiQuery.trim()) return;
    setIsGeneratingConfig(true);
    try {
      const config = await generateReportConfig({ query: aiQuery, module: selectedModule });
      setReportTitle(config.title);
      setSelectedColumns(config.columns);
      setFilters(config.filters.map(f => ({...f, id: `filter-${Math.random()}` })));
      setGroupBy(config.groupBy || '');
      setChartType(config.chartType as any);
      toast({ title: 'Report Configured!', description: 'AI has configured the report builder for you. Review and run the report.' });
    } catch (error) {
      console.error('AI Config Generation Error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate report configuration from your query.' });
    } finally {
      setIsGeneratingConfig(false);
    }
  };

  const handleRunReport = () => {
    setIsReportLoading(true);
    setReportData(null);
    setInsights([]);
    
    setTimeout(() => {
      const moduleConfig = MODULE_CONFIG[selectedModule];
      let data: Record<string, any>[] = [...moduleConfig.data];

      if (dateRange?.from && dateRange?.to && moduleConfig.dateField) {
        data = data.filter(item => {
            const itemDate = parseISO(item[moduleConfig.dateField!]);
            return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! });
        });
      }
      
      filters.forEach(filter => {
        if (!filter.field || !filter.operator || !filter.value) return;
        data = data.filter(item => {
            const itemValue = item[filter.field]?.toString().toLowerCase();
            const filterValue = filter.value.toLowerCase();
            if (itemValue === undefined) return false;

            switch (filter.operator) {
                case 'equals': return itemValue === filterValue;
                case 'not_equals': return itemValue !== filterValue;
                case 'contains': return itemValue.includes(filterValue);
                case 'greater_than': return Number(itemValue) > Number(filterValue);
                case 'less_than': return Number(itemValue) < Number(filterValue);
                default: return true;
            }
        });
      });
      
      if (groupBy) {
        const grouped = data.reduce((acc, item) => {
          const key = item[groupBy] || 'Unassigned';
          if (!acc[key]) {
            acc[key] = { [groupBy]: key, count: 0 };
          }
          acc[key].count++;
          return acc;
        }, {} as Record<string, any>);
        setReportData(Object.values(grouped));
      } else {
        setReportData(data.map(item => {
            const filteredItem: Record<string, any> = {};
            selectedColumns.forEach(col => {
                filteredItem[col] = item[col];
            });
            return filteredItem;
        }));
      }

      setIsReportLoading(false);
    }, 1000);
  };
  
  const handleGetInsights = async () => {
    if (!reportData) return;
    setIsInsightLoading(true);
    setInsights([]);
    try {
      const result = await generateReportInsights({
        reportTitle: reportTitle,
        reportData: JSON.stringify(reportData.slice(0, 50)), // Limit data for AI prompt
      });
      setInsights(result.insights);
    } catch (error) {
       console.error('AI Insight Generation Error:', error);
       toast({ variant: 'destructive', title: 'Error', description: 'Could not generate insights for this report.' });
    } finally {
      setIsInsightLoading(false);
    }
  };

  const chartConfig = useMemo(() => {
    if (!reportData || !groupBy) return { count: { label: 'Count' } };
    const config: ChartConfig = { count: { label: 'Count', color: 'hsl(var(--primary))' } };
    return config;
  }, []);
  
  const addFilter = () => {
    const defaultField = MODULE_CONFIG[selectedModule].columns[0] || 'id';
    setFilters([...filters, {id: `filter-${Date.now()}`, field: defaultField, operator: 'equals', value: ''}])
  };
  const removeFilter = (id: string) => setFilters(filters.filter((f) => f.id !== id));
  const updateFilter = (id: string, field: string, value: any) => {
    const newFilters = filters.map(f => f.id === id ? { ...f, [field]: value } : f);
    setFilters(newFilters);
  };

  const renderChart = () => {
    if (!groupBy || !reportData || reportData.length === 0) return null;

    switch(chartType) {
        case 'bar':
            return (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={reportData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey={groupBy} type="category" tickLine={false} axisLine={false} width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} />
                        <XAxis dataKey="count" type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="count" layout="vertical" radius={4} fill="var(--color-count)" />
                    </BarChart>
                </ChartContainer>
            );
        case 'pie':
            return (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={reportData} dataKey="count" nameKey={groupBy} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        );
                    }}>
                        {reportData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
            );
         case 'line':
            return (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart data={reportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={groupBy} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
                    </LineChart>
                </ChartContainer>
            );
        default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Reports &amp; Analytics</h1>
        <p className="text-muted-foreground">
          Create custom reports and gain insights into your operations.
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary h-5 w-5"/>AI Report Pilot</CardTitle>
                        <CardDescription>Use natural language to configure your report.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Textarea placeholder={`e.g., Show me all critical tickets for TechCorp, grouped by assignee`} value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} />
                            <Button onClick={handleGenerateConfig} disabled={isGeneratingConfig} className="w-full">
                                {isGeneratingConfig ? 'Generating...' : 'Configure Report with AI'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/>Custom Report Builder</CardTitle>
                        <CardDescription>Manually configure the report below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <Label>Module</Label>
                            <Select value={selectedModule} onValueChange={(val) => handleModuleChange(val as ReportModule)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tickets">Tickets</SelectItem>
                                    <SelectItem value="Assets">Assets</SelectItem>
                                    <SelectItem value="Clients">Clients</SelectItem>
                                    <SelectItem value="Change Management">Change Management</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label>Report Title</Label>
                            <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Columns</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between">{selectedColumns.length} selected <ChevronDown/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64">
                                    <DropdownMenuLabel>{selectedModule} Fields</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {MODULE_CONFIG[selectedModule].columns.map(col => (
                                        <DropdownMenuCheckboxItem key={col} checked={selectedColumns.includes(col)} onCheckedChange={(checked) => {
                                            setSelectedColumns(checked ? [...selectedColumns, col] : selectedColumns.filter(c => c !== col));
                                        }}>{col}</DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                         <div className="space-y-2">
                            <Label>Group By</Label>
                            <Select value={groupBy} onValueChange={setGroupBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODULE_CONFIG[selectedModule].groupable.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Chart Type</Label>
                            <Select value={chartType} onValueChange={v => setChartType(v as any)} disabled={!groupBy}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="table_only">Table Only</SelectItem>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="pie">Pie Chart</SelectItem>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                           <Label>Filters</Label>
                           {MODULE_CONFIG[selectedModule].dateField && (
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-xs text-muted-foreground">Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button id="date" variant={"outline"} className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (dateRange.to ? <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</> : format(dateRange.from, "LLL dd, y")) : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                           )}
                           <div className="space-y-2">
                             {filters.map((filter) => (
                               <div key={filter.id} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center">
                                   <Select value={filter.field} onValueChange={(val) => updateFilter(filter.id, 'field', val)}><SelectTrigger className="text-xs h-9"><SelectValue/></SelectTrigger><SelectContent>{MODULE_CONFIG[selectedModule].columns.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                   <Select value={filter.operator} onValueChange={(val) => updateFilter(filter.id, 'operator', val)}><SelectTrigger className="text-xs h-9"><SelectValue/></SelectTrigger><SelectContent>{FILTER_OPERATORS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                   <Input value={filter.value} onChange={(e) => updateFilter(filter.id, 'value', e.target.value)} placeholder="Value" className="text-xs h-9"/>
                                   <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)} className="h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                               </div>
                             ))}
                           </div>
                           <Button variant="outline" size="sm" onClick={addFilter}><Plus className="mr-2 h-4 w-4"/>Add filter</Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleRunReport} disabled={isReportLoading} className="w-full">
                           {isReportLoading ? "Running..." : "Run Report"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            {/* Report Display */}
            <div className="lg:col-span-2">
                <Card className="min-h-[500px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                       <div>
                            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>{reportTitle}</CardTitle>
                            <CardDescription>Results for {selectedModule} module.</CardDescription>
                        </div>
                        {reportData && (
                            <Button variant="outline" onClick={handleGetInsights} disabled={isInsightLoading}><Lightbulb className="mr-2 h-4 w-4" />{isInsightLoading ? 'Analyzing...' : 'AI Insights'}</Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isReportLoading ? (<div className="flex items-center justify-center h-64"><p>Loading report data...</p></div>)
                        : !reportData ? (<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Run a report to see results here.</p></div>)
                        : (
                            <div className="space-y-6">
                                {(insights.length > 0) && (
                                    <Card className="bg-primary/10 border-primary/20">
                                        <CardHeader><CardTitle className="text-base text-primary">Key Insights</CardTitle></CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                {insights.map((insight, i) => <li key={i}>{insight}</li>)}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {chartType !== 'table_only' && renderChart()}

                                <div className="overflow-x-auto">
                                  <Table>
                                      <TableHeader><TableRow>{selectedColumns.map(col => <TableHead key={col}>{col}</TableHead>)}</TableRow></TableHeader>
                                      <TableBody>
                                          {reportData.length > 0 ? (
                                              reportData.map((row, index) => (
                                                  <TableRow key={index}>{selectedColumns.map(col => <TableCell key={col}>{typeof row[col] === 'boolean' ? String(row[col]) : row[col]}</TableCell>)}</TableRow>
                                              ))
                                          ) : (
                                            <TableRow><TableCell colSpan={selectedColumns.length} className="text-center h-24">No data found for this report.</TableCell></TableRow>
                                          )}
                                      </TableBody>
                                  </Table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

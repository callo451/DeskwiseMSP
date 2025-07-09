
'use client';

import React, { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { tickets as allTickets, ticketPriorities } from '@/lib/placeholder-data';
import type { Ticket } from '@/lib/types';
import { generateReportConfig, type ReportConfig } from '@/ai/flows/report-generation';
import { generateReportInsights } from '@/ai/flows/report-insights';
import { useToast } from '@/hooks/use-toast';
import { Bot, ChevronDown, FileText, Lightbulb, Settings, Sparkles } from 'lucide-react';
import { set } from 'zod';

type ReportData = Record<string, any>[];

const TICKET_COLUMNS = ['id', 'subject', 'client', 'assignee', 'priority', 'status', 'createdDate', 'queue'];
const TICKET_GROUPABLE_COLUMNS = ['client', 'assignee', 'priority', 'status', 'queue'];

export default function ReportsPage() {
  const { toast } = useToast();

  const [aiQuery, setAiQuery] = useState('');
  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);

  const [reportTitle, setReportTitle] = useState('All Tickets');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(TICKET_COLUMNS);
  const [groupBy, setGroupBy] = useState('');
  const [filters, setFilters] = useState<{ field: string; value: string }[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'table_only'>('table_only');

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  const handleGenerateConfig = async () => {
    if (!aiQuery.trim()) return;
    setIsGeneratingConfig(true);
    try {
      const config = await generateReportConfig({ query: aiQuery, module: 'Tickets' });
      setReportTitle(config.title);
      setSelectedColumns(config.columns);
      setFilters(config.filters);
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
    
    // Simulate API call and data processing
    setTimeout(() => {
      let data: Ticket[] = [...allTickets];

      // Apply filters
      filters.forEach(filter => {
        if (filter.value) {
          data = data.filter(item => (item as any)[filter.field]?.toLowerCase().includes(filter.value.toLowerCase()));
        }
      });
      
      // Apply grouping
      if (groupBy) {
        const grouped = data.reduce((acc, item) => {
          const key = (item as any)[groupBy] || 'Unassigned';
          if (!acc[key]) {
            acc[key] = { [groupBy]: key, count: 0 };
          }
          acc[key].count++;
          return acc;
        }, {} as Record<string, any>);
        setReportData(Object.values(grouped));
      } else {
        setReportData(data);
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
        reportData: JSON.stringify(reportData),
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
    
    const config: ChartConfig = {
      count: { label: 'Count', color: 'hsl(var(--primary))' },
    };
    reportData.forEach(item => {
      const name = item[groupBy];
      if (name && !config[name]) {
        config[name] = { label: name };
      }
    });
    return config;
  }, [reportData, groupBy]);
  
  const addFilter = () => setFilters([...filters, {field: 'status', value: ''}]);
  const removeFilter = (index: number) => setFilters(filters.filter((_, i) => i !== index));
  const updateFilter = (index: number, field: string, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Reports &amp; Analytics</h1>
        <p className="text-muted-foreground">
          Create custom reports and gain insights into your operations.
        </p>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="assets" disabled>Assets</TabsTrigger>
          <TabsTrigger value="clients" disabled>Clients</TabsTrigger>
          <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="tickets" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Report Builder */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary h-5 w-5"/>AI Report Pilot</CardTitle>
                            <CardDescription>Use natural language to configure your report.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Textarea placeholder="e.g., Show me all critical tickets for TechCorp this month, grouped by assignee" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} />
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
                                <Label>Report Title</Label>
                                <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Columns</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between">{selectedColumns.length} selected <ChevronDown/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64">
                                        <DropdownMenuLabel>Ticket Fields</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {TICKET_COLUMNS.map(col => (
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
                                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {TICKET_GROUPABLE_COLUMNS.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                               <Label>Filters</Label>
                               {filters.map((filter, index) => (
                                   <div key={index} className="flex gap-2 items-center">
                                       <Select value={filter.field} onValueChange={(val) => updateFilter(index, 'field', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{TICKET_COLUMNS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                       <Input value={filter.value} onChange={(e) => updateFilter(index, 'value', e.target.value)} placeholder="Value"/>
                                       <Button variant="ghost" size="icon" onClick={() => removeFilter(index)}>x</Button>
                                   </div>
                               ))}
                               <Button variant="outline" size="sm" onClick={addFilter}>Add filter</Button>
                            </div>
                        </CardContent>
                        <CardContent>
                            <Button onClick={handleRunReport} disabled={isReportLoading} className="w-full">
                               {isReportLoading ? "Running..." : "Run Report"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                {/* Report Display */}
                <div className="lg:col-span-2">
                    <Card className="min-h-[500px]">
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>{reportTitle}</CardTitle>
                                <CardDescription>Results from your query.</CardDescription>
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

                                    {chartType !== 'table_only' && groupBy && (
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <BarChart data={reportData} layout="vertical">
                                                <CartesianGrid horizontal={false} />
                                                <YAxis dataKey={groupBy} type="category" tickLine={false} axisLine={false} width={80}/>
                                                <XAxis dataKey="count" type="number" />
                                                <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<ChartTooltipContent />} />
                                                <Bar dataKey="count" layout="vertical" radius={4} fill="var(--color-count)" />
                                            </BarChart>
                                        </ChartContainer>
                                    )}
                                    <Table>
                                        <TableHeader><TableRow>{selectedColumns.map(col => <TableHead key={col}>{col}</TableHead>)}</TableRow></TableHeader>
                                        <TableBody>
                                            {reportData.map((row, index) => (
                                                <TableRow key={index}>{selectedColumns.map(col => <TableCell key={col}>{row[col]}</TableCell>)}</TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { assets as allAssets, clients, tickets, knowledgeBaseArticles } from '@/lib/placeholder-data';
import type { Asset, Ticket, Client, KnowledgeBaseArticle, TimeLog } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { analyzeTicket, type AnalyzeTicketOutput } from '@/ai/flows/ticket-insights';
import { summarizeTicket } from '@/ai/flows/ticket-summary';
import { generateSuggestedReply } from '@/ai/flows/suggested-reply';
import { findRelevantArticles, ProactiveKbSearchOutput } from '@/ai/flows/proactive-kb-search';
import {
  BookText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  HardDrive,
  Mail,
  MoreVertical,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Hourglass,
  CheckCircle2,
  XCircle,
  Bot,
  FileText,
  PlusCircle,
  Lightbulb,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, parseISO, isAfter } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode, icon?: React.ElementType }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="font-medium text-right">{value}</div>
    </div>
  );
};

const AssetRow = ({ asset }: { asset: Asset }) => (
  <TableRow>
    <TableCell className="font-medium">{asset.name}</TableCell>
    <TableCell className="hidden sm:table-cell">{asset.type}</TableCell>
    <TableCell>
      <div className={`flex items-center gap-1.5 ${asset.isSecure ? 'text-green-600' : 'text-amber-600'}`}>
        {asset.isSecure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
        <span className="hidden xl:inline">{asset.isSecure ? 'Secured' : 'At Risk'}</span>
      </div>
    </TableCell>
    <TableCell className="text-right">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/assets/${asset.id}`}><ChevronRight className="h-4 w-4" /></Link>
      </Button>
    </TableCell>
  </TableRow>
);

const SlaTimer = React.memo(({ dueDate, metDate, label }: { dueDate?: string, metDate?: string, label: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  const isMet = metDate && dueDate ? !isAfter(parseISO(metDate), parseISO(dueDate)) : false;
  const isBreached = !metDate && dueDate ? isAfter(new Date(), parseISO(dueDate)) : false;

  useEffect(() => {
    if (!dueDate || metDate || isBreached) return;

    const calculateTimeLeft = () => {
      const distance = formatDistanceToNow(parseISO(dueDate), { addSuffix: true });
      setTimeLeft(distance);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [dueDate, metDate, isBreached]);

  const getStatus = () => {
    if (isMet) return { text: 'Met', icon: CheckCircle2, color: 'text-green-600' };
    if (isBreached) return { text: 'Breached', icon: XCircle, color: 'text-red-600' };
    return { text: timeLeft, icon: Hourglass, color: 'text-amber-600' };
  };

  const { text, icon: Icon, color } = getStatus();

  return (
    <div className="flex justify-between items-center py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {dueDate ? (
        <div className={`flex items-center gap-1.5 font-medium ${color}`}>
          <Icon className="h-4 w-4" />
          <span>{text}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">Not set</span>
      )}
    </div>
  );
});
SlaTimer.displayName = 'SlaTimer';

const timeLogSchema = z.object({
  hours: z.coerce.number().min(0.1, 'Must be at least 0.1 hours.'),
  description: z.string().min(5, 'Description is required.'),
  isBillable: z.boolean(),
});

function TimeLogDialog({ onLogTime }: { onLogTime: (values: TimeLog) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof timeLogSchema>>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: { hours: 1, description: '', isBillable: true },
  });

  function onSubmit(values: z.infer<typeof timeLogSchema>) {
    const newLog: TimeLog = {
      id: `TL-${Date.now()}`,
      technician: 'John Doe', // Assuming current user
      date: new Date().toISOString().split('T')[0],
      ...values,
    };
    onLogTime(newLog);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Log Time</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
          <DialogDescription>Add a new time entry for this ticket.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField control={form.control} name="hours" render={({ field }) => (
                     <FormItem>
                         <Label>Hours</Label>
                         <Input type="number" step="0.1" {...field} />
                     </FormItem>
                 )} />
                 <FormField control={form.control} name="description" render={({ field }) => (
                     <FormItem>
                         <Label>Work Description</Label>
                         <Textarea {...field} />
                     </FormItem>
                 )} />
                 <FormField control={form.control} name="isBillable" render={({ field }) => (
                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                         <div className="space-y-0.5">
                             <FormLabel>Billable</FormLabel>
                         </div>
                         <FormControl>
                             <Switch checked={field.value} onCheckedChange={field.onChange} />
                         </FormControl>
                     </FormItem>
                 )} />
                 <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Entry</Button>
                 </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const ticket = tickets.find(t => t.id === params.id);
  const client = ticket ? clients.find(c => c.name === ticket.client) : undefined;
  const associatedAssets = ticket ? allAssets.filter(a => ticket.associatedAssets?.includes(a.id)) : [];
  
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTicketOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [suggestedArticles, setSuggestedArticles] = useState<ProactiveKbSearchOutput>([]);
  const [isKbLoading, setIsKbLoading] = useState(true);

  const ticketContext = useMemo(() => {
    if (!currentTicket) return '';
    const activityLog = currentTicket.activity.map(a => `${a.user}: ${a.activity}`).join('\n');
    return `Subject: ${currentTicket.subject}\n\nDescription: ${currentTicket.description}\n\nActivity:\n${activityLog}`;
  }, [currentTicket]);

  useEffect(() => {
    if (!ticket) return;

    async function fetchKbArticles() {
      setIsKbLoading(true);
      try {
        const results = await findRelevantArticles({ subject: ticket.subject, description: ticket.description });
        setSuggestedArticles(results);
      } catch (error) {
        console.error("Proactive KB search failed:", error);
        toast({ variant: 'destructive', title: 'Could not search knowledge base.' });
      } finally {
        setIsKbLoading(false);
      }
    }
    fetchKbArticles();
  }, [ticket, toast]);

  if (!currentTicket) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ticket Not Found</CardTitle>
            <CardDescription>The requested ticket could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/tickets">Back to Tickets</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnalysis = async () => {
    setIsAnalysisDialogOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeTicket({ ticketContent: ticketContext });
      setAnalysisResult(result);
    } catch (error) {
      console.error("AI Ticket Analysis failed:", error);
      setAnalysisResult({
        suggestedCategory: 'N/A',
        suggestedTechnician: 'N/A',
        confidenceLevel: 0,
        reasoning: 'Failed to retrieve AI analysis. Please try again later.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSummarize = async () => {
    setIsSummaryDialogOpen(true);
    setIsSummarizing(true);
    setSummary('');
    try {
        const result = await summarizeTicket({ ticketContext });
        setSummary(result.summary);
    } catch (error) {
        console.error("AI summary failed:", error);
        setSummary('Failed to retrieve AI summary. Please try again later.');
    } finally {
        setIsSummarizing(false);
    }
  };
  
  const handleGenerateReply = async (replyType: 'acknowledgement' | 'more_info' | 'resolution_confirmation') => {
    setIsGeneratingReply(true);
    setComment('Generating reply...');
    try {
      const result = await generateSuggestedReply({ ticketContext, replyType });
      setComment(result.reply);
    } catch (error) {
      console.error("AI reply generation failed:", error);
      setComment('Failed to generate reply.');
      toast({ variant: 'destructive', title: 'Reply Generation Failed' });
    } finally {
      setIsGeneratingReply(false);
    }
  }
  
  const handleLogTime = (log: TimeLog) => {
    setCurrentTicket(prev => prev ? ({ ...prev, timeLogs: [...(prev.timeLogs || []), log] }) : null);
    toast({ title: "Time logged successfully!" });
  };


  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'Open': return 'default';
      case 'In Progress': return 'secondary';
      case 'Resolved': return 'default';
      case 'Closed': return 'outline';
      default: return 'outline';
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
  
  const getAvatarForUser = (userName: string) => {
      const initials = userName.split(' ').map(n => n[0]).join('');
      if (userName === 'Alice') return "https://placehold.co/40x40/F87171/FFFFFF.png";
      if (userName === 'Bob') return "https://placehold.co/40x40/60A5FA/FFFFFF.png";
      if (userName === 'Charlie') return "https://placehold.co/40x40/34D399/FFFFFF.png";
      return "https://placehold.co/40x40/A3A3A3/FFFFFF.png";
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <Button asChild variant="outline" size="icon" className="h-8 w-8">
                  <Link href="/tickets"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back to tickets</span></Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{currentTicket.subject}</h1>
            </div>
            <p className="text-muted-foreground ml-12">
              Ticket <span className="font-mono">{currentTicket.id}</span> opened by <span className="font-medium text-foreground">{currentTicket.activity[0]?.user || 'Unknown'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button><Mail className="mr-2 h-4 w-4" /> Reply</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAnalysis}><Sparkles className="mr-2 h-4 w-4" />AI Insights</DropdownMenuItem>
                <DropdownMenuItem><ClipboardList className="mr-2 h-4 w-4" />Change Status</DropdownMenuItem>
                <DropdownMenuItem><User className="mr-2 h-4 w-4" />Assign Technician</DropdownMenuItem>
                 <DropdownMenuItem><Paperclip className="mr-2 h-4 w-4" />Add Attachment</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-border -mt-2">
                        <DetailRow label="Status" value={<Badge variant={getStatusVariant(currentTicket.status)} style={currentTicket.status === 'Resolved' ? { backgroundColor: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))'} : {}}>{currentTicket.status}</Badge>} />
                        <DetailRow label="Priority" value={<Badge variant={getPriorityVariant(currentTicket.priority)}>{currentTicket.priority}</Badge>} />
                        <DetailRow label="Client" value={<Link href="#" className="font-medium text-primary hover:underline">{client?.name}</Link>} />
                        <DetailRow label="Assignee" value={currentTicket.assignee} icon={User} />
                        <DetailRow label="Created" value={currentTicket.createdDate} icon={Clock} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>SLA Status</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-border -mt-2">
                        <SlaTimer label="Time to Respond" dueDate={currentTicket.sla?.responseDue} metDate={currentTicket.sla?.respondedAt} />
                        <SlaTimer label="Time to Resolve" dueDate={currentTicket.sla?.resolutionDue} metDate={currentTicket.sla?.resolvedAt} />
                    </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Associated Assets</CardTitle><CardDescription>Hardware linked to this ticket.</CardDescription></CardHeader>
                  <CardContent>
                     {associatedAssets.length > 0 ? (
                        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden sm:table-cell">Type</TableHead><TableHead>Security</TableHead><TableHead><span className="sr-only">View</span></TableHead></TableRow></TableHeader><TableBody>{associatedAssets.map(asset => <AssetRow key={asset.id} asset={asset} />)}</TableBody></Table>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-8"><HardDrive className="mx-auto h-8 w-8 mb-2" />No associated assets.</div>
                      )}
                  </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Tabs defaultValue="activity" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="activity">Activity &amp; Notes</TabsTrigger>
                        <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
                        <TabsTrigger value="timelogs">Time Logs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Full Description</CardTitle></CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentTicket.description}</p></CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Activity Feed</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing}><Bot className="mr-2 h-4 w-4" />Summarize</Button>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {currentTicket.activity.map((item, index) => (
                              <div key={index} className="flex gap-4">
                                 <Avatar><AvatarImage src={getAvatarForUser(item.user)} alt={item.user} data-ai-hint="user avatar" /><AvatarFallback>{item.user.charAt(0)}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center"><span className="font-semibold text-sm">{item.user}</span><span className="text-xs text-muted-foreground">{item.timestamp}</span></div>
                                  <div className="p-3 mt-1 rounded-md bg-secondary/50 text-foreground text-sm"><p className="whitespace-pre-wrap">{item.activity}</p></div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                          <CardFooter>
                             <div className="w-full flex gap-4">
                                <Avatar><AvatarImage src="https://placehold.co/40x40.png" alt="Current User" data-ai-hint="user avatar" /><AvatarFallback>U</AvatarFallback></Avatar>
                                <div className="w-full space-y-2">
                                    <Textarea placeholder="Add a comment or internal note..." rows={3} value={comment} onChange={e => setComment(e.target.value)} disabled={isGeneratingReply} />
                                    <div className="flex justify-end items-center gap-2">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="secondary" size="sm" disabled={isGeneratingReply}><Sparkles className="mr-2 h-4 w-4" /> AI Reply</Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={() => handleGenerateReply('acknowledgement')}>Acknowledge Ticket</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleGenerateReply('more_info')}>Request More Info</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleGenerateReply('resolution_confirmation')}>Confirm Resolution</DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                       <Button variant="outline" size="sm">Add Internal Note</Button>
                                       <Button size="sm">Reply to Client</Button>
                                    </div>
                                </div>
                             </div>
                          </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="kb">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><BookText className="h-5 w-5" />Knowledge Base</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                              <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary"><Lightbulb className="h-4 w-4" /> Suggested Articles</h3>
                                <div className="space-y-2">
                                  {isKbLoading ? <p className="text-sm text-muted-foreground">Searching for relevant articles...</p>
                                   : suggestedArticles.length > 0 ? (
                                      suggestedArticles.map(article => (
                                        <Link href={`/knowledge-base/${article.id}`} key={article.id} className="block p-3 rounded-md hover:bg-secondary">
                                          <p className="font-medium">{article.title}</p>
                                          <p className="text-sm text-muted-foreground">{article.category}</p>
                                        </Link>
                                      ))
                                  ) : <p className="text-sm text-muted-foreground">No relevant articles found.</p>}
                                </div>
                              </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                     <TabsContent value="timelogs">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1.5">
                                  <CardTitle>Time Logs</CardTitle>
                                  <CardDescription>Time entries recorded for this ticket.</CardDescription>
                                </div>
                                <TimeLogDialog onLogTime={handleLogTime} />
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Technician</TableHead><TableHead>Hours</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Billable</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {currentTicket.timeLogs && currentTicket.timeLogs.length > 0 ? (
                                            currentTicket.timeLogs.map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell>{log.technician}</TableCell>
                                                    <TableCell>{log.hours.toFixed(1)}</TableCell>
                                                    <TableCell>{log.date}</TableCell>
                                                    <TableCell>{log.description}</TableCell>
                                                    <TableCell>{log.isBillable ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={5} className="h-24 text-center">No time logged for this ticket.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </div>
      
       <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 font-headline"><Sparkles className="h-6 w-6 text-primary" />AI Ticket Insights</AlertDialogTitle><AlertDialogDescription>{isAnalyzing ? "Gemini is analyzing the ticket... Please wait." : "Here are the insights based on the ticket content."}</AlertDialogDescription></AlertDialogHeader>
            {isAnalyzing ? ( <div className="flex justify-center items-center h-48"><div className="flex items-center gap-2 text-muted-foreground"><div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div><div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div><div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div></div></div>)
             : analysisResult && (<div className="text-sm space-y-4"><DetailRow label="Suggested Category" value={<Badge variant="secondary">{analysisResult.suggestedCategory}</Badge>} /><DetailRow label="Suggested Technician" value={<Badge variant="secondary">{analysisResult.suggestedTechnician}</Badge>} /><DetailRow label="Confidence" value={`${(analysisResult.confidenceLevel * 100).toFixed(0)}%`} /><div><h3 className="font-semibold mb-2 text-muted-foreground">Reasoning</h3><p className="p-3 bg-secondary/50 rounded-md">{analysisResult.reasoning}</p></div></div>)}
            <AlertDialogFooter><AlertDialogAction onClick={() => setIsAnalysisDialogOpen(false)}>Close</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 font-headline"><FileText className="h-6 w-6 text-primary" />AI Ticket Summary</AlertDialogTitle><AlertDialogDescription>{isSummarizing ? "Gemini is summarizing the ticket..." : "A quick summary of the ticket."}</AlertDialogDescription></AlertDialogHeader>
            {isSummarizing ? ( <div className="flex justify-center items-center h-48"><div className="flex items-center gap-2 text-muted-foreground"><div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div><div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div><div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div></div></div>)
             : (<div className="text-sm space-y-2"><ul className="list-disc list-inside text-muted-foreground">{summary.split('\n').map((item, i) => item.length > 1 && <li key={i}>{item.replace(/^- /, '')}</li>)}</ul></div>)}
            <AlertDialogFooter><AlertDialogAction onClick={() => setIsSummaryDialogOpen(false)}>Close</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

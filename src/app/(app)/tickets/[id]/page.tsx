
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
import { assets as allAssets, clients, tickets } from '@/lib/placeholder-data';
import type { Asset, Ticket, Client } from '@/lib/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { analyzeTicket, type AnalyzeTicketOutput } from '@/ai/flows/ticket-insights';
import { generateKnowledgeBaseArticle } from '@/ai/flows/knowledge-base-article-generation';
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
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const AssetRow = ({ asset }: { asset: Asset }) => {
  return (
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
};


export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const ticket = tickets.find(t => t.id === params.id);
  const client = ticket ? clients.find(c => c.name === ticket.client) : undefined;
  const associatedAssets = ticket ? allAssets.filter(a => ticket.associatedAssets?.includes(a.id)) : [];

  const [analysisResult, setAnalysisResult] = useState<AnalyzeTicketOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ticket Not Found</CardTitle>
            <CardDescription>The requested ticket could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/tickets">
              <Button>Back to Tickets</Button>
            </Link>
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
      const ticketContent = `Subject: ${ticket.subject}\n\nDescription: ${ticket.description}`;
      const result = await analyzeTicket({ ticketContent });
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
  
  const handleCreateArticle = async () => {
    if (!ticket) return;

    setIsGeneratingArticle(true);
    toast({
      title: 'Generating Knowledge Base Article...',
      description: 'Gemini is working on it. Please wait.',
    });

    try {
        const resolutionActivity = ticket.activity.find(a => ticket.status === 'Resolved' || ticket.status === 'Closed' ? a.activity.toLowerCase().includes('resolve') || a.activity.toLowerCase().includes('close') : false)
                                    ?.activity || 'No specific resolution comment found. The issue was resolved.';

        const articlePrompt = `Ticket Subject: ${ticket.subject}\nTicket Description: ${ticket.description}\nTicket Resolution: ${resolutionActivity}`;
        
        const result = await generateKnowledgeBaseArticle({
            prompt: articlePrompt,
            useWebSearch: false,
        });

        toast({
            title: 'Article Generated!',
            description: 'Redirecting you to the new article page to review and save.',
        });

        const params = new URLSearchParams();
        params.set('title', result.title);
        params.set('content', result.content);
        router.push(`/knowledge-base/new?${params.toString()}`);

    } catch (error) {
        console.error("AI Article Generation failed:", error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'The AI failed to generate the article. Please try again.',
        });
    } finally {
        setIsGeneratingArticle(false);
    }
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
               <Link href="/tickets">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back to tickets</span>
                    </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{ticket.subject}</h1>
            </div>
            <p className="text-muted-foreground ml-12">
              Ticket <span className="font-mono">{ticket.id}</span> opened by <span className="font-medium text-foreground">{ticket.activity[0]?.user || 'Unknown'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Reply
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAnalysis}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>AI Insights</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>Change Status</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Assign Technician</span>
                </DropdownMenuItem>
                 <DropdownMenuItem>
                  <Paperclip className="mr-2 h-4 w-4" />
                  <span>Add Attachment</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border -mt-2">
                        <DetailRow label="Status" value={<Badge variant={getStatusVariant(ticket.status)} style={ticket.status === 'Resolved' ? { backgroundColor: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))'} : {}}>{ticket.status}</Badge>} />
                        <DetailRow label="Priority" value={<Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>} />
                        <DetailRow label="Client" value={<Link href="#" className="font-medium text-primary hover:underline">{client?.name}</Link>} />
                        <DetailRow label="Assignee" value={ticket.assignee} icon={User} />
                        <DetailRow label="Created" value={ticket.createdDate} icon={Clock} />
                    </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Associated Assets</CardTitle>
                    <CardDescription>Hardware linked to this ticket.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {associatedAssets.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead className="hidden sm:table-cell">Type</TableHead>
                              <TableHead>Security</TableHead>
                              <TableHead><span className="sr-only">View</span></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {associatedAssets.map(asset => <AssetRow key={asset.id} asset={asset} />)}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-8">
                           <HardDrive className="mx-auto h-8 w-8 mb-2" />
                           No associated assets.
                        </div>
                      )}
                  </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Tabs defaultValue="activity" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="activity">Activity &amp; Notes</TabsTrigger>
                        <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Full Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Activity Feed</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {ticket.activity.map((item, index) => (
                              <div key={index} className="flex gap-4">
                                 <Avatar>
                                    <AvatarImage src={getAvatarForUser(item.user)} alt={item.user} data-ai-hint="user avatar" />
                                    <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">{item.user}</span>
                                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                                  </div>
                                  <div className="p-3 mt-1 rounded-md bg-secondary/50 text-sm text-foreground">
                                    <p className="whitespace-pre-wrap">{item.activity}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                          <CardFooter>
                             <div className="w-full flex gap-4">
                                <Avatar>
                                    <AvatarImage src="https://placehold.co/40x40.png" alt="Current User" data-ai-hint="user avatar"/>
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div className="w-full space-y-2">
                                    <Textarea placeholder="Add a comment or internal note..." rows={3} />
                                    <div className="flex justify-end gap-2">
                                       <Button variant="outline">Add Internal Note</Button>
                                       <Button>Reply to Client</Button>
                                    </div>
                                </div>
                             </div>
                          </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="kb">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookText className="h-5 w-5" />
                                    Knowledge Base
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Link this ticket to an existing article or generate a new one from the resolution.
                                </p>
                                <div className="space-y-4">
                                    <Button 
                                        onClick={handleCreateArticle} 
                                        disabled={isGeneratingArticle}
                                        className="w-full"
                                    >
                                        {isGeneratingArticle ? 'Generating...' : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Create Article from Ticket
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </div>
      
       <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI Ticket Insights
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {isAnalyzing
                        ? "Gemini is analyzing the ticket... Please wait."
                        : "Here are the insights based on the ticket content."}
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
                <div className="text-sm space-y-4">
                    <DetailRow label="Suggested Category" value={<Badge variant="secondary">{analysisResult.suggestedCategory}</Badge>} />
                    <DetailRow label="Suggested Technician" value={<Badge variant="secondary">{analysisResult.suggestedTechnician}</Badge>} />
                    <DetailRow label="Confidence" value={`${(analysisResult.confidenceLevel * 100).toFixed(0)}%`} />
                    <div>
                        <h3 className="font-semibold mb-2 text-muted-foreground">Reasoning</h3>
                        <p className="p-3 bg-secondary/50 rounded-md">{analysisResult.reasoning}</p>
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

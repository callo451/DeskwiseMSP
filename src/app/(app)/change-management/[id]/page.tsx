
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { assets as allAssets, tickets as allTickets, clients as allClients } from '@/lib/placeholder-data';
import type { Asset, ChangeRequest, Ticket } from '@/lib/types';
import { ChevronLeft, User, FileText, Activity, AlertTriangle, Shield, Calendar, HardDrive, Ticket as TicketIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSidebar } from '@/components/ui/sidebar';

const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode, icon?: React.ElementType }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-4 py-3 text-sm">
      <div className="col-span-1 flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="col-span-2 font-medium text-left">{value}</div>
    </div>
  );
};

const AssetRow = ({ asset }: { asset: Asset }) => (
    <TableRow>
        <TableCell><Link href={`/assets/${asset.id}`} className="font-medium text-primary hover:underline">{asset.name}</Link></TableCell>
        <TableCell>{asset.type}</TableCell>
        <TableCell>{asset.status}</TableCell>
        <TableCell className="text-right"><Button variant="ghost" size="icon" asChild><Link href={`/assets/${asset.id}`}><ChevronRight className="h-4 w-4" /></Link></Button></TableCell>
    </TableRow>
);

const TicketRow = ({ ticket }: { ticket: Ticket }) => (
    <TableRow>
        <TableCell><Link href={`/tickets/${ticket.id}`} className="font-medium text-primary hover:underline">{ticket.id}</Link></TableCell>
        <TableCell>{ticket.subject}</TableCell>
        <TableCell>{ticket.status}</TableCell>
        <TableCell className="text-right"><Button variant="ghost" size="icon" asChild><Link href={`/tickets/${ticket.id}`}><ChevronRight className="h-4 w-4" /></Link></Button></TableCell>
    </TableRow>
);

export default function ChangeRequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isInternalITMode } = useSidebar();
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChange();
  }, [params.id]);

  const fetchChange = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/change-requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setChange(data);
      } else if (response.status === 404) {
        setChange(null);
      } else {
        console.error('Failed to fetch change request');
      }
    } catch (error) {
      console.error('Error fetching change request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading change request...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!change) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Request Not Found</CardTitle>
          <CardDescription>The requested change could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()}><ChevronLeft className="mr-2 h-4 w-4" /> Go Back</Button>
        </CardContent>
      </Card>
    );
  }
  
  const client = allClients.find(c => c.name === change.client);
  const associatedAssets = allAssets.filter(a => change.associatedAssets.includes(a.id));
  const associatedTickets = allTickets.filter(t => change.associatedTickets.includes(t.id));
  
  const getStatusVariant = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'Pending Approval': return 'secondary';
      case 'Approved': return 'default';
      case 'In Progress': return 'default';
      case 'Completed': return 'outline';
      case 'Rejected':
      case 'Cancelled': return 'destructive';
    }
  };

  const getRiskVariant = (risk: ChangeRequest['riskLevel']) => {
    switch (risk) {
      case 'Low': return 'outline';
      case 'Medium': return 'secondary';
      case 'High': return 'default';
      case 'Critical': return 'destructive';
    }
  };
  
  const getImpactVariant = (impact: ChangeRequest['impact']) => {
    switch (impact) {
      case 'Low': return 'outline';
      case 'Medium': return 'secondary';
      case 'High': return 'default';
    }
  };


  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <Button asChild variant="outline" size="icon" className="h-8 w-8">
                  <Link href="/change-management"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back to changes</span></Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{change.title}</h1>
            </div>
            <p className="text-muted-foreground ml-12">
              Change Request <span className="font-mono">{change.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Edit Change</Button>
            <Button>Approve</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                <CardContent className="divide-y divide-border -mt-2">
                    <DetailRow label="Status" icon={Activity} value={<Badge variant={getStatusVariant(change.status)}>{change.status}</Badge>} />
                    {!isInternalITMode && <DetailRow label="Client" icon={User} value={<Link href={`/clients/${client?.id}`} className="font-medium text-primary hover:underline">{client?.name}</Link>} />}
                    <DetailRow label="Risk Level" icon={AlertTriangle} value={<Badge variant={getRiskVariant(change.riskLevel)}>{change.riskLevel}</Badge>} />
                    <DetailRow label="Impact" icon={Shield} value={<Badge variant={getImpactVariant(change.impact)}>{change.impact}</Badge>} />
                    <DetailRow label="Planned Start" icon={Calendar} value={format(new Date(change.plannedStartDate), 'PPpp')} />
                    <DetailRow label="Planned End" icon={Calendar} value={format(new Date(change.plannedEndDate), 'PPpp')} />
                    <DetailRow label="Submitted By" icon={User} value={change.submittedBy} />
                </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5"/>Associated Assets</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">View</span></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {associatedAssets.length > 0 ? (
                      associatedAssets.map(asset => <AssetRow key={asset.id} asset={asset} />)
                    ) : (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center">No associated assets.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

             <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TicketIcon className="h-5 w-5"/>Associated Tickets</CardTitle></CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">View</span></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {associatedTickets.length > 0 ? (
                      associatedTickets.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)
                    ) : (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center">No associated tickets.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{change.description}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Change Plan</CardTitle></CardHeader>
              <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{change.changePlan}</ReactMarkdown></div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Rollback Plan</CardTitle></CardHeader>
              <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{change.rollbackPlan}</ReactMarkdown></div></CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

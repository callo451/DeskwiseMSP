
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { majorIncidents, clients as allClients } from '@/lib/placeholder-data';
import type { MajorIncident } from '@/lib/types';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import {
  Flame,
  ChevronLeft,
  Rss,
  Building,
  CheckCircle,
  Clock,
  Send,
  Globe,
  PlusCircle,
  XCircle,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode, icon?: React.ElementType }) => (
  <div className="flex justify-between items-center py-3 text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </div>
    <div className="font-medium text-right">{value}</div>
  </div>
);

const TimelineNode = ({ update, isLast = false }: { update: MajorIncident['updates'][0], isLast?: boolean }) => {
    const getStatusInfo = (status: MajorIncident['status']) => {
        switch(status) {
            case 'Investigating': return { color: 'bg-yellow-500', icon: Info };
            case 'Identified': return { color: 'bg-blue-500', icon: Info };
            case 'Monitoring': return { color: 'bg-purple-500', icon: Info };
            case 'Resolved': return { color: 'bg-green-500', icon: CheckCircle };
            default: return { color: 'bg-gray-500', icon: Info };
        }
    };
    const { color, icon: Icon } = getStatusInfo(update.status);

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${color} text-white`}>
                    <Icon className="h-5 w-5" />
                </div>
                {!isLast && <div className="w-px h-full bg-border mt-2" />}
            </div>
            <div className="flex-1 pb-8">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground">
                        Status updated to <span className="font-bold">{update.status}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(parseISO(update.timestamp), 'PPpp')}
                    </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{update.message}</p>
            </div>
        </div>
    )
};


export default function IncidentDetailsPage() {
  const params = useParams<{ id: string }>();
  const incident = majorIncidents.find(i => i.id === params.id);

  if (!incident) {
    return <Card><CardHeader><CardTitle>Incident Not Found</CardTitle></CardHeader></Card>;
  }

  const getStatusVariant = (status: MajorIncident['status']) => {
    switch (status) {
      case 'Investigating': return 'secondary';
      case 'Identified': return 'default';
      case 'Monitoring': return 'default';
      case 'Resolved': return 'outline';
    }
  };
  
  const getStatusColor = (status: MajorIncident['status']) => {
     switch (status) {
      case 'Investigating': return 'text-yellow-500';
      case 'Identified': return 'text-blue-500';
      case 'Monitoring': return 'text-purple-500';
      case 'Resolved': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const affectedClients = incident.affectedClients.includes('All') 
    ? [{ id: 'all', name: 'All Clients' }] 
    : incident.affectedClients.map(id => allClients.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="outline" size="icon" className="h-8 w-8">
              <Link href="/incidents"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">{incident.title}</h1>
            <Badge variant={getStatusVariant(incident.status)} className={`capitalize ${getStatusColor(incident.status)} border-current`}>
                <Flame className="h-3 w-3 mr-1.5" />
                {incident.status}
            </Badge>
          </div>
          <p className="text-muted-foreground ml-12">
            Incident <span className="font-mono">{incident.id}</span> started {formatDistanceToNow(parseISO(incident.startedAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border -mt-2">
              <DetailRow label="Started At" value={format(parseISO(incident.startedAt), 'PPpp')} icon={Clock} />
              <DetailRow label="Resolved At" value={incident.resolvedAt ? format(parseISO(incident.resolvedAt), 'PPpp') : 'Ongoing'} icon={CheckCircle} />
              <DetailRow label="Visibility" value={incident.isPublished ? "Published" : "Internal"} icon={incident.isPublished ? Globe : Rss} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Impact</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <h4 className="font-medium text-sm">Affected Services</h4>
              <div className="flex flex-wrap gap-1">
                {incident.affectedServices.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
               <h4 className="font-medium text-sm pt-4">Affected Clients</h4>
              <div className="flex flex-wrap gap-1">
                {affectedClients.map(c => <Badge key={c!.id} variant="outline">{c!.name}</Badge>)}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Post an Update</CardTitle>
                <CardDescription>Publish a new update to the incident timeline. This will be visible on the client status page if the incident is published.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">New Status</label>
                        <Select defaultValue={incident.status}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Investigating">Investigating</SelectItem>
                                <SelectItem value="Identified">Identified</SelectItem>
                                <SelectItem value="Monitoring">Monitoring</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
                 <Textarea placeholder="Type your update message here..." rows={4} />
                 <div className="flex justify-end">
                    <Button><Send className="mr-2 h-4 w-4" /> Post Update</Button>
                 </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Timeline & Updates</CardTitle></CardHeader>
            <CardContent>
              {incident.updates.map((update, index) => (
                <TimelineNode key={update.id} update={update} isLast={index === incident.updates.length - 1} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

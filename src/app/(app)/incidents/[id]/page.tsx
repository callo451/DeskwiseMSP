
'use client';

import React, { useState, useEffect } from 'react';
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
import type { MajorIncident, MajorIncidentUpdate } from '@/lib/types';
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
  Info,
  Edit,
  Save,
  X,
  Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode, icon?: React.ElementType }) => (
  <div className="flex justify-between items-center py-3 text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </div>
    <div className="font-medium text-right">{value}</div>
  </div>
);

const TimelineNode = ({ update, isLast = false, isEditing, onUpdateChange, onUpdateDelete }: { 
    update: MajorIncident['updates'][0], 
    isLast?: boolean,
    isEditing: boolean;
    onUpdateChange: (updateId: string, message: string) => void;
    onUpdateDelete: (updateId: string) => void;
}) => {
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
            <div className="flex-1 pb-8 group">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground">
                        Status updated to <span className="font-bold">{update.status}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                          {format(parseISO(update.timestamp), 'PPpp')}
                      </p>
                      {isEditing && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => onUpdateDelete(update.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                </div>
                {isEditing ? (
                  <Textarea value={update.message} onChange={(e) => onUpdateChange(update.id, e.target.value)} className="mt-2" />
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{update.message}</p>
                )}
            </div>
        </div>
    )
};


export default function IncidentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const originalIncident = majorIncidents.find(i => i.id === params.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [incident, setIncident] = useState(originalIncident);
  
  useEffect(() => {
    setIncident(originalIncident);
    if (!originalIncident) {
        setIsEditing(false);
    }
  }, [originalIncident]);

  if (!incident) {
    return <Card><CardHeader><CardTitle>Incident Not Found</CardTitle></CardHeader></Card>;
  }

  const handleSave = () => {
    setIsEditing(false);
    // Here you would normally make an API call to save the `incident` state
    console.log("Saving incident:", incident);
    toast({
      title: "Incident Saved",
      description: `Changes to "${incident.title}" have been saved.`,
    });
  };

  const handleCancel = () => {
    setIncident(originalIncident);
    setIsEditing(false);
  };

  const handleUpdateChange = (updateId: string, message: string) => {
    setIncident(prev => prev ? { ...prev, updates: prev.updates.map(u => u.id === updateId ? {...u, message} : u)} : prev);
  };

  const handleUpdateDelete = (updateId: string) => {
    setIncident(prev => prev ? { ...prev, updates: prev.updates.filter(u => u.id !== updateId) } : prev);
  };

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
  
  const allServices = ['Email Hosting', 'Microsoft 365', 'Internet', 'VPN', 'Internal Network', 'Deskwise Application'];
  const affectedClients = incident.affectedClients.includes('All') 
    ? [{ id: 'all', name: 'All Clients' }] 
    : incident.affectedClients.map(id => allClients.find(c => c.id === id)).filter(Boolean) as { id: string, name: string }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="outline" size="icon" className="h-8 w-8">
              <Link href="/incidents"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
            </Button>
            {isEditing ? (
              <Input value={incident.title} onChange={(e) => setIncident({...incident, title: e.target.value})} className="text-2xl h-11 font-bold font-headline" />
            ) : (
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{incident.title}</h1>
            )}
            <Badge variant={getStatusVariant(incident.status)} className={`capitalize ${getStatusColor(incident.status)} border-current`}>
                <Flame className="h-3 w-3 mr-1.5" />
                {incident.status}
            </Badge>
          </div>
          <p className="text-muted-foreground ml-12">
            Incident <span className="font-mono">{incident.id}</span> started {formatDistanceToNow(parseISO(incident.startedAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
            {isEditing ? (
                <>
                    <Button variant="ghost" onClick={handleCancel}><X className="mr-2 h-4 w-4" />Cancel</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                </>
            ) : (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit Incident</Button>
            )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border -mt-2">
              <DetailRow label="Started At" value={format(parseISO(incident.startedAt), 'PPpp')} icon={Clock} />
              <DetailRow label="Resolved At" value={incident.resolvedAt ? format(parseISO(incident.resolvedAt), 'PPpp') : 'Ongoing'} icon={CheckCircle} />
              <div className="py-3">
                 <FormField
                    control={null as any}
                    name="isPublished"
                    render={() => (
                        <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2 text-sm text-muted-foreground"><Globe className="h-4 w-4" />Visibility</FormLabel>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{incident.isPublished ? "Published" : "Internal"}</span>
                                {isEditing && <Switch checked={incident.isPublished} onCheckedChange={(checked) => setIncident({...incident, isPublished: checked})} />}
                            </div>
                        </FormItem>
                    )}
                 />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Impact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Affected Services</Label>
                {isEditing ? (
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                <div className="flex gap-1 flex-wrap">
                                    {incident.affectedServices.length > 0 ? incident.affectedServices.map(s => <Badge variant="secondary" key={s}>{s}</Badge>) : "Select services..."}
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search services..." />
                                <CommandList>
                                    <CommandEmpty>No services found.</CommandEmpty>
                                    <CommandGroup>
                                        {allServices.map((service) => (
                                            <CommandItem key={service} onSelect={() => {
                                                const newSelection = incident.affectedServices.includes(service) ? incident.affectedServices.filter(s => s !== service) : [...incident.affectedServices, service];
                                                setIncident({...incident, affectedServices: newSelection});
                                            }}><CheckCircle className={cn("mr-2 h-4 w-4", incident.affectedServices.includes(service) ? "opacity-100" : "opacity-0")} />{service}</CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {incident.affectedServices.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                )}
              </div>
              <div>
                <Label>Affected Clients</Label>
                 {isEditing ? (
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                <div className="flex gap-1 flex-wrap">
                                    {affectedClients.length > 0 ? affectedClients.map(c => <Badge variant="outline" key={c.id}>{c.name}</Badge>) : "Select clients..."}
                                </div>
                            </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search clients..." />
                                <CommandList>
                                    <CommandEmpty>No clients found.</CommandEmpty>
                                    <CommandGroup>
                                         <CommandItem onSelect={() => setIncident({...incident, affectedClients: ['All']})}><CheckCircle className={cn("mr-2 h-4 w-4", incident.affectedClients.includes('All') ? "opacity-100" : "opacity-0")} />All Clients</CommandItem>
                                        {allClients.map((client) => (
                                            <CommandItem key={client.id} onSelect={() => {
                                                const currentSelection = incident.affectedClients.filter(c => c !== 'All');
                                                const newSelection = currentSelection.includes(client.id) ? currentSelection.filter(id => id !== client.id) : [...currentSelection, client.id];
                                                setIncident({...incident, affectedClients: newSelection});
                                            }}><CheckCircle className={cn("mr-2 h-4 w-4", incident.affectedClients.includes(client.id) ? "opacity-100" : "opacity-0")} />{client.name}</CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {affectedClients.map(c => <Badge key={c!.id} variant="outline">{c!.name}</Badge>)}
                  </div>
                )}
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
              {incident.updates.length > 0 ? (
                  incident.updates.map((update, index) => (
                    <TimelineNode 
                        key={update.id} 
                        update={update} 
                        isLast={index === incident.updates.length - 1}
                        isEditing={isEditing}
                        onUpdateChange={handleUpdateChange}
                        onUpdateDelete={handleUpdateDelete}
                     />
                  ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No updates have been posted for this incident yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

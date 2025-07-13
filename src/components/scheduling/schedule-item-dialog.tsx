
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { users, clients } from '@/lib/placeholder-data';
import type { ScheduleItem, User, Ticket } from '@/lib/types';
import { format, parse } from 'date-fns';
import { Ticket as TicketIcon, Edit, X, Save, Calendar, User as UserIcon, Building, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface ScheduleItemDialogProps {
  item: ScheduleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
}

const DetailRow = ({ label, value, icon: Icon, isEditing, children, className }: { label: string; value?: React.ReactNode, icon?: React.ElementType, isEditing?: boolean, children?: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("grid grid-cols-3 items-start gap-4 py-3", className)}>
      <div className="col-span-1 flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="col-span-2 text-sm font-medium">
        {isEditing ? children : value}
      </div>
    </div>
  );
};


export function ScheduleItemDialog({ item, isOpen, onClose, onSave }: ScheduleItemDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  useEffect(() => {
    setEditedItem(item);
    setIsEditing(false); // Reset edit mode when item changes
    
    // Fetch ticket data if ticketId exists
    if (item.ticketId) {
      fetchTicketData(item.ticketId);
    } else {
      setTicket(null);
    }
  }, [item]);

  const fetchTicketData = async (ticketId: string) => {
    try {
      setLoadingTicket(true);
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const ticketData = await response.json();
        setTicket(ticketData);
      } else {
        setTicket(null);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setTicket(null);
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSave = () => {
    onSave(editedItem);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  const technician = users.find(u => u.id === item.technicianId);
  const client = item.clientId ? clients.find(c => c.id === item.clientId) : null;

  const startDateTime = parse(item.start, 'yyyy-MM-dd HH:mm', new Date());
  const endDateTime = parse(item.end, 'yyyy-MM-dd HH:mm', new Date());

  const typeColor = {
    'Ticket': 'text-blue-500',
    'Meeting': 'text-purple-500',
    'Time Off': 'text-gray-500',
    'Appointment': 'text-green-500',
  }[item.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-headline">
                {isEditing ? (
                  <Input 
                    value={editedItem.title} 
                    onChange={e => setEditedItem({...editedItem, title: e.target.value})}
                    className="text-2xl font-headline h-9"
                   />
                ) : (
                  item.title
                )}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <Badge variant="outline" className={cn("border-current", typeColor)}>{item.type}</Badge>
              </DialogDescription>
            </div>
            {!isEditing && <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>}
          </div>
        </DialogHeader>
        
        <div className="divide-y divide-border -mx-6 px-6">
            <DetailRow label="Technician" icon={UserIcon} value={technician?.name} isEditing={isEditing}>
                <Select value={editedItem.technicianId} onValueChange={val => setEditedItem({...editedItem, technicianId: val})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {users.filter(u => u.role === 'Technician' || u.role === 'Administrator').map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </DetailRow>

            {item.type === 'Appointment' && (
                <DetailRow label="Client" icon={Building} value={client?.name} isEditing={isEditing}>
                    <Select value={editedItem.clientId} onValueChange={val => setEditedItem({...editedItem, clientId: val})}>
                        <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                        <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </DetailRow>
            )}

             {item.type === 'Meeting' && (
                <DetailRow label="Participants" icon={Users} value={(item.participants || []).join(', ')} isEditing={isEditing}>
                   <Input value={(editedItem.participants || []).join(', ')} onChange={e => setEditedItem({...editedItem, participants: e.target.value.split(',').map(p => p.trim())})} placeholder="Comma-separated names" />
                </DetailRow>
            )}

            <DetailRow label="Date" icon={Calendar} value={format(startDateTime, 'MMMM dd, yyyy')} isEditing={isEditing}>
                <Input type="date" value={format(parse(editedItem.start, 'yyyy-MM-dd HH:mm', new Date()), 'yyyy-MM-dd')} onChange={e => setEditedItem({...editedItem, start: `${e.target.value} ${format(startDateTime, 'HH:mm')}`, end: `${e.target.value} ${format(endDateTime, 'HH:mm')}` })}/>
            </DetailRow>

            <DetailRow label="Time" icon={Clock} value={`${format(startDateTime, 'h:mm a')} - ${format(endDateTime, 'h:mm a')}`} isEditing={isEditing}>
                <div className="flex items-center gap-2">
                    <Input type="time" value={format(parse(editedItem.start, 'yyyy-MM-dd HH:mm', new Date()), 'HH:mm')} onChange={e => setEditedItem({...editedItem, start: `${format(startDateTime, 'yyyy-MM-dd')} ${e.target.value}`})} />
                    <span>-</span>
                    <Input type="time" value={format(parse(editedItem.end, 'yyyy-MM-dd HH:mm', new Date()), 'HH:mm')} onChange={e => setEditedItem({...editedItem, end: `${format(endDateTime, 'yyyy-MM-dd')} ${e.target.value}`})} />
                </div>
            </DetailRow>

            <DetailRow label="Notes" icon={Edit} value={item.notes || 'N/A'} isEditing={isEditing} className="items-start">
               <Textarea value={editedItem.notes} onChange={e => setEditedItem({...editedItem, notes: e.target.value})} rows={4} placeholder="Add notes..."/>
            </DetailRow>
        </div>

        <DialogFooter className="sm:justify-between pt-4">
            <div className="flex gap-2">
                 {loadingTicket ? (
                   <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                 ) : ticket ? (
                   <Button variant="outline" size="sm" asChild>
                     <Link href={`/tickets/${ticket.id}`}>
                       <TicketIcon className="mr-2 h-4 w-4" /> Go to Ticket
                     </Link>
                   </Button>
                 ) : item.ticketId ? (
                   <Button variant="outline" size="sm" disabled>
                     <TicketIcon className="mr-2 h-4 w-4" /> Ticket Not Found
                   </Button>
                 ) : null}
            </div>
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button variant="ghost" onClick={handleCancel}><X className="mr-2 h-4 w-4" /> Cancel</Button>
                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
                    </>
                ) : (
                    <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

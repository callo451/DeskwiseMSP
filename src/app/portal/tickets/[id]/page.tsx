'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { tickets as allTickets, clients as allClients } from '@/lib/placeholder-data';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MessageSquare, Paperclip, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import type { Ticket } from '@/lib/types';
import Link from 'next/link';

// For demonstration, we assume the logged-in client is 'TechCorp'.
const CURRENT_CLIENT_NAME = 'TechCorp';

export default function ClientTicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const ticket = allTickets.find(
    (t) => t.id === params.id && t.client === CURRENT_CLIENT_NAME
  );
  
  const client = ticket ? allClients.find(c => c.name === ticket.client) : undefined;
  
  const getAvatarForUser = (userName: string) => {
      const initials = userName.split(' ').map(n => n[0]).join('');
      if (userName === 'Alice') return "https://placehold.co/40x40/F87171/FFFFFF.png";
      if (userName === 'Bob') return "https://placehold.co/40x40/60A5FA/FFFFFF.png";
      if (userName === 'Charlie') return "https://placehold.co/40x40/34D399/FFFFFF.png";
      if (userName === 'Jane Doe') return "https://placehold.co/40x40/c2410c/FFFFFF.png"
      return "https://placehold.co/40x40/A3A3A3/FFFFFF.png";
  }

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


  if (!ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket Not Found</CardTitle>
          <CardDescription>
            This ticket could not be found or you do not have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.push('/portal/tickets')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Tickets
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{ticket.subject}</CardTitle>
              <CardDescription>
                Ticket #{ticket.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Conversation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {ticket.activity.map((item, index) => (
                        <div key={index} className="flex gap-4">
                            <Avatar><AvatarImage src={getAvatarForUser(item.user)} alt={item.user} data-ai-hint="user avatar" /><AvatarFallback>{item.user.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-1">
                            <div className="flex justify-between items-center"><span className="font-semibold text-sm">{item.user}</span><span className="text-xs text-muted-foreground">{item.timestamp}</span></div>
                            <div className="p-3 mt-1 rounded-md bg-secondary/50 text-foreground text-sm"><p className="whitespace-pre-wrap">{item.activity}</p></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
                 <CardContent>
                    <div className="w-full flex gap-4">
                        <Avatar>
                            <AvatarImage src={getAvatarForUser('Jane Doe')} alt="Current User" data-ai-hint="user avatar" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                            <Textarea placeholder="Add a reply..." rows={3} />
                            <div className="flex justify-between items-center">
                                <Button variant="outline" size="icon">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="sr-only">Attach file</span>
                                </Button>
                                <Button>Send Reply</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(ticket.status)} style={ticket.status === 'Resolved' ? { backgroundColor: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))'} : {}}>{ticket.status}</Badge>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Technician</span>
                        <span className="font-medium">{ticket.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{ticket.createdDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Update</span>
                        <span className="font-medium">{ticket.lastUpdate}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
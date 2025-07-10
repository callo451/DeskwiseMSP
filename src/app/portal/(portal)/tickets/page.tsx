
'use client';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tickets as allTickets, contacts as allContacts } from '@/lib/placeholder-data';
import type { Ticket } from '@/lib/types';
import { ChevronRight, PlusCircle } from 'lucide-react';
import Link from 'next/link';

// For demonstration, we assume the logged-in client and user.
const CURRENT_CLIENT_NAME = 'TechCorp';
const CURRENT_USER_NAME = 'Jane Doe';

// Find the current user and check their permissions
const currentUser = allContacts.find(c => c.name === CURRENT_USER_NAME && c.client === CURRENT_CLIENT_NAME);
const canViewOrgTickets = currentUser?.canViewOrgTickets || false;

const TicketRow = ({ ticket }: { ticket: Ticket }) => {
  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'Open':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Resolved':
        return 'default'; // Using default for resolved to be visible
      case 'Closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/portal/tickets/${ticket.id}`} className="text-primary hover:underline">
          {ticket.id}
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/portal/tickets/${ticket.id}`} className="hover:underline">
          {ticket.subject}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge
          variant={getStatusVariant(ticket.status)}
          style={
            ticket.status === 'Resolved'
              ? {
                  backgroundColor: 'hsl(var(--success))',
                  color: 'hsl(var(--success-foreground))',
                }
              : {}
          }
        >
          {ticket.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{ticket.lastUpdate}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/portal/tickets/${ticket.id}`}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">View Ticket</span>
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default function ClientTicketsPage() {
  const clientTickets = allTickets.filter(
    (ticket) => {
      if (ticket.client !== CURRENT_CLIENT_NAME) return false;
      if (canViewOrgTickets) return true; // Show all org tickets if permission is granted
      return ticket.activity[0]?.user === CURRENT_USER_NAME; // Otherwise, show only user's own tickets
    }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{canViewOrgTickets ? 'Organization Tickets' : 'My Tickets'}</CardTitle>
          <CardDescription>
            {canViewOrgTickets 
              ? `All support requests for ${CURRENT_CLIENT_NAME}.`
              : 'Track and manage the support requests you have created.'
            }
          </CardDescription>
        </div>
        <Link href="/portal/tickets/new">
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Ticket
              </span>
            </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Update</TableHead>
              <TableHead>
                <span className="sr-only">View</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientTickets.length > 0 ? (
              clientTickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  You have not created any tickets yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tickets } from '@/lib/placeholder-data';
import type { Ticket } from '@/lib/types';
import { File, ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const TicketRow = ({ ticket }: { ticket: Ticket }) => {
  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'Open': return 'default';
      case 'In Progress': return 'secondary';
      case 'On Hold': return 'outline';
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


  return (
    <TableRow>
       <TableCell className="font-medium">{ticket.id}</TableCell>
      <TableCell>
        <div className="font-medium">{ticket.subject}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {ticket.client}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{ticket.assignee}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getPriorityVariant(ticket.priority)} className="capitalize">{ticket.priority}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getStatusVariant(ticket.status)} className="capitalize"
          style={ticket.status === 'Resolved' ? { backgroundColor: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))'} : {}}
        >{ticket.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{ticket.createdDate}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Assign</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function TicketsPage() {
  const ticketStatuses = ['All', 'Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>Create and track all service requests.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
            </Button>
            <Link href="/tickets/new">
                <Button size="sm" className="h-7 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Ticket</span>
                </Button>
            </Link>
          </div>
        </div>
         <Tabs defaultValue="All" className="pt-4">
              <TabsList>
                  {ticketStatuses.map(status => (
                      <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
                  ))}
              </TabsList>
          </Tabs>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Subject / Client</TableHead>
              <TableHead className="hidden sm:table-cell">Assignee</TableHead>
              <TableHead className="hidden sm:table-cell">Priority</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(ticket => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tickets, ticketPageStats, ticketQueues } from '@/lib/placeholder-data';
import type { Ticket, DashboardStat } from '@/lib/types';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

const TicketRow = ({ ticket }: { ticket: Ticket }) => {
  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'Open':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'On Hold':
        return 'outline';
      case 'Resolved':
        return 'default';
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
      <TableCell>
        <Link href={`/tickets/${ticket.id}`} className="font-medium text-primary hover:underline">
            {ticket.id}
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">
            {ticket.subject}
        </Link>
        <div className="hidden text-sm text-muted-foreground md:inline ml-2">
          - {ticket.client}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{ticket.queue}</TableCell>
      <TableCell className="hidden sm:table-cell">{ticket.assignee}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getPriorityVariant(ticket.priority)} className="capitalize">
          {ticket.priority}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge
          variant={getStatusVariant(ticket.status)}
          className="capitalize"
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
            <DropdownMenuItem asChild>
              <Link href={`/tickets/${ticket.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Assign</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const StatCard = ({ stat }: { stat: DashboardStat }) => {
  const isIncrease = stat.changeType === 'increase';
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span
            className={`flex items-center mr-1 ${
              isIncrease ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isIncrease ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {stat.change}
          </span>
          {stat.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default function TicketsPage() {
  const searchParams = useSearchParams();
  const ticketStatuses = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
  const ticketPriorities = ['Low', 'Medium', 'High', 'Critical'];
  const queues = ticketQueues;

  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [queueFilters, setQueueFilters] = useState<string[]>([]);
  
  useEffect(() => {
    const queueParam = searchParams.get('queue');
    if (queueParam) {
      setQueueFilters([queueParam]);
    }
  }, [searchParams]);

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setStatusFilters(prev =>
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  const handlePriorityFilterChange = (priority: string, checked: boolean) => {
    setPriorityFilters(prev =>
      checked ? [...prev, priority] : prev.filter(p => p !== priority)
    );
  };

  const handleQueueFilterChange = (queue: string, checked: boolean) => {
    setQueueFilters(prev =>
      checked ? [...prev, queue] : prev.filter(q => q !== queue)
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setQueueFilters([]);
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = statusFilters.length === 0 || statusFilters.includes(ticket.status);
    const priorityMatch =
      priorityFilters.length === 0 || priorityFilters.includes(ticket.priority);
    const queueMatch = queueFilters.length === 0 || queueFilters.includes(ticket.queue);
    return statusMatch && priorityMatch && queueMatch;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {ticketPageStats.map(stat => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>
                Create and track all service requests.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Queue</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {queues.map(queue => (
                    <DropdownMenuCheckboxItem
                      key={queue}
                      checked={queueFilters.includes(queue)}
                      onCheckedChange={checked =>
                        handleQueueFilterChange(queue, !!checked)
                      }
                    >
                      {queue}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ticketStatuses.map(status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={checked =>
                        handleStatusFilterChange(status, !!checked)
                      }
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                  {ticketPriorities.map(priority => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={priorityFilters.includes(priority)}
                      onCheckedChange={checked =>
                        handlePriorityFilterChange(priority, !!checked)
                      }
                    >
                      {priority}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>Clear Filters</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Link href="/tickets/new">
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Ticket
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Subject / Client</TableHead>
                <TableHead className="hidden sm:table-cell">Queue</TableHead>
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
              {filteredTickets.map(ticket => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

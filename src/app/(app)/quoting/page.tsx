
'use client';

import { useState } from 'react';
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
import { quotes } from '@/lib/placeholder-data';
import type { Quote } from '@/lib/types';
import { MoreHorizontal, PlusCircle, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const QuoteRow = ({ quote }: { quote: Quote }) => {
  const getStatusVariant = (status: Quote['status']) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Sent': return 'default';
      case 'Accepted': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusStyle = (status: Quote['status']) => {
    if (status === 'Accepted') return { backgroundColor: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))' };
    return {};
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-primary hover:underline">{quote.id}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium hover:underline">{quote.subject}</div>
        <div className="text-sm text-muted-foreground">{quote.clientName}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getStatusVariant(quote.status)} style={getStatusStyle(quote.status)}>{quote.status}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{formatCurrency(quote.total)}</TableCell>
      <TableCell className="hidden md:table-cell">{format(new Date(quote.createdDate), 'PP')}</TableCell>
      <TableCell className="hidden md:table-cell">{format(new Date(quote.expiryDate), 'PP')}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Download PDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function QuotingPage() {
  const quoteStatuses: Array<Quote['status']> = ['Draft', 'Sent', 'Accepted', 'Rejected'];
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setStatusFilters(prev =>
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
  };

  const filteredQuotes = quotes.filter(quote => {
    const statusMatch = statusFilters.length === 0 || statusFilters.includes(quote.status);
    return statusMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>
                Create and manage quotes for your clients.
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
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {quoteStatuses.map(status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={checked => handleStatusFilterChange(status, !!checked)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>Clear Filters</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/quoting/new">
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Quote
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Subject / Client</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Total</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Expiry</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map(quote => (
                <QuoteRow key={quote.id} quote={quote} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

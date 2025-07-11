
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
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { changeRequests } from '@/lib/placeholder-data';
import type { ChangeRequest } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSidebar } from '@/components/ui/sidebar';

const ChangeRequestRow = ({ change, isInternalITMode }: { change: ChangeRequest, isInternalITMode: boolean }) => {
  const getStatusVariant = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'Pending Approval': return 'secondary';
      case 'Approved': return 'default';
      case 'In Progress': return 'default';
      case 'Completed': return 'outline';
      case 'Rejected':
      case 'Cancelled': return 'destructive';
      default: return 'outline';
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

  return (
    <TableRow>
      <TableCell>
        <Link href={`/change-management/${change.id}`} className="font-medium text-primary hover:underline">
          {change.id}
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/change-management/${change.id}`} className="font-medium hover:underline">
          {change.title}
        </Link>
        {!isInternalITMode && (
          <div className="hidden text-sm text-muted-foreground md:inline ml-2">
            - {change.client}
          </div>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getStatusVariant(change.status)}>{change.status}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getRiskVariant(change.riskLevel)}>{change.riskLevel}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{change.submittedBy}</TableCell>
      <TableCell className="hidden md:table-cell">{format(new Date(change.plannedStartDate), 'PP')}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild><Link href={`/change-management/${change.id}`}>View Details</Link></DropdownMenuItem>
            <DropdownMenuItem>Approve</DropdownMenuItem>
            <DropdownMenuItem>Reject</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ChangeManagementPage() {
  const { isInternalITMode } = useSidebar();
  // Add filtering logic here in the future
  const filteredChanges = changeRequests;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Change Management</CardTitle>
              <CardDescription>
                Track and manage all IT change requests.
              </CardDescription>
            </div>
            <Link href="/change-management/new">
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                New Change Request
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title {isInternalITMode ? '' : '/ Client'}</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Risk</TableHead>
                <TableHead className="hidden md:table-cell">Submitted By</TableHead>
                <TableHead className="hidden md:table-cell">Planned Start</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChanges.map(change => (
                <ChangeRequestRow key={change.id} change={change} isInternalITMode={isInternalITMode} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

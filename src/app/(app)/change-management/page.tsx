
'use client';

import { useState, useEffect } from 'react';
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
import type { ChangeRequest } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSidebar } from '@/components/ui/sidebar';

const ChangeRequestRow = ({ change, isInternalITMode, onApprove, onReject, onDelete }: { 
  change: ChangeRequest; 
  isInternalITMode: boolean; 
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
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
            {change.status === 'Pending Approval' && (
              <>
                <DropdownMenuItem onClick={() => onApprove(change.id)}>Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReject(change.id)}>Reject</DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(change.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ChangeManagementPage() {
  const { isInternalITMode } = useSidebar();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/change-requests');
      if (response.ok) {
        const data = await response.json();
        setChangeRequests(data);
      } else {
        console.error('Failed to fetch change requests');
      }
    } catch (error) {
      console.error('Error fetching change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/change-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedBy: 'current-user', // TODO: Get from auth context
          reason: 'Approved via UI'
        }),
      });

      if (response.ok) {
        await fetchChangeRequests(); // Refresh the list
      } else {
        console.error('Failed to approve change request');
      }
    } catch (error) {
      console.error('Error approving change request:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/change-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectedBy: 'current-user', // TODO: Get from auth context
          reason
        }),
      });

      if (response.ok) {
        await fetchChangeRequests(); // Refresh the list
      } else {
        console.error('Failed to reject change request');
      }
    } catch (error) {
      console.error('Error rejecting change request:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this change request?')) return;

    try {
      const response = await fetch(`/api/change-requests/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChangeRequests(prev => prev.filter(change => change.id !== id));
      } else {
        console.error('Failed to delete change request');
      }
    } catch (error) {
      console.error('Error deleting change request:', error);
    }
  };

  // Add filtering logic here in the future
  const filteredChanges = changeRequests;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-primary"/>
                Change Management
              </CardTitle>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading change requests...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredChanges.length > 0 ? (
                filteredChanges.map(change => (
                  <ChangeRequestRow 
                    key={change.id} 
                    change={change} 
                    isInternalITMode={isInternalITMode}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No change requests found. Create your first change request to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


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
import type { MajorIncident } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Flame, Siren } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';

const IncidentRow = ({ incident, onDelete }: { incident: MajorIncident; onDelete: (id: string) => void }) => {
  const getStatusVariant = (status: MajorIncident['status']) => {
    switch (status) {
      case 'Investigating': return 'secondary';
      case 'Identified': return 'default';
      case 'Monitoring': return 'default';
      case 'Resolved': return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Link href={`/incidents/${incident.id}`} className="font-medium text-primary hover:underline">
          {incident.id}
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/incidents/${incident.id}`} className="font-medium hover:underline">
          {incident.title}
        </Link>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDistanceToNow(parseISO(incident.startedAt), { addSuffix: true })}
      </TableCell>
       <TableCell className="hidden sm:table-cell">
        {incident.isPublished ? 
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Published</Badge> 
            : <Badge variant="outline">Internal</Badge>
        }
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild><Link href={`/incidents/${incident.id}`}>View Details</Link></DropdownMenuItem>
            <DropdownMenuItem>Publish Update</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(incident.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<MajorIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/incidents');
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      } else {
        console.error('Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIncidents(prev => prev.filter(incident => incident.id !== id));
      } else {
        console.error('Failed to delete incident');
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Flame className="h-6 w-6 text-destructive"/>Incident Management</CardTitle>
              <CardDescription>
                Track and manage all major service disruptions and incidents.
              </CardDescription>
            </div>
            <Link href="/incidents/new">
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                New Incident
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead className="hidden sm:table-cell">Visibility</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading incidents...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : incidents.length > 0 ? (
                incidents.map(incident => (
                  <IncidentRow key={incident.id} incident={incident} onDelete={handleDelete} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No incidents found. Create your first incident to get started.
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

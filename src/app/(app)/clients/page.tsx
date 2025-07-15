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
import type { Client, DashboardStat } from '@/lib/types';
import type { ClientStats } from '@/lib/services/clients';
import { MoreHorizontal, PlusCircle, Activity, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NewClientDialog } from '@/components/clients/new-client-dialog';

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


const ClientRow = ({ client, onDelete }: { client: Client; onDelete: (id: string) => void }) => {
  const getStatusVariant = (status: Client['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Inactive':
        return 'destructive';
      case 'Onboarding':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Link href={`/clients/${client.id}`} className="font-medium text-primary hover:underline">{client.name}</Link>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {client.industry}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{client.contacts}</TableCell>
      <TableCell className="hidden sm:table-cell">{client.tickets}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
      </TableCell>
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
            <DropdownMenuItem asChild><Link href={`/clients/${client.id}`}>View Details</Link></DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(client.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const clientsData = await response.json();
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/clients/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch client stats');
      }
      const statsData = await response.json();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchClients(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      // Refresh the clients list
      await Promise.all([fetchClients(), fetchStats()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  const handleClientCreated = async () => {
    // Refresh the clients list and stats after successful creation
    await Promise.all([fetchClients(), fetchStats()]);
  };

  // Convert stats to dashboard stats format
  const getDashboardStats = (): DashboardStat[] => {
    if (!stats) return [];
    
    return [
      {
        title: "Total Clients",
        value: stats.totalClients.toString(),
        change: "",
        changeType: "increase" as const,
        description: "all clients"
      },
      {
        title: "Active Clients",
        value: stats.activeClients.toString(),
        change: "",
        changeType: "increase" as const,
        description: "currently active"
      },
      {
        title: "Onboarding",
        value: stats.onboardingClients.toString(),
        change: "",
        changeType: "increase" as const,
        description: "in progress"
      },
      {
        title: "Total Tickets",
        value: stats.totalTickets.toString(),
        change: "",
        changeType: "increase" as const,
        description: "across all clients"
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading clients: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getDashboardStats().map(stat => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Manage your client organizations.</CardDescription>
            </div>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => setShowNewClientDialog(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Client</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Industry</TableHead>
                <TableHead className="hidden sm:table-cell">Contacts</TableHead>
                <TableHead className="hidden sm:table-cell">Open Tickets</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No clients found. Create your first client to get started.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map(client => (
                  <ClientRow key={client.id} client={client} onDelete={handleDelete} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Client Dialog */}
      <NewClientDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onSuccess={handleClientCreated}
      />
    </div>
  );
}

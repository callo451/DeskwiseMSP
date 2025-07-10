
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { contracts, billingPageStats } from '@/lib/placeholder-data';
import type { Contract, DashboardStat } from '@/lib/types';
import { PlusCircle, Activity, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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


const ContractRow = ({ contract }: { contract: Contract }) => {
  const getStatusVariant = (status: Contract['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      default:
        return 'outline';
    }
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
        <Link href={`/billing/${contract.id}`} className="font-medium text-primary hover:underline">{contract.name}</Link>
        <div className="text-sm text-muted-foreground">
          {contract.id}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{contract.clientName}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getStatusVariant(contract.status)}>{contract.status}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{formatCurrency(contract.mrr)}</TableCell>
      <TableCell className="hidden md:table-cell">{new Date(contract.endDate).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/billing/${contract.id}`}><ChevronRight className="h-4 w-4" /></Link>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default function BillingPage() {
  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {billingPageStats.map(stat => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Manage recurring billing and service contracts.</CardDescription>
            </div>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Contract</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract / ID</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">MRR</TableHead>
                <TableHead className="hidden md:table-cell">End Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map(contract => (
                <ContractRow key={contract.id} contract={contract} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

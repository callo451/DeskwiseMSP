
'use client';

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
import { slaPolicies } from '@/lib/placeholder-data';
import type { SlaPolicy } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const SlaPolicyRow = ({ policy }: { policy: SlaPolicy }) => {
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours} hours`;
    return `${hours / 24} days`;
  };

  const criticalResponse = policy.targets.find(t => t.priority === 'Critical')?.response_time_minutes;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{policy.name}</div>
        <div className="text-sm text-muted-foreground">
          {policy.description}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {criticalResponse ? formatMinutes(criticalResponse) : 'N/A'}
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function SlaManagementPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SLA Policies</CardTitle>
            <CardDescription>Define and manage Service Level Agreements for your clients.</CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Policy</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy</TableHead>
              <TableHead className="hidden sm:table-cell">Critical Response Time</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slaPolicies.map(policy => (
              <SlaPolicyRow key={policy.id} policy={policy} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

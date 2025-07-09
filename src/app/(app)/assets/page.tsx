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
import { assets } from '@/lib/placeholder-data';
import type { Asset } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

const AssetRow = ({ asset }: { asset: Asset }) => {
  const getStatusVariant = (status: Asset['status']) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Offline':
        return 'destructive';
      case 'Warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{asset.name}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {asset.id}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{asset.client}</TableCell>
      <TableCell className="hidden sm:table-cell">{asset.type}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getStatusVariant(asset.status)}>{asset.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{asset.lastSeen}</TableCell>
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
            <DropdownMenuItem>Remote Session</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function AssetsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assets</CardTitle>
            <CardDescription>
              Manage and monitor all client assets.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Import from RMM</Button>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Asset</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name / ID</TableHead>
              <TableHead className="hidden sm:table-cell">Client</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Seen</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

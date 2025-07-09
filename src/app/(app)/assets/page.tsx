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
import { assets, assetPageStats } from '@/lib/placeholder-data';
import type { Asset, DashboardStat } from '@/lib/types';
import {
  MoreHorizontal,
  PlusCircle,
  ListFilter,
  File,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
        <Link
          href={`/assets/${asset.id}`}
          className="font-medium text-primary hover:underline"
        >
          {asset.name}
        </Link>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {asset.id}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{asset.client}</TableCell>
      <TableCell className="hidden sm:table-cell">{asset.type}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge
          variant={getStatusVariant(asset.status)}
          className="capitalize"
          style={
            asset.status === 'Online'
              ? {
                  backgroundColor: 'hsl(var(--success))',
                  color: 'hsl(var(--success-foreground))',
                }
              : {}
          }
        >
          {asset.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={`flex items-center gap-1.5 ${asset.isSecure ? 'text-green-600' : 'text-amber-600'}`}>
                  {asset.isSecure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  <span className="hidden xl:inline">{asset.isSecure ? 'Secured' : 'At Risk'}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{asset.isSecure ? 'Antivirus is active and up-to-date.' : 'Security software not detected or out-of-date.'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
            <DropdownMenuItem asChild>
              <Link href={`/assets/${asset.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Remote Session</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function AssetsPage() {
  const assetTypes: Array<Asset['type']> = ['Server', 'Workstation', 'Network', 'Printer'];
  const assetStatuses: Array<Asset['status']> = ['Online', 'Offline', 'Warning'];
  const assetSecurityStatuses: string[] = ['Secured', 'At Risk'];

  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [securityFilters, setSecurityFilters] = useState<string[]>([]);

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    setTypeFilters(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setStatusFilters(prev =>
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  const handleSecurityFilterChange = (securityStatus: string, checked: boolean) => {
    setSecurityFilters(prev =>
      checked ? [...prev, securityStatus] : prev.filter(s => s !== securityStatus)
    );
  };

  const clearFilters = () => {
    setTypeFilters([]);
    setStatusFilters([]);
    setSecurityFilters([]);
  };

  const filteredAssets = assets.filter(asset => {
    const typeMatch = typeFilters.length === 0 || typeFilters.includes(asset.type);
    const statusMatch = statusFilters.length === 0 || statusFilters.includes(asset.status);
    const securityMatch =
      securityFilters.length === 0 ||
      (securityFilters.includes('Secured') && asset.isSecure) ||
      (securityFilters.includes('At Risk') && !asset.isSecure);

    return typeMatch && statusMatch && securityMatch;
  });

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {assetPageStats.map(stat => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>
                Manage and monitor all client assets.
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
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {assetTypes.map(type => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilters.includes(type)}
                      onCheckedChange={checked =>
                        handleTypeFilterChange(type, !!checked)
                      }
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                  {assetStatuses.map(status => (
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
                  <DropdownMenuLabel>Filter by Security</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                  {assetSecurityStatuses.map(secStatus => (
                    <DropdownMenuCheckboxItem
                      key={secStatus}
                      checked={securityFilters.includes(secStatus)}
                      onCheckedChange={checked =>
                        handleSecurityFilterChange(secStatus, !!checked)
                      }
                    >
                      {secStatus}
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
              <Button size="sm" variant="outline" className="h-7 gap-1">Import from RMM</Button>
              <Link href="/assets/new">
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Asset
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
                <TableHead>Name / ID</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Security</TableHead>
                <TableHead className="hidden md:table-cell">Last Seen</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map(asset => (
                <AssetRow key={asset.id} asset={asset} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


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
import type { DashboardStat } from '@/lib/types';
import type { InventoryExtended, InventoryStats } from '@/lib/services/inventory';
import {
  MoreHorizontal,
  PlusCircle,
  ListFilter,
  File,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
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

const InventoryItemRow = ({ item, onDelete }: { item: InventoryExtended, onDelete: (id: string) => void }) => {
  const isLowStock = item.quantity <= item.reorderPoint;
  
  return (
    <TableRow className={isLowStock ? 'bg-destructive/5' : ''}>
      <TableCell>
        <Link href={`/inventory/${item.id}`} className="font-medium text-primary hover:underline">{item.name}</Link>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {item.sku}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={item.owner === 'MSP' ? 'secondary' : 'outline'}>{item.owner}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{item.category}</TableCell>
      <TableCell className="hidden md:table-cell">{item.location}</TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          {item.quantity}
          {isLowStock && <AlertCircle className="h-4 w-4 text-destructive" title="Low stock" />}
        </div>
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
            <DropdownMenuItem asChild>
                <Link href={`/inventory/${item.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Deploy as Asset</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function InventoryPage() {
  const itemCategories: Array<InventoryExtended['category']> = ['Hardware', 'Software License', 'Consumable', 'Part'];
  const itemOwners = ['MSP', 'TechCorp', 'GlobalInnovate', 'SecureNet Solutions', 'DataFlow Dynamics'];

  const [items, setItems] = useState<InventoryExtended[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [ownerFilters, setOwnerFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [categoryFilters, ownerFilters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (categoryFilters.length > 0) {
        params.append('category', categoryFilters.join(','));
      }
      
      if (ownerFilters.length > 0) {
        params.append('owner', ownerFilters.join(','));
      }
      
      const response = await fetch(`/api/inventory?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inventory/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory statistics');
      }
      
      const data: InventoryStats = await response.json();
      
      // Convert InventoryStats to DashboardStat format
      const dashboardStats: DashboardStat[] = [
        {
          title: "Total Items",
          value: data.totalItems.toString(),
          change: `$${data.totalValue.toLocaleString()}`,
          changeType: "increase",
          description: "total value"
        },
        {
          title: "Low Stock",
          value: data.lowStockItems.toString(),
          change: data.outOfStockItems > 0 ? `${data.outOfStockItems} out of stock` : "No outages",
          changeType: data.lowStockItems > 0 ? "increase" : "decrease",
          description: "items need reorder"
        },
        {
          title: "Recent Activity",
          value: data.recentMovements.toString(),
          change: "Last 30 days",
          changeType: "increase",
          description: "stock movements"
        },
        {
          title: "Pending Orders",
          value: data.pendingOrders.toString(),
          change: "Track deliveries",
          changeType: data.pendingOrders > 0 ? "increase" : "decrease",
          description: "purchase orders"
        }
      ];
      
      setStats(dashboardStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete inventory item');
      }
      
      // Refresh the items list
      fetchItems();
      fetchStats();
    } catch (err) {
      console.error('Error deleting inventory item:', err);
    }
  };

  const handleCategoryFilterChange = (category: string, checked: boolean) => {
    setCategoryFilters(prev =>
      checked ? [...prev, category] : prev.filter(c => c !== category)
    );
  };
  
  const handleOwnerFilterChange = (owner: string, checked: boolean) => {
    setOwnerFilters(prev =>
      checked ? [...prev, owner] : prev.filter(o => o !== owner)
    );
  };
  
  const clearFilters = () => {
    setCategoryFilters([]);
    setOwnerFilters([]);
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading inventory...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading inventory: {error}</p>
              <Button onClick={fetchItems} className="mt-4" size="sm">
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
        {stats.map(stat => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Manage stock levels for hardware, software, and consumables.
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
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {itemCategories.map(cat => (
                    <DropdownMenuCheckboxItem key={cat} checked={categoryFilters.includes(cat)} onCheckedChange={checked => handleCategoryFilterChange(cat, !!checked)}>
                      {cat}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Owner</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   {itemOwners.map(owner => (
                    <DropdownMenuCheckboxItem key={owner} checked={ownerFilters.includes(owner)} onCheckedChange={checked => handleOwnerFilterChange(owner, !!checked)}>
                      {owner}
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
              <Link href="/inventory/new">
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Item
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
                <TableHead>Name / SKU</TableHead>
                <TableHead className="hidden sm:table-cell">Owner</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Quantity</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map(item => (
                  <InventoryItemRow 
                    key={item.id} 
                    item={item}
                    onDelete={handleDeleteItem}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center h-24">
                    {categoryFilters.length > 0 || ownerFilters.length > 0
                      ? "No inventory items match the current filters."
                      : "No inventory items found. Add your first item to get started."
                    }
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

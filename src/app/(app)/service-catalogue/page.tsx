
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
import { serviceCatalogueItems } from '@/lib/placeholder-data';
import type { ServiceCatalogueItem } from '@/lib/types';
import { MoreHorizontal, PlusCircle, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

const ServiceItemRow = ({ item }: { item: ServiceCatalogueItem }) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{item.name}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">{item.description}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="secondary">{item.category}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{formatCurrency(item.price)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ServiceCataloguePage() {
  const serviceCategories = useMemo(() => [...new Set(serviceCatalogueItems.map(item => item.category))], []);
  const serviceTypes: Array<ServiceCatalogueItem['type']> = ['Fixed', 'Recurring', 'Hourly'];

  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);

  const handleCategoryFilterChange = (category: string, checked: boolean) => {
    setCategoryFilters(prev =>
      checked ? [...prev, category] : prev.filter(c => c !== category)
    );
  };

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    setTypeFilters(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const clearFilters = () => {
    setCategoryFilters([]);
    setTypeFilters([]);
  };

  const filteredItems = serviceCatalogueItems.filter(item => {
    const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(item.category);
    const typeMatch = typeFilters.length === 0 || typeFilters.includes(item.type);
    return categoryMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Service Catalogue</CardTitle>
              <CardDescription>
                Manage your standardized service offerings.
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
                  {serviceCategories.map(cat => (
                    <DropdownMenuCheckboxItem
                      key={cat}
                      checked={categoryFilters.includes(cat)}
                      onCheckedChange={checked => handleCategoryFilterChange(cat, !!checked)}
                    >
                      {cat}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {serviceTypes.map(type => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilters.includes(type)}
                      onCheckedChange={checked => handleTypeFilterChange(type, !!checked)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>Clear Filters</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/service-catalogue/new">
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Service
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <ServiceItemRow key={item.id} item={item} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

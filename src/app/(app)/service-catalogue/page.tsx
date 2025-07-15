
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
import type { ServiceCatalogueItemExtended } from '@/lib/services/service-catalogue';
import { MoreHorizontal, PlusCircle, ListFilter, Loader2, RefreshCw, Database } from 'lucide-react';
import Link from 'next/link';

const ServiceItemRow = ({ 
  item, 
  onDelete, 
  onRestore 
}: { 
  item: ServiceCatalogueItemExtended; 
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'Recurring': return 'default';
      case 'Fixed': return 'secondary';
      case 'Hourly': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <TableRow className={!item.isActive ? 'opacity-50' : ''}>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            {item.name}
            {!item.isActive && <Badge variant="destructive" className="text-xs">Deleted</Badge>}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1">
              {item.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {item.tags.length > 3 && <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">{item.description}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="secondary">{item.category}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getTypeVariant(item.type)}>{item.type}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="space-y-1">
          <div>{formatCurrency(item.price)}</div>
          {item.setupFee && item.setupFee > 0 && (
            <div className="text-xs text-muted-foreground">
              +{formatCurrency(item.setupFee)} setup
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="text-sm text-muted-foreground">
          {item.popularity} uses
        </div>
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            {item.isActive ? (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(item.id)}
              >
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onRestore(item.id)}>
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ServiceCataloguePage() {
  const [services, setServices] = useState<ServiceCatalogueItemExtended[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  
  const serviceTypes = ['Fixed', 'Recurring', 'Hourly'];
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [showDeleted]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        isActive: (!showDeleted).toString()
      });
      
      const response = await fetch(`/api/service-catalogue?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const servicesData = await response.json();
      setServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/service-catalogue/categories');
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const seedServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/service-catalogue/seed', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed services');
      }
      
      await fetchServices();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed services');
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await fetch(`/api/service-catalogue/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      await fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const handleRestore = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/service-catalogue/${serviceId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to restore service');
      }

      await fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore service');
    }
  };

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

  const filteredItems = services.filter(item => {
    const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(item.category);
    const typeMatch = typeFilters.length === 0 || typeFilters.includes(item.type);
    return categoryMatch && typeMatch;
  });

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
              <p>Error loading services: {error}</p>
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Service Catalogue
                <Badge variant="outline">{filteredItems.length} services</Badge>
              </CardTitle>
              <CardDescription>
                Manage your standardized service offerings.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleted(!showDeleted)}
                className="h-7"
              >
                {showDeleted ? 'Show Active' : 'Show Deleted'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchServices}
                className="h-7"
                disabled={loading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              {services.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={seedServices}
                  className="h-7 gap-1"
                  disabled={loading}
                >
                  <Database className="h-3.5 w-3.5" />
                  Seed Services
                </Button>
              )}
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
                  {categories.map(cat => (
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
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Popularity</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {services.length === 0 
                      ? "No services found. Click 'Seed Services' to get started with default services or 'New Service' to create your first service."
                      : "No services match the current filters. Try adjusting your filters or clearing them."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => (
                  <ServiceItemRow 
                    key={item.id} 
                    item={item} 
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

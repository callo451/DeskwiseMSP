'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Package, 
  DollarSign, 
  AlertTriangle,
  TrendingDown,
  Warehouse,
  RefreshCw,
  Loader2,
  ShoppingCart,
  Target
} from 'lucide-react';
import type { InventoryStats, CategoryStats, LocationStats } from '@/lib/services/inventory';

interface InventoryStatsDashboardProps {
  orgId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function InventoryStatsDashboard({ orgId }: InventoryStatsDashboardProps) {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [orgId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch general stats
      const [statsResponse, categoryResponse, locationResponse] = await Promise.all([
        fetch('/api/inventory/stats'),
        fetch('/api/inventory/categories'),
        fetch('/api/inventory/locations')
      ]);

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch inventory statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        setCategoryStats(categoryData);
      }

      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        setLocationStats(locationData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading statistics: {error}</p>
            <Button onClick={fetchStats} className="mt-4" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getOwnershipData = () => [
    { name: 'MSP Owned', value: stats.mspOwnedItems, color: '#22c55e' },
    { name: 'Client Owned', value: stats.clientOwnedItems, color: '#3b82f6' },
  ];

  const getStockStatusData = () => [
    { name: 'Normal Stock', value: stats.totalItems - stats.lowStockItems, color: '#22c55e' },
    { name: 'Low Stock', value: stats.lowStockItems - stats.outOfStockItems, color: '#f59e0b' },
    { name: 'Out of Stock', value: stats.outOfStockItems, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCategories} categories, {stats.totalLocations} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(stats.avgItemValue)} per item
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.outOfStockItems} completely out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentMovements}</div>
            <p className="text-xs text-muted-foreground">
              Stock movements (30 days)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Stock Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
            <CardDescription>Distribution of stock levels across inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalItems > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStockStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStockStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No inventory items available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ownership Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Item Ownership</CardTitle>
            <CardDescription>MSP vs client-owned inventory distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalItems > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getOwnershipData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getOwnershipData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No ownership data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Item distribution and value across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'itemCount' ? `${value} items` : formatCurrency(value as number),
                    name === 'itemCount' ? 'Count' : 'Value'
                  ]}
                />
                <Bar dataKey="itemCount" fill="#8884d8" name="itemCount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Details */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Analysis</CardTitle>
            <CardDescription>Detailed breakdown by category with stock alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category.itemCount} items</Badge>
                      <Badge variant="secondary">{formatCurrency(category.totalValue)}</Badge>
                      {category.lowStockCount > 0 && (
                        <Badge variant="destructive">{category.lowStockCount} low stock</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Items: </span>
                      <span className="font-medium">{category.itemCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Qty: </span>
                      <span className="font-medium">{category.avgQuantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value: </span>
                      <span className="font-medium">{formatCurrency(category.totalValue)}</span>
                    </div>
                  </div>
                  {index < categoryStats.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Distribution */}
      {locationStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Location</CardTitle>
            <CardDescription>Item distribution across storage locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationStats.map((location, index) => (
                <div key={location.location}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Warehouse className="h-4 w-4" />
                      {location.location}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{location.itemCount} items</Badge>
                      <Badge variant="secondary">{formatCurrency(location.totalValue)}</Badge>
                      {location.lowStockCount > 0 && (
                        <Badge variant="destructive">{location.lowStockCount} low stock</Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(location.itemCount / stats.totalItems) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Categories: </span>
                      <span className="font-medium">{location.categories.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value: </span>
                      <span className="font-medium">{formatCurrency(location.totalValue)}</span>
                    </div>
                  </div>
                  {index < locationStats.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts and Actions */}
      {(stats.lowStockItems > 0 || stats.pendingOrders > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Action Items
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Low Stock Alert</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stats.lowStockItems} items</Badge>
                    <Button variant="outline" size="sm">
                      View Items
                    </Button>
                  </div>
                </div>
              )}
              
              {stats.pendingOrders > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Pending Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stats.pendingOrders} orders</Badge>
                    <Button variant="outline" size="sm">
                      Track Orders
                    </Button>
                  </div>
                </div>
              )}

              {stats.outOfStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Out of Stock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stats.outOfStockItems} items</Badge>
                    <Button variant="outline" size="sm">
                      Reorder Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
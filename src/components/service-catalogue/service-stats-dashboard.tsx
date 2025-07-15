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
  DollarSign, 
  Package, 
  TrendingUp, 
  Activity,
  RefreshCw,
  Loader2
} from 'lucide-react';
import type { ServiceCatalogueStats, ServiceCategoryStats } from '@/lib/services/service-catalogue';

interface ServiceStatsDashboardProps {
  orgId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ServiceStatsDashboard({ orgId }: ServiceStatsDashboardProps) {
  const [stats, setStats] = useState<ServiceCatalogueStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<ServiceCategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [orgId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch general stats
      const statsResponse = await fetch('/api/service-catalogue/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch service statistics');
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch category stats (if we had this endpoint)
      // For now, we'll derive it from the main stats
      setCategoryStats(statsData.categoryCounts.map((cat: any) => ({
        category: cat.category,
        serviceCount: cat.count,
        averagePrice: 0, // We'd need additional data for this
        totalRevenue: 0,
        popularityScore: 0
      })));

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

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeServices} active, {stats.inactiveServices} archived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenuePotential)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
            <p className="text-xs text-muted-foreground">
              Across all service types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.mostPopularServices.length > 0 
                ? stats.mostPopularServices[0].name.substring(0, 20) + (stats.mostPopularServices[0].name.length > 20 ? '...' : '')
                : 'No usage data'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mostPopularServices.length > 0 
                ? `${stats.mostPopularServices[0].popularity} uses`
                : 'Start using services in quotes'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Services by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Services by Category</CardTitle>
            <CardDescription>Distribution of services across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.categoryCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                  >
                    {stats.categoryCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Services by Type</CardTitle>
            <CardDescription>Breakdown of service pricing models</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.typeCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.typeCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Services List */}
      {stats.mostPopularServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Services</CardTitle>
            <CardDescription>Services ranked by usage in quotes and contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mostPopularServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {service.popularity} {service.popularity === 1 ? 'use' : 'uses'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {stats.categoryCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Overview</CardTitle>
            <CardDescription>Detailed breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryCounts.map((category, index) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    <Badge variant="outline">{category.count} services</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(category.count / stats.totalServices) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((category.count / stats.totalServices) * 100).toFixed(1)}% of all services
                  </p>
                  {index < stats.categoryCounts.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
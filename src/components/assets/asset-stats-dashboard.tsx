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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Server, 
  Shield, 
  Activity,
  AlertTriangle,
  Wrench,
  TrendingUp,
  RefreshCw,
  Loader2,
  Clock
} from 'lucide-react';
import type { AssetStats, AssetLocationStats, AssetTypeStats } from '@/lib/services/assets';

interface AssetStatsDashboardProps {
  orgId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AssetStatsDashboard({ orgId }: AssetStatsDashboardProps) {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [locationStats, setLocationStats] = useState<AssetLocationStats[]>([]);
  const [typeStats, setTypeStats] = useState<AssetTypeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [orgId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch general stats
      const [statsResponse, locationResponse, typeResponse] = await Promise.all([
        fetch('/api/assets/stats'),
        fetch('/api/assets/locations'),
        fetch('/api/assets/types')
      ]);

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch asset statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        setLocationStats(locationData);
      }

      if (typeResponse.ok) {
        const typeData = await typeResponse.json();
        setTypeStats(typeData);
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

  const getStatusData = () => [
    { name: 'Online', value: stats.onlineAssets, color: '#22c55e' },
    { name: 'Offline', value: stats.offlineAssets, color: '#ef4444' },
    { name: 'Warning', value: stats.warningAssets, color: '#f59e0b' },
  ];

  const getSecurityData = () => [
    { name: 'Secured', value: stats.securedAssets, color: '#22c55e' },
    { name: 'At Risk', value: stats.atRiskAssets, color: '#ef4444' },
  ];

  const getPerformanceData = () => [
    { name: 'CPU', usage: stats.avgCpuUsage },
    { name: 'Memory', usage: stats.avgMemoryUsage },
    { name: 'Disk', usage: stats.avgDiskUsage },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineAssets} online, {stats.offlineAssets} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securedAssets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.atRiskAssets} assets at risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenanceDue}</div>
            <p className="text-xs text-muted-foreground">
              Assets requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current asset value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Status</CardTitle>
            <CardDescription>Distribution of asset operational status</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalAssets > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No assets available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>Asset security compliance overview</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalAssets > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getSecurityData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getSecurityData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No security data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Average Resource Usage</CardTitle>
          <CardDescription>Average CPU, memory, and disk usage across all assets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getPerformanceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
              <Bar dataKey="usage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Types Distribution */}
      {typeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assets by Type</CardTitle>
            <CardDescription>Distribution and performance by asset type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeStats.map((typeData, index) => (
                <div key={typeData.type}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{typeData.type}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{typeData.count} assets</Badge>
                      <Badge variant="secondary">{typeData.onlineCount} online</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg CPU: </span>
                      <span className="font-medium">{typeData.avgCpuUsage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Memory: </span>
                      <span className="font-medium">{typeData.avgMemoryUsage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Disk: </span>
                      <span className="font-medium">{typeData.avgDiskUsage}%</span>
                    </div>
                  </div>
                  {index < typeStats.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Stats */}
      {locationStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assets by Location</CardTitle>
            <CardDescription>Asset distribution across different locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationStats.map((locationData, index) => (
                <div key={locationData.location}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{locationData.location}</h4>
                    <Badge variant="outline">{locationData.assetCount} assets</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(locationData.assetCount / stats.totalAssets) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-green-600">
                      Online: {locationData.onlineCount}
                    </div>
                    <div className="text-red-600">
                      Offline: {locationData.offlineCount}
                    </div>
                    <div className="text-yellow-600">
                      Warning: {locationData.warningCount}
                    </div>
                  </div>
                  {index < locationStats.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance & Warranty Alerts */}
      {(stats.maintenanceDue > 0 || stats.warrantyExpiring > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Attention Required
            </CardTitle>
            <CardDescription>Assets requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.maintenanceDue > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Maintenance Due</span>
                  </div>
                  <Badge variant="secondary">{stats.maintenanceDue} assets</Badge>
                </div>
              )}
              
              {stats.warrantyExpiring > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Warranty Expiring</span>
                  </div>
                  <Badge variant="secondary">{stats.warrantyExpiring} assets</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
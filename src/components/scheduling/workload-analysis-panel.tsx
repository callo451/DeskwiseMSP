"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface WorkloadData {
  totalHours: number;
  scheduledHours: number;
  availableHours: number;
  utilization: number;
  items: any[];
}

interface WorkloadAnalysisPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const technicians = [
  { id: 'TECH-001', name: 'John Smith' },
  { id: 'TECH-002', name: 'Sarah Johnson' },
  { id: 'TECH-003', name: 'Mike Davis' },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export function WorkloadAnalysisPanel({ open, onOpenChange }: WorkloadAnalysisPanelProps) {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [workloadData, setWorkloadData] = useState<WorkloadData | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const currentWeek = {
    start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    end: format(endOfWeek(new Date()), 'yyyy-MM-dd')
  };

  const fetchWorkloadData = async (technicianId: string) => {
    if (!technicianId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/schedule/workload?technicianId=${technicianId}&startDate=${currentWeek.start}&endDate=${currentWeek.end}`
      );
      const data = await response.json();
      setWorkloadData(data);
      
      // Generate weekly breakdown
      const weekData = [];
      for (let i = 0; i < 7; i++) {
        const day = format(addDays(new Date(currentWeek.start), i), 'yyyy-MM-dd');
        const dayName = format(addDays(new Date(currentWeek.start), i), 'EEE');
        const dayItems = data.items.filter((item: any) => item.start.startsWith(day));
        
        let scheduledMinutes = 0;
        dayItems.forEach((item: any) => {
          const start = new Date(`${item.start}:00`);
          const end = new Date(`${item.end}:00`);
          scheduledMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
          if (item.travelTime) scheduledMinutes += item.travelTime;
        });
        
        const scheduledHours = scheduledMinutes / 60;
        const availableHours = Math.max(0, 8 - scheduledHours);
        
        weekData.push({
          day: dayName,
          scheduled: Number(scheduledHours.toFixed(1)),
          available: Number(availableHours.toFixed(1)),
          utilization: Math.min(100, (scheduledHours / 8) * 100)
        });
      }
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Error fetching workload data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTechnician) {
      fetchWorkloadData(selectedTechnician);
    }
  }, [selectedTechnician]);

  const utilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const utilizationVariant = (utilization: number) => {
    if (utilization >= 90) return 'destructive';
    if (utilization >= 75) return 'secondary';
    return 'default';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Workload Analysis
          </CardTitle>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Current Week
            </Badge>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading workload data...</div>
            </div>
          )}

          {workloadData && !loading && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">Total Hours</div>
                    </div>
                    <div className="text-2xl font-bold">{workloadData.totalHours}h</div>
                    <div className="text-xs text-muted-foreground">Available this week</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">Scheduled</div>
                    </div>
                    <div className="text-2xl font-bold">{workloadData.scheduledHours.toFixed(1)}h</div>
                    <div className="text-xs text-muted-foreground">Booked appointments</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">Available</div>
                    </div>
                    <div className="text-2xl font-bold">{workloadData.availableHours.toFixed(1)}h</div>
                    <div className="text-xs text-muted-foreground">Free time remaining</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">Utilization</div>
                    </div>
                    <div className={`text-2xl font-bold ${utilizationColor(workloadData.utilization)}`}>
                      {workloadData.utilization.toFixed(1)}%
                    </div>
                    <Progress 
                      value={workloadData.utilization} 
                      className="h-2 mt-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Schedule Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="scheduled" stackId="a" fill="#8884d8" name="Scheduled Hours" />
                      <Bar dataKey="available" stackId="a" fill="#82ca9d" name="Available Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-medium mb-2">{day.day}</div>
                        <div className="space-y-1">
                          <Progress value={day.utilization} className="h-2" />
                          <Badge 
                            variant={utilizationVariant(day.utilization)}
                            className="text-xs"
                          >
                            {day.utilization.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {day.scheduled}h / 8h
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Types Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Types This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Tickets', value: workloadData.items.filter(i => i.type === 'Ticket').length },
                              { name: 'Meetings', value: workloadData.items.filter(i => i.type === 'Meeting').length },
                              { name: 'Appointments', value: workloadData.items.filter(i => i.type === 'Appointment').length },
                              { name: 'Time Off', value: workloadData.items.filter(i => i.type === 'Time Off').length },
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {workloadData.items.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Scheduled Items</div>
                      {[
                        { type: 'Ticket', count: workloadData.items.filter(i => i.type === 'Ticket').length, color: '#8884d8' },
                        { type: 'Meeting', count: workloadData.items.filter(i => i.type === 'Meeting').length, color: '#82ca9d' },
                        { type: 'Appointment', count: workloadData.items.filter(i => i.type === 'Appointment').length, color: '#ffc658' },
                        { type: 'Time Off', count: workloadData.items.filter(i => i.type === 'Time Off').length, color: '#ff7300' },
                      ].filter(item => item.count > 0).map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.type}</span>
                          </div>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
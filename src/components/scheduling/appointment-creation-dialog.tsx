"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock, MapPin, Users, AlertCircle, Repeat } from 'lucide-react';
import type { ScheduleItem, RecurrencePattern } from '@/lib/types';

interface AppointmentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialDate?: string;
  initialTime?: string;
  technicianId?: string;
}

const technicians = [
  { id: 'TECH-001', name: 'John Smith' },
  { id: 'TECH-002', name: 'Sarah Johnson' },
  { id: 'TECH-003', name: 'Mike Davis' },
];

const clients = [
  { id: 'CLI-001', name: 'TechCorp' },
  { id: 'CLI-002', name: 'InnovateLabs' },
  { id: 'CLI-003', name: 'DataFlow Systems' },
];

export function AppointmentCreationDialog({
  open,
  onOpenChange,
  onSuccess,
  initialDate,
  initialTime,
  technicianId
}: AppointmentCreationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [conflicts, setConflicts] = useState<ScheduleItem[]>([]);
  const [optimalSlot, setOptimalSlot] = useState<{ start: string; end: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Appointment' as const,
    technicianId: technicianId || '',
    start: initialDate && initialTime ? `${initialDate} ${initialTime}` : '',
    end: '',
    clientId: '',
    location: '',
    notes: '',
    priority: 'medium' as const,
    estimatedDuration: 60,
    travelTime: 0,
    requiredSkills: [] as string[],
    equipment: [] as string[],
    reminders: [] as any[],
  });

  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>({
    type: 'weekly',
    interval: 1,
    endDate: '',
    occurrences: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRecurring ? '/api/schedule/recurring' : '/api/schedule';
      const payload = isRecurring 
        ? { ...formData, recurrencePattern }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Appointment',
      technicianId: technicianId || '',
      start: initialDate && initialTime ? `${initialDate} ${initialTime}` : '',
      end: '',
      clientId: '',
      location: '',
      notes: '',
      priority: 'medium',
      estimatedDuration: 60,
      travelTime: 0,
      requiredSkills: [],
      equipment: [],
      reminders: [],
    });
    setRecurrencePattern({
      type: 'weekly',
      interval: 1,
      endDate: '',
      occurrences: 10,
    });
    setIsRecurring(false);
    setConflicts([]);
    setOptimalSlot(null);
  };

  const checkConflicts = async () => {
    if (!formData.technicianId || !formData.start || !formData.end) return;

    try {
      const response = await fetch(
        `/api/schedule/conflicts?technicianId=${formData.technicianId}&start=${formData.start}&end=${formData.end}`
      );
      const data = await response.json();
      setConflicts(data.conflicts || []);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const findOptimalSlot = async () => {
    if (!formData.technicianId || !formData.estimatedDuration) return;

    try {
      const response = await fetch('/api/schedule/optimal-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: formData.technicianId,
          duration: formData.estimatedDuration,
          preferredDate: formData.start.split(' ')[0] || new Date().toISOString().split('T')[0],
          timePreference: 'any'
        }),
      });
      const data = await response.json();
      setOptimalSlot(data.slot);
      
      if (data.slot) {
        setFormData(prev => ({
          ...prev,
          start: data.slot.start,
          end: data.slot.end
        }));
      }
    } catch (error) {
      console.error('Error finding optimal slot:', error);
    }
  };

  const updateEndTime = () => {
    if (formData.start && formData.estimatedDuration) {
      const startDate = new Date(`${formData.start}:00`);
      const endDate = new Date(startDate.getTime() + formData.estimatedDuration * 60000);
      const endFormatted = endDate.toISOString().slice(0, 16).replace('T', ' ');
      setFormData(prev => ({ ...prev, end: endFormatted }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Create Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Appointment title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appointment">Appointment</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Ticket">Ticket Work</SelectItem>
                      <SelectItem value="Time Off">Time Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technician">Technician *</Label>
                  <Select
                    value={formData.technicianId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, technicianId: value }))}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Meeting location or address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or instructions"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Date & Time *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formData.start.replace(' ', 'T')}
                    onChange={(e) => {
                      const value = e.target.value.replace('T', ' ');
                      setFormData(prev => ({ ...prev, start: value }));
                      setTimeout(updateEndTime, 100);
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 60 }));
                      setTimeout(updateEndTime, 100);
                    }}
                    min="15"
                    step="15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end">End Date & Time</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formData.end.replace(' ', 'T')}
                    onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value.replace('T', ' ') }))}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelTime">Travel Time (minutes)</Label>
                <Input
                  id="travelTime"
                  type="number"
                  value={formData.travelTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelTime: parseInt(e.target.value) || 0 }))}
                  min="0"
                  step="15"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={findOptimalSlot}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Find Optimal Time
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkConflicts}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Check Conflicts
                </Button>
              </div>

              {optimalSlot && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Optimal Time Slot Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {optimalSlot.start} - {optimalSlot.end}
                    </p>
                  </CardContent>
                </Card>
              )}

              {conflicts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">Scheduling Conflicts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {conflicts.map((conflict) => (
                        <div key={conflict.id} className="text-sm">
                          <Badge variant="destructive">{conflict.start} - {conflict.end}</Badge>
                          <span className="ml-2">{conflict.title}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked === true)}
                />
                <Label htmlFor="isRecurring" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Make this a recurring appointment
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recurrenceType">Recurrence Type</Label>
                      <Select
                        value={recurrencePattern.type}
                        onValueChange={(value: any) => setRecurrencePattern(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interval">Every</Label>
                      <Input
                        id="interval"
                        type="number"
                        value={recurrencePattern.interval}
                        onChange={(e) => setRecurrencePattern(prev => ({ 
                          ...prev, 
                          interval: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={recurrencePattern.endDate}
                        onChange={(e) => setRecurrencePattern(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occurrences">Or after # occurrences</Label>
                      <Input
                        id="occurrences"
                        type="number"
                        value={recurrencePattern.occurrences || ''}
                        onChange={(e) => setRecurrencePattern(prev => ({ 
                          ...prev, 
                          occurrences: parseInt(e.target.value) || undefined 
                        }))}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Required Skills</Label>
                  <Input
                    id="requiredSkills"
                    value={formData.requiredSkills.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Enter skills separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Required Equipment</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Enter equipment separated by commas"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : isRecurring ? 'Create Recurring Series' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
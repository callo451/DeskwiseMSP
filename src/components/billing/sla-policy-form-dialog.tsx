'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X, Clock } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { SLAPolicy, SLATarget } from '@/lib/types';

const slaTargetSchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  response_time_minutes: z.number().min(1, 'Response time must be at least 1 minute'),
  resolution_time_minutes: z.number().min(1, 'Resolution time must be at least 1 minute'),
});

const slaPolicyFormSchema = z.object({
  id: z.string().min(1, 'Policy ID is required'),
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().min(1, 'Description is required'),
  targets: z.array(slaTargetSchema).min(1, 'At least one SLA target is required'),
});

type SLAPolicyFormValues = z.infer<typeof slaPolicyFormSchema>;

interface SLAPolicyFormDialogProps {
  policy?: SLAPolicy;
  onSave: (policy: Omit<SLAPolicy, 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const priorityLevels: Array<SLATarget['priority']> = ['Low', 'Medium', 'High', 'Critical'];

const timePresets = {
  response: {
    'Low': [60, 120, 240, 480], // 1h, 2h, 4h, 8h
    'Medium': [30, 60, 120, 240], // 30m, 1h, 2h, 4h
    'High': [15, 30, 60, 120], // 15m, 30m, 1h, 2h
    'Critical': [5, 10, 15, 30], // 5m, 10m, 15m, 30m
  },
  resolution: {
    'Low': [480, 960, 1440, 2880], // 8h, 16h, 24h, 48h
    'Medium': [240, 480, 960, 1440], // 4h, 8h, 16h, 24h
    'High': [120, 240, 480, 960], // 2h, 4h, 8h, 16h
    'Critical': [60, 120, 240, 480], // 1h, 2h, 4h, 8h
  },
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

export function SLAPolicyFormDialog({
  policy,
  onSave,
  trigger,
  open,
  onOpenChange,
}: SLAPolicyFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SLAPolicyFormValues>({
    resolver: zodResolver(slaPolicyFormSchema),
    defaultValues: {
      id: policy?.id || '',
      name: policy?.name || '',
      description: policy?.description || '',
      targets: policy?.targets || [
        {
          priority: 'Critical',
          response_time_minutes: 15,
          resolution_time_minutes: 240,
        },
        {
          priority: 'High',
          response_time_minutes: 60,
          resolution_time_minutes: 480,
        },
        {
          priority: 'Medium',
          response_time_minutes: 120,
          resolution_time_minutes: 960,
        },
        {
          priority: 'Low',
          response_time_minutes: 240,
          resolution_time_minutes: 1440,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'targets',
  });

  const handleSubmit = async (values: SLAPolicyFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(values);
      
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
      
      form.reset();
    } catch (error) {
      console.error('Failed to save SLA policy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTarget = () => {
    append({
      priority: 'Medium',
      response_time_minutes: 60,
      resolution_time_minutes: 480,
    });
  };

  const getPriorityColor = (priority: SLATarget['priority']) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'secondary';
      case 'Medium': return 'outline';
      case 'Low': return 'default';
      default: return 'outline';
    }
  };

  const currentOpen = open !== undefined ? open : isOpen;
  const currentOnOpenChange = onOpenChange || setIsOpen;

  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit SLA Policy' : 'Create SLA Policy'}</DialogTitle>
          <DialogDescription>
            {policy ? 'Update SLA policy details and response targets.' : 'Define service level agreements and response time targets.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SLA-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard Support SLA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the SLA policy and its objectives"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">SLA Targets</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTarget}
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Target
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(form.watch(`targets.${index}.priority`))}>
                          {form.watch(`targets.${index}.priority`)} Priority
                        </Badge>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name={`targets.${index}.priority`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {priorityLevels.map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {priority}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`targets.${index}.response_time_minutes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Response Time (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(field.value || 0)}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`targets.${index}.resolution_time_minutes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resolution Time (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(field.value || 0)}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => currentOnOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
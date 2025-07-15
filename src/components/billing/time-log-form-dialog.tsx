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
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TimeLog } from '@/lib/types';

const timeLogFormSchema = z.object({
  technician: z.string().min(1, 'Technician is required'),
  date: z.string().min(1, 'Date is required'),
  hours: z.number().min(0.25, 'Hours must be at least 0.25 (15 minutes)').max(24, 'Hours cannot exceed 24'),
  description: z.string().min(1, 'Description is required'),
  ticketId: z.string().optional(),
  isBillable: z.boolean().default(true),
  category: z.string().optional(),
});

type TimeLogFormValues = z.infer<typeof timeLogFormSchema>;

interface TimeLogFormDialogProps {
  contractId: string;
  timeLog?: TimeLog;
  onSave: (timeLog: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const workCategories = [
  'General Support',
  'System Maintenance',
  'Security Updates',
  'Hardware Repair',
  'Software Installation',
  'Network Configuration',
  'Backup Management',
  'User Training',
  'Documentation',
  'Emergency Response',
];

export function TimeLogFormDialog({
  contractId,
  timeLog,
  onSave,
  trigger,
  open,
  onOpenChange,
}: TimeLogFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TimeLogFormValues>({
    resolver: zodResolver(timeLogFormSchema),
    defaultValues: {
      technician: timeLog?.technician || '',
      date: timeLog?.date ? new Date(timeLog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      hours: timeLog?.hours || 1,
      description: timeLog?.description || '',
      ticketId: timeLog?.ticketId || '',
      isBillable: timeLog?.isBillable ?? true,
      category: timeLog?.category || '',
    },
  });

  const handleSubmit = async (values: TimeLogFormValues) => {
    setIsSubmitting(true);
    try {
      const timeLogData = {
        ...values,
        contractId,
        date: new Date(values.date).toISOString(),
      };

      await onSave(timeLogData);
      
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
      
      form.reset();
    } catch (error) {
      console.error('Failed to save time log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentOpen = open !== undefined ? open : isOpen;
  const currentOnOpenChange = onOpenChange || setIsOpen;

  const watchedHours = form.watch('hours');
  const watchedIsBillable = form.watch('isBillable');

  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{timeLog ? 'Edit Time Entry' : 'Log Time'}</DialogTitle>
          <DialogDescription>
            {timeLog ? 'Update time entry details.' : 'Record billable hours for this contract.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician</FormLabel>
                    <FormControl>
                      <Input placeholder="Technician name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        placeholder="1.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ticketId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Ticket ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TK-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the work performed..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBillable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Billable Time
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      This time entry is billable to the client
                      {watchedIsBillable && watchedHours > 0 && (
                        <span className="ml-2 font-medium text-foreground">
                          ({watchedHours} {watchedHours === 1 ? 'hour' : 'hours'})
                        </span>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => currentOnOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : timeLog ? 'Update Entry' : 'Log Time'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
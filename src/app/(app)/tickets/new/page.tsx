
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clients, tickets } from '@/lib/placeholder-data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import React from 'react';

const ticketSchema = z.object({
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters long.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
  clientId: z.string().min(1, { message: 'Please select a client.' }),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  assignee: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const uniqueAssignees = [...new Set(tickets.map(t => t.assignee).filter(a => a !== 'Unassigned'))];

export default function NewTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const subjectFromAI = searchParams.get('subject');
  const descriptionFromAI = searchParams.get('description');
  const clientIdFromAI = searchParams.get('clientId');

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: subjectFromAI || '',
      description: descriptionFromAI || '',
      clientId: clientIdFromAI || '',
      priority: 'Medium',
      assignee: '',
    },
  });

  const onSubmit = (data: TicketFormValues) => {
    console.log(data); // In a real app, you'd submit this to an API
    toast({
      title: 'Ticket Created!',
      description: `Ticket with subject "${data.subject}" has been successfully created.`,
    });
    router.push('/tickets');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Create New Ticket</h1>
          <p className="text-muted-foreground">Fill out the form below to create a new service ticket.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible to ensure a quick resolution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Server offline" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the issue in detail..."
                            className="resize-y"
                            rows={8}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-8">
                   <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority level" />
                            </Trigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignee (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {uniqueAssignees.map(assignee => (
                              <SelectItem key={assignee} value={assignee}>
                                {assignee}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          You can leave this blank to be assigned later.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit">Create Ticket</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

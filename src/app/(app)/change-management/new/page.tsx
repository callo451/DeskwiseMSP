
'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { clients, changeRequestStatusSettings, changeRequestRiskSettings, changeRequestImpactSettings } from '@/lib/placeholder-data';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const changeRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  clientId: z.string().min(1, 'Please select a client.'),
  status: z.string().min(1, 'Please select a status.'),
  riskLevel: z.string().min(1, 'Please select a risk level.'),
  impact: z.string().min(1, 'Please select an impact level.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  changePlan: z.string().min(20, 'Change plan must be at least 20 characters.'),
  rollbackPlan: z.string().min(20, 'Rollback plan must be at least 20 characters.'),
  plannedStartDate: z.date({ required_error: 'A planned start date is required.' }),
  plannedEndDate: z.date({ required_error: 'A planned end date is required.' }),
});

type ChangeRequestFormValues = z.infer<typeof changeRequestSchema>;

export default function NewChangeRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<ChangeRequestFormValues>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: {
      title: searchParams.get('title') || '',
      clientId: searchParams.get('clientId') || '',
      status: 'Pending Approval',
      riskLevel: 'Low',
      impact: 'Low',
      description: searchParams.get('description') || '',
      changePlan: '',
      rollbackPlan: '',
    },
  });

  const onSubmit = (data: ChangeRequestFormValues) => {
    console.log(data); // In a real app, you'd save this
    toast({
      title: 'Change Request Submitted',
      description: `Change request "${data.title}" has been created successfully.`,
    });
    router.push('/change-management');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <a href="/change-management"><ChevronLeft className="h-4 w-4" /></a>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">New Change Request</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Change Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Upgrade Primary Firewall Firmware" {...field} />
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
                        <FormLabel>Reason for Change</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the reason for the change, including the problem it solves." {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Plan</CardTitle>
                  <CardDescription>Provide a step-by-step plan for implementing the change.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="changePlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MarkdownEditor value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rollback Plan</CardTitle>
                  <CardDescription>Detail the procedure to revert the change if it fails.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="rollbackPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MarkdownEditor value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="clientId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                        <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl><SelectContent>{changeRequestStatusSettings.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>
                        <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="riskLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a risk level" /></SelectTrigger></FormControl><SelectContent>{changeRequestRiskSettings.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select>
                        <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="impact" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an impact level" /></SelectTrigger></FormControl><SelectContent>{changeRequestImpactSettings.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent></Select>
                        <FormMessage />
                      </FormItem>
                  )} />
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                  <CardTitle>Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="plannedStartDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Planned Start Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="plannedEndDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Planned End Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
               </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Submit for Approval</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

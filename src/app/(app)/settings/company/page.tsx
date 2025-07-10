
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Globe } from 'lucide-react';
import Link from 'next/link';

const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens."),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    // Pre-populate with existing data for a real implementation
    defaultValues: {
      companyName: 'My MSP Inc.',
      subdomain: 'my-msp',
    },
  });

  function onSubmit(data: CompanySettingsFormValues) {
    console.log(data);
    toast({
      title: 'Company Settings Saved',
      description: 'Your company details and subdomain have been updated.',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
          <Link href="/settings"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage your company information and branding.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
             <CardHeader>
              <CardTitle>Subdomain Configuration</CardTitle>
              <CardDescription>
                Set a unique subdomain for your client portal and SSO.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                       <div className="flex items-center">
                          <FormControl>
                            <Input {...field} className="rounded-r-none" />
                          </FormControl>
                          <span className="flex h-10 items-center rounded-r-md border border-l-0 border-input bg-secondary px-3 text-sm text-muted-foreground">
                            .deskwise.app
                          </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

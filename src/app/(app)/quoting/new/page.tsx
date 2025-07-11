
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { clients, serviceCatalogueItems } from '@/lib/placeholder-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const lineItemSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string(),
  description: z.string(),
  quantity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
});

const quoteSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  clientId: z.string().min(1, 'Please select a client.'),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']),
  lineItems: z.array(lineItemSchema).min(1, 'Quote must have at least one line item.'),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
};

export default function NewQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      subject: '',
      clientId: '',
      status: 'Draft',
      lineItems: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });
  
  const watchLineItems = form.watch('lineItems');
  const total = watchLineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const addServiceToQuote = (serviceId: string) => {
    const service = serviceCatalogueItems.find(s => s.id === serviceId);
    if (service) {
      append({
        serviceId: service.id,
        name: service.name,
        description: service.description,
        quantity: 1,
        price: service.price,
      });
    }
    setServiceSearchOpen(false);
  }

  const onSubmit = (data: QuoteFormValues) => {
    console.log(data); // In a real app, you'd save this
    toast({
      title: 'Quote Created',
      description: `Quote "${data.subject}" has been created successfully.`,
    });
    router.push('/quoting');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" href="/quoting">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">New Quote</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Q3 Managed Services Proposal" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="clientId" render={({ field }) => (
                        <FormItem><FormLabel>Client</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Add services to this quote from your service catalogue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Service</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <p className="font-medium">{field.name}</p>
                                        <p className="text-xs text-muted-foreground">{field.description}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" {...form.register(`lineItems.${index}.quantity`)} className="w-20"/>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" {...form.register(`lineItems.${index}.price`)} className="w-24"/>
                                    </TableCell>
                                    <TableCell>{formatCurrency(watchLineItems[index].quantity * watchLineItems[index].price)}</TableCell>
                                    <TableCell>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {fields.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No line items yet. Add a service to get started.
                        </div>
                    )}
                    <div className="mt-4">
                        <Popover open={serviceSearchOpen} onOpenChange={setServiceSearchOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search services..." />
                                    <CommandList>
                                        <CommandEmpty>No services found.</CommandEmpty>
                                        <CommandGroup>
                                            {serviceCatalogueItems.map((service) => (
                                                <CommandItem key={service.id} onSelect={() => addServiceToQuote(service.id)}>
                                                    {service.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end bg-secondary/50 p-4 font-semibold text-lg">
                    <div className="flex items-center gap-4">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </CardFooter>
            </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/quoting')}>Cancel</Button>
            <Button type="submit">Create Quote</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

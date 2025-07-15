'use client';

import { useState, useEffect } from 'react';
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
import { FileSignature, Calendar, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Quote, Contract } from '@/lib/types';

const contractFromQuoteSchema = z.object({
  name: z.string().min(1, 'Contract name is required'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Pending', 'Expired']).default('Pending'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  autoRenewal: z.boolean().default(false),
  renewalTermMonths: z.number().min(1).default(12),
});

type ContractFromQuoteValues = z.infer<typeof contractFromQuoteSchema>;

interface QuoteToContractDialogProps {
  quote: Quote;
  onConvert: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuoteToContractDialog({
  quote,
  onConvert,
  trigger,
  open,
  onOpenChange,
}: QuoteToContractDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const form = useForm<ContractFromQuoteValues>({
    resolver: zodResolver(contractFromQuoteSchema),
    defaultValues: {
      name: `${quote.name} - Service Contract`,
      description: quote.description || '',
      status: 'Pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      autoRenewal: false,
      renewalTermMonths: 12,
    },
  });

  const handleSubmit = async (values: ContractFromQuoteValues) => {
    setIsConverting(true);
    try {
      // Convert quote services to contract services
      const contractServices = quote.services.map(service => ({
        id: crypto.randomUUID(),
        name: service.name,
        description: service.description,
        quantity: service.quantity,
        rate: service.rate,
        total: service.quantity * service.rate,
      }));

      const contractData = {
        ...values,
        clientId: quote.clientId,
        clientName: quote.clientName,
        mrr: contractServices.reduce((sum, service) => sum + service.total, 0),
        services: contractServices,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      };

      await onConvert(contractData);
      
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
      
      form.reset();
    } catch (error) {
      console.error('Failed to convert quote to contract:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateMRR = () => {
    return quote.services.reduce((sum, service) => sum + (service.quantity * service.rate), 0);
  };

  const currentOpen = open !== undefined ? open : isOpen;
  const currentOnOpenChange = onOpenChange || setIsOpen;

  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Convert Quote to Contract
          </DialogTitle>
          <DialogDescription>
            Convert this quote into a service contract with recurring billing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quote:</span>
                <span className="font-medium">{quote.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="font-medium">{quote.clientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value:</span>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(quote.totalAmount)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(calculateMRR())}/month MRR
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Services:</span>
                <Badge variant="outline">{quote.services.length} services</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contract Details Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Service contract name" {...field} />
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
                        placeholder="Contract description and terms"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Services Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Contract Services</span>
                    <Badge variant="outline" className="text-sm">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(calculateMRR())}/month
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quote.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {service.quantity} × {formatCurrency(service.rate)}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(service.quantity * service.rate)}
                        </div>
                      </div>
                    ))}
                  </div>
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
                <Button type="submit" disabled={isConverting}>
                  {isConverting ? 'Converting...' : 'Create Contract'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
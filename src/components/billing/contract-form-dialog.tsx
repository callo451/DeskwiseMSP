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
  FormDescription,
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
import { PlusCircle, X, Calendar, DollarSign } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Contract, ContractService, Client } from '@/lib/types';

const contractServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be non-negative'),
  total: z.number().min(0),
});

const contractFormSchema = z.object({
  name: z.string().min(1, 'Contract name is required'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  status: z.enum(['Active', 'Pending', 'Expired']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  autoRenewal: z.boolean().default(false),
  renewalTermMonths: z.number().min(1).optional(),
  services: z.array(contractServiceSchema).min(1, 'At least one service is required'),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormDialogProps {
  contract?: Contract;
  onSave: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContractFormDialog({
  contract,
  onSave,
  trigger,
  open,
  onOpenChange,
}: ContractFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      name: contract?.name || '',
      description: contract?.description || '',
      clientId: contract?.clientId || '',
      status: contract?.status || 'Pending',
      startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      autoRenewal: contract?.autoRenewal || false,
      renewalTermMonths: contract?.renewalTermMonths || 12,
      services: contract?.services || [
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          quantity: 1,
          rate: 0,
          total: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'services',
  });

  const watchedServices = form.watch('services');

  // Update service totals when quantity or rate changes
  useEffect(() => {
    watchedServices.forEach((service, index) => {
      const total = service.quantity * service.rate;
      if (total !== service.total) {
        form.setValue(`services.${index}.total`, total);
      }
    });
  }, [watchedServices, form]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const clientsData = await response.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    if (isOpen || open) {
      fetchClients();
    }
  }, [isOpen, open]);

  const calculateMRR = () => {
    return watchedServices.reduce((sum, service) => sum + service.total, 0);
  };

  const handleSubmit = async (values: ContractFormValues) => {
    setIsSubmitting(true);
    try {
      const clientName = clients.find(c => c.id === values.clientId)?.name || '';
      const mrr = calculateMRR();

      const contractData = {
        ...values,
        clientName,
        mrr,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      };

      await onSave(contractData);
      
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
      
      form.reset();
    } catch (error) {
      console.error('Failed to save contract:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addService = () => {
    append({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      total: 0,
    });
  };

  const currentOpen = open !== undefined ? open : isOpen;
  const currentOnOpenChange = onOpenChange || setIsOpen;

  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? 'Edit Contract' : 'Create New Contract'}</DialogTitle>
          <DialogDescription>
            {contract ? 'Update contract details and services.' : 'Create a new service contract with recurring billing.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., IT Support Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {clients.map((client) => (
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
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
                    <FormItem className="flex-1">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Services</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    <DollarSign className="h-3 w-3 mr-1" />
                    MRR: ${calculateMRR().toLocaleString()}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addService}
                    className="h-8"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium">Service {index + 1}</h4>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`services.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Monthly IT Support" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Service description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Rate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">
                          ${(watchedServices[index]?.total || 0).toFixed(2)}
                        </span>
                      </div>
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
                {isSubmitting ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
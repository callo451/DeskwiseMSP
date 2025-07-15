'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { InventoryExtended } from '@/lib/services/inventory';

const inventoryFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['Hardware', 'Software License', 'Consumable', 'Part']),
  owner: z.string().min(1, 'Owner is required'),
  location: z.string().min(1, 'Location is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  reorderPoint: z.number().min(0, 'Reorder point must be non-negative'),
  notes: z.string().optional(),
  // Enhanced fields
  unitCost: z.number().min(0, 'Unit cost must be non-negative').optional(),
  supplier: z.string().optional(),
  supplierSku: z.string().optional(),
  barcode: z.string().optional(),
  serialNumbers: z.string().optional(), // Comma-separated list
  // Warranty info
  warrantyProvider: z.string().optional(),
  warrantyStartDate: z.date().optional(),
  warrantyEndDate: z.date().optional(),
  // Purchase info
  purchaseOrderNumber: z.string().optional(),
  purchaseDate: z.date().optional(),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  item?: InventoryExtended;
  onSuccess?: () => void;
}

export function InventoryForm({ item, onSuccess }: InventoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      sku: item?.sku || '',
      name: item?.name || '',
      category: item?.category || 'Hardware',
      owner: item?.owner || 'MSP',
      location: item?.location || '',
      quantity: item?.quantity || 0,
      reorderPoint: item?.reorderPoint || 0,
      notes: item?.notes || '',
      unitCost: item?.unitCost || undefined,
      supplier: item?.supplier || '',
      supplierSku: item?.supplierSku || '',
      barcode: item?.barcode || '',
      serialNumbers: item?.serialNumbers?.join(', ') || '',
      warrantyProvider: item?.warrantyInfo?.provider || '',
      warrantyStartDate: item?.warrantyInfo?.startDate ? new Date(item.warrantyInfo.startDate) : undefined,
      warrantyEndDate: item?.warrantyInfo?.endDate ? new Date(item.warrantyInfo.endDate) : undefined,
      purchaseOrderNumber: item?.purchaseInfo?.purchaseOrderNumber || '',
      purchaseDate: item?.purchaseInfo?.purchaseDate ? new Date(item.purchaseInfo.purchaseDate) : undefined,
      vendor: item?.purchaseInfo?.vendor || '',
      invoiceNumber: item?.purchaseInfo?.invoiceNumber || '',
    },
  });

  useEffect(() => {
    // Fetch available owners and locations - this would be from APIs in real implementation
    setOwners(['MSP', 'TechCorp', 'GlobalInnovate', 'SecureNet Solutions', 'DataFlow Dynamics']);
    setLocations(['Main Warehouse', 'Repair Bench', 'Digital', 'Client Site', 'Storage Room A', 'Storage Room B']);
  }, []);

  const onSubmit = async (data: InventoryFormData) => {
    try {
      setLoading(true);

      // Prepare the inventory data
      const inventoryData = {
        sku: data.sku,
        name: data.name,
        category: data.category,
        owner: data.owner,
        location: data.location,
        quantity: data.quantity,
        reorderPoint: data.reorderPoint,
        notes: data.notes,
        unitCost: data.unitCost,
        supplier: data.supplier,
        supplierSku: data.supplierSku,
        barcode: data.barcode,
        serialNumbers: data.serialNumbers ? data.serialNumbers.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        warrantyInfo: (data.warrantyProvider || data.warrantyStartDate || data.warrantyEndDate) ? {
          provider: data.warrantyProvider,
          startDate: data.warrantyStartDate,
          endDate: data.warrantyEndDate,
        } : undefined,
        purchaseInfo: (data.purchaseOrderNumber || data.purchaseDate || data.vendor || data.invoiceNumber) ? {
          purchaseOrderNumber: data.purchaseOrderNumber,
          purchaseDate: data.purchaseDate,
          vendor: data.vendor,
          invoiceNumber: data.invoiceNumber,
        } : undefined,
      };

      const url = item ? `/api/inventory/${item.id}` : '/api/inventory';
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save inventory item');
      }

      const savedItem = await response.json();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/inventory/${savedItem.id}`);
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      // In a real app, you'd show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about the inventory item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="HW-LAP-D01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique stock keeping unit identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dell Latitude 5420 Laptop" {...field} />
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
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Software License">Software License</SelectItem>
                        <SelectItem value="Consumable">Consumable</SelectItem>
                        <SelectItem value="Part">Part</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {owners.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      MSP for company stock, or client name for client-owned items
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Quantity threshold that triggers reorder alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this inventory item..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier & Tracking</CardTitle>
            <CardDescription>
              Supplier information and tracking details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="Dell Technologies" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierSku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="DELL-LAT-5420" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789012" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Numbers</FormLabel>
                    <FormControl>
                      <Input placeholder="SN001, SN002, SN003" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list for tracked items
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase & Warranty Information</CardTitle>
            <CardDescription>
              Purchase details and warranty tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PO-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="TechDistributors Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warrantyProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="Dell Warranty Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warrantyStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Warranty Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warrantyEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Warranty End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {item ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
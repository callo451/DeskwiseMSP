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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AssetExtended } from '@/lib/services/assets';

const assetFormSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  client: z.string().min(1, 'Client is required'),
  type: z.enum(['Server', 'Workstation', 'Network', 'Printer']),
  status: z.enum(['Online', 'Offline', 'Warning']),
  isSecure: z.boolean().default(false),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  os: z.string().optional(),
  notes: z.string().optional(),
  sku: z.string().optional(),
  contractId: z.string().optional(),
  // Enhanced fields
  purchaseDate: z.date().optional(),
  warrantyExpiration: z.date().optional(),
  // CPU details
  cpuModel: z.string().optional(),
  cpuUsage: z.number().min(0).max(100).default(0),
  // RAM details
  ramTotal: z.number().min(0).default(0),
  ramUsed: z.number().min(0).default(0),
  // Disk details
  diskTotal: z.number().min(0).default(0),
  diskUsed: z.number().min(0).default(0),
  // Specifications
  motherboard: z.string().optional(),
  gpu: z.string().optional(),
  biosVersion: z.string().optional(),
  serialNumber: z.string().optional(),
  // Location
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  rack: z.string().optional(),
  // Maintenance
  maintenanceFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).optional(),
  nextMaintenanceDate: z.date().optional(),
  // Depreciation
  depreciationMethod: z.enum(['straight_line', 'declining_balance']).optional(),
  usefulLife: z.number().min(1).optional(),
  salvageValue: z.number().min(0).default(0),
  currentValue: z.number().min(0).default(0),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  asset?: AssetExtended;
  onSuccess?: () => void;
}

export function AssetForm({ asset, onSuccess }: AssetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<string[]>([]);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name || '',
      client: asset?.client || '',
      type: asset?.type || 'Workstation',
      status: asset?.status || 'Online',
      isSecure: asset?.isSecure || false,
      ipAddress: asset?.ipAddress || '',
      macAddress: asset?.macAddress || '',
      os: asset?.os || '',
      notes: asset?.notes || '',
      sku: asset?.sku || '',
      contractId: asset?.contractId || '',
      purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate) : undefined,
      warrantyExpiration: asset?.warrantyExpiration ? new Date(asset.warrantyExpiration) : undefined,
      cpuModel: asset?.cpu?.model || '',
      cpuUsage: asset?.cpu?.usage || 0,
      ramTotal: asset?.ram?.total || 0,
      ramUsed: asset?.ram?.used || 0,
      diskTotal: asset?.disk?.total || 0,
      diskUsed: asset?.disk?.used || 0,
      motherboard: asset?.specifications?.motherboard || '',
      gpu: asset?.specifications?.gpu || '',
      biosVersion: asset?.specifications?.biosVersion || '',
      serialNumber: asset?.specifications?.serialNumber || '',
      building: asset?.location?.building || '',
      floor: asset?.location?.floor || '',
      room: asset?.location?.room || '',
      rack: asset?.location?.rack || '',
      maintenanceFrequency: asset?.maintenanceSchedule?.frequency,
      nextMaintenanceDate: asset?.maintenanceSchedule?.nextMaintenanceDate ? new Date(asset.maintenanceSchedule.nextMaintenanceDate) : undefined,
      depreciationMethod: asset?.depreciation?.method,
      usefulLife: asset?.depreciation?.usefulLife,
      salvageValue: asset?.depreciation?.salvageValue || 0,
      currentValue: asset?.depreciation?.currentValue || 0,
    },
  });

  useEffect(() => {
    // Fetch available clients - this would be from an API in real implementation
    setClients(['TechCorp', 'GlobalInnovate', 'SecureNet Solutions', 'DataFlow Dynamics']);
  }, []);

  const onSubmit = async (data: AssetFormData) => {
    try {
      setLoading(true);

      // Prepare the asset data
      const assetData = {
        name: data.name,
        client: data.client,
        type: data.type,
        status: data.status,
        isSecure: data.isSecure,
        lastSeen: new Date().toISOString(),
        ipAddress: data.ipAddress || '',
        macAddress: data.macAddress || '',
        os: data.os || '',
        cpu: {
          model: data.cpuModel || '',
          usage: data.cpuUsage,
        },
        ram: {
          total: data.ramTotal,
          used: data.ramUsed,
        },
        disk: {
          total: data.diskTotal,
          used: data.diskUsed,
        },
        notes: data.notes,
        activityLogs: asset?.activityLogs || [],
        associatedTickets: asset?.associatedTickets || [],
        specifications: {
          motherboard: data.motherboard,
          gpu: data.gpu,
          biosVersion: data.biosVersion,
          serialNumber: data.serialNumber,
        },
        sku: data.sku,
        contractId: data.contractId,
        purchaseDate: data.purchaseDate,
        warrantyExpiration: data.warrantyExpiration,
        maintenanceSchedule: data.maintenanceFrequency && data.nextMaintenanceDate ? {
          frequency: data.maintenanceFrequency,
          nextMaintenanceDate: data.nextMaintenanceDate,
          lastMaintenanceDate: asset?.maintenanceSchedule?.lastMaintenanceDate,
        } : undefined,
        depreciation: data.depreciationMethod && data.usefulLife ? {
          method: data.depreciationMethod,
          usefulLife: data.usefulLife,
          salvageValue: data.salvageValue,
          currentValue: data.currentValue,
        } : undefined,
        location: (data.building || data.floor || data.room || data.rack) ? {
          building: data.building,
          floor: data.floor,
          room: data.room,
          rack: data.rack,
        } : undefined,
      };

      const url = asset ? `/api/assets/${asset.id}` : '/api/assets';
      const method = asset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save asset');
      }

      const savedAsset = await response.json();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/assets/${savedAsset.id}`);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
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
              Essential details about the asset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="DC-SRV-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
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
                          <SelectItem key={client} value={client}>
                            {client}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Server">Server</SelectItem>
                        <SelectItem value="Workstation">Workstation</SelectItem>
                        <SelectItem value="Network">Network Device</SelectItem>
                        <SelectItem value="Printer">Printer</SelectItem>
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="macAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAC Address</FormLabel>
                    <FormControl>
                      <Input placeholder="00:1B:44:11:3A:B7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="os"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating System</FormLabel>
                    <FormControl>
                      <Input placeholder="Windows Server 2022" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="VM-12345-67890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isSecure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Secure</FormLabel>
                    <FormDescription>
                      Asset has security software installed and up to date
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hardware Specifications</CardTitle>
            <CardDescription>
              Technical specifications and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpuModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Intel Xeon E-2386G" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpuUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Usage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
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
                name="ramTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total RAM (GB)</FormLabel>
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
                name="ramUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Used RAM (GB)</FormLabel>
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
                name="diskTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Disk Space (GB)</FormLabel>
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
                name="diskUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Used Disk Space (GB)</FormLabel>
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
                name="motherboard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motherboard</FormLabel>
                    <FormControl>
                      <Input placeholder="Supermicro X12SPi-TF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graphics Card</FormLabel>
                    <FormControl>
                      <Input placeholder="ASPEED AST2600 BMC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="biosVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIOS Version</FormLabel>
                    <FormControl>
                      <Input placeholder="2.1b" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Management</CardTitle>
            <CardDescription>
              Physical location and asset management details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Office" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input placeholder="2nd Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <FormControl>
                      <Input placeholder="Server Room A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rack</FormLabel>
                    <FormControl>
                      <Input placeholder="Rack 1, Unit 5-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventory SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="HW-SRV-SM01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract ID</FormLabel>
                    <FormControl>
                      <Input placeholder="CTR-001" {...field} />
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
                name="warrantyExpiration"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Warranty Expiration</FormLabel>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this asset..."
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
            {asset ? 'Update Asset' : 'Create Asset'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
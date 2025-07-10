'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { inventoryItems } from '@/lib/placeholder-data';
import type { InventoryItem } from '@/lib/types';
import { ChevronLeft, Edit, PlusCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex justify-between items-center py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="font-medium text-right">{value}</div>
    </div>
  );
};

export default function InventoryItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const item = inventoryItems.find(i => i.id === params.id);
  
  const [quantity, setQuantity] = useState(item?.quantity || 0);

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Inventory Item Not Found</CardTitle>
            <CardDescription>The requested item could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/inventory">Back to Inventory</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleStockAdjustment = () => {
    // In a real app, this would be an API call
    toast({
        title: "Stock Adjusted",
        description: `Quantity for ${item.name} has been updated to ${quantity}.`
    });
  };

  const isLowStock = quantity <= item.reorderPoint;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
             <Button asChild variant="outline" size="icon" className="h-8 w-8">
                <Link href="/inventory"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back to inventory</span></Link>
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{item.name}</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            SKU: <span className="font-mono">{item.sku}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Item</Button>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Deploy as Asset</Button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border -mt-2">
              <DetailRow label="Category" value={<Badge variant="secondary">{item.category}</Badge>} />
              <DetailRow label="Owner" value={<Badge variant={item.owner === 'MSP' ? 'secondary' : 'outline'}>{item.owner}</Badge>} />
              <DetailRow label="Location" value={item.location} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <DetailRow label="Reorder Point" value={item.reorderPoint} />
                <div>
                  <label htmlFor="quantity" className="text-sm font-medium text-muted-foreground">Current Quantity</label>
                   <div className="flex items-center gap-2 mt-1">
                       <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                       <Button onClick={handleStockAdjustment}>Adjust</Button>
                   </div>
                   {isLowStock && (
                       <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                           <AlertCircle className="h-3 w-3" />
                           Stock is at or below reorder point.
                       </p>
                   )}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Internal notes about this inventory item.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add notes here..." defaultValue={item.notes} rows={6} />
            </CardContent>
            <CardFooter>
                <Button className="ml-auto">Save Notes</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

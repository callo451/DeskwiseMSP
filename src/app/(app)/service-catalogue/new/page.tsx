
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function NewServiceItemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" href="/service-catalogue">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">
          New Service Item
        </h1>
      </div>
      <form>
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Define a new standardized service offering.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                placeholder="e.g., Managed Workstation Support"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the service, what's included, etc."
                rows={4}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g., Support, Professional Services" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price / Rate</Label>
                <Input type="number" id="price" placeholder="150" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/service-catalogue">Cancel</Link>
            </Button>
            <Button type="submit">Create Service</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

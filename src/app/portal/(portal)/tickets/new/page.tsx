
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NewClientTicketPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/portal/tickets">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">
          Create a New Ticket
        </h1>
      </div>
      <form>
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Request</CardTitle>
            <CardDescription>
              Please provide as much detail as possible so we can assist you
              quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Cannot connect to the office Wi-Fi"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">
                      Medium - System performance issue
                    </SelectItem>
                    <SelectItem value="high">
                      High - Affecting multiple users
                    </SelectItem>
                    <SelectItem value="critical">
                      Critical - Business operations are down
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset">Affected Asset (Optional)</Label>
                <Select>
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ast-001">DC-SRV-01</SelectItem>
                    <SelectItem value="ast-005">TC-SQL-DB</SelectItem>
                    <SelectItem value="other">Other/Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue you're experiencing. Please include any error messages and steps to reproduce the problem."
                rows={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/portal/tickets">Cancel</Link>
            </Button>
            <Button type="submit">Submit Ticket</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

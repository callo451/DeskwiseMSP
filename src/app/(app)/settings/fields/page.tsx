'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Ticket, HardDrive, Users } from 'lucide-react';
import { customFields as allCustomFields } from '@/lib/placeholder-data';
import type { CustomField, CustomFieldType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


const fieldSchema = z.object({
  name: z.string().min(3, 'Field name must be at least 3 characters.'),
  type: z.enum(['Text', 'Textarea', 'Number', 'Checkbox', 'Date', 'Dropdown']),
  required: z.boolean(),
  options: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

function AddFieldDialog({ module, onFieldAdd }: { module: CustomField['module'], onFieldAdd: (values: any) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: { name: '', type: 'Text', required: false, options: '' },
  });

  const fieldType = form.watch('type');

  function onSubmit(data: FieldFormValues) {
    onFieldAdd({ ...data, id: `CF-NEW-${Date.now()}`, module });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Custom Field to {module}</DialogTitle>
          <DialogDescription>
            Create a new field to capture additional information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Onboarding Checklist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Text">Text</SelectItem>
                      <SelectItem value="Textarea">Textarea</SelectItem>
                      <SelectItem value="Number">Number</SelectItem>
                      <SelectItem value="Checkbox">Checkbox</SelectItem>
                      <SelectItem value="Date">Date</SelectItem>
                      <SelectItem value="Dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fieldType === 'Dropdown' && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dropdown Options</FormLabel>
                    <FormControl>
                      <Input placeholder="Option 1, Option 2, Option 3" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter comma-separated values for the dropdown.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Required Field</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create Field</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const CustomFieldsTable = ({ fields }: { fields: CustomField[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Field Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Required</TableHead>
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {fields.length > 0 ? (
        fields.map((field) => (
          <TableRow key={field.id}>
            <TableCell className="font-medium">{field.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{field.type}</Badge>
            </TableCell>
            <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center">
            No custom fields for this module yet.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export default function CustomFieldsPage() {
  const [customFields, setCustomFields] = useState(allCustomFields);
  const { toast } = useToast();

  const handleFieldAdd = (newField: CustomField) => {
    setCustomFields((prev) => [...prev, newField]);
    toast({
        title: "Field Created!",
        description: `The custom field "${newField.name}" has been added.`
    });
  };

  const ticketFields = customFields.filter((f) => f.module === 'Tickets');
  const assetFields = customFields.filter((f) => f.module === 'Assets');
  const clientFields = customFields.filter((f) => f.module === 'Clients');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tickets">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="tickets"><Ticket className="mr-2 h-4 w-4" />Tickets</TabsTrigger>
          <TabsTrigger value="assets"><HardDrive className="mr-2 h-4 w-4" />Assets</TabsTrigger>
          <TabsTrigger value="clients"><Users className="mr-2 h-4 w-4" />Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ticket Custom Fields</CardTitle>
                <CardDescription>Fields that will appear on ticket forms.</CardDescription>
              </div>
              <AddFieldDialog module="Tickets" onFieldAdd={handleFieldAdd} />
            </CardHeader>
            <CardContent>
              <CustomFieldsTable fields={ticketFields} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asset Custom Fields</CardTitle>
                <CardDescription>Fields that will appear on asset forms.</CardDescription>
              </div>
               <AddFieldDialog module="Assets" onFieldAdd={handleFieldAdd} />
            </CardHeader>
            <CardContent>
              <CustomFieldsTable fields={assetFields} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Custom Fields</CardTitle>
                <CardDescription>Fields that will appear on client records.</CardDescription>
              </div>
               <AddFieldDialog module="Clients" onFieldAdd={handleFieldAdd} />
            </CardHeader>
            <CardContent>
              <CustomFieldsTable fields={clientFields} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

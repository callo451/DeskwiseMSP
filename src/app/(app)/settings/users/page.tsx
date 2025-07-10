
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { users, roles } from '@/lib/placeholder-data';
import type { User, Role } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const UserRow = ({ user }: { user: User }) => {
  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Invited':
        return 'secondary';
      case 'Inactive':
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{user.role}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Deactivate User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const RoleRow = ({ role }: { role: Role }) => {
    return (
      <TableRow>
        <TableCell>
          <div className="font-medium">{role.name}</div>
          <div className="text-sm text-muted-foreground">{role.description}</div>
        </TableCell>
        <TableCell className="text-center">{role.userCount}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
              <DropdownMenuItem>Duplicate Role</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
};

const ssoSettingsSchema = z.object({
  enabled: z.boolean(),
  entityId: z.string().url().optional().or(z.literal('')),
  ssoUrl: z.string().url().optional().or(z.literal('')),
  certificate: z.string().optional(),
});
type SsoSettingsFormValues = z.infer<typeof ssoSettingsSchema>;

function SsoSettings() {
  const { toast } = useToast();
  const form = useForm<SsoSettingsFormValues>({
    resolver: zodResolver(ssoSettingsSchema),
    defaultValues: {
      enabled: false,
      entityId: 'https://api.serviceflow.ai/sso/metadata',
      ssoUrl: '',
      certificate: '',
    },
  });

  function onSubmit(data: SsoSettingsFormValues) {
    console.log(data);
    toast({
      title: 'SSO Settings Saved',
      description: 'Your SAML SSO settings have been updated.',
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Single Sign-On (SSO)</CardTitle>
            <CardDescription>
              Manage how your users sign in with SAML 2.0 and provision users with SCIM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable SAML SSO</FormLabel>
                    <FormDescription>
                      Allow users to log in through your identity provider.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <CardTitle className="text-xl pt-4">Service Provider Details</CardTitle>
            <CardDescription>Use these values to configure your Identity Provider (IdP).</CardDescription>
            <div>
              <FormLabel>Entity ID / Audience URI</FormLabel>
              <Input readOnly value="https://api.serviceflow.ai/sso/metadata" />
            </div>
            <div>
              <FormLabel>Assertion Consumer Service (ACS) URL</FormLabel>
              <Input readOnly value="https://api.serviceflow.ai/sso/acs" />
            </div>

            <CardTitle className="text-xl pt-4">Identity Provider Details</CardTitle>
            <CardDescription>Provide these details from your IdP.</CardDescription>
            <FormField
              control={form.control}
              name="ssoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IdP SSO URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://idp.example.com/sso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certificate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X.509 Certificate</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste your certificate here..." {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


export default function UserManagementPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Users & Permissions</h1>
        <p className="text-muted-foreground">
          Manage who has access to your workspace and what they can do.
        </p>
      </div>

       <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Invite, manage, and remove team members.</CardDescription>
                        </div>
                        <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Invite User</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="hidden sm:table-cell">Role</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead>
                            <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {users.map(user => (
                            <UserRow key={user.id} user={user} />
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="roles" className="mt-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>Define permission sets to assign to users.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-center">Users</TableHead>
                            <TableHead>
                            <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {roles.map(role => (
                            <RoleRow key={role.id} role={role} />
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sso" className="mt-6">
          <SsoSettings />
        </TabsContent>
       </Tabs>
    </div>
  );
}

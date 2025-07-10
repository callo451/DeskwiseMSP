
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
import { users, roles, userGroups } from '@/lib/placeholder-data';
import type { User, Role, UserGroup } from '@/lib/types';
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

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

const PermissionIcon = ({ allowed }: { allowed: boolean }) => {
    return allowed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-muted-foreground" />
    );
};

const PermissionRow = ({ label, value }: { label: string, value: boolean | string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {typeof value === 'boolean' ? (
        <PermissionIcon allowed={value} />
      ) : (
        <Badge variant="secondary" className="capitalize text-xs">{value.replace(/_/g, ' ')}</Badge>
      )}
    </div>
);

const RoleCard = ({ role }: { role: Role }) => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{role.name}</CardTitle>
              <CardDescription>{role.userCount} users • {role.description}</CardDescription>
            </div>
             <Button variant="outline" size="sm">Edit</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold text-sm">Tickets</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="Create" value={role.permissions.tickets.create} />
                    <PermissionRow label="Read Access" value={role.permissions.tickets.read} />
                    <PermissionRow label="Update" value={role.permissions.tickets.update} />
                    <PermissionRow label="Delete" value={role.permissions.tickets.delete} />
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-sm">Clients</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="Create" value={role.permissions.clients.create} />
                    <PermissionRow label="Read" value={role.permissions.clients.read} />
                    <PermissionRow label="Update" value={role.permissions.clients.update} />
                    <PermissionRow label="Delete" value={role.permissions.clients.delete} />
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-sm">Assets</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="Create" value={role.permissions.assets.create} />
                    <PermissionRow label="Read" value={role.permissions.assets.read} />
                    <PermissionRow label="Update" value={role.permissions.assets.update} />
                    <PermissionRow label="Delete" value={role.permissions.assets.delete} />
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-sm">Inventory</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="Create" value={role.permissions.inventory.create} />
                    <PermissionRow label="Read" value={role.permissions.inventory.read} />
                    <PermissionRow label="Update" value={role.permissions.inventory.update} />
                    <PermissionRow label="Delete" value={role.permissions.inventory.delete} />
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-sm">Knowledge Base</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="Create" value={role.permissions.knowledgeBase.create} />
                    <PermissionRow label="Read Access" value={role.permissions.knowledgeBase.read} />
                    <PermissionRow label="Update" value={role.permissions.knowledgeBase.update} />
                    <PermissionRow label="Delete" value={role.permissions.knowledgeBase.delete} />
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-sm">Reports</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="View Reports" value={role.permissions.reports.view} />
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-sm">Settings</h4>
                <div className="divide-y mt-2 border-t">
                    <PermissionRow label="Admin Access" value={role.permissions.settings.adminAccess} />
                </div>
            </div>
        </CardContent>
      </Card>
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
      entityId: 'https://api.deskwise.io/sso/metadata',
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
              <Input readOnly value="https://api.deskwise.io/sso/metadata" />
            </div>
            <div>
              <FormLabel>Assertion Consumer Service (ACS) URL</FormLabel>
              <Input readOnly value="https://api.deskwise.io/sso/acs" />
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

const UserGroups = () => {
  const allUsers = React.useMemo(() => {
    const userMap = new Map<string, User>();
    users.forEach(user => userMap.set(user.id, user));
    return userMap;
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Groups</CardTitle>
              <CardDescription>Manage groups for visibility and permissions.</CardDescription>
            </div>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              New Group
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {userGroups.map(group => (
          <Card key={group.id} className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2"><Users2 className="h-5 w-5" />{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold text-sm mb-2">Members ({group.memberIds.length})</h4>
              <div className="flex flex-wrap gap-2">
                {group.memberIds.map(memberId => {
                  const user = allUsers.get(memberId);
                  return user ? (
                    <Badge key={user.id} variant="outline" className="flex items-center gap-2 pr-1">
                       <Avatar className="h-4 w-4">
                         <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                         <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       {user.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};


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
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Roles</h2>
                    <p className="text-muted-foreground">Define permission sets to assign to users.</p>
                </div>
                 <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    New Role
                </Button>
            </div>
            <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map(role => (
                    <RoleCard key={role.id} role={role} />
                ))}
            </div>
        </TabsContent>
        <TabsContent value="groups" className="mt-6">
          <UserGroups />
        </TabsContent>
        <TabsContent value="sso" className="mt-6">
          <SsoSettings />
        </TabsContent>
       </Tabs>
    </div>
  );
}

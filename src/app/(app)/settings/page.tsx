
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  CreditCard,
  Cog,
  Shield,
  Plug,
  ChevronRight,
  FileCode,
  Globe,
  Smile,
  Ticket,
  HardDrive,
  Warehouse,
  Building,
  LayoutGrid,
  History,
  KanbanSquare,
  Hash,
  User,
} from 'lucide-react';
import Link from 'next/link';

const personalSettingsItems = [
  {
    icon: User,
    title: 'Profile & Account',
    description: 'Manage your personal profile, password, and account settings.',
    href: '/user-profile',
    target: '_self',
  },
];

const settingsItems = [
  {
    icon: Building,
    title: 'Company Settings',
    description: 'Manage your company info and subdomain.',
    href: '/settings/company',
    target: '_self',
  },
  {
    icon: Users,
    title: 'Users & Permissions',
    description: 'Manage user accounts, roles, and single sign-on.',
    href: '/settings/users',
    target: '_self',
  },
  {
    icon: LayoutGrid,
    title: 'Modules',
    description: 'Enable or disable application modules.',
    href: '/settings/modules',
    target: '_self',
  },
    {
    icon: Hash,
    title: 'Numbering Schemes',
    description: 'Customize ID prefixes and suffixes.',
    href: '/settings/numbering',
    target: '_self',
  },
  {
    icon: CreditCard,
    title: 'Billing & Subscriptions',
    description: 'Manage your payment methods and plan.',
    href: '/settings/billing',
    target: '_self',
  },
  {
    icon: Cog,
    title: 'Custom Fields',
    description: 'Create and manage custom fields for modules.',
    href: '/settings/fields',
    target: '_self',
  },
  {
    icon: KanbanSquare,
    title: 'Project Management',
    description: 'Configure project statuses and templates.',
    href: '/settings/projects',
    target: '_self',
  },
  {
    icon: Ticket,
    title: 'Ticket Management',
    description: 'Manage queues, statuses, and priorities.',
    href: '/settings/tickets',
    target: '_self',
  },
  {
    icon: HardDrive,
    title: 'Asset Management',
    description: 'Manage asset statuses, categories, and locations.',
    href: '/settings/assets',
    target: '_self',
  },
  {
    icon: Warehouse,
    title: 'Inventory Management',
    description: 'Manage inventory categories, locations, and suppliers.',
    href: '/settings/inventory',
    target: '_self',
  },
  {
    icon: History,
    title: 'Change Management',
    description: 'Manage statuses, risk, and impact levels for changes.',
    href: '/settings/change-management',
    target: '_self',
  },
  {
    icon: Shield,
    title: 'SLA Management',
    description: 'Define and manage Service Level Agreements.',
    href: '/settings/sla',
    target: '_self',
  },
  {
    icon: Smile,
    title: 'CSAT Management',
    description: 'Configure and monitor customer satisfaction surveys.',
    href: '/settings/csat',
    target: '_self',
  },
  {
    icon: FileCode,
    title: 'Script Repository',
    description: 'Manage and generate scripts for automation.',
    href: '/settings/script-repository',
    target: '_self',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description: 'Connect with RMM and other third-party apps.',
    href: '/settings/integrations',
    target: '_self',
  },
  {
    icon: Globe,
    title: 'Client Portal',
    description: 'Preview the client-facing portal.',
    href: '/portal/login',
    target: '_blank',
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Settings</CardTitle>
            <CardDescription>
              Manage your personal account and profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {personalSettingsItems.map(item => (
                <Link
                  href={item.href}
                  key={item.title}
                  className="block hover:bg-secondary/50 -mx-6 px-6 py-4"
                  target={item.target}
                  rel={
                    item.target === '_blank' ? 'noopener noreferrer' : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <item.icon className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Configure core application modules and integrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {settingsItems.map(item => (
                <Link
                  href={item.href}
                  key={item.title}
                  className="block hover:bg-secondary/50 -mx-6 px-6 py-4"
                  target={item.target}
                  rel={
                    item.target === '_blank' ? 'noopener noreferrer' : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <item.icon className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  Lock,
  Cog,
  Shield,
  Plug,
  ChevronRight,
  FileCode,
} from 'lucide-react';
import Link from 'next/link';

const settingsItems = [
  {
    icon: Users,
    title: 'Users & Permissions',
    description: 'Manage user accounts and roles.',
    href: '/settings/users',
  },
  {
    icon: CreditCard,
    title: 'Billing & Subscriptions',
    description: 'Manage your payment methods and plan.',
    href: '/settings/billing',
  },
  {
    icon: Lock,
    title: 'SAML SSO',
    description: 'Configure Single Sign-On for your organization.',
    href: '/settings/sso',
  },
  {
    icon: Cog,
    title: 'Custom Fields',
    description: 'Create and manage custom fields for modules.',
    href: '/settings/fields',
  },
  {
    icon: Shield,
    title: 'SLA Management',
    description: 'Define and manage Service Level Agreements.',
    href: '/settings/sla',
  },
  {
    icon: FileCode,
    title: 'Script Repository',
    description: 'Manage and generate scripts for automation.',
    href: '/settings/script-repository',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description: 'Connect with RMM and other third-party apps.',
    href: '/settings/integrations',
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
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              View and update your personal and company information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* General Settings Form can go here */}
            <p className="text-sm text-muted-foreground">Profile and company settings form will be here.</p>
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
                    <Link href={item.href} key={item.title} className="block hover:bg-secondary/50 -mx-6 px-6 py-4">
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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Zap, Users, BarChart3, Shield, BookOpen, CreditCard, History, Flame, Gem, KanbanSquare, Library, FileText, Warehouse, Calendar, Contact, Settings } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const featureGroups = {
  'Service Desk': [
    {
      icon: Ticket,
      title: 'Advanced Ticketing',
      description: 'Centralize all your support requests with powerful routing, automations, and SLA management to ensure nothing gets missed.',
    },
    {
      icon: Flame,
      title: 'Incident Management',
      description: 'Declare and manage major incidents, keeping stakeholders informed with public or private status pages and updates.',
    },
    {
      icon: History,
      title: 'Change Management',
      description: 'Implement changes with confidence using structured approval workflows, change plans, and rollback procedures.',
    },
     {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Build internal SOPs and public help articles. Use AI to generate clear, helpful content in seconds.',
    },
  ],
  'Automation & AI': [
    {
      icon: Zap,
      title: 'AI Copilot',
      description: 'From suggesting ticket categories and replies to summarizing long ticket threads, our AI works alongside you to close tickets faster.',
    },
    {
      icon: BarChart3,
      title: 'AI-Powered Reporting',
      description: 'Use our AI pilot to generate reports with natural language, or dive deep with the manual builder to get the exact data you need.',
    },
  ],
  'Business Management (MSP)': [
    {
      icon: Users,
      title: '360° Client View',
      description: 'Manage clients, contacts, assets, and contracts from a single place. Understand client health at a glance with AI-powered insights.',
    },
     {
      icon: FileText,
      title: 'Quoting',
      description: 'Create professional quotes from your service catalogue, with support for templates and multiple revisions.',
    },
    {
      icon: CreditCard,
      title: 'Billing & Contracts',
      description: 'Manage recurring billing contracts and generate invoices from project milestones or time logs.',
    },
  ],
  'Resource & Project Management': [
     {
      icon: KanbanSquare,
      title: 'Project Management',
      description: 'Plan and execute complex projects with tasks, milestones, and Kanban boards. Keep your team and clients aligned.',
    },
    {
      icon: HardDrive,
      title: 'Asset Management',
      description: 'Track and manage hardware and software assets throughout their lifecycle with RMM integration.',
    },
    {
      icon: Warehouse,
      title: 'Inventory Management',
      description: 'Manage your stock of hardware, parts, and consumables across multiple locations.',
    },
    {
      icon: Calendar,
      title: 'Scheduling',
      description: 'Dispatch technicians and manage appointments with a shared, interactive calendar.',
    },
  ],
  'Platform': [
    {
      icon: Gem,
      title: 'Internal IT Mode',
      description: 'A dedicated mode that transforms Deskwise into a focused ITSM tool, hiding all MSP-specific features.',
    },
     {
      icon: Settings,
      title: 'Customization',
      description: 'Tailor the platform to your needs with custom fields, statuses, and configurable modules.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Protect your data with SSO, MFA, and robust permission controls. Learn more on our security page.',
      href: '/security',
    },
  ]
};

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">A Platform Built for Service Excellence</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Deskwise provides a comprehensive suite of tools to manage every aspect of your service delivery, from the first contact to the final invoice.
        </p>
      </div>

      {Object.entries(featureGroups).map(([groupTitle, features]) => (
        <div key={groupTitle} className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold font-headline mb-8 text-center">{groupTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                     <div className="bg-primary/10 p-3 rounded-lg">
                       <feature.icon className="h-6 w-6 text-primary" />
                     </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                {feature.href && (
                  <CardContent>
                     <Button variant="link" asChild className="p-0">
                       <Link href={feature.href}>Learn more &rarr;</Link>
                     </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

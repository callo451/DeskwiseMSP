import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Zap, Users, BarChart3, Shield, BookOpen, CreditCard, History, Flame, Gem } from 'lucide-react';
import Image from 'next/image';

const featureList = [
  {
    icon: Ticket,
    title: 'Advanced Ticketing',
    description: 'Centralize all your support requests with powerful routing, automations, and SLA management to ensure nothing gets missed.',
  },
  {
    icon: Zap,
    title: 'AI Copilot',
    description: 'From suggesting ticket categories and replies to summarizing long ticket threads, our AI works alongside you to close tickets faster.',
  },
  {
    icon: Users,
    title: '360° Client View',
    description: 'Manage clients, contacts, assets, and contracts from a single place. Understand client health at a glance with AI-powered insights.',
  },
  {
    icon: Shield,
    title: 'Project Management',
    description: 'Plan and execute complex projects with tasks, milestones, and Kanban boards. Keep your team and clients aligned.',
  },
  {
    icon: History,
    title: 'Change Management',
    description: 'Implement changes with confidence using structured approval workflows, change plans, and rollback procedures.',
  },
  {
    icon: Flame,
    title: 'Incident Management',
    description: 'Declare and manage major incidents, keeping stakeholders informed with public or private status pages and updates.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description: 'Build internal SOPs and public help articles. Use AI to generate clear, helpful content in seconds.',
  },
  {
    icon: CreditCard,
    title: 'Billing & Quoting',
    description: 'Create quotes from your service catalogue and manage recurring billing contracts with ease.',
  },
  {
    icon: BarChart3,
    title: 'Custom Reporting',
    description: 'Use our AI pilot to generate reports with natural language, or dive deep with the manual builder to get the exact data you need.',
  },
  {
    icon: Gem,
    title: 'Internal IT Mode',
    description: 'A dedicated mode that transforms ServiceFlow into a focused ITSM tool, hiding all MSP-specific features.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">A Smarter Way to Manage Your Services</h1>
        <p className="text-lg text-muted-foreground mt-4">
          ServiceFlow AI brings together everything you need to run a successful service desk, supercharged with intelligent automation.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((feature) => (
          <Card key={feature.title} className="border-t-4 border-primary bg-secondary/30">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

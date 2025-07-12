import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Zap, Shield, BarChart3, Users, Ticket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: Ticket,
    title: 'Unified Ticketing',
    description: 'Manage tickets from all channels in one place with powerful automation and SLA tracking.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Leverage AI to categorize tickets, suggest replies, and identify client health risks before they escalate.',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'A complete view of your clients, including contacts, assets, contracts, and service history.',
  },
  {
    icon: Shield,
    title: 'Project & Change Management',
    description: 'Run complex projects and manage IT changes with structured, auditable workflows.',
  },
  {
    icon: BarChart3,
    title: 'Powerful Reporting',
    description: 'Build custom reports with our AI pilot or manual builder to get the data you need.',
  },
  {
    icon: CheckCircle,
    title: 'Internal IT Mode',
    description: 'Switch to a focused ITSM experience, hiding MSP-specific features for your internal team.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Now with Internal IT Mode</Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">The AI-Powered Service Platform</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            ServiceFlow AI is the all-in-one platform for MSPs and IT teams, combining a full-featured PSA & ITSM with powerful AI to automate your workload and delight your users.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Everything you need. Nothing you don’t.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
              From ticketing to billing, ServiceFlow is your single source of truth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center bg-background/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Internal IT vs MSP Section */}
       <section className="py-20">
        <div className="container mx-auto px-4">
           <div className="grid lg:grid-cols-2 gap-12 items-center">
             <div>
                <Badge>One Platform, Two Modes</Badge>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-4">Built for MSPs.<br/>Perfect for Internal IT.</h2>
                <p className="text-lg text-muted-foreground mt-4">
                    ServiceFlow is the only platform that adapts to your business model. Use our full suite of MSP tools, or toggle to a streamlined ITSM experience for your internal IT department. All your data, one flexible interface.
                </p>
                 <ul className="mt-6 space-y-4">
                    <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Full-Featured MSP Mode</h4>
                            <p className="text-muted-foreground">Includes client management, billing, contracts, and quoting.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Focused Internal IT Mode</h4>
                            <p className="text-muted-foreground">A clean ITSM experience focusing on tickets, assets, and users.</p>
                        </div>
                    </li>
                </ul>
             </div>
             <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-2 rounded-lg">
                <Image src="https://placehold.co/600x450/3498db/ecf0f1.png" width={600} height={450} alt="ServiceFlow Dashboard" className="rounded-md shadow-2xl" data-ai-hint="dashboard computer" />
             </div>
           </div>
        </div>
       </section>
    </div>
  );
}

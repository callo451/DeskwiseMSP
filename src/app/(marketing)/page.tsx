
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Zap, Shield, BarChart3, Users, Ticket, Quote } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    quote: "Deskwise AI has revolutionized how we manage tickets. The AI suggestions save us hours every week, and our CSAT scores have never been higher.",
    name: "Sarah Johnson",
    title: "IT Director, TechCorp",
    avatar: "https://placehold.co/40x40/c2410c/FFFFFF.png",
    avatarHint: "woman face"
  },
  {
    quote: "As an MSP, having a single platform for ticketing, projects, and billing has been a game-changer. The Internal IT mode is also brilliant for our bigger clients who co-manage.",
    name: "Michael Chen",
    title: "CEO, Innovate MSP",
    avatar: "https://placehold.co/40x40/09a0f7/FFFFFF.png",
    avatarHint: "man face"
  },
  {
    quote: "The reporting tools are incredibly powerful. I can get insights in seconds with natural language, which used to take me hours to pull from our old system.",
    name: "David Rodriguez",
    title: "Operations Manager, GlobalInnovate",
    avatar: "https://placehold.co/40x40/00d46a/FFFFFF.png",
    avatarHint: "man face"
  }
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
            Deskwise is the all-in-one platform for MSPs and IT teams, combining a full-featured PSA & ITSM with powerful AI to automate your workload and delight your users.
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

      {/* Feature Spotlight Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 space-y-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
             <div>
                <Badge>Unified Service Desk</Badge>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-4">A smarter, faster ticketing system.</h2>
                <p className="text-lg text-muted-foreground mt-4">
                    Stop juggling tools. Deskwise unifies tickets, incidents, problems, and changes into one intelligent platform. Our AI Copilot helps categorize tickets, suggests replies, and summarizes long threads so your team can focus on what matters.
                </p>
                 <ul className="mt-6 space-y-4">
                    <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" /><div><h4 className="font-semibold">AI-Powered Automation</h4><p className="text-muted-foreground">Automate ticket routing, categorization, and replies.</p></div></li>
                     <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" /><div><h4 className="font-semibold">Integrated Knowledge Base</h4><p className="text-muted-foreground">Find and attach relevant articles without leaving the ticket.</p></div></li>
                </ul>
             </div>
             <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-2 rounded-lg">
                <Image src="https://placehold.co/600x450/3498db/ecf0f1.png" width={600} height={450} alt="Deskwise Ticketing Dashboard" className="rounded-md shadow-2xl" data-ai-hint="dashboard computer" />
             </div>
           </div>

           <div className="grid lg:grid-cols-2 gap-12 items-center">
             <div className="bg-gradient-to-bl from-primary/20 to-accent/20 p-2 rounded-lg lg:order-last">
                <Image src="https://placehold.co/600x450/2ecc71/ecf0f1.png" width={600} height={450} alt="Deskwise Client Management" className="rounded-md shadow-2xl" data-ai-hint="collaboration business" />
             </div>
             <div>
                <Badge>MSP & Internal IT</Badge>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-4">One platform, two modes.</h2>
                <p className="text-lg text-muted-foreground mt-4">
                    Deskwise is the only platform that adapts to your business model. Use our full suite of MSP tools, or toggle to a streamlined ITSM experience for your internal IT department. All your data, one flexible interface.
                </p>
                 <ul className="mt-6 space-y-4">
                    <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" /><div><h4 className="font-semibold">Full-Featured MSP Mode</h4><p className="text-muted-foreground">Includes client management, billing, contracts, and quoting.</p></div></li>
                     <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0" /><div><h4 className="font-semibold">Focused Internal IT Mode</h4><p className="text-muted-foreground">A clean ITSM experience focusing on tickets, assets, and users.</p></div></li>
                </ul>
             </div>
           </div>
        </div>
       </section>
      
      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Loved by modern service teams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
              Don't just take our word for it. Here's what our customers are saying.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="flex flex-col">
                <CardContent className="pt-6 flex-1">
                  <Quote className="h-8 w-8 text-primary/50 mb-4" />
                  <p className="text-muted-foreground">"{testimonial.quote}"</p>
                </CardContent>
                <CardFooter>
                   <div className="flex items-center gap-3">
                     <Image src={testimonial.avatar} width={40} height={40} alt={testimonial.name} className="rounded-full" data-ai-hint={testimonial.avatarHint} />
                     <div>
                       <p className="font-semibold">{testimonial.name}</p>
                       <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                     </div>
                   </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Final CTA Section */}
       <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Transform Your Service Delivery?</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                Join hundreds of successful service teams who use Deskwise to work smarter, not harder.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/signup">Start Your 14-Day Free Trial</Link>
            </Button>
        </div>
       </section>

    </div>
  );
}

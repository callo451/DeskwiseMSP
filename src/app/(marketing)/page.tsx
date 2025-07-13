'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, Zap, Shield, BarChart3, Users, Ticket, Quote as QuoteIcon, ArrowRight, Play, Star, Award, TrendingUp, Clock, Brain, Sparkles, Workflow, Globe, Lock, Lightbulb, Users2, Target, Gauge } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

const stats = [
  { value: '500+', label: 'Companies Trust Us', icon: Users2 },
  { value: '99.9%', label: 'Uptime SLA', icon: Gauge },
  { value: '2.5x', label: 'Faster Resolution', icon: TrendingUp },
  { value: '24/7', label: 'AI-Powered Support', icon: Brain }
];

const testimonials = [
  {
    quote: "Deskwise AI has revolutionized how we manage tickets. The AI suggestions save us hours every week, and our CSAT scores have never been higher.",
    name: "Sarah Johnson",
    title: "IT Director, TechCorp",
    avatar: "https://placehold.co/40x40/c2410c/FFFFFF.png",
    avatarHint: "woman face",
    rating: 5,
    company: "TechCorp Solutions"
  },
  {
    quote: "As an MSP, having a single platform for ticketing, projects, and billing has been a game-changer. The Internal IT mode is also brilliant for our bigger clients who co-manage.",
    name: "Michael Chen",
    title: "CEO, Innovate MSP",
    avatar: "https://placehold.co/40x40/09a0f7/FFFFFF.png",
    avatarHint: "man face",
    rating: 5,
    company: "Innovate MSP"
  },
  {
    quote: "The reporting tools are incredibly powerful. I can get insights in seconds with natural language, which used to take me hours to pull from our old system.",
    name: "David Rodriguez",
    title: "Operations Manager, GlobalInnovate",
    avatar: "https://placehold.co/40x40/00d46a/FFFFFF.png",
    avatarHint: "man face",
    rating: 5,
    company: "GlobalInnovate Inc"
  }
];

const features = [
  {
    icon: Brain,
    title: "AI-First Approach",
    description: "Smart automation that learns from your team's patterns"
  },
  {
    icon: Workflow,
    title: "Unified Platform",
    description: "Everything you need in one seamlessly integrated solution"
  },
  {
    icon: Globe,
    title: "Multi-Mode Design",
    description: "Adapts perfectly to MSP or Internal IT workflows"
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-grade security with SOC 2 Type II compliance"
  }
];

const integrations = [
  "Microsoft 365", "Slack", "Teams", "Jira", "GitHub", "AWS", "Azure", "Google Workspace"
];

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < numericValue) {
        setCount(prev => Math.min(prev + Math.ceil(numericValue / 50), numericValue));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count, numericValue]);

  return (
    <span>
      {value.includes('.') ? value : `${count}${value.replace(/[0-9]/g, '')}${suffix}`}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div 
            className="absolute inset-0 opacity-40" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-4 py-2 text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              Now with Advanced AI Capabilities
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline mb-6 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent leading-tight">
            Service Desk
            <br />
            <span className="text-foreground">Reimagined</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            The only platform that combines <span className="text-primary font-semibold">AI-powered automation</span> with comprehensive PSA & ITSM capabilities. Transform how your team delivers exceptional service.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <SignedOut>
              <SignUpButton>
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/dashboard" className="flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </SignedIn>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:bg-primary/5">
              <Link href="#demo" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
      
      {/* Trust Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8 font-medium">Trusted by leading organizations worldwide</p>
          <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap opacity-60">
            {integrations.map((integration, index) => (
              <div key={index} className="text-lg font-semibold text-muted-foreground hover:text-primary transition-colors">
                {integration}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Why Teams Choose Deskwise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four core principles that make us the leading choice for modern service teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Feature Spotlight Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto px-4 space-y-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20">AI-Powered Service Desk</Badge>
                <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">Tickets that resolve themselves</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Our AI doesn't just categorize tickets—it understands context, suggests solutions, and can even resolve common issues automatically. Your team focuses on complex problems while AI handles the routine.
                </p>
                 <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg mt-1">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Intelligent Auto-Resolution</h4>
                        <p className="text-muted-foreground">AI resolves 40% of tickets automatically with 95% accuracy</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg mt-1">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Smart Suggestions</h4>
                        <p className="text-muted-foreground">Context-aware recommendations from your knowledge base</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg mt-1">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Predictive Insights</h4>
                        <p className="text-muted-foreground">Identify issues before they become problems</p>
                      </div>
                    </div>
                </div>
                <Button asChild className="mt-6">
                  <Link href="/features" className="flex items-center gap-2">
                    Explore AI Features
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
             </div>
             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-6"></div>
                <div className="relative bg-background border-2 border-primary/10 rounded-2xl p-2 shadow-2xl">
                  <Image src="https://placehold.co/600x450/3498db/ecf0f1.png" width={600} height={450} alt="AI-Powered Ticketing Dashboard" className="rounded-xl" data-ai-hint="AI dashboard with charts and automation" />
                </div>
             </div>
           </div>

           <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="relative lg:order-first">
                <div className="absolute inset-0 bg-gradient-to-bl from-accent/20 to-primary/20 rounded-2xl transform -rotate-6"></div>
                <div className="relative bg-background border-2 border-primary/10 rounded-2xl p-2 shadow-2xl">
                  <Image src="https://placehold.co/600x450/2ecc71/ecf0f1.png" width={600} height={450} alt="Unified Platform Interface" className="rounded-xl" data-ai-hint="modern business interface with multiple modules" />
                </div>
             </div>
             <div className="space-y-6">
                <Badge className="bg-accent/10 text-accent-foreground border-accent/20">Adaptive Platform</Badge>
                <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">One platform that grows with you</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Whether you're a 3-person IT team or a 500+ MSP, Deskwise adapts to your needs. Switch between MSP and Internal IT modes instantly, access only the features you need, and scale without limits.
                </p>
                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg">MSP Mode</h4>
                      <p className="text-muted-foreground text-sm">Full suite: clients, billing, contracts, quoting, and comprehensive reporting</p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h4 className="font-semibold text-lg">Internal IT Mode</h4>
                      <p className="text-muted-foreground text-sm">Streamlined ITSM focused on tickets, assets, and internal workflows</p>
                    </div>
                </div>
                <Button asChild variant="outline" className="border-2">
                  <Link href="/pricing" className="flex items-center gap-2">
                    View Pricing Plans
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
             </div>
           </div>
        </div>
       </section>
      
      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-lg font-semibold text-primary">4.9/5</span>
              <span className="text-muted-foreground">from 500+ reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Trusted by industry leaders</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how leading MSPs and IT teams are transforming their service delivery with Deskwise
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                <CardContent className="pt-8 pb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image 
                        src={testimonial.avatar} 
                        width={48} 
                        height={48} 
                        alt={testimonial.name} 
                        className="rounded-full ring-2 ring-primary/20" 
                        data-ai-hint={testimonial.avatarHint} 
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.title}</p>
                      <p className="text-primary text-sm font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/case-studies" className="flex items-center gap-2">
                Read More Success Stories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

       {/* ROI Section */}
       <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6">
                <Award className="w-4 h-4 mr-2" />
                Proven Results
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">See measurable results in 30 days</h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Our customers typically see a 250% ROI within the first quarter. Reduce resolution times, increase customer satisfaction, and free up your team for strategic work.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">-60%</div>
                  <div className="text-white/90">Resolution Time</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">+40%</div>
                  <div className="text-white/90">Team Productivity</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
                  <div className="text-white/90">Customer Satisfaction</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <SignedOut>
                  <SignUpButton>
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                      Start Your 14-Day Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </SignedIn>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                  <Link href="/demo" className="flex items-center gap-2">
                    Book a Demo
                    <Clock className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
              
              <p className="text-white/70 text-sm mt-6">
                No credit card required • Full access to all features • Cancel anytime
              </p>
            </div>
          </div>
        </div>
       </section>
    </div>
  );
}
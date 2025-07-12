'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Zap, Users, BarChart3, Shield, BookOpen, CreditCard, History, Flame, Gem, KanbanSquare, Library, FileText, Warehouse, Calendar, Contact, Settings, HardDrive, ArrowRight, CheckCircle, Star, Brain, Workflow, Globe, Lock, Lightbulb, Target, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

const featureCategories = [
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    description: 'Intelligent automation that learns and adapts to your workflows',
    color: 'from-purple-500 to-pink-500',
    features: [
      {
        icon: Brain,
        title: 'AI Copilot',
        description: 'Advanced AI that understands context, suggests solutions, and can resolve tickets automatically',
        benefits: ['40% faster resolution', '95% accuracy rate', 'Natural language processing'],
        image: 'https://placehold.co/400x300/8b5cf6/ffffff.png'
      },
      {
        icon: Zap,
        title: 'Smart Automation',
        description: 'Workflow automation that eliminates repetitive tasks and ensures consistency',
        benefits: ['Custom triggers', 'Multi-step workflows', 'Error-free execution'],
        image: 'https://placehold.co/400x300/06b6d4/ffffff.png'
      },
      {
        icon: BarChart3,
        title: 'Predictive Analytics',
        description: 'AI-powered insights that help you stay ahead of problems before they occur',
        benefits: ['Trend prediction', 'Capacity planning', 'Risk assessment'],
        image: 'https://placehold.co/400x300/10b981/ffffff.png'
      }
    ]
  },
  {
    id: 'service-desk',
    title: 'Service Desk Excellence',
    description: 'Complete ITSM capabilities designed for modern service delivery',
    color: 'from-blue-500 to-cyan-500',
    features: [
      {
        icon: Ticket,
        title: 'Advanced Ticketing',
        description: 'Comprehensive ticket management with smart routing, SLA enforcement, and escalation rules',
        benefits: ['Smart categorization', 'SLA monitoring', 'Priority-based routing'],
        image: 'https://placehold.co/400x300/3b82f6/ffffff.png'
      },
      {
        icon: Flame,
        title: 'Incident Management',
        description: 'Streamlined incident response with public status pages and stakeholder communication',
        benefits: ['Major incident protocols', 'Status page automation', 'Stakeholder notifications'],
        image: 'https://placehold.co/400x300/ef4444/ffffff.png'
      },
      {
        icon: History,
        title: 'Change Management',
        description: 'Structured change approval process with risk assessment and rollback planning',
        benefits: ['Approval workflows', 'Risk assessment', 'Automated rollback'],
        image: 'https://placehold.co/400x300/f59e0b/ffffff.png'
      }
    ]
  },
  {
    id: 'business-ops',
    title: 'Business Operations',
    description: 'Complete business management tools for MSPs and IT service providers',
    color: 'from-emerald-500 to-teal-500',
    features: [
      {
        icon: Users,
        title: 'Client Management',
        description: '360-degree client view with relationship mapping, contract tracking, and health monitoring',
        benefits: ['Client health scores', 'Contract tracking', 'Relationship mapping'],
        image: 'https://placehold.co/400x300/059669/ffffff.png'
      },
      {
        icon: CreditCard,
        title: 'Billing & Contracts',
        description: 'Automated billing, contract management, and revenue tracking for sustainable growth',
        benefits: ['Recurring billing', 'Contract automation', 'Revenue forecasting'],
        image: 'https://placehold.co/400x300/7c3aed/ffffff.png'
      },
      {
        icon: FileText,
        title: 'Professional Quoting',
        description: 'Create stunning proposals and quotes with customizable templates and e-signature integration',
        benefits: ['Template library', 'E-signature integration', 'Quote analytics'],
        image: 'https://placehold.co/400x300/dc2626/ffffff.png'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operational Excellence',
    description: 'Comprehensive tools for managing resources, projects, and daily operations',
    color: 'from-orange-500 to-red-500',
    features: [
      {
        icon: KanbanSquare,
        title: 'Project Management',
        description: 'Advanced project planning with Gantt charts, resource allocation, and milestone tracking',
        benefits: ['Gantt charts', 'Resource planning', 'Milestone tracking'],
        image: 'https://placehold.co/400x300/ea580c/ffffff.png'
      },
      {
        icon: HardDrive,
        title: 'Asset Lifecycle',
        description: 'Complete asset management from procurement to disposal with automated discovery',
        benefits: ['Auto-discovery', 'Lifecycle tracking', 'Compliance reporting'],
        image: 'https://placehold.co/400x300/6366f1/ffffff.png'
      },
      {
        icon: Calendar,
        title: 'Resource Scheduling',
        description: 'Intelligent scheduling with skill-based routing and capacity optimization',
        benefits: ['Skill-based routing', 'Capacity optimization', 'Mobile scheduling'],
        image: 'https://placehold.co/400x300/84cc16/ffffff.png'
      }
    ]
  }
];

const platformFeatures = [
  {
    icon: Gem,
    title: 'Dual-Mode Platform',
    description: 'Seamlessly switch between full MSP capabilities and streamlined Internal IT mode',
    features: ['MSP Mode', 'Internal IT Mode', 'One-click switching']
  },
  {
    icon: Settings,
    title: 'Infinite Customization',
    description: 'Tailor every aspect of the platform to match your unique business processes',
    features: ['Custom fields', 'Workflow builder', 'Brand customization']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with SOC 2 compliance and advanced threat protection',
    features: ['SSO integration', 'MFA support', 'Audit trails']
  },
  {
    icon: Globe,
    title: 'Global Scalability',
    description: 'Built for global operations with multi-language support and localization',
    features: ['Multi-language', 'Time zones', 'Global compliance']
  }
];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState(featureCategories[0].id);
  const activeCategoryData = featureCategories.find(cat => cat.id === activeCategory) || featureCategories[0];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Enterprise-Grade Features
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-headline mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Every Feature You Need
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            From AI-powered automation to comprehensive business management, Deskwise provides everything modern service teams need to excel.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/signup" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
              <Link href="/demo" className="flex items-center gap-2">
                Book a Demo
                <Calendar className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Feature Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {featureCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* Active Category Content */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">{activeCategoryData.title}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{activeCategoryData.description}</p>
          </div>

          {/* Feature Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {activeCategoryData.features.map((feature, index) => (
              <Card key={feature.title} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/20">
                <div className="relative overflow-hidden">
                  <Image 
                    src={feature.image} 
                    width={400} 
                    height={300} 
                    alt={feature.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    data-ai-hint={`${feature.title} interface screenshot`}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeCategoryData.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`bg-gradient-to-br ${activeCategoryData.color} p-3 rounded-xl text-white`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Platform Advantages</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built on modern architecture with enterprise-grade capabilities that scale with your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <Card key={feature.title} className="p-8 text-center hover:shadow-lg transition-all duration-300 group">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <div className="space-y-1">
                  {feature.features.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1 mb-1">{item}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Integrates with Everything</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Connect Deskwise with your existing tools through our extensive API and pre-built integrations
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {['Microsoft 365', 'Slack', 'Teams', 'Jira', 'GitHub', 'AWS', 'Azure', 'Google Workspace', 'Salesforce', 'Zoom', 'ConnectWise', 'AutoTask'].map((integration, index) => (
              <div key={index} className="text-lg font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                {integration}
              </div>
            ))}
          </div>
          
          <div className="mt-12">
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/integrations" className="flex items-center gap-2">
                View All Integrations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience the Difference?</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            Join thousands of teams who have transformed their service delivery with Deskwise. Start your free trial today and see the results within days.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
              <Link href="/signup" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
              <Link href="/contact" className="flex items-center gap-2">
                Contact Sales
                <Users className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
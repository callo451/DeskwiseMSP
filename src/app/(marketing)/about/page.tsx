'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Lightbulb, Award, ArrowRight, Quote, Heart, Globe, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const values = [
  {
    icon: Users,
    title: 'Customer First',
    description: 'Every decision we make starts with how it impacts our customers and their success.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We constantly push boundaries to deliver cutting-edge solutions that solve real problems.'
  },
  {
    icon: Heart,
    title: 'Empathy',
    description: 'We understand the challenges IT teams face because we\'ve been there ourselves.'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'Building technology that empowers teams worldwide to deliver exceptional service.'
  }
];

const team = [
  {
    name: 'Sarah Mitchell',
    role: 'CEO & Co-Founder',
    bio: 'Former VP of Engineering at ServiceNow with 15 years in enterprise software.',
    image: 'https://placehold.co/300x300/3b82f6/ffffff.png',
    linkedin: '#'
  },
  {
    name: 'David Chen',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineer who led AI initiatives for cloud infrastructure platforms.',
    image: 'https://placehold.co/300x300/10b981/ffffff.png',
    linkedin: '#'
  },
  {
    name: 'Maria Rodriguez',
    role: 'VP of Product',
    bio: 'Product leader with deep experience in B2B SaaS and customer success.',
    image: 'https://placehold.co/300x300/f59e0b/ffffff.png',
    linkedin: '#'
  },
  {
    name: 'James Wilson',
    role: 'VP of Engineering',
    bio: 'Infrastructure expert who scaled platforms for millions of users at Atlassian.',
    image: 'https://placehold.co/300x300/8b5cf6/ffffff.png',
    linkedin: '#'
  }
];

const milestones = [
  { year: '2019', event: 'Company founded by IT veterans' },
  { year: '2020', event: 'First customer deployment' },
  { year: '2021', event: 'Series A funding raised' },
  { year: '2022', event: 'AI capabilities launched' },
  { year: '2023', event: '1000+ customers milestone' },
  { year: '2024', event: 'Global expansion complete' }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Our Mission
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-headline mb-6">
              Transforming IT Service Delivery
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
              We're building the future of IT service management, where AI and human expertise combine to deliver exceptional experiences for both teams and their customers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/careers" className="flex items-center gap-2">
                  Join Our Team
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                <Link href="/contact" className="flex items-center gap-2">
                  Get in Touch
                  <Users className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Deskwise was born from frustration. As IT leaders at growing companies, our founders experienced firsthand the pain of juggling multiple disconnected tools, manually routing tickets, and struggling to keep up with customer demands.
                </p>
                <p>
                  The breaking point came during a major outage when it took hours to coordinate response across different platforms. That night, Sarah and David decided there had to be a better way.
                </p>
                <p>
                  Today, Deskwise serves over 1,000 organizations worldwide, from nimble startups to Fortune 500 enterprises. We're proud to be the platform that IT teams rely on to deliver exceptional service.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-6"></div>
              <div className="relative bg-background border-2 border-primary/10 rounded-2xl p-2 shadow-2xl">
                <Image 
                  src="https://placehold.co/600x400/3498db/ecf0f1.png" 
                  width={600} 
                  height={400} 
                  alt="Deskwise founders working together" 
                  className="rounded-xl" 
                  data-ai-hint="diverse team of professionals collaborating in modern office"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide every decision we make and every feature we build
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-all duration-300 group">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From a small startup to a global platform trusted by thousands
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary to-accent"></div>
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                      <div className="text-lg text-muted-foreground">{milestone.event}</div>
                    </div>
                    <div className="w-4 h-4 bg-primary rounded-full relative z-10 border-4 border-background"></div>
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Meet Our Leadership</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experienced leaders who've built and scaled enterprise software at the world's top companies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <Image 
                    src={member.image} 
                    width={300} 
                    height={300} 
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    data-ai-hint={`professional headshot of ${member.role}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <div className="text-primary font-medium mb-3">{member.role}</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">50M+</div>
              <div className="text-muted-foreground">Tickets Processed</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime SLA</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">40+</div>
              <div className="text-muted-foreground">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Want to Join Our Mission?</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            We're always looking for passionate individuals who want to transform how IT teams deliver service. Come build the future with us.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
              <Link href="/careers" className="flex items-center gap-2">
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
              <Link href="/contact" className="flex items-center gap-2">
                Contact Us
                <Users className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Zap, Users, BarChart3, Shield, BookOpen, CreditCard, History, Flame, Gem, KanbanSquare, Library, FileText, Warehouse, Calendar, Contact, Settings, HardDrive, ArrowRight, CheckCircle, Star, Brain, Workflow, Globe, Lock, Lightbulb, Target, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  
  // State for interactive elements
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  
  // Refs for animation elements
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const platformRef = useRef<HTMLElement>(null);
  const integrationRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  
  // Handle category change animations
  useEffect(() => {
    const featureCards = document.querySelectorAll('.feature-card');
    
    gsap.fromTo(featureCards, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1,
        ease: 'power2.out'
      }
    );
  }, [activeCategory]);
  
  // Initialize GSAP animations
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Hero section animations
    if (heroRef.current && heroContentRef.current) {
      const heroElements = heroContentRef.current.children;
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      // Create floating gradient background
      const gradientBg = document.createElement('div');
      gradientBg.id = 'features-gradient-bg';
      gradientBg.className = 'absolute inset-0 z-0 overflow-hidden opacity-40';
      heroRef.current.appendChild(gradientBg);
      
      // Create gradient bubbles
      for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = `absolute rounded-full bg-gradient-to-br ${i % 2 === 0 ? 'from-primary/30 to-purple-500/30' : 'from-purple-500/30 to-primary/30'}`;
        
        // Random size between 100px and 300px
        const size = Math.random() * 200 + 100;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // Add blur
        bubble.style.filter = 'blur(40px)';
        
        gradientBg.appendChild(bubble);
        
        // Animate bubble
        gsap.to(bubble, {
          x: `${Math.random() * 100 - 50}`,
          y: `${Math.random() * 100 - 50}`,
          scale: Math.random() * 0.5 + 0.8,
          opacity: Math.random() * 0.5 + 0.5,
          duration: Math.random() * 10 + 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
      
      // Create particles background
      const particlesContainer = document.createElement('div');
      particlesContainer.id = 'features-particles';
      particlesContainer.className = 'absolute inset-0 z-0';
      heroRef.current.appendChild(particlesContainer);
      
      // Create particles
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full bg-primary/10';
        
        // Random size between 2px and 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        particlesContainer.appendChild(particle);
        
        // Animate particle
        gsap.to(particle, {
          x: `${Math.random() * 200 - 100}`,
          y: `${Math.random() * 200 - 100}`,
          opacity: Math.random() * 0.5 + 0.5,
          duration: Math.random() * 20 + 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
      
      // Setup cursor follower
      const cursorArea = document.querySelector('.features-cursor-area');
      if (cursorArea && cursorFollowerRef.current) {
        cursorArea.addEventListener('mousemove', (e) => {
          const mouseEvent = e as MouseEvent;
          const rect = (cursorArea as Element).getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left;
          const y = mouseEvent.clientY - rect.top;
          
          gsap.to(cursorFollowerRef.current, {
            opacity: 1,
            x,
            y,
            duration: 0.5,
            ease: 'power2.out'
          });
        });
        
        cursorArea.addEventListener('mouseleave', () => {
          gsap.to(cursorFollowerRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        });
      }
      
      // Animate hero content
      heroTl
        .from('.features-hero-badge', { opacity: 0, y: 20, duration: 0.8 })
        .from('.features-hero-title-line', { opacity: 0, y: 30, stagger: 0.2, duration: 0.8 }, '-=0.4')
        .from('.features-hero-description', { opacity: 0, y: 20, duration: 0.8 }, '-=0.4')
        .from('.features-hero-buttons', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
        .from('.features-hero-image', { opacity: 0, y: 40, duration: 1 }, '-=0.8')
        .from('.features-hero-glow', { opacity: 0, scale: 0.8, duration: 1.5 }, '-=1')
        .from('.features-icon-grid > div', { opacity: 0, y: 20, stagger: 0.05, duration: 0.5 }, '-=1')
        .from('.features-scroll-indicator', { opacity: 0, y: -20, duration: 0.5 }, '-=0.5');
      
      // Floating animations for feature icons
      document.querySelectorAll('.floating-feature-icon').forEach((el, index) => {
        gsap.to(el, {
          y: `${Math.random() * 20 - 10}`,
          x: `${Math.random() * 20 - 10}`,
          rotate: Math.random() * 10 - 5,
          duration: Math.random() * 5 + 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.1
        });
      });
    }
  }, []);
    
    // Section transitions with ScrollTrigger
    const sections = [featuresRef.current, platformRef.current, integrationRef.current, ctaRef.current];
    
    sections.forEach((section) => {
      if (!section) return;
      
      // Animate section titles and descriptions
      const title = section.querySelector('h2');
      const description = section.querySelector('p');
      
      if (title) {
        gsap.from(title, {
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 30,
          duration: 0.8
        });
      }
      
      if (description) {
        gsap.from(description, {
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.2
        });
      }
    });
    
    // Feature category buttons animation
    const categoryButtons = document.querySelectorAll('.category-button');
    gsap.from(categoryButtons, {
      scrollTrigger: {
        trigger: categoryButtons[0],
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.5
    });
    
    // Platform features animation
    const platformCards = platformRef.current?.querySelectorAll('.card');
    if (platformCards) {
      gsap.from(platformCards, {
        scrollTrigger: {
          trigger: platformCards[0],
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8
      });
    }
    
    // Integration logos animation
    const integrationLogos = integrationRef.current?.querySelectorAll('.text-lg');
    if (integrationLogos) {
      gsap.from(integrationLogos, {
        scrollTrigger: {
          trigger: integrationLogos[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        scale: 0.8,
        stagger: 0.05,
        duration: 0.5,
        ease: 'back.out(1.5)'
      });
    }
    
    // CTA section reveal animation
    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none'
          },
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power4.inOut'
        }
      );
    }
    
    // Clean up animations
    useEffect(() => {
      // Cleanup function
      return () => {
        // Kill all ScrollTrigger instances
        ScrollTrigger.getAll().forEach(st => st.kill());
        
        // Remove any dynamically created particles
        const particlesContainer = document.getElementById('features-particles');
        if (particlesContainer && particlesContainer.parentNode) {
          particlesContainer.parentNode.removeChild(particlesContainer);
        }
        
        // Remove gradient background
        const gradientBg = document.getElementById('features-gradient-bg');
        if (gradientBg && gradientBg.parentNode) {
          gradientBg.parentNode.removeChild(gradientBg);
        }
      };
    }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-b from-background to-background/95 overflow-hidden">
        <div className="container px-4 py-20 lg:py-24 mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div ref={heroContentRef} className="space-y-6 features-cursor-area relative">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors features-hero-badge">
                Powerful Features Suite
              </Badge>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="block features-hero-title-line">Transform your</span>
                  <span className="block features-hero-title-line">IT service delivery</span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 features-hero-title-line">with Deskwise</span>
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground features-hero-description">
                Our comprehensive platform combines AI-powered automation, 
                intuitive workflows, and powerful analytics to help you deliver 
                exceptional service at scale.
              </p>
              
              <div className="flex flex-wrap gap-4 features-hero-buttons">
                <Button size="lg" className="group relative hero-button-primary overflow-hidden">
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
                
                <Button size="lg" variant="outline" className="group relative overflow-hidden">
                  <span className="relative z-10">Watch Demo</span>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>
              
              {/* Feature Icons Grid */}
              <div className="grid grid-cols-4 gap-4 mt-8 features-icon-grid">
                {featureCategories.slice(0, 3).flatMap((category, idx) => 
                  category.features.slice(0, 4).map((feature, featureIdx) => {
                    const index = idx * 4 + featureIdx;
                    const Icon = feature.icon;
                    return (
                      <div 
                        key={`${idx}-${featureIdx}`} 
                        className={`relative p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors floating-feature-icon ${
                          hoveredFeature === index ? 'ring-2 ring-primary' : ''
                        }`}
                        onMouseEnter={() => setHoveredFeature(index)}
                        onMouseLeave={() => setHoveredFeature(null)}
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Cursor follower */}
              <div id="features-cursor-follower" ref={cursorFollowerRef} className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 blur-sm pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 z-0"></div>
            </div>
            
            {/* Right Column - Interactive Visual */}
            <div ref={heroImageRef} className="relative features-hero-image">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl features-hero-glow"></div>
              <div className="relative bg-muted/30 backdrop-blur-sm border border-muted rounded-xl overflow-hidden shadow-2xl">
                <div className="p-1 bg-muted/50">
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-4 text-xs text-muted-foreground">Deskwise Features Dashboard</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Feature Category Previews */}
                    {featureCategories.slice(0, 4).map((category, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-background/80 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-md bg-gradient-to-r ${category.color}`}>
                            {category.features[0].icon && (() => {
                              const Icon = category.features[0].icon;
                              return <Icon className="h-5 w-5 text-white" />;
                            })()}
                          </div>
                          <h3 className="font-medium">{category.title}</h3>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Feature Metrics */}
                  <div className="mt-6 p-4 rounded-lg bg-background/80 border border-border">
                    <h3 className="font-medium mb-3">Feature Usage Analytics</h3>
                    <div className="flex justify-between items-end h-24">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-8 bg-gradient-to-t from-primary/80 to-purple-500/80 rounded-t-sm" style={{ height: `${Math.random() * 70 + 30}%` }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="flex justify-center mt-12 features-scroll-indicator">
            <div className="animate-bounce p-2 bg-muted/50 rounded-full">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Categories */}
      <section ref={featuresRef} className="py-24">
        <div className="container mx-auto px-4">
          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {featureCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-button px-6 py-3 rounded-full font-medium transition-all duration-300 ${
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
              <Card key={feature.title} className="feature-card group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/20">
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
      <section ref={platformRef} className="py-24 bg-gradient-to-br from-muted/30 to-background">
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
      <section ref={integrationRef} className="py-24">
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
      <section ref={ctaRef} className="py-24 bg-gradient-to-r from-primary to-accent">
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
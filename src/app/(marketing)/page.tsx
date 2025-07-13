'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, Zap, Shield, BarChart3, Users, Ticket, Quote as QuoteIcon, ArrowRight, Play, Star, Award, TrendingUp, Clock, Brain, Sparkles, Workflow, Globe, Lock, Lightbulb, Users2, Target, Gauge, MousePointer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Helper function for section transitions
const createSectionTransition = (section: Element, options = {}) => {
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.1,
    start: 'top 80%',
  };
  
  const settings = { ...defaults, ...options };
  
  // Find elements to animate
  const title = section.querySelector('h2, h3');
  const paragraph = section.querySelector('p');
  const items = section.querySelectorAll('.animate-item, .card, .grid > div');
  const buttons = section.querySelectorAll('a, button, .button');
  
  // Create timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: settings.start,
      toggleActions: 'play none none none',
    }
  });
  
  // Add animations
  if (title) tl.from(title, { y: settings.y, opacity: 0, duration: settings.duration }, 0);
  if (paragraph) tl.from(paragraph, { y: settings.y, opacity: 0, duration: settings.duration }, 0.2);
  if (items.length) tl.from(items, { y: settings.y, opacity: 0, duration: settings.duration, stagger: settings.stagger }, 0.3);
  if (buttons.length) tl.from(buttons, { y: settings.y, opacity: 0, duration: settings.duration, stagger: settings.stagger }, 0.5);
  
  return tl;
};

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
  const counterRef = useRef<HTMLSpanElement>(null);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (counterRef.current) {
      gsap.to(counterRef.current, {
        innerHTML: numericValue,
        duration: 2,
        snap: { innerHTML: 1 },
        ease: "power2.out"
      });
    }
  }, [numericValue]);

  return (
    <span ref={counterRef}>
      0
    </span>
  );
}

export default function HomePage() {
  // References for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroDashboardRef = useRef<HTMLDivElement>(null);
  const chartBarsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize GSAP animations
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Create a timeline for hero animations
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Stagger in the hero elements
    heroTl
      .from('.hero-badge', { opacity: 0, y: 20, duration: 0.8 })
      .from('.hero-title-line', { opacity: 0, y: 30, stagger: 0.2, duration: 0.8 }, "-=0.4")
      .from('.hero-description', { opacity: 0, y: 20, duration: 0.8 }, "-=0.4")
      .from('.hero-buttons > *', { opacity: 0, y: 20, stagger: 0.15, duration: 0.6 }, "-=0.4")
      .from('.dashboard-container', { opacity: 0, scale: 0.9, duration: 1 }, "-=0.8")
      .from('.dashboard-glow', { opacity: 0, scale: 1.1, duration: 1 }, "-=1")
      .from('.notification-popup', { opacity: 0, x: 30, duration: 0.6 }, "-=0.6")
      .from('.chart-popup', { opacity: 0, y: 30, duration: 0.6 }, "-=0.4")
      .from('.stat-item', { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, "-=0.6")
      .from('.scroll-indicator', { opacity: 0, y: -20, duration: 0.8 }, "-=0.4");
    
    // Animate chart bars
    const chartBars = document.querySelectorAll('.chart-bar');
    gsap.set(chartBars, { height: '10%' });
    gsap.to(chartBars, {
      height: () => `${Math.random() * 70 + 30}%`,
      duration: 1.5,
      stagger: 0.1,
      ease: 'elastic.out(1, 0.3)',
      delay: 1.5
    });
    
    // Animate floating elements
    document.querySelectorAll('.floating-element').forEach((el) => {
      gsap.to(el, {
        y: `${Math.random() * 40 - 20}`,
        x: `${Math.random() * 40 - 20}`,
        duration: Math.random() * 5 + 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
    
    // Create particles effect
    const particlesContainer = document.getElementById('particles-bg');
    if (particlesContainer) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full bg-primary/10';
        particle.style.width = `${Math.random() * 6 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particlesContainer.appendChild(particle);
        
        gsap.to(particle, {
          y: `${Math.random() * 100 - 50}`,
          x: `${Math.random() * 100 - 50}`,
          opacity: Math.random() * 0.5 + 0.1,
          duration: Math.random() * 20 + 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }
    
    // Interactive cursor follower
    const cursorFollower = document.getElementById('cursor-follower');
    const cursorArea = document.querySelector('.hero-cursor-area');
    
    if (cursorFollower && cursorArea) {
      cursorArea.addEventListener('mousemove', (e) => {
        const mouseEvent = e as MouseEvent;
        const rect = cursorArea.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        
        gsap.to(cursorFollower, {
          x: x - 24,
          y: y - 24,
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      cursorArea.addEventListener('mouseenter', () => {
        gsap.to(cursorFollower, {
          opacity: 1,
          scale: 1,
          duration: 0.3
        });
      });
      
      cursorArea.addEventListener('mouseleave', () => {
        gsap.to(cursorFollower, {
          opacity: 0,
          scale: 0.5,
          duration: 0.3
        });
      });
    }
    
    // Button hover effects
    document.querySelectorAll('.hero-button-primary').forEach((button) => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button.querySelector('.group-hover\\:opacity-100'), {
          opacity: 1,
          duration: 0.3
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button.querySelector('.group-hover\\:opacity-100'), {
          opacity: 0,
          duration: 0.3
        });
      });
    });
    
    // Section transitions with ScrollTrigger
    // Trust Section transition
    const trustSection = document.querySelector('section.bg-muted\\/30');
    if (trustSection) {
      gsap.from(trustSection, {
        scrollTrigger: {
          trigger: trustSection,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 1
      });
      
      gsap.from(trustSection.querySelectorAll('div > div'), {
        scrollTrigger: {
          trigger: trustSection,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        delay: 0.3
      });
    }
    
    // Core Features Section transition
    const featuresSection = document.querySelector('section.py-24:not(.bg-gradient-to-br):not(.bg-gradient-to-r)');
    if (featuresSection) {
      const featureCards = featuresSection.querySelectorAll('.card');
      
      gsap.from(featuresSection.querySelector('h2'), {
        scrollTrigger: {
          trigger: featuresSection,
          start: 'top 75%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.8
      });
      
      gsap.from(featuresSection.querySelector('p'), {
        scrollTrigger: {
          trigger: featuresSection,
          start: 'top 75%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2
      });
      
      gsap.from(featureCards, {
        scrollTrigger: {
          trigger: featureCards[0],
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        delay: 0.3
      });
    }
    
    // Feature Spotlight Section transitions
    const spotlightSection = document.querySelector('.bg-gradient-to-br.from-muted\\/30');
    if (spotlightSection) {
      const spotlightItems = spotlightSection.querySelectorAll('.grid.lg\\:grid-cols-2');
      
      spotlightItems.forEach((item, index) => {
        const direction = index % 2 === 0 ? -50 : 50;
        const content = item.querySelector('.space-y-6');
        const image = item.querySelector('.relative:not(.space-y-6)');
        
        if (content) {
          gsap.from(content, {
            scrollTrigger: {
              trigger: item,
              start: 'top 70%',
              toggleActions: 'play none none none'
            },
            x: -direction,
            opacity: 0,
            duration: 1
          });
        }
        
        if (image) {
          gsap.from(image, {
            scrollTrigger: {
              trigger: item,
              start: 'top 70%',
              toggleActions: 'play none none none'
            },
            x: direction,
            opacity: 0,
            duration: 1,
            delay: 0.2
          });
        }
      });
    }
    
    // Social Proof Section transition
    const socialProofSection = document.querySelector('.bg-gradient-to-r.from-primary\\/5');
    if (socialProofSection) {
      const testimonialCards = socialProofSection.querySelectorAll('.card');
      
      createSectionTransition(socialProofSection, {
        start: 'top 75%',
        stagger: 0.15
      });
      
      // Add a special animation for the stars
      gsap.from(socialProofSection.querySelectorAll('.star'), {
        scrollTrigger: {
          trigger: socialProofSection,
          start: 'top 75%',
          toggleActions: 'play none none none'
        },
        scale: 0,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: 'back.out(1.7)',
        delay: 0.5
      });
    }
    
    // ROI Section transition with reveal effect
    const roiSection = document.querySelector('section.py-24:last-of-type');
    if (roiSection) {
      const gradientBg = roiSection.querySelector('.bg-gradient-to-br');
      
      if (gradientBg) {
        // Create a reveal effect
        gsap.fromTo(gradientBg, 
          { clipPath: 'inset(100% 0 0 0)' },
          {
            scrollTrigger: {
              trigger: roiSection,
              start: 'top 70%',
              toggleActions: 'play none none none'
            },
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.2,
            ease: 'power4.out'
          }
        );
        
        // Animate the content inside
        const contentElements = gradientBg.querySelectorAll('h2, p, .grid, .flex');
        gsap.from(contentElements, {
          scrollTrigger: {
            trigger: roiSection,
            start: 'top 70%',
            toggleActions: 'play none none none'
          },
          y: 50,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          delay: 0.5
        });
      }
    }
    
    // Add a scroll-triggered parallax effect to the background elements
    gsap.to('.floating-element', {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: (i, el) => (parseFloat(el.style.top) - 50) * 0.5,
      ease: 'none'
    });
    
    // Clean up animations
    return () => {
      heroTl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero-section">
        {/* Animated Background with Particles */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="particles-container absolute inset-0 opacity-40" id="particles-bg" />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-xl floating-element`}
              id={`floating-element-${i}`}
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left hero-content">
              <div className="mb-6 hero-badge">
                <Badge 
                  variant="outline" 
                  className="border-primary/50 text-primary bg-primary/5 px-4 py-2 text-sm font-medium inline-flex items-center"
                  id="hero-badge"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Now with Advanced AI Capabilities
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline mb-6 hero-title">
                <span className="block hero-title-line bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">Service Desk</span>
                <span className="block text-foreground hero-title-line">Reimagined</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 leading-relaxed hero-description">
                The only platform that combines <span className="text-primary font-semibold">AI-powered automation</span> with comprehensive PSA & ITSM capabilities. Transform how your team delivers exceptional service.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 hero-buttons">
                <SignedOut>
                  <SignUpButton>
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hero-button-primary relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center">
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hero-button-primary relative overflow-hidden group"
                  >
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <span className="relative z-10 flex items-center">
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                  </Button>
                </SignedIn>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-2 hover:bg-primary/5 hero-button-secondary group"
                >
                  <Link href="#demo" className="flex items-center gap-2">
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Link>
                </Button>
              </div>
              
              {/* Interactive Mouse Cursor Follower */}
              <div className="hidden md:block relative h-12 w-full cursor-pointer hero-cursor-area">
                <div className="absolute top-0 left-0 flex items-center text-sm text-muted-foreground">
                  <MousePointer className="w-4 h-4 mr-2" />
                  <span>Move your cursor here</span>
                </div>
                <div className="cursor-follower absolute hidden md:block w-12 h-12 rounded-full bg-primary/20 pointer-events-none" id="cursor-follower"></div>
              </div>
            </div>
            
            {/* Right Content - Animated Dashboard Preview */}
            <div className="relative hero-dashboard">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-6 dashboard-glow"></div>
              <div className="relative bg-background border-2 border-primary/10 rounded-2xl p-2 shadow-2xl dashboard-container overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-8 bg-muted/30 rounded-t-xl flex items-center px-4 dashboard-header">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                  </div>
                </div>
                <div className="pt-8 dashboard-content">
                  <Image 
                    src="https://placehold.co/600x400/3498db/ecf0f1.png" 
                    width={600} 
                    height={400} 
                    alt="AI-Powered Dashboard" 
                    className="rounded-xl dashboard-image" 
                    data-ai-hint="AI dashboard with charts and automation"
                  />
                  
                  {/* Animated Notification */}
                  <div className="absolute top-16 right-4 bg-background border border-primary/20 rounded-lg p-3 shadow-lg notification-popup">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Ticket #4872 resolved</p>
                        <p className="text-xs text-muted-foreground">AI assistant handled password reset</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Chart */}
                  <div className="absolute bottom-8 left-4 bg-background border border-primary/20 rounded-lg p-3 shadow-lg chart-popup w-48">
                    <p className="text-xs font-medium mb-2">Resolution Time</p>
                    <div className="h-8 bg-muted/30 rounded-md overflow-hidden flex items-end">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className="chart-bar bg-primary/80 w-full" 
                          style={{ height: '10%' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-16 stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="text-center stat-item">
                <div className="flex justify-center mb-2">
                  <div className="p-3 rounded-full bg-primary/10 stat-icon-container">
                    <stat.icon className="w-8 h-8 text-primary stat-icon" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1 stat-value">
                  <AnimatedCounter value={stat.value} />
                  <span className="stat-suffix">{stat.value.replace(/[0-9]/g, '')}</span>
                </div>
                <div className="text-sm text-muted-foreground font-medium stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 scroll-indicator">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary/60 rounded-full mt-2 scroll-dot"></div>
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
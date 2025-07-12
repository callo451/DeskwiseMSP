'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, X, Star, Zap, Shield, Users, ArrowRight, Calculator, HelpCircle, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small IT teams just getting started',
    price: {
      monthly: 49,
      annual: 39
    },
    userLimit: '3 users',
    highlight: false,
    features: {
      included: [
        'Core Ticketing System',
        'Basic Knowledge Base',
        'Asset Management (up to 100 assets)',
        'Basic Reporting & Analytics',
        'Email Support',
        'Mobile App Access',
        'Standard Integrations (10+)'
      ],
      excluded: [
        'AI-Powered Features',
        'Advanced Automation',
        'Client Management',
        'Billing & Contracts',
        'Project Management',
        'Custom Branding'
      ]
    },
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Professional',
    description: 'Ideal for growing MSPs and IT departments',
    price: {
      monthly: 89,
      annual: 69
    },
    userLimit: '15 users',
    highlight: true,
    features: {
      included: [
        'Everything in Starter, plus:',
        'AI Ticket Assistant & Automation',
        'Advanced Knowledge Base',
        'Client Management & Portal',
        'SLA Management & Monitoring',
        'Time Tracking & Basic Billing',
        'Project Management',
        'Advanced Reporting & Analytics',
        'Custom Branding',
        'Priority Support',
        'All Integrations (50+)'
      ],
      excluded: [
        'Unlimited Users',
        'Enterprise Security (SSO)',
        'Dedicated Account Manager',
        'Custom Integrations'
      ]
    },
    cta: 'Start Free Trial',
    popular: true,
    savings: '22%'
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: {
      monthly: 'Custom',
      annual: 'Custom'
    },
    userLimit: 'Unlimited users',
    highlight: false,
    features: {
      included: [
        'Everything in Professional, plus:',
        'Unlimited Users & Assets',
        'Advanced AI Features',
        'Enterprise Security (SSO, MFA)',
        'Dedicated Account Manager',
        'Custom Integrations & API',
        'Advanced Automation Workflows',
        'White-label Solutions',
        'On-premise Deployment Option',
        '24/7 Phone Support',
        'Training & Onboarding',
        'SLA Guarantees'
      ],
      excluded: []
    },
    cta: 'Contact Sales',
    popular: false
  }
];

const faqs = [
  {
    question: 'How does the user pricing work?',
    answer: 'You pay per active user per month. Users can be technicians, managers, or any staff member who needs access to the platform. Client portal users are always free.'
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
  },
  {
    question: 'What\'s included in the free trial?',
    answer: 'The 14-day free trial includes full access to all Professional plan features with no limitations. No credit card required to start.'
  },
  {
    question: 'Do you offer volume discounts?',
    answer: 'Yes! Organizations with 50+ users qualify for volume pricing. Contact our sales team for a custom quote tailored to your needs.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH transfers, and wire transfers. Annual plans can be paid via invoice for qualifying organizations.'
  }
];

const testimonials = [
  {
    text: "Switching to Deskwise saved us $2,400/month compared to our previous solution while giving us 10x more features.",
    author: "Sarah Chen",
    title: "IT Director",
    company: "TechFlow Solutions"
  },
  {
    text: "The ROI was immediate. We reduced our average resolution time by 60% in the first month.",
    author: "Michael Rodriguez",
    title: "Operations Manager",
    company: "Global IT Services"
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Calculator className="w-4 h-4 mr-2" />
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-headline mb-6">
            Simple, Scalable Pricing
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Choose the perfect plan for your team. Start free, scale as you grow, and only pay for what you use.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Save 22%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  plan.highlight 
                    ? 'border-primary shadow-xl scale-105 ring-1 ring-primary/20' 
                    : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2 text-sm font-semibold">
                    <Star className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'} pb-8`}>
                  <CardTitle className="text-2xl font-bold font-headline">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                  
                  <div className="mt-6">
                    {typeof plan.price.monthly === 'number' ? (
                      <>
                        <div className="text-5xl font-bold">
                          ${billingCycle === 'annual' ? plan.price.annual : plan.price.monthly}
                        </div>
                        <div className="text-muted-foreground mt-1">
                          per user/month {billingCycle === 'annual' && '(billed annually)'}
                        </div>
                        {billingCycle === 'annual' && plan.savings && (
                          <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                            Save {plan.savings}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-5xl font-bold">Custom</div>
                        <div className="text-muted-foreground mt-1">Tailored to your needs</div>
                      </>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-4">
                    {plan.userLimit}
                  </div>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <div className="space-y-4">
                    {plan.features.included.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${feature.startsWith('Everything') ? 'font-medium' : ''}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.features.excluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-50">
                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="px-8 pb-8">
                  <Button 
                    asChild 
                    className={`w-full text-lg py-6 ${plan.highlight ? '' : 'variant-outline'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    <Link href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'} className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Why Teams Choose Deskwise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              More than just great features - we deliver measurable results that impact your bottom line
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">60% Faster Resolution</h3>
              <p className="text-muted-foreground">AI-powered automation and smart workflows dramatically reduce time-to-resolution</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">99.9% Uptime SLA</h3>
              <p className="text-muted-foreground">Enterprise-grade reliability with guaranteed uptime and data protection</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">250% ROI</h3>
              <p className="text-muted-foreground">Customers see positive ROI within 90 days through efficiency gains and cost savings</p>
            </Card>
          </div>
          
          {/* Customer Testimonials */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <blockquote className="text-lg text-muted-foreground mb-6 italic">
                  "{testimonial.text}"
                </blockquote>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.title}, {testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Got questions? We've got answers. Can't find what you're looking for? Contact our team.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <HelpCircle className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            Join thousands of teams who have transformed their service delivery. Start your free trial today or speak with our experts.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
              <Link href="/signup" className="flex items-center gap-2">
                Start 14-Day Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
              <Link href="/contact" className="flex items-center gap-2">
                Talk to Sales
                <Phone className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Full access to all features</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
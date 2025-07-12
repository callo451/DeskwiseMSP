
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const pricingTiers = [
  {
    name: 'Starter',
    price: '49',
    userCount: 'Up to 3 users',
    features: [
      'Core Ticketing System',
      'Asset Management',
      'Knowledge Base',
      'Basic Reporting',
    ],
    cta: 'Start with Starter',
  },
  {
    name: 'Pro',
    price: '99',
    userCount: 'Up to 10 users',
    isPopular: true,
    features: [
      'Everything in Starter, plus:',
      'AI Ticket Insights & Summary',
      'Client Management & Portal',
      'SLA Management',
      'Time Tracking & Billing',
      'Project Management',
    ],
    cta: 'Choose Pro',
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    userCount: 'Unlimited users',
    features: [
      'Everything in Pro, plus:',
      'Advanced Security & SSO',
      'Dedicated Account Manager',
      'Custom Integrations',
      'On-premise option available',
    ],
    cta: 'Contact Sales',
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Find the Right Plan for Your Team</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Simple, transparent pricing that scales with your business. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col h-full ${tier.isPopular ? 'border-primary shadow-lg' : ''}`}>
            {tier.isPopular && (
              <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{tier.name}</CardTitle>
              <CardDescription>{tier.userCount}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                {tier.price.startsWith('Contact') ? (
                  <p className="text-4xl font-bold">{tier.price}</p>
                ) : (
                  <p className="text-4xl font-bold">
                    ${tier.price}
                    <span className="text-lg font-medium text-muted-foreground">/user/mo</span>
                  </p>
                )}
              </div>
              <ul className="space-y-4">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={tier.isPopular ? 'default' : 'outline'}>
                <Link href="/signup">{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

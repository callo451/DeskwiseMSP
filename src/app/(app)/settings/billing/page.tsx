
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { DollarSign } from 'lucide-react';
  
  export default function BillingSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Billing & Subscriptions</h1>
                <p className="text-muted-foreground">
                Manage your payment methods and plan.
                </p>
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                    Manage billing, contracts, and invoices for your clients.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <div className="text-center text-muted-foreground">
                        <DollarSign className="mx-auto h-12 w-12 mb-4" />
                        <p>Billing & Subscriptions module coming soon.</p>
                    </div>
                </div>
                </CardContent>
            </Card>
      </div>
    );
  }

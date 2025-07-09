import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from 'lucide-react';

export default function ClientTicketsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tickets</CardTitle>
        <CardDescription>
          Track and manage your support requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
          <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Ticket management is coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2 } from 'lucide-react';

export default function CustomFieldsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>
          Create and manage custom fields for modules like tickets, clients, and assets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
          <div className="text-center text-muted-foreground">
            <FilePlus2 className="mx-auto h-12 w-12 mb-4" />
            <p>Custom Fields module coming soon.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

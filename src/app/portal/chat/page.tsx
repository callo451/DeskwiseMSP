import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function ClientChatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          Chat with our AI to get help with your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">The AI chatbot with voice chat is coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}

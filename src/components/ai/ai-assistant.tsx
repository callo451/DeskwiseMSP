'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Gem, Sparkles, User } from 'lucide-react';
import { aiAssistantCrud, type AiAssistantCrudOutput } from '@/ai/flows/ai-assistant-crud';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // This is a simplified call. A real implementation would parse the natural language `input`
      // into structured `AiAssistantCrudInput`. For this demo, we'll pass the raw text
      // and let the AI figure it out, which may not be robust.
      const [module, operation, ...dataParts] = input.split(' ');
      const data = dataParts.join(' ');

      const response: AiAssistantCrudOutput = await aiAssistantCrud({ module, operation, data });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (!response.success) {
        toast({
          variant: 'destructive',
          title: 'AI Operation Failed',
          description: response.message,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      };
      setMessages(prev => [...prev, assistantMessage]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const examplePrompts = [
    "create ticket 'Server is down' for 'TechCorp'",
    "list all open tickets",
    "update contact 'Jane Doe' email to 'jane.d@techcorp.com'",
    "find client 'GlobalInnovate'",
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="sr-only">Toggle AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Assistant
          </SheetTitle>
          <SheetDescription>
            Your copilot for managing the PSA. Perform actions using natural language.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                 <div className="text-center text-sm text-muted-foreground p-4 rounded-lg bg-secondary">
                   <Gem className="mx-auto h-8 w-8 mb-2" />
                   <p className="font-semibold mb-2">Welcome to your AI Assistant</p>
                   <p className="mb-4">Try one of these examples to get started:</p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                     {examplePrompts.map((prompt, i) => (
                       <button
                         key={i}
                         onClick={() => handleExampleClick(prompt)}
                         className="p-2 bg-background rounded-md text-primary text-xs hover:bg-primary/10 transition-colors"
                       >
                         {prompt}
                       </button>
                     ))}
                   </div>
                 </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn('flex items-start gap-3', {
                      'justify-end': message.role === 'user',
                    })}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn('max-w-xs sm:max-w-sm rounded-xl px-4 py-2 text-sm', {
                        'bg-primary text-primary-foreground': message.role === 'user',
                        'bg-secondary': message.role === 'assistant',
                      })}
                    >
                      {message.content}
                    </div>
                     {message.role === 'user' && (
                       <Avatar className="h-8 w-8">
                         <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                         <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                       </Avatar>
                     )}
                  </div>
                ))
              )}
               {isLoading && (
                 <div className="flex items-start gap-3">
                   <Avatar className="h-8 w-8">
                     <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                   </Avatar>
                   <div className="bg-secondary rounded-xl px-4 py-2 text-sm">
                     <div className="flex items-center gap-2">
                       <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                       <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                       <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="mt-auto">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              id="ai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g., 'create a new ticket...'"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Send, Sparkles, User, Bot, Phone, HelpCircle, Volume2, MoreHorizontal, PhoneOff, Mic, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { portalChat } from '@/ai/flows/portal-chat';
import { voiceCall } from '@/ai/flows/voice-call';
import ReactMarkdown from 'react-markdown';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

type CallStatus = 'idle' | 'listening' | 'connecting' | 'speaking';

function VoiceCallDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [callDuration, setCallDuration] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMounted = useRef(true);

  // Initialize SpeechRecognition and audio player logic once
  useEffect(() => {
    isMounted.current = true;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = async (event) => {
      if (!isMounted.current || status !== 'listening') return;
      const transcript = event.results[0][0].transcript;
      setStatus('connecting');
      try {
        const aiResponse = await voiceCall({ query: transcript, clientId: 'CLI-001' });
        if (!isMounted.current) return;
        if (aiResponse.audioDataUri && audioRef.current) {
          setStatus('speaking');
          audioRef.current.src = aiResponse.audioDataUri;
          await audioRef.current.play();
        } else {
          setStatus('listening');
        }
      } catch (error) {
        console.error('Voice call error:', error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get a response.' });
        if (isMounted.current) setStatus('listening');
      }
    };
    
    recognition.onerror = (event) => {
      if (isMounted.current && status === 'listening') {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
          toast({ variant: 'destructive', title: 'Voice Error', description: `An error occurred: ${event.error}` });
        }
        setStatus('listening');
      }
    };

    if (audioRef.current) {
      audioRef.current.onended = () => {
        if (isMounted.current) setStatus('listening');
      };
    }
    
    return () => { isMounted.current = false; };
  }, [status, toast]);

  // Main lifecycle effect for the call state
  useEffect(() => {
    if (open) {
      setStatus('listening');
      timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      setStatus('idle');
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
      recognitionRef.current?.abort();
      if (audioRef.current) audioRef.current.pause();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.abort();
    };
  }, [open]);

  // Effect to control the recognition start/stop based on status
  useEffect(() => {
    if (status === 'listening' && recognitionRef.current?.start) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignore errors from trying to start recognition when it's already active.
      }
    } else if (status !== 'listening' && recognitionRef.current?.stop) {
      recognitionRef.current.stop();
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStatusIndicator = () => {
    let color = 'bg-gray-500';
    let text = 'Idle';
    switch (status) {
      case 'listening': color = 'bg-green-500 animate-pulse'; text = 'Listening...'; break;
      case 'connecting': color = 'bg-yellow-500 animate-pulse'; text = 'Thinking...'; break;
      case 'speaking': color = 'bg-blue-500'; text = "Deskwise AI is speaking..."; break;
    }
    return (
      <div className="flex flex-col items-center gap-2">
          <div className={cn('relative h-24 w-24')}>
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://placehold.co/96x96/c4b5fd/312e81.png" alt="Deskwise AI" data-ai-hint="man cartoon" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className={cn('absolute top-0 right-0 h-4 w-4 rounded-full border-2 border-zinc-800', color)} />
          </div>
           <div className="text-center">
            <p className="text-zinc-400">On call with</p>
            <p className="text-2xl font-bold">Deskwise AI</p>
            <p className="text-sm text-zinc-300 min-h-[20px]">{text}</p>
          </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-zinc-800 text-white border-zinc-700 p-0" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-semibold text-base">Customer Support</DialogTitle>
            <HelpCircle className="h-5 w-5 text-zinc-400" />
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-8 gap-4">
          {getStatusIndicator()}
          <p className="text-5xl font-mono font-light tracking-wider">{formatTime(callDuration)}</p>
        </div>

        <DialogFooter className="bg-zinc-900/50 p-4 flex-row justify-center gap-4">
          <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full bg-zinc-700 hover:bg-zinc-600">
            <Settings className="h-6 w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full bg-zinc-700 hover:bg-zinc-600">
            <Mic className="h-6 w-6" />
          </Button>
          <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full" onClick={() => onOpenChange(false)}>
            <PhoneOff className="h-6 w-6" />
          </Button>
        </DialogFooter>
        <audio ref={audioRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}


export default function ClientChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // For demo, client ID is hardcoded.
      const chatResponse = await portalChat({ query: userInput, clientId: 'CLI-001' });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: chatResponse.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get a response from the assistant.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary h-5 w-5" /> AI Assistant</CardTitle>
            <CardDescription>Chat with our AI about your tickets, assets, and more.</CardDescription>
        </div>
        <Button variant="outline" onClick={() => setIsVoiceCallOpen(true)}>
            <Phone className="mr-2 h-4 w-4" /> Voice Call
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full" ref={scrollAreaRef as any}>
            <div className="p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full pt-16">
                        <Bot className="h-12 w-12 mb-4" />
                        <p className="font-semibold">Hello! How can I help you today?</p>
                        <p className="text-sm">You can ask me things like "what's the status of my server ticket?" or "how do I reset my password?".</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={cn('flex items-start gap-4', message.role === 'user' && 'justify-end')}>
                            {message.role === 'assistant' && (
                                <Avatar className="h-9 w-9 border">
                                   <AvatarImage src="https://placehold.co/96x96/c4b5fd/312e81.png" alt="Deskwise AI" data-ai-hint="man cartoon" />
                                   <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn('max-w-md rounded-2xl px-4 py-3 text-sm',
                                message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none')}>
                                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src="https://placehold.co/40x40/c2410c/FFFFFF.png" alt="User" data-ai-hint="user avatar" />
                                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex items-start gap-4">
                       <Avatar className="h-9 w-9 border">
                         <AvatarImage src="https://placehold.co/96x96/c4b5fd/312e81.png" alt="Deskwise AI" data-ai-hint="man cartoon" />
                         <AvatarFallback>AI</AvatarFallback>
                       </Avatar>
                       <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-3">
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                           <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                           <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                         </div>
                       </div>
                    </div>
                )}
            </div>
          </ScrollArea>
      </CardContent>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            autoComplete="off"
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
    <VoiceCallDialog open={isVoiceCallOpen} onOpenChange={setIsVoiceCallOpen} />
    </>
  );
}

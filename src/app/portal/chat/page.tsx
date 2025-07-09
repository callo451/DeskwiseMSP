'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Mic, Phone, PhoneOff, Send, Sparkles, User, Bot, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { portalChat } from '@/ai/flows/portal-chat';
import { textToSpeech } from '@/ai/flows/text-to-speech';
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

type CallStatus = 'idle' | 'listening' | 'processing' | 'speaking';

function VoiceCallDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) return;
    
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: "Voice input not supported in this browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
      setLastTranscript('');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript);
      setStatus('processing');
      try {
        const chatResponse = await portalChat({ query: transcript, clientId: 'CLI-001' });
        setStatus('speaking');
        const ttsResponse = await textToSpeech({ text: chatResponse.response });
        if (audioRef.current && ttsResponse.audioDataUri) {
          audioRef.current.src = ttsResponse.audioDataUri;
          await audioRef.current.play();
        } else {
          // If there's no audio, just end the turn
           setStatus('idle');
        }
      } catch (error) {
        console.error('Voice call error:', error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get a response.' });
        setStatus('idle');
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if(event.error !== 'no-speech') {
        toast({ variant: 'destructive', title: 'Voice Error', description: `An error occurred: ${event.error}` });
      }
      setStatus('idle');
    };

    recognition.onend = () => {
      if (status === 'listening') {
        setStatus('idle');
      }
    };
      
    recognitionRef.current = recognition;

    if (audioRef.current) {
        audioRef.current.onended = () => {
            setStatus('idle');
        };
    }
  }, [open, toast, status]);

  const handleMicClick = () => {
    if (status === 'idle' && recognitionRef.current) {
      recognitionRef.current.start();
    } else if (status === 'listening' && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Gemini is thinking...';
      case 'speaking': return 'Gemini is speaking...';
      case 'idle':
      default:
        return 'Press the microphone to speak.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline"><Phone className="h-5 w-5 text-primary" /> Live Voice Call</DialogTitle>
          <DialogDescription>Speak with the Gemini assistant in real-time.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Button
            size="icon"
            className={cn('h-20 w-20 rounded-full',
              status === 'listening' && 'bg-destructive hover:bg-destructive/90 animate-pulse',
              status === 'processing' && 'bg-muted',
              status === 'speaking' && 'bg-blue-500',
            )}
            onClick={handleMicClick}
            disabled={status !== 'idle' && status !== 'listening'}
          >
            {status === 'processing' || status === 'speaking' ?
              <CircleDot className="h-8 w-8" /> :
              <Mic className="h-8 w-8" />
            }
          </Button>
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          {lastTranscript && <p className="text-sm italic text-center">You said: &quot;{lastTranscript}&quot;</p>}
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => onOpenChange(false)}>
            <PhoneOff className="mr-2 h-4 w-4" /> End Call
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
            <CardDescription>Chat with Gemini about your tickets, assets, and more.</CardDescription>
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
                                    <AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback>
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
                       <Avatar className="h-9 w-9 border"><AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback></Avatar>
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

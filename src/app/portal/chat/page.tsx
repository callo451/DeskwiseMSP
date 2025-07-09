'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Send, Sparkles, User, Volume2, Bot } from 'lucide-react';
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

export default function ClientChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [canUseVoice, setCanUseVoice] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      setCanUseVoice(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInput(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({ variant: 'destructive', title: 'Voice Error', description: `Speech recognition error: ${event.error}` });
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
        toast({ title: "Voice input not supported in this browser."})
    }
  }, [toast]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
  
  const playAudio = (audioDataUri: string) => {
    if (audioRef.current && audioDataUri) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play().catch(e => console.error("Audio playback failed", e));
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    if(isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }
    
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
      
      const ttsResponse = await textToSpeech({ text: chatResponse.response });
      playAudio(ttsResponse.audioDataUri);

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
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary h-5 w-5" /> AI Assistant</CardTitle>
            <CardDescription>Chat with Gemini about your tickets, assets, and more.</CardDescription>
        </div>
        { canUseVoice && <Volume2 className="h-5 w-5 text-muted-foreground" />}
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
            placeholder={isRecording ? "Listening..." : "Type your message or use the microphone..."}
            disabled={isLoading}
            autoComplete="off"
            className="flex-1"
          />
          { canUseVoice && (
            <Button type="button" size="icon" variant={isRecording ? "destructive" : "secondary"} onClick={toggleRecording} disabled={isLoading}>
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
       <audio ref={audioRef} className="hidden" />
    </Card>
  );
}

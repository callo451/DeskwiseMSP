
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Sparkles, Bot, Users } from 'lucide-react';
import { generateKbArticle } from '@/ai/flows/knowledge-base-article-generation';
import { userGroups } from '@/lib/placeholder-data';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  type: z.enum(['Internal', 'Public']),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  aiPrompt: z.string().optional(),
  visibleTo: z.array(z.string()).default(['GRP-001']), // Default to all technicians
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const uniqueCategories = [...new Set(knowledgeBaseArticles.map(a => a.category))];

export default function NewKnowledgeBaseArticlePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      category: '',
      type: 'Internal',
      content: '',
      aiPrompt: '',
      visibleTo: ['GRP-001'], // Default to all technicians
    },
  });

  const handleGenerateArticle = async () => {
    const { aiPrompt, category } = form.getValues();
    if (!aiPrompt) {
      form.setError('aiPrompt', { message: 'Please enter a topic to generate an article.' });
      return;
    }
     if (!category) {
      form.setError('category', { message: 'Please select a category before generating.' });
      return;
    }

    setIsGenerating(true);
    form.setValue('content', 'Generating article with AI...');
    try {
      const result = await generateKbArticle({ prompt: aiPrompt, category });
      form.setValue('title', result.title, { shouldValidate: true });
      form.setValue('content', result.content, { shouldValidate: true });
      toast({
        title: 'Article Generated!',
        description: 'The title and content have been filled by AI.',
      });
    } catch (error) {
      console.error('AI Article Generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI failed to generate the article. Please try again.',
      });
       form.setValue('content', ''); // Clear the loading message
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      const articleData = {
        title: data.title,
        content: data.content,
        category: data.category,
        type: data.type,
        author: 'current-user', // TODO: Get from auth context
        visibleTo: data.visibleTo,
        tags: [], // TODO: Add tags support in form
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        const createdArticle = await response.json();
        toast({
          title: 'Article Created',
          description: `Article "${data.title}" has been created successfully.`,
        });
        router.push(`/knowledge-base/${createdArticle.id}`);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create article',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to create article',
        variant: 'destructive',
      });
    }
  };
  
  const selectedGroups = userGroups.filter(group => form.watch('visibleTo').includes(group.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">New Knowledge Base Article</h1>
          <p className="text-muted-foreground">Create a new article for your team or clients.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Article Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., How to Reset a Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                          <SelectContent>{uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibleTo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Visible To</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                <div className="flex gap-1 flex-wrap">
                                    {selectedGroups.length > 0 ? selectedGroups.map(group => (
                                        <Badge variant="secondary" key={group.id}>{group.name}</Badge>
                                    )) : "Select groups..."}
                                </div>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search groups..." />
                                <CommandList>
                                    <CommandEmpty>No groups found.</CommandEmpty>
                                    <CommandGroup>
                                        {userGroups.map((group) => (
                                            <CommandItem
                                                key={group.id}
                                                onSelect={() => {
                                                    const selected = field.value || [];
                                                    const isSelected = selected.includes(group.id);
                                                    const newSelection = isSelected ? selected.filter(id => id !== group.id) : [...selected, group.id];
                                                    field.onChange(newSelection);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(group.id) ? "opacity-100" : "opacity-0")} />
                                                {group.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select which user groups can view this article.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5"/>Generate</CardTitle>
                  <CardDescription>Describe the article you want to create, and AI will write it for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="aiPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic / Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'A guide on how to troubleshoot slow internet for home users'"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={handleGenerateArticle} disabled={isGenerating} className="w-full">
                    <Bot className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Article'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>Write the article content using the Markdown editor.</CardDescription>
                </CardHeader>
                <CardContent>
                   <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MarkdownEditor
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Article</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Sparkles, Bot, Users } from 'lucide-react';
import { generateKbArticle } from '@/ai/flows/knowledge-base-article-generation';
import { knowledgeBaseArticles, userGroups } from '@/lib/placeholder-data';
import type { KnowledgeBaseArticle, UserGroup } from '@/lib/types';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import Link from 'next/link';
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
  visibleTo: z.array(z.string()).default([]),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const uniqueCategories = [...new Set(knowledgeBaseArticles.map(a => a.category))];

export default function EditKnowledgeBaseArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      category: '',
      type: 'Internal',
      content: '',
      aiPrompt: '',
      visibleTo: [],
    },
  });

  useEffect(() => {
    const foundArticle = knowledgeBaseArticles.find(a => a.id === params.id);
    if (foundArticle) {
        setArticle(foundArticle);
        form.reset({
            title: foundArticle.title,
            category: foundArticle.category,
            type: foundArticle.type,
            content: foundArticle.content,
            aiPrompt: '',
            visibleTo: foundArticle.visibleTo || [],
        });
    }
  }, [params.id, form]);

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
    form.setValue('content', 'Generating new article content with AI...');
    try {
      const result = await generateKbArticle({ prompt: aiPrompt, category });
      form.setValue('title', result.title, { shouldValidate: true });
      form.setValue('content', result.content, { shouldValidate: true });
      toast({
        title: 'Content Generated!',
        description: 'The title and content have been updated by AI.',
      });
    } catch (error) {
      console.error('AI Article Generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI failed to generate content. Please try again.',
      });
       form.setValue('content', article?.content || ''); // Restore original content
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: ArticleFormValues) => {
    console.log(data); // In a real app, you'd save this
    toast({
      title: 'Article Saved!',
      description: `Article "${data.title}" has been updated successfully.`,
    });
    router.push('/knowledge-base');
  };
  
  if (!article) {
     return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Article Not Found</CardTitle>
            <CardDescription>The requested article could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/knowledge-base">
              <Button>Back to Knowledge Base</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const selectedGroups = userGroups.filter(group => form.watch('visibleTo').includes(group.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Edit Article</h1>
          <p className="text-muted-foreground">Editing &quot;{article.title}&quot;</p>
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
                          Select which user groups can view this article. Leave blank to make it visible to all technicians.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5"/>AI Generator</CardTitle>
                  <CardDescription>Generate new content to replace the existing article.</CardDescription>
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
                    {isGenerating ? 'Generating...' : 'Generate & Replace Article'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>Edit the article content using the Markdown editor.</CardDescription>
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
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

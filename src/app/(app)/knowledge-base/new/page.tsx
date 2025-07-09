
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
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
import { ChevronLeft, Sparkles, Bot } from 'lucide-react';
import { generateKbArticle } from '@/ai/flows/knowledge-base-article-generation';
import { knowledgeBaseArticles } from '@/lib/placeholder-data';

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  type: z.enum(['Internal', 'Public']),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  aiPrompt: z.string().optional(),
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

  const onSubmit = (data: ArticleFormValues) => {
    console.log(data); // In a real app, you'd save this
    toast({
      title: 'Article Saved!',
      description: `Article "${data.title}" has been saved successfully.`,
    });
    router.push('/knowledge-base');
  };

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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Internal">Internal (for technicians only)</SelectItem>
                            <SelectItem value="Public">Public (visible to clients)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5"/>AI Generator</CardTitle>
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
                  <CardDescription>Write the article content using Markdown for formatting.</CardDescription>
                </CardHeader>
                <CardContent>
                   <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Your article content goes here..."
                            className="min-h-[400px] font-mono text-sm resize-y"
                            {...field}
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

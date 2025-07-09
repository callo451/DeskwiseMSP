
'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Save } from 'lucide-react';

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  type: z.enum(['Internal', 'Public']),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const categories = ['Networking', 'User Guides', 'Hardware', 'SOPs', 'Software', 'Troubleshooting'];

export function NewArticleDialog() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      type: 'Internal',
    },
  });

  const onSubmit = (data: ArticleFormValues) => {
    console.log(data); // In a real app, you'd save this data
    toast({
      title: 'Article Saved!',
      description: `The article "${data.title}" has been saved.`,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          New Article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Knowledge Base Article</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new article.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-4">
              <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., How to fix printer connection issues" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                          <Textarea
                          placeholder="Write the article content here. Supports Markdown."
                          className="resize-y min-h-[250px] font-mono"
                          {...field}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                              </Trigger>
                          </FormControl>
                          <SelectContent>
                              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
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
                          <FormControl>
                              <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                              </Trigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Internal">Internal</SelectItem>
                              <SelectItem value="Public">Public</SelectItem>
                          </SelectContent>
                          </Select>
                          <FormDescription>
                              'Public' articles can be viewed by clients.
                          </FormDescription>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Article
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

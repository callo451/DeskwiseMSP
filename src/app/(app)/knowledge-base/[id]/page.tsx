'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, BookOpen, User, Calendar, Eye } from 'lucide-react';
import rehypeSanitize from 'rehype-sanitize';
import Link from 'next/link';
import type { KnowledgeBaseArticle } from '@/lib/types';
import { format } from 'date-fns';

export default function ArticleViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/knowledge-base/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else if (response.status === 404) {
        setArticle(null);
      } else {
        console.error('Failed to fetch article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading article...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!article) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Article Not Found</CardTitle>
          <CardDescription>This article could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Button>
        <Button asChild size="sm">
            <Link href={`/knowledge-base/${article.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit Article</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <Badge variant={article.type === 'Internal' ? 'secondary' : 'outline'}>
                  {article.type}
                </Badge>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex gap-1">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl font-headline">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  By {article.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.lastUpdated), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {article.category}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

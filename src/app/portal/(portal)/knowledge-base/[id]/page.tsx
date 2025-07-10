
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { knowledgeBaseArticles } from '@/lib/placeholder-data';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import rehypeSanitize from 'rehype-sanitize';

export default function ClientArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const article = knowledgeBaseArticles.find(a => a.id === params.id && a.type === 'Public');

  if (!article) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Article Not Found</CardTitle>
          <CardDescription>This article could not be found or is not public.</CardDescription>
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
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Knowledge Base
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{article.title}</CardTitle>
          <CardDescription>
            In {article.category} • Last updated on {article.lastUpdated}
          </CardDescription>
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

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
import { ArrowLeft, Edit } from 'lucide-react';
import rehypeSanitize from 'rehype-sanitize';
import Link from 'next/link';

export default function ArticleViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const article = knowledgeBaseArticles.find(a => a.id === params.id);

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
          <CardTitle className="text-3xl font-headline">{article.title}</CardTitle>
          <CardDescription>
            In {article.category} • By {article.author} • Last updated on {article.lastUpdated}
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

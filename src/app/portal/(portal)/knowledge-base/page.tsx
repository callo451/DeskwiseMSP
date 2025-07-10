
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { knowledgeBaseArticles } from '@/lib/placeholder-data';
import {
  BookOpen,
  ChevronRight,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientKnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const publicArticles = knowledgeBaseArticles.filter(a => a.type === 'Public');

  const filteredArticles = publicArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedArticles = filteredArticles.reduce((acc, article) => {
    (acc[article.category] = acc[article.category] || []).push(article);
    return acc;
  }, {} as Record<string, typeof publicArticles>);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Knowledge Base</h1>
        <p className="text-muted-foreground">Find answers to common questions and guides.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search articles..."
          className="pl-10 text-base h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {Object.entries(groupedArticles).map(([category, articles]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {articles.map(article => (
                  <Link href={`/portal/knowledge-base/${article.id}`} key={article.id} className="block">
                    <div className="flex justify-between items-center p-4 -mx-4 hover:bg-secondary">
                      <div className="flex items-center gap-4">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-sm text-muted-foreground">Last updated: {article.lastUpdated}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="font-semibold">No articles found</p>
            <p className="text-muted-foreground">Try adjusting your search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}

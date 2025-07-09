'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { knowledgeBaseArticles } from '@/lib/placeholder-data';
import type { KnowledgeBaseArticle } from '@/lib/types';
import {
  BookOpen,
  Folder,
  MoreHorizontal,
  PlusCircle,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const ArticleRow = ({ article }: { article: KnowledgeBaseArticle }) => (
  <TableRow>
    <TableCell className="font-medium">{article.title}</TableCell>
    <TableCell className="hidden sm:table-cell">{article.category}</TableCell>
    <TableCell className="hidden md:table-cell">{article.author}</TableCell>
    <TableCell className="hidden md:table-cell">{article.lastUpdated}</TableCell>
    <TableCell className="hidden sm:table-cell">
      <Badge variant={article.type === 'Internal' ? 'secondary' : 'outline'}>{article.type}</Badge>
    </TableCell>
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

export default function KnowledgeBasePage() {
  return (
    <div className="grid md:grid-cols-[250px_1fr] gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 font-headline">Categories</h2>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Folder className="h-4 w-4" />
            All Articles
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Folder className="h-4 w-4" />
            Networking
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-2">
            <Folder className="h-4 w-4" />
            User Guides
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Folder className="h-4 w-4" />
            Hardware
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Folder className="h-4 w-4" />
            SOPs
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-primary">
            <PlusCircle className="h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Find and manage internal and public articles.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search articles..." className="pl-8" />
              </div>
              <Link href="/knowledge-base/new">
                <Button className="gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  New Article
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledgeBaseArticles.map(article => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

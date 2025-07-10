'use client';

import React, { useMemo, useState } from 'react';
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
  FolderOpen,
  MoreHorizontal,
  PlusCircle,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const ArticleRow = ({ article }: { article: KnowledgeBaseArticle }) => (
  <TableRow>
    <TableCell className="font-medium">
      <Link href={`/knowledge-base/${article.id}`} className="hover:underline text-primary">
        {article.title}
      </Link>
    </TableCell>
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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild><Link href={`/knowledge-base/${article.id}`}>View</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/knowledge-base/${article.id}/edit`}>Edit</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

interface CategoryNode {
  name: string;
  children: { [key: string]: CategoryNode };
  articleCount: number;
}

const CategoryTree = ({ node, path, onSelectCategory, selectedCategory }: { node: CategoryNode, path: string, onSelectCategory: (path: string) => void, selectedCategory: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  const currentPath = path ? `${path}/${node.name}` : node.name;
  const isSelected = selectedCategory === currentPath;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="pl-4">
       <div className="flex items-center gap-2">
         <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            {Object.keys(node.children).length > 0 ? (isOpen ? <FolderOpen className="h-4 w-4"/> : <Folder className="h-4 w-4"/>) : <div className="w-4"/>}
          </Button>
         </CollapsibleTrigger>
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          className="w-full justify-start gap-2 h-8"
          onClick={() => onSelectCategory(currentPath)}
        >
          {node.name}
          <Badge variant="outline" className="ml-auto">{node.articleCount}</Badge>
        </Button>
      </div>
      <CollapsibleContent>
        {Object.values(node.children)
          .sort((a,b) => a.name.localeCompare(b.name))
          .map(childNode => (
          <CategoryTree key={childNode.name} node={childNode} path={currentPath} onSelectCategory={onSelectCategory} selectedCategory={selectedCategory} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};


export default function KnowledgeBasePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryTree = useMemo(() => {
    const root: CategoryNode = { name: 'All', children: {}, articleCount: 0 };
    
    knowledgeBaseArticles.forEach(article => {
      let currentNode = root;
      const parts = article.category.split(' / ');
      parts.forEach(part => {
        if (!currentNode.children[part]) {
          currentNode.children[part] = { name: part, children: {}, articleCount: 0 };
        }
        currentNode = currentNode.children[part];
        currentNode.articleCount++;
      });
    });

    const countArticles = (node: CategoryNode): number => {
      let count = Object.keys(node.children).length > 0 ? 0 : node.articleCount;
      Object.values(node.children).forEach(child => {
        count += countArticles(child);
      });
      node.articleCount = count;
      return count;
    };
    
    root.articleCount = knowledgeBaseArticles.length;
    countArticles(root);

    return root;
  }, []);

  const filteredArticles = useMemo(() => {
    return knowledgeBaseArticles
      .filter(article => {
        const categoryMatch = selectedCategory === 'All' || article.category.startsWith(selectedCategory.replace(/\//g, ' / '));
        const searchMatch =
          searchTerm === '' ||
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [selectedCategory, searchTerm]);

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
      <div>
        <h2 className="text-xl font-semibold mb-4 font-headline px-4">Categories</h2>
        <div className="space-y-1">
          <Button
            variant={selectedCategory === 'All' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2 h-9"
            onClick={() => setSelectedCategory('All')}
          >
            <Folder className="h-4 w-4" />
            All Articles
            <Badge variant="outline" className="ml-auto">{categoryTree.articleCount}</Badge>
          </Button>
          {Object.values(categoryTree.children)
            .sort((a,b) => a.name.localeCompare(b.name))
            .map(node => (
            <CategoryTree key={node.name} node={node} path="" onSelectCategory={setSelectedCategory} selectedCategory={selectedCategory}/>
          ))}
           <Button variant="ghost" className="w-full justify-start gap-2 text-primary h-9">
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
                <Input type="search" placeholder="Search articles..." className="pl-8" onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button asChild className="gap-1">
                <Link href="/knowledge-base/new">
                  <BookOpen className="h-3.5 w-3.5" />
                  New Article
                </Link>
              </Button>
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
              {filteredArticles.map(article => (
                <ArticleRow key={article.id} article={article} />
              ))}
              {filteredArticles.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No articles found for the current filter.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

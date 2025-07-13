'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
import type { KnowledgeBaseArticle } from '@/lib/types';
import {
  BookOpen,
  Folder,
  FolderOpen,
  MoreHorizontal,
  PlusCircle,
  Search,
  Archive,
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
import { format } from 'date-fns';

const ArticleRow = ({ article, onArchive, onDelete }: { 
  article: KnowledgeBaseArticle; 
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <TableRow>
    <TableCell className="font-medium">
      <Link href={`/knowledge-base/${article.id}`} className="hover:underline text-primary">
        {article.title}
      </Link>
      {article.tags && article.tags.length > 0 && (
        <div className="mt-1 flex gap-1 flex-wrap">
          {article.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">+{article.tags.length - 3}</Badge>
          )}
        </div>
      )}
    </TableCell>
    <TableCell className="hidden sm:table-cell">{article.category}</TableCell>
    <TableCell className="hidden md:table-cell">{article.author}</TableCell>
    <TableCell className="hidden md:table-cell">
      {format(new Date(article.lastUpdated), 'MMM d, yyyy')}
    </TableCell>
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
          <DropdownMenuItem onClick={() => onArchive(article.id)}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => onDelete(article.id)}
          >
            Delete
          </DropdownMenuItem>
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
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; articleCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge-base');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        console.error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/knowledge-base/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this article?')) return;

    try {
      const response = await fetch(`/api/knowledge-base/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updatedBy: 'current-user' // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== id));
      } else {
        console.error('Failed to archive article');
      }
    } catch (error) {
      console.error('Error archiving article:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== id));
        await fetchCategories(); // Refresh categories to update counts
      } else {
        console.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const categoryTree = useMemo(() => {
    const root: CategoryNode = { name: 'All', children: {}, articleCount: 0 };
    
    articles.forEach(article => {
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
    
    root.articleCount = articles.length;
    countArticles(root);

    return root;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.tags && article.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => 
        article.category.startsWith(selectedCategory.replace(/\//g, ' / '))
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }, [articles, selectedCategory, searchTerm]);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading articles...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <ArticleRow 
                    key={article.id} 
                    article={article} 
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {searchTerm || selectedCategory !== 'All' 
                      ? 'No articles found for the current filter.' 
                      : 'No articles found. Create your first article to get started.'
                    }
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

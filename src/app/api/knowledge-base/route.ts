import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type') as 'Internal' | 'Public' | undefined;
    const author = searchParams.get('author');
    const tag = searchParams.get('tag');
    const searchQuery = searchParams.get('search');
    const isArchived = searchParams.get('archived') === 'true';
    const visibleTo = searchParams.get('visibleTo')?.split(',').filter(Boolean);

    const filters: any = {};
    
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (author) filters.author = author;
    if (tag) filters.tag = tag;
    if (searchQuery) filters.searchQuery = searchQuery;
    if (isArchived !== undefined) filters.isArchived = isArchived;
    if (visibleTo && visibleTo.length > 0) filters.visibleTo = visibleTo;

    const articles = await KnowledgeBaseService.getAllArticles(filters);
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching knowledge base articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category || !body.author || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, category, author, type' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || body.author || 'system'; // TODO: Get from auth context

    // Set default values
    const article = {
      ...body,
      visibleTo: body.visibleTo || [],
      tags: body.tags || [],
      lastUpdated: new Date().toISOString(),
    };

    const createdArticle = await KnowledgeBaseService.createArticle(
      article,
      createdBy
    );

    return NextResponse.json(createdArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge base article:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base article' },
      { status: 500 }
    );
  }
}
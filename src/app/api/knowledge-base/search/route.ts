import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'Internal' | 'Public' | undefined;
    const category = searchParams.get('category');
    const visibleTo = searchParams.get('visibleTo')?.split(',').filter(Boolean);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const filters: any = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (visibleTo && visibleTo.length > 0) filters.visibleTo = visibleTo;

    const articles = await KnowledgeBaseService.searchArticles(query, filters);
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error searching knowledge base articles:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base articles' },
      { status: 500 }
    );
  }
}
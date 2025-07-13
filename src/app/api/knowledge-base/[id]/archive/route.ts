import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedBy = body.updatedBy || 'system'; // TODO: Get from auth context

    const archived = await KnowledgeBaseService.archiveArticle(params.id, updatedBy);

    if (!archived) {
      return NextResponse.json(
        { error: 'Knowledge base article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving knowledge base article:', error);
    return NextResponse.json(
      { error: 'Failed to archive knowledge base article' },
      { status: 500 }
    );
  }
}
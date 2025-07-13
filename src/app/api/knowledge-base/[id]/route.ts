import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await KnowledgeBaseService.getArticleById(params.id);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Knowledge base article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching knowledge base article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedBy = body.updatedBy || 'system'; // TODO: Get from auth context
    
    // Remove fields that shouldn't be updated directly
    const { id, createdBy, createdAt, updatedAt, ...updateData } = body;

    // Update lastUpdated timestamp
    updateData.lastUpdated = new Date().toISOString();

    const updatedArticle = await KnowledgeBaseService.updateArticle(
      params.id,
      updateData,
      updatedBy
    );

    if (!updatedArticle) {
      return NextResponse.json(
        { error: 'Knowledge base article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating knowledge base article:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge base article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await KnowledgeBaseService.deleteArticle(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Knowledge base article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge base article:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge base article' },
      { status: 500 }
    );
  }
}
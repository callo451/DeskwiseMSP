import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const tags = await KnowledgeBaseService.getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching knowledge base tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || 'system'; // TODO: Get from auth context

    await KnowledgeBaseService.createTag(
      body.name,
      body.description,
      body.color,
      createdBy
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge base tag:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base tag' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const categories = await KnowledgeBaseService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching knowledge base categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base categories' },
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

    await KnowledgeBaseService.createCategory(
      body.name,
      body.description,
      createdBy,
      body.parentCategory
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge base category:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base category' },
      { status: 500 }
    );
  }
}
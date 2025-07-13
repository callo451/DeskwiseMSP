import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/services/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const stats = await KnowledgeBaseService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching knowledge base stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base stats' },
      { status: 500 }
    );
  }
}
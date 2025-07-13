import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function GET(request: NextRequest) {
  try {
    const stats = await ProjectsService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project stats' },
      { status: 500 }
    );
  }
}
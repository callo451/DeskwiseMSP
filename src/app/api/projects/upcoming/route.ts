import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const upcomingProjects = await ProjectsService.getUpcoming(days);
    return NextResponse.json(upcomingProjects);
  } catch (error) {
    console.error('Error fetching upcoming projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming projects' },
      { status: 500 }
    );
  }
}
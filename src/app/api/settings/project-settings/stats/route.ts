import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ProjectSettingsService } from '@/lib/services/project-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await ProjectSettingsService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching project settings stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project settings statistics' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ProjectSettingsService } from '@/lib/services/project-settings';

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    
    const { statuses, templates } = await ProjectSettingsService.initializeDefaults(orgId, userId);

    return NextResponse.json({
      statuses,
      templates,
      message: `Initialized ${statuses.length} default statuses and ${templates.length} default templates`
    });
  } catch (error) {
    console.error('Error initializing default project settings:', error);
    return NextResponse.json(
      { error: 'Failed to initialize default project settings' },
      { status: 500 }
    );
  }
}
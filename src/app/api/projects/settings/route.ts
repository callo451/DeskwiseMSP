import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ProjectSettingsService } from '@/lib/services/project-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'statuses') {
      const statuses = await ProjectSettingsService.getAllStatuses(orgId);
      return NextResponse.json({ statuses });
    } else if (type === 'templates') {
      const templates = await ProjectSettingsService.getAllTemplates(orgId);
      return NextResponse.json({ templates });
    } else {
      // Return both for project creation forms
      const [statuses, templates] = await Promise.all([
        ProjectSettingsService.getAllStatuses(orgId),
        ProjectSettingsService.getAllTemplates(orgId)
      ]);
      return NextResponse.json({ statuses, templates });
    }
  } catch (error) {
    console.error('Error fetching project settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project settings' },
      { status: 500 }
    );
  }
}
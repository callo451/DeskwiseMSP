import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ProjectSettingsService } from '@/lib/services/project-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'statuses' or 'templates'

    if (type === 'statuses') {
      const statuses = await ProjectSettingsService.getAllStatuses(orgId);
      return NextResponse.json({ statuses });
    } else if (type === 'templates') {
      const templates = await ProjectSettingsService.getAllTemplates(orgId);
      return NextResponse.json({ templates });
    } else {
      // Return both
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

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { type, ...data } = await request.json();

    if (type === 'status') {
      // Validate required fields for status
      if (!data.name || !data.color) {
        return NextResponse.json(
          { error: 'Name and color are required for status' },
          { status: 400 }
        );
      }

      const status = await ProjectSettingsService.createStatus(orgId, data, userId);
      return NextResponse.json({ 
        status,
        message: 'Project status created successfully' 
      }, { status: 201 });
    } else if (type === 'template') {
      // Validate required fields for template
      if (!data.name || !data.description) {
        return NextResponse.json(
          { error: 'Name and description are required for template' },
          { status: 400 }
        );
      }

      const template = await ProjectSettingsService.createTemplate(orgId, data, userId);
      return NextResponse.json({ 
        template,
        message: 'Project template created successfully' 
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "status" or "template"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating project setting:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project setting' },
      { status: 500 }
    );
  }
}
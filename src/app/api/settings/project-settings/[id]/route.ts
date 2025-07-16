import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ProjectSettingsService } from '@/lib/services/project-settings';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'status' or 'template'

    if (type === 'status') {
      const status = await ProjectSettingsService.getStatusById(id, orgId);
      if (!status) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ status });
    } else if (type === 'template') {
      const template = await ProjectSettingsService.getTemplateById(id, orgId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ template });
    } else {
      return NextResponse.json(
        { error: 'Type parameter is required ("status" or "template")' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching project setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project setting' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = params;
    const { type, ...updates } = await request.json();

    if (type === 'status') {
      const status = await ProjectSettingsService.updateStatus(id, orgId, updates, userId);
      if (!status) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        status,
        message: 'Project status updated successfully'
      });
    } else if (type === 'template') {
      const template = await ProjectSettingsService.updateTemplate(id, orgId, updates, userId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        template,
        message: 'Project template updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Type parameter is required ("status" or "template")' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating project setting:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update project setting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'status' or 'template'

    if (type === 'status') {
      const success = await ProjectSettingsService.deleteStatus(id, orgId, userId);
      if (!success) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'Project status deleted successfully'
      });
    } else if (type === 'template') {
      const success = await ProjectSettingsService.deleteTemplate(id, orgId, userId);
      if (!success) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'Project template deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Type parameter is required ("status" or "template")' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting project setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete project setting' },
      { status: 500 }
    );
  }
}
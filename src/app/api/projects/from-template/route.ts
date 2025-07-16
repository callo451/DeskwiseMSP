import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ProjectsService } from '@/lib/services/projects';

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { templateId, ...projectData } = await request.json();

    // Validate required fields
    if (!templateId || !projectData.name) {
      return NextResponse.json(
        { error: 'Template ID and project name are required' },
        { status: 400 }
      );
    }

    const project = await ProjectsService.createFromTemplate(
      orgId,
      templateId,
      projectData,
      userId
    );

    return NextResponse.json({
      project,
      message: 'Project created from template successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project from template:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project from template' },
      { status: 500 }
    );
  }
}
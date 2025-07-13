import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestones = await ProjectsService.getProjectMilestones(params.id);
    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project milestones' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.dueDate || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: name, dueDate, status' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || 'system'; // TODO: Get from auth context

    const milestone = {
      ...body,
      isBillable: body.isBillable || false,
    };

    const createdMilestone = await ProjectsService.addMilestone(
      params.id,
      milestone,
      createdBy
    );

    return NextResponse.json(createdMilestone, { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
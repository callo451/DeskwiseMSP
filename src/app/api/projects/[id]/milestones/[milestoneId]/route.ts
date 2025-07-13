import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const body = await request.json();
    const updatedBy = body.updatedBy || 'system'; // TODO: Get from auth context
    
    // Remove fields that shouldn't be updated directly
    const { id, createdBy, createdAt, updatedAt, ...updateData } = body;

    const updatedMilestone = await ProjectsService.updateMilestone(
      params.id,
      params.milestoneId,
      updateData,
      updatedBy
    );

    if (!updatedMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const deleted = await ProjectsService.deleteMilestone(params.id, params.milestoneId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
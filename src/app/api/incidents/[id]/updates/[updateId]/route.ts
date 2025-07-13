import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incidents';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; updateId: string } }
) {
  try {
    const body = await request.json();
    const updatedBy = body.updatedBy || 'system'; // TODO: Get from auth context
    
    // Remove fields that shouldn't be updated directly
    const { id, incidentId, createdBy, createdAt, ...updateData } = body;

    const updatedUpdate = await IncidentService.updateIncidentUpdate(
      params.id,
      params.updateId,
      updateData,
      updatedBy
    );

    if (!updatedUpdate) {
      return NextResponse.json(
        { error: 'Incident update not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUpdate);
  } catch (error) {
    console.error('Error updating incident update:', error);
    return NextResponse.json(
      { error: 'Failed to update incident update' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; updateId: string } }
) {
  try {
    const deleted = await IncidentService.deleteIncidentUpdate(
      params.id,
      params.updateId
    );

    if (!deleted) {
      return NextResponse.json(
        { error: 'Incident update not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting incident update:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident update' },
      { status: 500 }
    );
  }
}
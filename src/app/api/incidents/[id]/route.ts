import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incidents';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incident = await IncidentService.getById(params.id);
    
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedBy = body.updatedBy || 'system'; // TODO: Get from auth context
    
    // Remove fields that shouldn't be updated directly
    const { id, updates, createdBy, createdAt, updatedAt, ...updateData } = body;

    const updatedIncident = await IncidentService.update(
      params.id,
      updateData,
      updatedBy
    );

    if (!updatedIncident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await IncidentService.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}
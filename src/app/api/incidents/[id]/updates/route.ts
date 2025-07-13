import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incidents';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.message || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: message, status' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || 'system'; // TODO: Get from auth context
    
    const updateData = {
      status: body.status,
      message: body.message,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const createdUpdate = await IncidentService.addUpdate(
      params.id,
      updateData,
      createdBy
    );

    return NextResponse.json(createdUpdate, { status: 201 });
  } catch (error) {
    console.error('Error adding incident update:', error);
    return NextResponse.json(
      { error: 'Failed to add incident update' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await IncidentService.getIncidentUpdates(params.id);
    return NextResponse.json(updates);
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident updates' },
      { status: 500 }
    );
  }
}
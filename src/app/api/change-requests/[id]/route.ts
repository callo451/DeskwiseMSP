import { NextRequest, NextResponse } from 'next/server';
import { ChangeManagementService } from '@/lib/services/change-management';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const changeRequest = await ChangeManagementService.getById(params.id);
    
    if (!changeRequest) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(changeRequest);
  } catch (error) {
    console.error('Error fetching change request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change request' },
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
    const { id, createdBy, createdAt, updatedAt, ...updateData } = body;

    const updatedChangeRequest = await ChangeManagementService.update(
      params.id,
      updateData,
      updatedBy
    );

    if (!updatedChangeRequest) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedChangeRequest);
  } catch (error) {
    console.error('Error updating change request:', error);
    return NextResponse.json(
      { error: 'Failed to update change request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await ChangeManagementService.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting change request:', error);
    return NextResponse.json(
      { error: 'Failed to delete change request' },
      { status: 500 }
    );
  }
}
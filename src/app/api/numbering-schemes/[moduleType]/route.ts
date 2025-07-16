import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { NumberingSchemesService, ModuleType } from '@/lib/services/numbering-schemes';

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleType: string } }
) {
  try {
    const { orgId } = await getAuthContext();
    const { moduleType } = params;

    const scheme = await NumberingSchemesService.getByModule(orgId, moduleType as ModuleType);

    if (!scheme) {
      return NextResponse.json(
        { error: 'Numbering scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ scheme });
  } catch (error) {
    console.error('Error fetching numbering scheme:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Organization required')) {
      return NextResponse.json(
        { error: 'Organization setup required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch numbering scheme' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { moduleType: string } }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { moduleType } = params;
    const updates = await request.json();

    const scheme = await NumberingSchemesService.update(
      orgId,
      moduleType as ModuleType,
      updates,
      userId
    );

    if (!scheme) {
      return NextResponse.json(
        { error: 'Numbering scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      scheme,
      message: 'Numbering scheme updated successfully'
    });
  } catch (error) {
    console.error('Error updating numbering scheme:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Organization required')) {
      return NextResponse.json(
        { error: 'Organization setup required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update numbering scheme' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleType: string } }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { moduleType } = params;

    const success = await NumberingSchemesService.delete(
      orgId,
      moduleType as ModuleType,
      userId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Numbering scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Numbering scheme deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting numbering scheme:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Organization required')) {
      return NextResponse.json(
        { error: 'Organization setup required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete numbering scheme' },
      { status: 500 }
    );
  }
}
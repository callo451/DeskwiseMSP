import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { ticketId } = await request.json();
    
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    await AssetsService.associateWithTicket(id, orgId, ticketId);
    
    return NextResponse.json({ message: 'Asset associated with ticket successfully' });
  } catch (error) {
    console.error('Error associating asset with ticket:', error);
    return NextResponse.json(
      { error: 'Failed to associate asset with ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    await AssetsService.removeTicketAssociation(id, orgId, ticketId);
    
    return NextResponse.json({ message: 'Asset ticket association removed successfully' });
  } catch (error) {
    console.error('Error removing asset ticket association:', error);
    return NextResponse.json(
      { error: 'Failed to remove asset ticket association' },
      { status: 500 }
    );
  }
}
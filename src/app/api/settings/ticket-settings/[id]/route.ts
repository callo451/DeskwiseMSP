import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { TicketSettingsService } from '@/lib/services/ticket-settings';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'queue', 'status', or 'priority'

    if (type === 'queue') {
      const queue = await TicketSettingsService.getQueueById(id, orgId);
      if (!queue) {
        return NextResponse.json(
          { error: 'Queue not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ queue });
    } else {
      return NextResponse.json(
        { error: 'Type parameter is required ("queue", "status", or "priority")' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching ticket setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket setting' },
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

    if (type === 'queue') {
      const queue = await TicketSettingsService.updateQueue(id, orgId, updates, userId);
      if (!queue) {
        return NextResponse.json(
          { error: 'Queue not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        queue,
        message: 'Ticket queue updated successfully'
      });
    } else if (type === 'status') {
      const status = await TicketSettingsService.updateStatus(id, orgId, updates, userId);
      if (!status) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        status,
        message: 'Ticket status updated successfully'
      });
    } else if (type === 'priority') {
      const priority = await TicketSettingsService.updatePriority(id, orgId, updates, userId);
      if (!priority) {
        return NextResponse.json(
          { error: 'Priority not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        priority,
        message: 'Ticket priority updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Type parameter is required ("queue", "status", or "priority")' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating ticket setting:', error);
    
    if (error instanceof Error && (
      error.message.includes('already exists') || 
      error.message.includes('Cannot modify') ||
      error.message.includes('Cannot delete')
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update ticket setting' },
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
    const type = searchParams.get('type'); // 'queue', 'status', or 'priority'

    if (type === 'queue') {
      const success = await TicketSettingsService.deleteQueue(id, orgId, userId);
      if (!success) {
        return NextResponse.json(
          { error: 'Queue not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'Ticket queue deleted successfully'
      });
    } else if (type === 'status') {
      const success = await TicketSettingsService.deleteStatus(id, orgId, userId);
      if (!success) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'Ticket status deleted successfully'
      });
    } else if (type === 'priority') {
      const success = await TicketSettingsService.deletePriority(id, orgId, userId);
      if (!success) {
        return NextResponse.json(
          { error: 'Priority not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'Ticket priority deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Type parameter is required ("queue", "status", or "priority")' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting ticket setting:', error);
    
    if (error instanceof Error && (
      error.message.includes('Cannot modify') ||
      error.message.includes('Cannot delete')
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete ticket setting' },
      { status: 500 }
    );
  }
}
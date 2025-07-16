import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { TicketSettingsService } from '@/lib/services/ticket-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'queues', 'statuses', or 'priorities'

    if (type === 'queues') {
      const queues = await TicketSettingsService.getAllQueues(orgId);
      return NextResponse.json({ queues });
    } else if (type === 'statuses') {
      const statuses = await TicketSettingsService.getAllStatuses(orgId);
      return NextResponse.json({ statuses });
    } else if (type === 'priorities') {
      const priorities = await TicketSettingsService.getAllPriorities(orgId);
      return NextResponse.json({ priorities });
    } else {
      // Return all
      const [queues, statuses, priorities] = await Promise.all([
        TicketSettingsService.getAllQueues(orgId),
        TicketSettingsService.getAllStatuses(orgId),
        TicketSettingsService.getAllPriorities(orgId)
      ]);
      return NextResponse.json({ queues, statuses, priorities });
    }
  } catch (error) {
    console.error('Error fetching ticket settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { type, ...data } = await request.json();

    if (type === 'queue') {
      // Validate required fields for queue
      if (!data.name) {
        return NextResponse.json(
          { error: 'Name is required for queue' },
          { status: 400 }
        );
      }

      const queue = await TicketSettingsService.createQueue(orgId, data, userId);
      return NextResponse.json({ 
        queue,
        message: 'Ticket queue created successfully' 
      }, { status: 201 });
    } else if (type === 'status') {
      // Validate required fields for status
      if (!data.name || !data.color || !data.type) {
        return NextResponse.json(
          { error: 'Name, color, and type are required for status' },
          { status: 400 }
        );
      }

      const status = await TicketSettingsService.createStatus(orgId, data, userId);
      return NextResponse.json({ 
        status,
        message: 'Ticket status created successfully' 
      }, { status: 201 });
    } else if (type === 'priority') {
      // Validate required fields for priority
      if (!data.name || !data.color || data.level === undefined || 
          data.responseSlaMinutes === undefined || data.resolutionSlaMinutes === undefined) {
        return NextResponse.json(
          { error: 'Name, color, level, and SLA times are required for priority' },
          { status: 400 }
        );
      }

      const priority = await TicketSettingsService.createPriority(orgId, data, userId);
      return NextResponse.json({ 
        priority,
        message: 'Ticket priority created successfully' 
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "queue", "status", or "priority"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating ticket setting:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create ticket setting' },
      { status: 500 }
    );
  }
}
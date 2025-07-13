import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/tickets';
import { getAuthContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user context
    const { orgId } = await getAuthContext();
    
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status')?.split(',').filter(Boolean) || [],
      priority: searchParams.get('priority')?.split(',').filter(Boolean) || [],
      queue: searchParams.get('queue')?.split(',').filter(Boolean) || [],
      assignee: searchParams.get('assignee') || undefined,
      client: searchParams.get('client') || undefined,
    };

    // Remove empty arrays from filters
    Object.keys(filters).forEach(key => {
      if (Array.isArray(filters[key as keyof typeof filters]) && 
          (filters[key as keyof typeof filters] as string[]).length === 0) {
        delete filters[key as keyof typeof filters];
      }
    });
    
    const tickets = await TicketService.getAll(orgId, Object.keys(filters).length > 0 ? filters : undefined);
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user context
    const { orgId, user } = await getAuthContext();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.subject || !body.description || !body.client || !body.priority) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, description, client, priority' },
        { status: 400 }
      );
    }

    const ticket = await TicketService.create(orgId, {
      subject: body.subject,
      description: body.description,
      client: body.client,
      assignee: body.assignee || 'Unassigned',
      priority: body.priority,
      status: body.status || 'Open',
      queue: body.queue || 'Unassigned',
      associatedAssets: body.associatedAssets || [],
      sla: body.sla,
      timeLogs: body.timeLogs || [],
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
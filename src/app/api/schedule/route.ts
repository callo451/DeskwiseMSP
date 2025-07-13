import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      technicianId: searchParams.get('technicianId') || undefined,
      type: searchParams.get('type') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    // Remove undefined values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const scheduleItems = await ScheduleService.getAll(Object.keys(filters).length > 0 ? filters : undefined);
    
    return NextResponse.json(scheduleItems);
  } catch (error) {
    console.error('Error fetching schedule items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.technicianId || !body.type || !body.start || !body.end) {
      return NextResponse.json(
        { error: 'Missing required fields: title, technicianId, type, start, end' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflicts = await ScheduleService.getConflicts(
      body.technicianId,
      body.start,
      body.end
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Schedule conflict detected',
          conflicts: conflicts.map(c => ({
            id: c.id,
            title: c.title,
            start: c.start,
            end: c.end
          }))
        },
        { status: 409 }
      );
    }

    const scheduleItem = await ScheduleService.create({
      title: body.title,
      technicianId: body.technicianId,
      type: body.type,
      start: body.start,
      end: body.end,
      clientId: body.clientId,
      participants: body.participants,
      ticketId: body.ticketId,
      notes: body.notes,
    });

    return NextResponse.json(scheduleItem, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule item' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.technicianId || !body.type || !body.start || !body.end || !body.recurrencePattern) {
      return NextResponse.json(
        { error: 'Missing required fields: title, technicianId, type, start, end, recurrencePattern' },
        { status: 400 }
      );
    }

    // Validate recurrence pattern
    const pattern = body.recurrencePattern;
    if (!pattern.type || !pattern.interval) {
      return NextResponse.json(
        { error: 'Invalid recurrence pattern: type and interval are required' },
        { status: 400 }
      );
    }

    const scheduleItems = await ScheduleService.createRecurring(
      {
        title: body.title,
        technicianId: body.technicianId,
        type: body.type,
        start: body.start,
        end: body.end,
        clientId: body.clientId,
        participants: body.participants,
        ticketId: body.ticketId,
        notes: body.notes,
        location: body.location,
        status: body.status || 'scheduled',
        priority: body.priority,
        estimatedDuration: body.estimatedDuration,
        travelTime: body.travelTime,
        requiredSkills: body.requiredSkills,
        equipment: body.equipment,
        reminders: body.reminders,
      },
      pattern
    );

    return NextResponse.json({
      parentItem: scheduleItems[0],
      instances: scheduleItems.slice(1),
      totalCreated: scheduleItems.length
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring schedule item' },
      { status: 500 }
    );
  }
}
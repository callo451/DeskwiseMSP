import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduleItem = await ScheduleService.getById(id);
    
    if (!scheduleItem) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scheduleItem);
  } catch (error) {
    console.error('Error fetching schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check for conflicts if time or technician is being changed
    if (body.technicianId || body.start || body.end) {
      const currentItem = await ScheduleService.getById(id);
      if (!currentItem) {
        return NextResponse.json(
          { error: 'Schedule item not found' },
          { status: 404 }
        );
      }

      const technicianId = body.technicianId || currentItem.technicianId;
      const start = body.start || currentItem.start;
      const end = body.end || currentItem.end;

      const conflicts = await ScheduleService.getConflicts(
        technicianId,
        start,
        end,
        id // Exclude current item from conflict check
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
    }
    
    const scheduleItem = await ScheduleService.update(id, body);
    
    if (!scheduleItem) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scheduleItem);
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await ScheduleService.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Schedule item deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule item' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const excludeId = searchParams.get('excludeId');

    if (!technicianId || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: technicianId, start, end' },
        { status: 400 }
      );
    }

    const conflicts = await ScheduleService.getConflicts(
      technicianId,
      start,
      end,
      excludeId || undefined
    );

    return NextResponse.json({ conflicts });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check conflicts' },
      { status: 500 }
    );
  }
}